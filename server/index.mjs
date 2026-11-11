import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  initDb, 
  getFullState, 
  insertTransaction, 
  updateTransaction, 
  insertContract, 
  saveAttendance,
  getMonthlyBalances,
  recalculateMonthlyBalances,
  importSheetDataToPostgres
} from './db.mjs';
import { syncToGoogleSheet } from './sheetSync.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', async (req, res) => {
  res.json({
    status: 'ok',
    database: 'PostgreSQL 16 (Local)',
    schema: process.env.DB_SCHEMA || 'finance_vpm',
    googleSheetSyncEnabled: Boolean(process.env.GOOGLE_SHEET_API_URL && process.env.GOOGLE_SHEET_API_URL.trim()),
    timestamp: new Date().toISOString()
  });
});

// Lấy toàn bộ AppState từ PostgreSQL
app.get('/api/state', async (req, res) => {
  try {
    const state = await getFullState();
    res.json({ success: true, data: state });
  } catch (err) {
    console.error('❌ Lỗi lấy state từ PostgreSQL:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Lấy danh sách số dư các tháng từ PostgreSQL
app.get('/api/monthly-balances', async (req, res) => {
  try {
    const balances = await getMonthlyBalances();
    res.json({ success: true, data: balances });
  } catch (err) {
    console.error('❌ Lỗi lấy số dư các tháng:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Tính toán lại số dư và tự động đồng bộ sang Google Sheet (tạo mới tab 00_SODU_KY nếu chưa có)
app.post('/api/monthly-balances/sync', async (req, res) => {
  try {
    const balances = await recalculateMonthlyBalances();
    const sheetRes = await syncToGoogleSheet('syncMonthlyBalances', { balances });
    res.json({ 
      success: true, 
      count: balances.length, 
      balances, 
      sheetSynced: sheetRes.success || false,
      sheetDetails: sheetRes
    });
  } catch (err) {
    console.error('❌ Lỗi tính toán & đồng bộ số dư:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Thêm Giao dịch mới (Dual-Write: PostgreSQL + Google Sheet)
app.post('/api/transactions', async (req, res) => {
  try {
    const tx = req.body;
    if (!tx || !tx.id || !tx.date || !tx.amt) {
      return res.status(400).json({ success: false, error: 'Dữ liệu giao dịch không hợp lệ' });
    }

    // 1. Ghi tức thời vào PostgreSQL
    const saved = await insertTransaction(tx);

    // 2. Kích hoạt đồng bộ ngầm sang Google Sheet (Non-blocking)
    syncToGoogleSheet('addTransaction', { data: tx }).catch((e) => {
      console.warn('Lỗi sync Google Sheet ngầm:', e);
    });

    // 3. Tự động cập nhật bảng monthly_balances và đồng bộ tab 00_SODU_KY
    recalculateMonthlyBalances().then((balances) => {
      syncToGoogleSheet('syncMonthlyBalances', { balances });
    }).catch(console.warn);

    res.json({ 
      success: true, 
      data: saved, 
      savedToPostgres: true,
      syncedToGoogleSheet: Boolean(process.env.GOOGLE_SHEET_API_URL)
    });
  } catch (err) {
    console.error('❌ Lỗi thêm giao dịch:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Cập nhật Giao dịch
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // 1. Cập nhật trong PostgreSQL
    const updated = await updateTransaction(id, updates);

    // 2. Kích hoạt đồng bộ ngầm sang Google Sheet
    syncToGoogleSheet('updateTransaction', { id, updates }).catch((e) => {
      console.warn('Lỗi sync Google Sheet ngầm:', e);
    });

    // 3. Tự động cập nhật bảng monthly_balances và đồng bộ tab 00_SODU_KY
    recalculateMonthlyBalances().then((balances) => {
      syncToGoogleSheet('syncMonthlyBalances', { balances });
    }).catch(console.warn);

    res.json({ success: true, data: updated, savedToPostgres: true });
  } catch (err) {
    console.error('❌ Lỗi cập nhật giao dịch:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Thêm Hợp đồng mới
app.post('/api/contracts', async (req, res) => {
  try {
    const c = req.body;
    const saved = await insertContract(c);

    syncToGoogleSheet('addContract', { data: c }).catch((e) => {
      console.warn('Lỗi sync hợp đồng Google Sheet:', e);
    });

    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('❌ Lỗi thêm hợp đồng:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Lưu chấm công nhân sự
app.post('/api/attendance', async (req, res) => {
  try {
    const { staffId, dateIso, val } = req.body;
    const att = await saveAttendance(staffId, dateIso, val);

    syncToGoogleSheet('saveAttendance', { staffId, dateIso, val }).catch((e) => {
      console.warn('Lỗi sync chấm công Google Sheet:', e);
    });

    res.json({ success: true, data: att });
  } catch (err) {
    console.error('❌ Lỗi lưu chấm công:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Khởi tạo toàn bộ các bảng cơ sở dữ liệu trên Google Sheet
app.post('/api/init-database-sheets', async (req, res) => {
  try {
    const result = await syncToGoogleSheet('initAllDatabaseSheets', {});
    res.json({ success: true, result });
  } catch (err) {
    console.error('❌ Lỗi khởi tạo các bảng trên Google Sheet:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// ĐỒNG BỘ HAI CHIỀU (TWO-WAY CROSS SYNC: SHEET <=> POSTGRESQL)
// =========================================================================

// Chiều 1: Kéo toàn bộ dữ liệu từ Google Sheet về nạp/cập nhật vào PostgreSQL (Sheet -> DB)
app.post('/api/sync/sheet-to-db', async (req, res) => {
  const url = process.env.GOOGLE_SHEET_API_URL;
  if (!url || !url.trim()) {
    return res.status(400).json({ success: false, error: 'Chưa cấu hình GOOGLE_SHEET_API_URL trong .env' });
  }

  try {
    console.log(`📥 [TwoWaySync] Đang xuất dữ liệu từ Google Sheet về...`);
    // Gọi Webhook Google Sheet với action exportAllData
    const sheetResponse = await fetch(url + '?action=exportAllData');
    if (!sheetResponse.ok) {
      throw new Error(`Google Sheet API trả về lỗi HTTP ${sheetResponse.status}`);
    }

    const sheetData = await sheetResponse.json();
    if (!sheetData.success) {
      throw new Error(sheetData.error || 'Google Sheet từ chối xuất dữ liệu');
    }

    console.log(`📥 [TwoWaySync] Đã nhận ${sheetData.txCount || 0} giao dịch, ${sheetData.contractsCount || 0} hợp đồng từ Sheet.`);
    
    // Nạp và cập nhật an toàn vào PostgreSQL theo chuẩn ACID
    const stats = await importSheetDataToPostgres(sheetData);

    res.json({
      success: true,
      message: `Đồng bộ thành công từ Google Sheet về PostgreSQL!`,
      ...stats
    });
  } catch (err) {
    console.error('❌ [TwoWaySync] Lỗi đồng bộ Sheet -> PostgreSQL:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Chiều 2: Đẩy toàn bộ dữ liệu từ PostgreSQL lên làm mới Google Sheet (DB -> Sheet)
app.post('/api/sync/db-to-sheet', async (req, res) => {
  try {
    console.log(`📤 [TwoWaySync] Đang đẩy toàn bộ state PostgreSQL lên Google Sheet...`);
    const [state, balances] = await Promise.all([
      getFullState(),
      getMonthlyBalances()
    ]);
    const result = await syncToGoogleSheet('syncFullDatabase', { state, balances });
    res.json({ 
      success: true, 
      message: `Đã đẩy toàn bộ dữ liệu từ PostgreSQL lên Google Sheet!`,
      txCount: state.tx?.length || 0,
      contractCount: state.contracts?.length || 0,
      balanceCount: balances.length,
      result 
    });
  } catch (err) {
    console.error('❌ [TwoWaySync] Lỗi đẩy DB -> Google Sheet:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Khởi chạy server
async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`🚀 Sổ Quỹ VPM API Server đang chạy trên cổng ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ Khởi động server thất bại:', err);
    process.exit(1);
  }
}

start();


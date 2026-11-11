import { Router } from 'express';
import { importSheetDataToPostgres } from './syncService.mjs';
import { getFullState } from '../state/stateService.mjs';
import { getMonthlyBalances } from '../ledger/ledgerService.mjs';
import { syncToGoogleSheet, dispatchRealtimeSync } from '../../sheetSync.mjs';

const router = Router();

// Khởi tạo toàn bộ 10 bảng trên Google Sheet
router.post('/init-database-sheets', async (req, res) => {
  try {
    const result = await syncToGoogleSheet('initAllDatabaseSheets', {});
    res.json({ success: true, result });
  } catch (err) {
    console.error('❌ Lỗi khởi tạo các bảng trên Google Sheet:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Chiều 1: Kéo toàn bộ dữ liệu từ Google Sheet về nạp/cập nhật vào PostgreSQL (Sheet -> DB)
router.post('/sync/sheet-to-db', async (req, res) => {
  const url = process.env.GOOGLE_SHEET_API_URL;
  if (!url || !url.trim()) {
    return res.status(400).json({ success: false, error: 'Chưa cấu hình GOOGLE_SHEET_API_URL trong .env' });
  }

  try {
    const sheetResponse = await fetch(url + '?action=exportAllData');
    if (!sheetResponse.ok) {
      throw new Error(`Google Sheet API trả về lỗi HTTP ${sheetResponse.status}`);
    }

    const sheetData = await sheetResponse.json();
    if (!sheetData.success) {
      throw new Error(sheetData.error || 'Google Sheet từ chối xuất dữ liệu');
    }

    const stats = await importSheetDataToPostgres(sheetData);

    dispatchRealtimeSync({
      table: 'sync',
      action: 'UPDATE',
      id: 'SHEET_TO_DB',
      data: stats,
      actor: 'Admin',
      details: `Đồng bộ Sheet -> DB: ${stats.insertedTx} mới, ${stats.updatedTx} sửa`
    });

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

// Chiều 2: Đẩy toàn bộ 10 Bảng nghiệp vụ từ PostgreSQL lên làm mới Google Sheet (DB -> Sheet)
router.post('/sync/db-to-sheet', async (req, res) => {
  try {
    const [state, balances] = await Promise.all([
      getFullState(),
      getMonthlyBalances()
    ]);
    const result = await syncToGoogleSheet('syncFullDatabase', { state, balances });

    dispatchRealtimeSync({
      table: 'sync',
      action: 'UPDATE',
      id: 'DB_TO_SHEET',
      data: { txCount: state.tx?.length || 0, contractsCount: state.contracts?.length || 0 },
      actor: 'Admin',
      details: `Đẩy toàn bộ 10 Bảng từ PostgreSQL lên Google Sheet`
    });

    res.json({ 
      success: true, 
      message: `Đã đẩy toàn bộ 10 Bảng từ PostgreSQL lên Google Sheet!`,
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

export default router;

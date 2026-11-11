import { Router } from 'express';
import { 
  insertTransaction, 
  updateTransaction, 
  deleteTransaction, 
  getMonthlyBalances, 
  recalculateMonthlyBalances, 
  resetLedgerToCurrentMonth 
} from './ledgerService.mjs';
import { executeMonthRollover } from '../../cron.mjs';
import { dispatchRealtimeSync, syncToGoogleSheet } from '../../sheetSync.mjs';
import { recordAuditLog } from '../audit/auditService.mjs';

const router = Router();

// Thêm Giao dịch mới
router.post('/transactions', async (req, res) => {
  try {
    const tx = req.body;
    if (!tx || !tx.id || !tx.date || !tx.amt) {
      return res.status(400).json({ success: false, error: 'Dữ liệu giao dịch không hợp lệ' });
    }

    const saved = await insertTransaction(tx);

    dispatchRealtimeSync({
      table: 'transactions',
      action: 'CREATE',
      id: saved.id,
      data: saved,
      actor: tx.src || 'Web App',
      details: `Thêm giao dịch ${saved.id}: ${saved.desc} (${saved.amt.toLocaleString('vi-VN')} đ)`
    });

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
router.put('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await updateTransaction(id, updates);

    dispatchRealtimeSync({
      table: 'transactions',
      action: 'UPDATE',
      id,
      data: updated,
      actor: updates.actor || 'Web App',
      details: `Cập nhật giao dịch ${id}`
    });

    recalculateMonthlyBalances().then((balances) => {
      syncToGoogleSheet('syncMonthlyBalances', { balances });
    }).catch(console.warn);

    res.json({ success: true, data: updated, savedToPostgres: true });
  } catch (err) {
    console.error('❌ Lỗi cập nhật giao dịch:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Xóa Giao dịch
router.delete('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteTransaction(id);

    dispatchRealtimeSync({
      table: 'transactions',
      action: 'DELETE',
      id,
      data: deleted || {},
      actor: 'Admin',
      details: `Xóa giao dịch ${id}`
    });

    recalculateMonthlyBalances().then((balances) => {
      syncToGoogleSheet('syncMonthlyBalances', { balances });
    }).catch(console.warn);

    res.json({ success: true, data: deleted });
  } catch (err) {
    console.error('❌ Lỗi xóa giao dịch:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Lấy danh sách số dư các tháng
router.get('/monthly-balances', async (req, res) => {
  try {
    const balances = await getMonthlyBalances();
    res.json({ success: true, data: balances });
  } catch (err) {
    console.error('❌ Lỗi lấy số dư các tháng:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Tính toán lại & đồng bộ số dư
router.post('/monthly-balances/sync', async (req, res) => {
  try {
    const balances = await recalculateMonthlyBalances();
    const sheetRes = await syncToGoogleSheet('syncMonthlyBalances', { balances });

    recordAuditLog({
      action: 'SYNC',
      tableName: 'monthly_balances',
      recordId: 'ALL',
      actor: 'Admin',
      details: `Đồng bộ ma trận số dư ${balances.length} tháng sang Google Sheet tab 00_SODU_KY`
    });

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

// Clear sổ giao dịch & reset kỳ
router.post('/ledger/clear', async (req, res) => {
  try {
    const balances = await resetLedgerToCurrentMonth();
    
    const [sheetClearRes, sheetBalanceRes] = await Promise.all([
      syncToGoogleSheet('clearTransactions', {}).catch((e) => ({ success: false, error: e.message })),
      syncToGoogleSheet('syncMonthlyBalances', { balances }).catch((e) => ({ success: false, error: e.message }))
    ]);

    dispatchRealtimeSync({
      table: 'transactions',
      action: 'DELETE',
      id: 'ALL',
      data: {},
      actor: 'Master',
      details: 'Xóa toàn bộ sổ giao dịch gốc & Reset kỳ hiện tại về 0 đ'
    });

    res.json({
      success: true,
      message: 'Đã clear toàn bộ dữ liệu Sổ Giao Dịch Gốc & reset kỳ hiện tại!',
      balances,
      googleSheetSync: {
        clearTransactions: sheetClearRes,
        monthlyBalances: sheetBalanceRes
      }
    });
  } catch (err) {
    console.error('❌ [ClearLedger] Lỗi clear sổ giao dịch:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Trigger cron chuyển kỳ mới
router.post('/cron/trigger-rollover', async (req, res) => {
  try {
    const { targetMonth } = req.body || {};
    const result = await executeMonthRollover(targetMonth);

    dispatchRealtimeSync({
      table: 'monthly_balances',
      action: 'CREATE',
      id: result.targetMonth,
      data: result,
      actor: 'Cron',
      details: `Tạo kỳ tháng mới ${result.targetMonth} với số dư đầu kỳ từ tháng trước`
    });

    res.json({
      success: true,
      message: `Đã thực thi thành công chuyển kỳ tháng mới ${result.targetMonth}!`,
      data: result
    });
  } catch (err) {
    console.error('❌ [CronTrigger] Lỗi kích hoạt chuyển kỳ:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

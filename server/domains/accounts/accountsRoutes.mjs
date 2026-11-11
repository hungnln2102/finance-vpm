import { Router } from 'express';
import { getAccounts, upsertAccount, deleteAccount, toggleAccountStatus } from './accountsService.mjs';
import { dispatchRealtimeSync } from '../../sheetSync.mjs';

const router = Router();

router.get('/accounts', async (req, res) => {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const accounts = await getAccounts(activeOnly);
    res.json({ success: true, data: accounts });
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách tài khoản:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/accounts/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Trạng thái status không hợp lệ' });
    }
    const updated = await toggleAccountStatus(id, status);
    dispatchRealtimeSync({
      table: 'accounts',
      action: 'UPDATE',
      id,
      data: updated,
      actor: req.body.actor || 'Admin',
      details: `${status === 'active' ? 'Bật (ON)' : 'Tắt (OFF)'} tài khoản ${id}`
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('❌ Lỗi cập nhật trạng thái tài khoản:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/accounts', async (req, res) => {
  try {
    const acc = req.body;
    if (!acc || !acc.id || !acc.name) {
      return res.status(400).json({ success: false, error: 'Dữ liệu tài khoản không hợp lệ' });
    }
    const saved = await upsertAccount(acc);
    dispatchRealtimeSync({
      table: 'accounts',
      action: 'UPDATE',
      id: saved.id,
      data: saved,
      actor: req.body.actor || 'Admin',
      details: `Lưu thông tin tài khoản ${saved.id} (${saved.name})`
    });
    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('❌ Lỗi lưu tài khoản:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteAccount(id);
    dispatchRealtimeSync({
      table: 'accounts',
      action: 'DELETE',
      id,
      data: deleted || {},
      actor: 'Admin',
      details: `Xóa tài khoản ${id}`
    });
    res.json({ success: true, data: deleted });
  } catch (err) {
    console.error('❌ Lỗi xóa tài khoản:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

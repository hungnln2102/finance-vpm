import { Router } from 'express';
import { upsertProposal, deleteProposal } from './proposalsService.mjs';
import { dispatchRealtimeSync } from '../../sheetSync.mjs';

const router = Router();

router.post('/proposals', async (req, res) => {
  try {
    const p = req.body;
    const saved = await upsertProposal(p);

    dispatchRealtimeSync({
      table: 'proposals',
      action: 'CREATE',
      id: saved.id,
      data: saved,
      actor: saved.creator || 'Web App',
      details: `Đệ trình kế hoạch ${saved.code} (${saved.amount.toLocaleString('vi-VN')} đ)`
    });

    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('❌ Lỗi tạo đề xuất:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/proposals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const p = { ...req.body, id };
    const saved = await upsertProposal(p);

    dispatchRealtimeSync({
      table: 'proposals',
      action: 'UPDATE',
      id,
      data: saved,
      actor: req.body.actor || 'Admin',
      details: `Cập nhật trạng thái đề xuất ${saved.code || id}: ${saved.status}`
    });

    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('❌ Lỗi cập nhật đề xuất:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/proposals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteProposal(id);

    dispatchRealtimeSync({
      table: 'proposals',
      action: 'DELETE',
      id,
      data: deleted || {},
      actor: 'Admin',
      details: `Xóa đề xuất ${id}`
    });

    res.json({ success: true, data: deleted });
  } catch (err) {
    console.error('❌ Lỗi xóa đề xuất:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

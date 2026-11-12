import { Router } from 'express';
import { insertContract, deleteContract, approveContractDiscount } from './contractsService.mjs';
import { dispatchRealtimeSync } from '../../sheetSync.mjs';

const router = Router();

router.post('/contracts', async (req, res) => {
  try {
    const c = req.body;
    const saved = await insertContract(c);

    await dispatchRealtimeSync({
      table: 'contracts',
      action: 'CREATE',
      id: saved.id,
      data: saved,
      actor: 'Web App',
      details: `Thêm hợp đồng ${saved.id} - ${saved.customer}`
    });

    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('❌ Lỗi thêm hợp đồng:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/contracts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteContract(id);

    await dispatchRealtimeSync({
      table: 'contracts',
      action: 'DELETE',
      id,
      data: deleted || {},
      actor: 'Admin',
      details: `Xóa hợp đồng ${id}`
    });

    res.json({ success: true, data: deleted });
  } catch (err) {
    console.error('❌ Lỗi xóa hợp đồng:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/contracts/:id/approve-discount', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await approveContractDiscount(id);

    await dispatchRealtimeSync({
      table: 'contracts',
      action: 'UPDATE',
      id,
      data: updated,
      actor: 'Master',
      details: `Phê duyệt chiết khấu hợp đồng ${id}`
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('❌ Lỗi duyệt chiết khấu:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

import { Router } from 'express';
import { insertGiftMovement } from './giftsService.mjs';
import { dispatchRealtimeSync } from '../../sheetSync.mjs';

const router = Router();

router.post('/gifts/movements', async (req, res) => {
  try {
    const mv = req.body;
    const saved = await insertGiftMovement(mv);

    dispatchRealtimeSync({
      table: 'gifts',
      action: 'CREATE',
      id: String(saved.id),
      data: saved,
      actor: mv.who || 'Operator',
      details: `${mv.kind === 'out' ? 'Xuất' : 'Nhập'} ${mv.qty} món quà ${mv.item}`
    });

    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('❌ Lỗi lưu biến động quà tặng:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

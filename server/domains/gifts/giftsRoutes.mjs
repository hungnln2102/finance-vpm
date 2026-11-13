import { Router } from 'express';
import { getGiftItems, createGiftItem, insertGiftMovement } from './giftsService.mjs';
import { dispatchRealtimeSync } from '../../sheetSync.mjs';

const router = Router();

router.get('/gifts/items', async (req, res) => {
  try {
    const items = await getGiftItems();
    res.json({ success: true, data: items });
  } catch (err) {
    console.error('❌ Lỗi đọc danh sách sản phẩm quà tặng:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/gifts/items', async (req, res) => {
  try {
    const result = await createGiftItem(req.body || {});
    try {
      await dispatchRealtimeSync({
        table: 'gift_items',
        action: 'CREATE',
        id: String(result.item.id),
        data: result.item,
        actor: req.body?.who || 'Master',
        details: `Tạo sản phẩm mới ${result.item.id} - ${result.item.name} (${result.item.price.toLocaleString('vi-VN')} đ/${result.item.unit})`
      });
    } catch (syncErr) {
      console.warn('⚠️ [Gifts] Đã lưu PostgreSQL thành công, bỏ qua lỗi đồng bộ Sheet:', syncErr.message);
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('❌ Lỗi tạo sản phẩm quà tặng:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/gifts/movements', async (req, res) => {
  try {
    const mv = req.body;
    const saved = await insertGiftMovement(mv);

    try {
      await dispatchRealtimeSync({
        table: 'gifts',
        action: 'CREATE',
        id: String(saved.id),
        data: saved,
        actor: mv.who || 'Operator',
        details: `${mv.kind === 'out' ? 'Xuất' : 'Nhập'} ${mv.qty} món quà ${mv.item}`
      });
    } catch (syncErr) {
      console.warn('⚠️ [Gifts] Đã lưu phiếu kho vào PostgreSQL, bỏ qua lỗi đồng bộ Sheet:', syncErr.message);
    }

    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('❌ Lỗi lưu biến động quà tặng:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;

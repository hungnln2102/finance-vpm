import { Router } from 'express';
import { upsertCostAdjustment } from './budgetService.mjs';
import { dispatchRealtimeSync } from '../../sheetSync.mjs';

const router = Router();

router.post('/cost-adjustments', async (req, res) => {
  try {
    const adj = req.body;
    const saved = await upsertCostAdjustment(adj);

    dispatchRealtimeSync({
      table: 'cost_adjustments',
      action: 'CREATE',
      id: saved.id,
      data: saved,
      actor: adj.approvedBy || 'Master',
      details: `Điều chỉnh ngân sách ${saved.category} tháng ${saved.month}: ${saved.newBudget.toLocaleString('vi-VN')} đ`
    });

    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('❌ Lỗi điều chỉnh ngân sách:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

import { Router } from 'express';
import {
  getCostCategories,
  upsertCostCategory,
  upsertCostBudget,
  setCostBudgetStatus,
  upsertCostAdjustment
} from './budgetService.mjs';
import { dispatchRealtimeSync } from '../../sheetSync.mjs';

const router = Router();

router.get('/cost-categories', async (req, res) => {
  try {
    res.json({ success: true, data: await getCostCategories() });
  } catch (err) {
    console.error('L?i ??c danh m?c cost:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/cost-categories', async (req, res) => {
  try {
    const saved = await upsertCostCategory(req.body || {});
    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('L?i l?u danh m?c cost:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/cost-budgets', async (req, res) => {
  try {
    const saved = await upsertCostBudget(req.body || {});
    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('L?i l?u ng?n s?ch cost:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/cost-budgets/status', async (req, res) => {
  try {
    const saved = await setCostBudgetStatus(req.body || {});
    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('L?i c?p nh?t tr?ng th?i cost:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/cost-adjustments', async (req, res) => {
  try {
    const adj = req.body;
    const saved = await upsertCostAdjustment(adj);
    await dispatchRealtimeSync({
      table: 'cost_adjustments',
      action: 'CREATE',
      id: saved.id,
      data: saved,
      actor: adj.approvedBy || 'Master',
      details: `?i?u ch?nh ng?n s?ch ${saved.category} th?ng ${saved.month}: ${saved.newBudget.toLocaleString('vi-VN')} ?`
    });
    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('L?i ?i?u ch?nh ng?n s?ch:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

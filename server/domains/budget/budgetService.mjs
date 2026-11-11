import { pool } from '../../config/dbPool.mjs';
import { tableName, TABLES } from '../../config/dbSchema.mjs';

export async function upsertCostAdjustment(adj) {
  const query = `
    INSERT INTO ${tableName(TABLES.COST_ADJUSTMENTS)} (id, month, category, old_budget, new_budget, reason, approved_by, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (id) DO UPDATE SET
      new_budget = EXCLUDED.new_budget,
      reason = EXCLUDED.reason,
      approved_by = EXCLUDED.approved_by,
      status = EXCLUDED.status
    RETURNING id, month, category, old_budget::float as "oldBudget", new_budget::float as "newBudget", 
              reason, approved_by as "approvedBy", status, to_char(created_at, 'YYYY-MM-DD') as "createdAt";
  `;
  const res = await pool.query(query, [
    adj.id, adj.month, adj.category, adj.oldBudget || 0, adj.newBudget || 0,
    adj.reason || '', adj.approvedBy || '', adj.status || 'pending'
  ]);
  return res.rows[0];
}

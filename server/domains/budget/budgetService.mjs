import { pool } from '../../config/dbPool.mjs';
import { tableName, TABLES } from '../../config/dbSchema.mjs';

export async function getCostCategories() {
  const result = await pool.query(
    `SELECT code, name, is_active AS \"isActive\"
     FROM ${tableName(TABLES.COST_CATEGORIES)}
     WHERE is_active = true
     ORDER BY code`
  );
  return result.rows;
}

export async function upsertCostCategory(category) {
  const result = await pool.query(
    `INSERT INTO ${tableName(TABLES.COST_CATEGORIES)} (code, name)
     VALUES ($1, $2)
     ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, is_active = true, updated_at = NOW()
     RETURNING code, name, is_active AS \"isActive\"`,
    [category.code.trim().toUpperCase(), category.name.trim()]
  );
  return result.rows[0];
}

export async function upsertCostBudget({ month, category, amount, isEnabled = true }) {
  const result = await pool.query(
    `INSERT INTO ${tableName(TABLES.COST_BUDGETS)} (month, category_code, amount, is_enabled)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (month, category_code) DO UPDATE SET
       amount = EXCLUDED.amount,
       is_enabled = EXCLUDED.is_enabled,
       updated_at = NOW()
     RETURNING month, category_code AS \"category\", amount::float AS amount, is_enabled AS \"isEnabled\"`,
    [month, category.trim().toUpperCase(), Number(amount) || 0, Boolean(isEnabled)]
  );
  return result.rows[0];
}

export async function setCostBudgetStatus({ month, category, isEnabled }) {
  const result = await pool.query(
    `INSERT INTO ${tableName(TABLES.COST_BUDGETS)} (month, category_code, amount, is_enabled)
     VALUES ($1, $2, 0, $3)
     ON CONFLICT (month, category_code) DO UPDATE SET
       is_enabled = EXCLUDED.is_enabled,
       updated_at = NOW()
     RETURNING month, category_code AS \"category\", amount::float AS amount, is_enabled AS \"isEnabled\"`,
    [month, category.trim().toUpperCase(), Boolean(isEnabled)]
  );
  return result.rows[0];
}

export async function upsertCostAdjustment(adj) {
  const query = `
    INSERT INTO ${tableName(TABLES.COST_ADJUSTMENTS)} (id, month, category, old_budget, new_budget, reason, approved_by, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (id) DO UPDATE SET
      new_budget = EXCLUDED.new_budget,
      reason = EXCLUDED.reason,
      approved_by = EXCLUDED.approved_by,
      status = EXCLUDED.status
    RETURNING id, month, category, old_budget::float as \"oldBudget\", new_budget::float as \"newBudget\",
              reason, approved_by as \"approvedBy\", status, to_char(created_at, 'YYYY-MM-DD') as \"createdAt\";
  `;
  const res = await pool.query(query, [
    adj.id, adj.month, adj.category, adj.oldBudget || 0, adj.newBudget || 0,
    adj.reason || '', adj.approvedBy || '', adj.status || 'pending'
  ]);
  return res.rows[0];
}

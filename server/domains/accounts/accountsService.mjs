import { pool } from '../../config/dbPool.mjs';
import { tableName, TABLES } from '../../config/dbSchema.mjs';

/**
 * Lấy danh sách tài khoản từ database
 * @param {boolean} [activeOnly=false] Nếu true thì chỉ lấy tài khoản active, ngược lại lấy tất cả
 */
export async function getAccounts(activeOnly = false) {
  const whereClause = activeOnly ? "WHERE status = 'active'" : "";
  const res = await pool.query(`
    SELECT id, name, type, account_no as "accountNo", bank_name as "bankName", status
    FROM ${tableName(TABLES.ACCOUNTS)}
    ${whereClause}
    ORDER BY CASE id WHEN 'QUY' THEN 1 WHEN 'ACB' THEN 2 WHEN 'MB' THEN 3 ELSE 4 END, id ASC;
  `);
  return res.rows;
}

/**
 * Cập nhật nhanh trạng thái bật/tắt (active/inactive) của tài khoản
 */
export async function toggleAccountStatus(id, status) {
  const query = `
    UPDATE ${tableName(TABLES.ACCOUNTS)}
    SET status = $2, updated_at = NOW()
    WHERE id = $1
    RETURNING id, name, type, account_no as "accountNo", bank_name as "bankName", status;
  `;
  const res = await pool.query(query, [id, status]);
  return res.rows[0];
}

/**
 * Thêm hoặc cập nhật tài khoản
 */
export async function upsertAccount(acc) {
  const query = `
    INSERT INTO ${tableName(TABLES.ACCOUNTS)} (id, name, type, account_no, bank_name, status, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      type = EXCLUDED.type,
      account_no = EXCLUDED.account_no,
      bank_name = EXCLUDED.bank_name,
      status = EXCLUDED.status,
      updated_at = NOW()
    RETURNING id, name, type, account_no as "accountNo", bank_name as "bankName", status;
  `;
  const res = await pool.query(query, [
    acc.id, acc.name, acc.type || 'bank', acc.accountNo || '', acc.bankName || '', acc.status || 'active'
  ]);
  return res.rows[0];
}

/**
 * Xóa tài khoản
 */
export async function deleteAccount(id) {
  const res = await pool.query(`DELETE FROM ${tableName(TABLES.ACCOUNTS)} WHERE id = $1 RETURNING *;`, [id]);
  return res.rows[0];
}

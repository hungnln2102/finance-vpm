import { pool } from '../../config/dbPool.mjs';
import { tableName, TABLES } from '../../config/dbSchema.mjs';

/**
 * Ghi vết kiểm toán vào PostgreSQL
 */
export async function recordAuditLog({ 
  action, 
  tableName: targetTable, 
  recordId = '', 
  actor = 'System', 
  details = '', 
  payload = {} 
}, clientOrPool = pool) {
  const query = `
    INSERT INTO ${tableName(TABLES.AUDIT_LOGS)} (action, table_name, record_id, actor, details, payload)
    VALUES ($1, $2, $3, $4, $5, $6::jsonb)
    RETURNING id, to_char(timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD HH24:MI:SS') as timestamp, 
              action, table_name as "tableName", record_id as "recordId", actor, details;
  `;
  const res = await clientOrPool.query(query, [
    action, 
    targetTable, 
    String(recordId), 
    actor, 
    details, 
    JSON.stringify(payload || {})
  ]);
  return res.rows[0];
}

/**
 * Lấy danh sách nhật ký kiểm toán
 */
export async function getAuditLogs(limit = 200) {
  const res = await pool.query(`
    SELECT id, to_char(timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD HH24:MI:SS') as timestamp,
           action, table_name as "tableName", record_id as "recordId", actor, details
    FROM ${tableName(TABLES.AUDIT_LOGS)}
    ORDER BY id DESC LIMIT $1;
  `, [limit]);
  return res.rows;
}

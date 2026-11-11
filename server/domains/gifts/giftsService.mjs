import { pool } from '../../config/dbPool.mjs';
import { tableName, TABLES } from '../../config/dbSchema.mjs';

export async function insertGiftMovement(mv) {
  const query = `
    INSERT INTO ${tableName(TABLES.GIFT_MOVEMENTS)} (d, item, qty, kind, who, tx, "to", note, ex)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, to_char(d, 'YYYY-MM-DD') as d, item, qty, kind, who, tx, "to", note, ex;
  `;
  const res = await pool.query(query, [
    mv.d || new Date().toISOString().slice(0, 10), mv.item, mv.qty, mv.kind || 'out',
    mv.who || '', mv.tx || '', mv.to || '', mv.note || '', mv.ex !== false
  ]);
  return res.rows[0];
}

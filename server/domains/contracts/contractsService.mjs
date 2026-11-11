import { pool } from '../../config/dbPool.mjs';
import { tableName, TABLES } from '../../config/dbSchema.mjs';

export async function insertContract(c) {
  const query = `
    INSERT INTO ${tableName(TABLES.CONTRACTS)} (id, kind, customer, no, tv, signed, fee, disc, disc_approved, due, terms, note)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (id) DO UPDATE SET
      kind = EXCLUDED.kind, customer = EXCLUDED.customer, no = EXCLUDED.no, tv = EXCLUDED.tv,
      signed = EXCLUDED.signed, fee = EXCLUDED.fee, disc = EXCLUDED.disc,
      disc_approved = EXCLUDED.disc_approved, due = EXCLUDED.due, terms = EXCLUDED.terms,
      note = EXCLUDED.note, updated_at = NOW()
    RETURNING id, kind, customer, no, tv, to_char(signed, 'YYYY-MM-DD') as signed, 
              fee::float as fee, disc::float as disc, disc_approved as "discApproved", 
              to_char(due, 'YYYY-MM-DD') as due, terms, note;
  `;
  const values = [
    c.id, c.kind, c.customer, c.no || '', c.tv || '', c.signed || null,
    c.fee || 0, c.disc || 0, c.discApproved || false, c.due || null,
    c.terms || '', c.note || ''
  ];
  const res = await pool.query(query, values);
  return res.rows[0];
}

export async function deleteContract(id) {
  const res = await pool.query(`DELETE FROM ${tableName(TABLES.CONTRACTS)} WHERE id = $1 RETURNING *;`, [id]);
  return res.rows[0];
}

export async function approveContractDiscount(id) {
  const res = await pool.query(
    `UPDATE ${tableName(TABLES.CONTRACTS)} SET disc_approved = TRUE, updated_at = NOW() WHERE id = $1 
     RETURNING id, kind, customer, no, tv, to_char(signed, 'YYYY-MM-DD') as signed, 
               fee::float as fee, disc::float as disc, disc_approved as "discApproved", 
               to_char(due, 'YYYY-MM-DD') as due, terms, note;`,
    [id]
  );
  return res.rows[0];
}

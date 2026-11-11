import { pool } from '../../config/dbPool.mjs';
import { tableName, TABLES } from '../../config/dbSchema.mjs';

export async function upsertProposal(p) {
  const query = `
    INSERT INTO ${tableName(TABLES.PROPOSALS)} (id, code, title, creator, creator_email, department, amount, date, description, status, resend_sent_at, cc_emails, threads, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, NOW())
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      amount = EXCLUDED.amount,
      description = EXCLUDED.description,
      status = EXCLUDED.status,
      threads = EXCLUDED.threads,
      updated_at = NOW()
    RETURNING id, code, title, creator, creator_email as "creatorEmail", department, amount::float, 
              to_char(date, 'YYYY-MM-DD') as date, description, status, 
              resend_sent_at as "resendSentAt", cc_emails as "ccEmails", threads;
  `;
  const values = [
    p.id, p.code || p.id, p.title || '', p.creator || '', p.creatorEmail || '',
    p.department || '', p.amount || 0, p.date || new Date().toISOString().slice(0, 10),
    p.description || '', p.status || 'pending_admin', p.resendSentAt || '',
    p.ccEmails || [], JSON.stringify(p.threads || [])
  ];
  const res = await pool.query(query, values);
  return res.rows[0];
}

export async function deleteProposal(id) {
  const res = await pool.query(`DELETE FROM ${tableName(TABLES.PROPOSALS)} WHERE id = $1 RETURNING *;`, [id]);
  return res.rows[0];
}

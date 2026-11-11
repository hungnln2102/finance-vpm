import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

export const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://admin:ZAQ!xsw21122@localhost:5432/mydtbmav';
export const SCHEMA = process.env.DB_SCHEMA || 'finance_vpm';

export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000
});

/**
 * Helper thực thi khối logic trong một PostgreSQL Transaction an toàn ACID
 */
export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function checkDbHealth() {
  const res = await pool.query('SELECT 1 as healthy');
  return res.rows && res.rows[0]?.healthy === 1;
}

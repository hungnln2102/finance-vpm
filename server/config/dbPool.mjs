import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

export const DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  'postgresql://admin:ZAQ!xsw21122@localhost:5432/mydtbmav';

export const SCHEMA = process.env.DB_SCHEMA || 'finance_vpm';

const isLocalDatabase =
  DATABASE_URL.includes('@localhost') ||
  DATABASE_URL.includes('@127.0.0.1') ||
  DATABASE_URL.includes('://localhost') ||
  DATABASE_URL.includes('://127.0.0.1');

const shouldUseSsl =
  process.env.DB_SSL === 'true' ||
  (!isLocalDatabase && process.env.DB_SSL !== 'false');

export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: process.env.VERCEL ? 5 : 10,
  idleTimeoutMillis: 30000,
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : false
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

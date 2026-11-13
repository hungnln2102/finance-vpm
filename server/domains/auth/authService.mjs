import crypto from 'crypto';
import { promisify } from 'util';
import { tableName, TABLES } from '../../config/dbSchema.mjs';
import { pool } from '../../config/dbPool.mjs';

const scrypt = promisify(crypto.scrypt);
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

function hashSessionToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('base64url');
  const derivedKey = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${Buffer.from(derivedKey).toString('base64url')}`;
}

export async function verifyPassword(password, storedHash) {
  const [algorithm, salt, encodedKey] = String(storedHash).split('$');
  if (algorithm !== 'scrypt' || !salt || !encodedKey) return false;

  const expected = Buffer.from(encodedKey, 'base64url');
  const actual = Buffer.from(await scrypt(password, salt, expected.length));
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

export async function bootstrapMasterAccount(client) {
  const username = process.env.AUTH_BOOTSTRAP_USERNAME?.trim();
  const password = process.env.AUTH_BOOTSTRAP_PASSWORD;
  const displayName = process.env.AUTH_BOOTSTRAP_DISPLAY_NAME?.trim() || 'Sếp Mavryk';

  if (!username || !password) {
    console.warn('AUTH_BOOTSTRAP_USERNAME và AUTH_BOOTSTRAP_PASSWORD chưa được cấu hình; không tạo Master bootstrap.');
    return;
  }

  const passwordHash = await hashPassword(password);
  await client.query(
    `INSERT INTO ${tableName(TABLES.USER_ACCOUNTS)} (username, display_name, role, password_hash)
     VALUES ($1, $2, 'master', $3)
     ON CONFLICT (username) DO NOTHING`,
    [username.toLowerCase(), displayName, passwordHash]
  );
}

export async function authenticate(username, password) {
  const result = await pool.query(
    `SELECT id, username, display_name, role, password_hash
     FROM ${tableName(TABLES.USER_ACCOUNTS)}
     WHERE username = $1 AND is_active = true`,
    [username.trim().toLowerCase()]
  );
  const account = result.rows[0];
  if (!account || !(await verifyPassword(password, account.password_hash))) return null;

  await pool.query(
    `UPDATE ${tableName(TABLES.USER_ACCOUNTS)} SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1`,
    [account.id]
  );
  return toPublicAccount(account);
}

export async function createSession(accountId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await pool.query(
    `INSERT INTO ${tableName(TABLES.AUTH_SESSIONS)} (user_account_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [accountId, tokenHash, expiresAt]
  );
  return { token, expiresAt };
}

export async function getSessionAccount(token) {
  if (!token) return null;
  const result = await pool.query(
    `SELECT u.id, u.username, u.display_name, u.role
     FROM ${tableName(TABLES.AUTH_SESSIONS)} s
     JOIN ${tableName(TABLES.USER_ACCOUNTS)} u ON u.id = s.user_account_id
     WHERE s.token_hash = $1 AND s.expires_at > NOW() AND s.revoked_at IS NULL AND u.is_active = true`,
    [hashSessionToken(token)]
  );
  return result.rows[0] ? toPublicAccount(result.rows[0]) : null;
}

export async function revokeSession(token) {
  if (!token) return;
  await pool.query(
    `UPDATE ${tableName(TABLES.AUTH_SESSIONS)} SET revoked_at = NOW() WHERE token_hash = $1`,
    [hashSessionToken(token)]
  );
}

function toPublicAccount(account) {
  return {
    id: account.id,
    username: account.username,
    displayName: account.display_name,
    role: account.role
  };
}

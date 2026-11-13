import { Router } from 'express';
import { authenticate, createSession, getSessionAccount, revokeSession } from './authService.mjs';

const router = Router();
const COOKIE_NAME = 'finance_vpm_session';

function getCookie(req, name) {
  const value = req.headers.cookie?.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${name}=`));
  return value ? decodeURIComponent(value.slice(name.length + 1)) : '';
}

function setSessionCookie(res, token, expiresAt) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}${secure}`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Vui lòng nhập tài khoản và mật khẩu.' });
  }

  try {
    const account = await authenticate(username, password);
    if (!account) return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không đúng.' });

    const session = await createSession(account.id);
    setSessionCookie(res, session.token, session.expiresAt);
    return res.json({ user: account });
  } catch (error) {
    console.error('Login failed:', error);
    return res.status(500).json({ error: 'Không thể đăng nhập vào lúc này.' });
  }
});

router.post('/auth/logout', async (req, res) => {
  try {
    await revokeSession(getCookie(req, COOKIE_NAME));
  } catch (error) {
    console.error('Logout failed:', error);
  }
  clearSessionCookie(res);
  return res.status(204).end();
});

router.get('/auth/me', async (req, res) => {
  try {
    const account = await getSessionAccount(getCookie(req, COOKIE_NAME));
    if (!account) return res.status(401).json({ error: 'Chưa đăng nhập.' });
    return res.json({ user: account });
  } catch (error) {
    console.error('Session lookup failed:', error);
    return res.status(500).json({ error: 'Không thể kiểm tra phiên đăng nhập.' });
  }
});

export function requireAuth(req, res, next) {
  getSessionAccount(getCookie(req, COOKIE_NAME))
    .then((account) => {
      if (!account) return res.status(401).json({ error: 'Cần đăng nhập để truy cập dữ liệu.' });
      req.user = account;
      return next();
    })
    .catch((error) => {
      console.error('Auth middleware failed:', error);
      return res.status(500).json({ error: 'Không thể xác thực phiên đăng nhập.' });
    });
}

export function requireWriteAccess(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.user?.role === 'master') return next();
  return res.status(403).json({ error: 'Chỉ Master được phép thay đổi dữ liệu.' });
}

export default router;

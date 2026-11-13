import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { checkDbHealth } from './config/dbPool.mjs';
import { initDb } from './domains/init/initDbService.mjs';
import { getFullState } from './domains/state/stateService.mjs';
import { initCronJobs, ensureCurrentMonthInitialized } from './cron.mjs';

// Domain Routers
import accountsRoutes from './domains/accounts/accountsRoutes.mjs';
import ledgerRoutes from './domains/ledger/ledgerRoutes.mjs';
import contractsRoutes from './domains/contracts/contractsRoutes.mjs';
import attendanceRoutes from './domains/attendance/attendanceRoutes.mjs';
import proposalsRoutes from './domains/proposals/proposalsRoutes.mjs';
import budgetRoutes from './domains/budget/budgetRoutes.mjs';
import giftsRoutes from './domains/gifts/giftsRoutes.mjs';
import auditRoutes from './domains/audit/auditRoutes.mjs';
import syncRoutes from './domains/sync/syncRoutes.mjs';
import authRoutes, { requireAuth, requireWriteAccess } from './domains/auth/authRoutes.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '10mb' }));

let initPromise = null;
export function ensureServerInitialized() {
  if (!initPromise) {
    initPromise = (async () => {
      await initDb();
      await ensureCurrentMonthInitialized();
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

app.use('/api', async (req, res, next) => {
  try {
    await ensureServerInitialized();
    next();
  } catch (err) {
    console.error('❌ Lỗi khởi tạo PostgreSQL schema/seed:', err);
    res.status(500).json({
      status: 'error',
      error: 'Không thể khởi tạo kết nối PostgreSQL: ' + (err?.message || 'Unknown error')
    });
  }
});

// System Health & Full State Endpoints
app.get('/api/health', async (req, res) => {
  try {
    const dbOk = await checkDbHealth();
    res.json({
      status: dbOk ? 'ok' : 'error',
      database: process.env.VERCEL ? 'Vercel Postgres (Cloud)' : 'PostgreSQL 16 (Local)',
      schema: process.env.DB_SCHEMA || 'finance_vpm',
      googleSheetSyncEnabled: Boolean(process.env.GOOGLE_SHEET_API_URL && process.env.GOOGLE_SHEET_API_URL.trim()),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.use('/api', authRoutes);
app.use('/api', requireAuth);
app.use('/api', requireWriteAccess);

app.get('/api/state', async (req, res) => {
  try {
    const state = await getFullState();
    res.json({ success: true, data: state });
  } catch (err) {
    console.error('❌ Lỗi lấy state từ PostgreSQL:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mount Domain Routers
app.use('/api', accountsRoutes);
app.use('/api', ledgerRoutes);
app.use('/api', contractsRoutes);
app.use('/api', attendanceRoutes);
app.use('/api', proposalsRoutes);
app.use('/api', budgetRoutes);
app.use('/api', giftsRoutes);
app.use('/api', auditRoutes);
app.use('/api', syncRoutes);

// Phục vụ Web Frontend tĩnh (SPA)
app.use(express.static(distPath));
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

// Bootstrap Server (Local / Long-running Node process)
async function start() {
  try {
    await ensureServerInitialized();
    initCronJobs();

    app.listen(PORT, () => {
      console.log(`🚀 Sổ Quỹ VPM API Server (Domain-Driven) đang chạy trên cổng ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ Khởi động server thất bại:', err);
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  start();
}

export default app;

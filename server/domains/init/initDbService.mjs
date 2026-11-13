import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, SCHEMA } from '../../config/dbPool.mjs';
import { recalculateMonthlyBalances } from '../ledger/ledgerService.mjs';
import { bootstrapMasterAccount } from '../auth/authService.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Khởi tạo Schema và các bảng dữ liệu trong PostgreSQL (finance_vpm)
 */
export async function initDb() {
  const client = await pool.connect();
  try {
    console.log(`🔌 Kết nối PostgreSQL thành công. Đang khởi tạo schema: ${SCHEMA}...`);
    await client.query('BEGIN');

    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${SCHEMA};`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.user_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(128) NOT NULL UNIQUE,
        display_name VARCHAR(128) NOT NULL,
        role VARCHAR(32) NOT NULL CHECK (role IN ('operator', 'admin', 'master')),
        password_hash TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        last_login_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.auth_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_account_id UUID NOT NULL REFERENCES ${SCHEMA}.user_accounts(id) ON DELETE CASCADE,
        token_hash CHAR(64) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        revoked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_auth_sessions_active ON ${SCHEMA}.auth_sessions(user_account_id, expires_at) WHERE revoked_at IS NULL;
    `);
    await bootstrapMasterAccount(client);

    // 1. Transactions
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.transactions (
        id VARCHAR(32) PRIMARY KEY,
        date DATE NOT NULL,
        acc VARCHAR(16) NOT NULL,
        dir VARCHAR(8) NOT NULL,
        amt NUMERIC(15, 2) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(32) DEFAULT '',
        cat VARCHAR(64) DEFAULT '',
        contract VARCHAR(64) DEFAULT '',
        status VARCHAR(32) DEFAULT 'migrated',
        flags TEXT[] DEFAULT ARRAY[]::TEXT[],
        doc TEXT DEFAULT '',
        src TEXT DEFAULT '',
        proposal_id VARCHAR(32) DEFAULT '',
        receipts JSONB DEFAULT '[]'::JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE ${SCHEMA}.transactions ADD COLUMN IF NOT EXISTS proposal_id VARCHAR(32) DEFAULT '';
      ALTER TABLE ${SCHEMA}.transactions ADD COLUMN IF NOT EXISTS receipts JSONB DEFAULT '[]'::JSONB;
      CREATE INDEX IF NOT EXISTS idx_tx_date ON ${SCHEMA}.transactions(date);
      CREATE INDEX IF NOT EXISTS idx_tx_acc ON ${SCHEMA}.transactions(acc);
      CREATE INDEX IF NOT EXISTS idx_tx_contract ON ${SCHEMA}.transactions(contract);
      CREATE INDEX IF NOT EXISTS idx_tx_proposal ON ${SCHEMA}.transactions(proposal_id);
    `);

    // 2. Contracts
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.contracts (
        id VARCHAR(32) PRIMARY KEY,
        kind VARCHAR(8) NOT NULL,
        customer VARCHAR(128) NOT NULL,
        no VARCHAR(64) DEFAULT '',
        tv VARCHAR(128) DEFAULT '',
        signed DATE,
        fee NUMERIC(15, 2) DEFAULT 0,
        disc NUMERIC(15, 2) DEFAULT 0,
        disc_approved BOOLEAN DEFAULT FALSE,
        due DATE,
        terms TEXT DEFAULT '',
        note TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Gift Items
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.gift_items (
        id VARCHAR(32) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        unit VARCHAR(32) NOT NULL,
        price NUMERIC(15, 2) DEFAULT 0
      );
    `);

    // 4. Gift Movements
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.gift_movements (
        id SERIAL PRIMARY KEY,
        d DATE NOT NULL,
        item VARCHAR(32) NOT NULL,
        qty INT NOT NULL,
        kind VARCHAR(8) NOT NULL,
        who VARCHAR(255) DEFAULT '',
        tx VARCHAR(32) DEFAULT '',
        "to" VARCHAR(32) DEFAULT '',
        note TEXT DEFAULT '',
        ex BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 5. Staff
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.staff (
        id VARCHAR(32) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        role VARCHAR(64) DEFAULT '',
        base_salary NUMERIC(15, 2) DEFAULT 0,
        allowance NUMERIC(15, 2) DEFAULT 0,
        status VARCHAR(32) DEFAULT 'active'
      );
    `);

    // 6. Proposals
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.proposals (
        id VARCHAR(32) PRIMARY KEY,
        code VARCHAR(64) NOT NULL,
        title TEXT NOT NULL,
        creator VARCHAR(128) NOT NULL,
        creator_email VARCHAR(128) DEFAULT '',
        department VARCHAR(128) DEFAULT '',
        amount NUMERIC(15, 2) DEFAULT 0,
        date DATE NOT NULL,
        description TEXT DEFAULT '',
        status VARCHAR(32) DEFAULT 'pending_master',
        resend_sent_at VARCHAR(64) DEFAULT '',
        cc_emails TEXT[] DEFAULT ARRAY[]::TEXT[],
        threads JSONB DEFAULT '[]'::JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 7. Cost Adjustments
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.cost_adjustments (
        id VARCHAR(32) PRIMARY KEY,
        month VARCHAR(16) NOT NULL,
        category VARCHAR(64) NOT NULL,
        old_budget NUMERIC(15, 2) DEFAULT 0,
        new_budget NUMERIC(15, 2) DEFAULT 0,
        reason TEXT DEFAULT '',
        approved_by VARCHAR(128) DEFAULT '',
        status VARCHAR(32) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 8. App Metadata
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.app_metadata (
        key VARCHAR(64) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 9. Monthly Balances
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.monthly_balances (
        month VARCHAR(16) PRIMARY KEY,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        start_quy NUMERIC(15, 2) NOT NULL DEFAULT 0,
        end_quy NUMERIC(15, 2) NOT NULL DEFAULT 0,
        start_acb NUMERIC(15, 2) NOT NULL DEFAULT 0,
        end_acb NUMERIC(15, 2) NOT NULL DEFAULT 0,
        start_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
        end_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
        net_change NUMERIC(15, 2) NOT NULL DEFAULT 0,
        status VARCHAR(32) NOT NULL DEFAULT 'open',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_monthly_balances_month ON ${SCHEMA}.monthly_balances(month);
    `);

    // 10. Accounts
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.accounts (
        id VARCHAR(32) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        type VARCHAR(64) DEFAULT 'cash',
        account_no VARCHAR(64) DEFAULT '',
        bank_name VARCHAR(128) DEFAULT '',
        status VARCHAR(32) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      INSERT INTO ${SCHEMA}.accounts (id, name, type, account_no, bank_name, status)
      VALUES
        ('QUY', 'Sổ quỹ văn phòng (Tiền mặt)', 'cash', '', '', 'active'),
        ('ACB', 'Tài khoản ACB (Ngân hàng Á Châu)', 'bank', '0378304963', 'ACB', 'active'),
        ('MB', 'Tài khoản MB Bank (Ngân hàng Quân Đội)', 'bank', '0378304963', 'MB Bank', 'active'),
        ('TCB', 'Tài khoản Techcombank', 'bank', '', 'Techcombank', 'active')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 11. Audit Logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.audit_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        action VARCHAR(32) NOT NULL,
        table_name VARCHAR(64) NOT NULL,
        record_id VARCHAR(64) DEFAULT '',
        actor VARCHAR(128) DEFAULT 'System',
        details TEXT DEFAULT '',
        payload JSONB DEFAULT '{}'::JSONB
      );
      CREATE INDEX IF NOT EXISTS idx_audit_logs_ts ON ${SCHEMA}.audit_logs(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_tbl ON ${SCHEMA}.audit_logs(table_name);
    `);

    // 12. Attendance
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.attendance (
        id SERIAL PRIMARY KEY,
        staff_id VARCHAR(32) NOT NULL,
        date DATE NOT NULL,
        val VARCHAR(16) NOT NULL DEFAULT '1',
        status VARCHAR(32) DEFAULT 'posted',
        note TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT uq_attendance_staff_date UNIQUE (staff_id, date)
      );
      CREATE INDEX IF NOT EXISTS idx_att_date ON ${SCHEMA}.attendance(date);
    `);

    await client.query('COMMIT');
    console.log(`✅ Khởi tạo Schema ${SCHEMA} và các bảng thành công!`);

    await seedIfEmpty(client);
    await recalculateMonthlyBalances(client);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`❌ Lỗi khởi tạo cơ sở dữ liệu PostgreSQL:`, err);
    throw err;
  } finally {
    client.release();
  }
}

async function seedIfEmpty(client) {
  const countRes = await client.query(`SELECT COUNT(*)::int as cnt FROM ${SCHEMA}.staff;`);
  if (countRes.rows[0].cnt > 0) {
    console.log(`ℹ️ PostgreSQL đã có dữ liệu khởi tạo trong schema ${SCHEMA}.`);
    return;
  }

  const seedPath = path.resolve(__dirname, '../../seedData.json');
  if (!fs.existsSync(seedPath)) {
    console.warn(`⚠️ Không tìm thấy tệp seedData.json để nạp.`);
    return;
  }

  console.log(`🌱 Đang nạp Seed Data vào PostgreSQL schema ${SCHEMA}...`);
  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

  await client.query('BEGIN');
  try {
    if (seed.tx && seed.tx.length > 0) {
      for (const t of seed.tx) {
        await client.query(`
          INSERT INTO ${SCHEMA}.transactions (id, date, acc, dir, amt, description, type, cat, contract, status, flags, doc, src)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO NOTHING;
        `, [
          t.id, t.date, t.acc, t.dir, t.amt, t.desc || '', t.type || '', t.cat || '',
          t.contract || '', t.status || 'migrated', t.flags || [], t.doc || '', t.src || ''
        ]);
      }
      console.log(`✅ Đã nạp ${seed.tx.length} giao dịch.`);
    }

    if (seed.contracts && seed.contracts.length > 0) {
      for (const c of seed.contracts) {
        await client.query(`
          INSERT INTO ${SCHEMA}.contracts (id, kind, customer, no, tv, signed, fee, disc, disc_approved, due, terms, note)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO NOTHING;
        `, [
          c.id, c.kind, c.customer, c.no || '', c.tv || '', c.signed || null,
          c.fee || 0, c.disc || 0, c.discApproved || false, c.due || null,
          c.terms || '', c.note || ''
        ]);
      }
      console.log(`✅ Đã nạp ${seed.contracts.length} hợp đồng.`);
    }

    if (seed.staff && seed.staff.length > 0) {
      for (const s of seed.staff) {
        await client.query(`
          INSERT INTO ${SCHEMA}.staff (id, name, role, base_salary, allowance, status)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO NOTHING;
        `, [s.id, s.name, s.role || '', s.baseSalary || 0, s.allowance || 0, s.status || 'active']);
      }
      console.log(`✅ Đã nạp ${seed.staff.length} nhân sự.`);
    }

    const seedGifts = [
      { id: 'Q01', name: 'Hộp bánh trung thu', unit: 'hộp', price: 271675 },
      { id: 'Q02', name: 'Quà bốc thăm hội thảo', unit: 'phần', price: 666364 },
      { id: 'Q03', name: 'Ấn phẩm, brochure', unit: 'cuốn', price: 14850 },
      { id: 'Q04', name: 'Tờ rơi thẻ', unit: 'tờ', price: 3208 },
      { id: 'Q05', name: 'Hashtag cầm tay', unit: 'cái', price: 76667 },
      { id: 'Q06', name: 'Túi đựng quà', unit: 'cái', price: 5350 }
    ];
    for (const g of seedGifts) {
      await client.query(`
        INSERT INTO ${SCHEMA}.gift_items (id, name, unit, price)
        VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING;
      `, [g.id, g.name, g.unit, g.price]);
    }

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    await client.query(`
      INSERT INTO ${SCHEMA}.app_metadata (key, value) VALUES 
        ('attMonth', $1::jsonb),
        ('att', $2::jsonb),
        ('holidays', $3::jsonb),
        ('budget', $4::jsonb),
        ('locks', $5::jsonb),
        ('close', $6::jsonb)
      ON CONFLICT (key) DO NOTHING;
    `, [
      JSON.stringify(currentMonth),
      JSON.stringify({}),
      JSON.stringify([]),
      JSON.stringify({}),
      JSON.stringify({}),
      JSON.stringify({})
    ]);

    await client.query('COMMIT');
    console.log(`🎉 Nạp Seed Data vào PostgreSQL thành công 100%!`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`❌ Lỗi khi nạp seed data:`, err);
  }
}

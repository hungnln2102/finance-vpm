import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://admin:ZAQ!xsw21122@localhost:5432/mydtbmav';
const SCHEMA = process.env.DB_SCHEMA || 'finance_vpm';

export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000
});

/**
 * Khởi tạo Schema và các bảng dữ liệu trong PostgreSQL (finance_vpm)
 */
export async function initDb() {
  const client = await pool.connect();
  try {
    console.log(`🔌 Kết nối PostgreSQL thành công. Đang khởi tạo schema: ${SCHEMA}...`);
    await client.query('BEGIN');

    // 1. Tạo Schema độc lập
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${SCHEMA};`);

    // 2. Bảng Sổ Giao Dịch Gốc
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
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_tx_date ON ${SCHEMA}.transactions(date);
      CREATE INDEX IF NOT EXISTS idx_tx_acc ON ${SCHEMA}.transactions(acc);
      CREATE INDEX IF NOT EXISTS idx_tx_contract ON ${SCHEMA}.transactions(contract);
    `);

    // 3. Bảng Hợp Đồng
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

    // 4. Bảng Danh Mục Quà Tặng
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.gift_items (
        id VARCHAR(32) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        unit VARCHAR(32) NOT NULL,
        price NUMERIC(15, 2) DEFAULT 0
      );
    `);

    // 5. Bảng Biến Động Quà Tặng (Xuất / Nhập)
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

    // 6. Bảng Nhân Sự
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

    // 7. Bảng Kế Hoạch & Đệ Trình (Proposals)
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

    // 8. Bảng Điều Chỉnh Ngân Sách
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

    // 9. Bảng Metadata chung (Lưu Budget, Khóa sổ, Chấm công tháng, Log...)
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.app_metadata (
        key VARCHAR(64) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 10. Bảng Theo Dõi Số Dư Đầu Kỳ & Cuối Kỳ Theo Tháng
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

    await client.query('COMMIT');
    console.log(`✅ Khởi tạo Schema ${SCHEMA} và các bảng thành công!`);

    // 11. Tự động nạp Seed Data nếu bảng rỗng
    await seedIfEmpty(client);

    // 12. Tự động tính toán và lưu snapshot số dư các kỳ
    await recalculateMonthlyBalances(client);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`❌ Lỗi khởi tạo cơ sở dữ liệu PostgreSQL:`, err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Tự động nạp Seed Data từ server/seedData.json nếu chưa có giao dịch
 */
async function seedIfEmpty(client) {
  const countRes = await client.query(`SELECT COUNT(*)::int as cnt FROM ${SCHEMA}.transactions;`);
  if (countRes.rows[0].cnt > 0) {
    console.log(`ℹ️ PostgreSQL đã có sẵn ${countRes.rows[0].cnt} giao dịch trong schema ${SCHEMA}.`);
    return;
  }

  const seedPath = path.resolve(__dirname, 'seedData.json');
  if (!fs.existsSync(seedPath)) {
    console.warn(`⚠️ Không tìm thấy tệp seedData.json để nạp.`);
    return;
  }

  console.log(`🌱 Đang nạp Seed Data vào PostgreSQL schema ${SCHEMA}...`);
  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

  await client.query('BEGIN');
  try {
    // Nạp Transactions
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

    // Nạp Contracts
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

    // Nạp Staff
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

    // Nạp Gift Items & Movements mẫu
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

    // Nạp Metadata (attendance, holidays, budget, locks...)
    await client.query(`
      INSERT INTO ${SCHEMA}.app_metadata (key, value) VALUES 
        ('attMonth', $1::jsonb),
        ('att', $2::jsonb),
        ('holidays', $3::jsonb),
        ('budget', $4::jsonb),
        ('locks', $5::jsonb),
        ('close', $6::jsonb)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
    `, [
      JSON.stringify(seed.attMonth || '2026-08'),
      JSON.stringify(seed.att || {}),
      JSON.stringify(seed.holidays || []),
      JSON.stringify({ '2026-08': { LUONG: 33228000, SUKIEN: 3000000 }, '2026-09': {}, '2026-10': {} }),
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

/**
 * Đọc toàn bộ AppState từ PostgreSQL
 */
export async function getFullState() {
  const client = await pool.connect();
  try {
    // 1. Transactions
    const txRes = await client.query(`
      SELECT 
        id, 
        to_char(date, 'YYYY-MM-DD') as date, 
        acc, 
        dir, 
        amt::float as amt, 
        description as "desc", 
        type, 
        cat, 
        contract, 
        status, 
        flags, 
        doc, 
        src 
      FROM ${SCHEMA}.transactions 
      ORDER BY date ASC, id ASC;
    `);

    // 2. Contracts
    const contractsRes = await client.query(`
      SELECT 
        id, 
        kind, 
        customer, 
        no, 
        tv, 
        to_char(signed, 'YYYY-MM-DD') as signed, 
        fee::float as fee, 
        disc::float as disc, 
        disc_approved as "discApproved", 
        to_char(due, 'YYYY-MM-DD') as due, 
        terms, 
        note 
      FROM ${SCHEMA}.contracts 
      ORDER BY id ASC;
    `);

    // 3. Staff
    const staffRes = await client.query(`
      SELECT 
        id, 
        name, 
        role, 
        base_salary::float as "baseSalary", 
        allowance::float as allowance, 
        status 
      FROM ${SCHEMA}.staff 
      ORDER BY id ASC;
    `);

    // 4. Gifts
    const giftItemsRes = await client.query(`SELECT id, name, unit, price::float FROM ${SCHEMA}.gift_items;`);
    const giftMvRes = await client.query(`
      SELECT 
        to_char(d, 'YYYY-MM-DD') as d, 
        item, 
        qty, 
        kind, 
        who, 
        tx, 
        "to", 
        note, 
        ex 
      FROM ${SCHEMA}.gift_movements 
      ORDER BY d ASC;
    `);

    // 5. Proposals
    const proposalsRes = await client.query(`
      SELECT 
        id, code, title, creator, creator_email as "creatorEmail", 
        department, amount::float, to_char(date, 'YYYY-MM-DD') as date, 
        description, status, resend_sent_at as "resendSentAt", 
        cc_emails as "ccEmails", threads 
      FROM ${SCHEMA}.proposals 
      ORDER BY id ASC;
    `);

    // 6. Cost Adjustments
    const costAdjRes = await client.query(`
      SELECT 
        id, month, category, old_budget::float as "oldBudget", 
        new_budget::float as "newBudget", reason, approved_by as "approvedBy", 
        status, to_char(created_at, 'YYYY-MM-DD') as "createdAt" 
      FROM ${SCHEMA}.cost_adjustments 
      ORDER BY id ASC;
    `);

    // 7. Metadata (budget, locks, close, att, attMonth, holidays)
    const metaRes = await client.query(`SELECT key, value FROM ${SCHEMA}.app_metadata;`);
    const meta = {};
    for (const r of metaRes.rows) {
      meta[r.key] = r.value;
    }

    return {
      tx: txRes.rows,
      contracts: contractsRes.rows,
      staff: staffRes.rows,
      gifts: {
        items: giftItemsRes.rows,
        mv: giftMvRes.rows
      },
      proposals: proposalsRes.rows,
      costAdjustments: costAdjRes.rows,
      budget: meta.budget || {},
      locks: meta.locks || {},
      close: meta.close || {},
      att: meta.att || {},
      attMonth: meta.attMonth || '2026-10',
      holidays: meta.holidays || [],
      webhooks: [],
      log: []
    };
  } finally {
    client.release();
  }
}

/**
 * Thêm giao dịch mới vào PostgreSQL
 */
export async function insertTransaction(tx) {
  const query = `
    INSERT INTO ${SCHEMA}.transactions (id, date, acc, dir, amt, description, type, cat, contract, status, flags, doc, src)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *;
  `;
  const values = [
    tx.id, tx.date, tx.acc, tx.dir, tx.amt, tx.desc || '', tx.type || '', tx.cat || '',
    tx.contract || '', tx.status || 'posted', tx.flags || [], tx.doc || '', tx.src || 'Nhập từ Web'
  ];
  const res = await pool.query(query, values);
  return res.rows[0];
}

/**
 * Cập nhật giao dịch trong PostgreSQL
 */
export async function updateTransaction(id, updates) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (updates.desc !== undefined) {
    fields.push(`description = $${idx++}`);
    values.push(updates.desc);
  }
  if (updates.cat !== undefined) {
    fields.push(`cat = $${idx++}`);
    values.push(updates.cat);
  }
  if (updates.contract !== undefined) {
    fields.push(`contract = $${idx++}`);
    values.push(updates.contract);
  }
  if (updates.status !== undefined) {
    fields.push(`status = $${idx++}`);
    values.push(updates.status);
  }
  if (updates.doc !== undefined) {
    fields.push(`doc = $${idx++}`);
    values.push(updates.doc);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `
    UPDATE ${SCHEMA}.transactions 
    SET ${fields.join(', ')} 
    WHERE id = $${idx} 
    RETURNING *;
  `;
  const res = await pool.query(query, values);
  return res.rows[0];
}

/**
 * Thêm hợp đồng vào PostgreSQL
 */
export async function insertContract(c) {
  const query = `
    INSERT INTO ${SCHEMA}.contracts (id, kind, customer, no, tv, signed, fee, disc, disc_approved, due, terms, note)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *;
  `;
  const values = [
    c.id, c.kind, c.customer, c.no || '', c.tv || '', c.signed || null,
    c.fee || 0, c.disc || 0, c.discApproved || false, c.due || null,
    c.terms || '', c.note || ''
  ];
  const res = await pool.query(query, values);
  return res.rows[0];
}

/**
 * Lưu chấm công vào PostgreSQL (Metadata)
 */
export async function saveAttendance(staffId, dateIso, val) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const metaRes = await client.query(`SELECT value FROM ${SCHEMA}.app_metadata WHERE key = 'att';`);
    const att = metaRes.rows.length > 0 ? metaRes.rows[0].value : {};
    if (!att[staffId]) att[staffId] = {};
    att[staffId][dateIso] = val;

    await client.query(`
      INSERT INTO ${SCHEMA}.app_metadata (key, value, updated_at)
      VALUES ('att', $1::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
    `, [JSON.stringify(att)]);

    await client.query('COMMIT');
    return att;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Tự động tính toán lại ma trận số dư đầu kỳ - cuối kỳ cho tất cả các tháng
 * và lưu trực tiếp vào bảng finance_vpm.monthly_balances
 */
export async function recalculateMonthlyBalances(clientOrPool = pool) {
  const txRes = await clientOrPool.query(`
    SELECT 
      id, 
      to_char(date, 'YYYY-MM-DD') as date, 
      acc, 
      dir, 
      amt::float as amt, 
      status 
    FROM ${SCHEMA}.transactions 
    WHERE status != 'returned'
    ORDER BY date ASC, id ASC;
  `);

  const txList = txRes.rows;
  const monthSet = new Set(['2026-08', '2026-09', '2026-10']);
  txList.forEach((t) => {
    if (t.date) monthSet.add(t.date.slice(0, 7));
  });
  const months = Array.from(monthSet).sort();

  // Khởi tạo số dư mở sổ ban đầu (OPEN_BAL)
  let prevQuy = -1487000;
  let prevAcb = 0;

  const results = [];

  for (let i = 0; i < months.length; i++) {
    const m = months[i];
    const startDate = `${m}-01`;
    const [y, mo] = m.split('-').map(Number);
    const lastDayNum = new Date(y, mo, 0).getDate();
    const endDate = `${m}-${String(lastDayNum).padStart(2, '0')}`;

    const startQuy = prevQuy;
    const startAcb = prevAcb;
    const startTotal = startQuy + startAcb;

    let netQuy = 0;
    let netAcb = 0;

    for (const t of txList) {
      if (t.date.startsWith(m)) {
        const delta = t.dir === 'in' ? t.amt : -t.amt;
        if (t.acc === 'QUY') netQuy += delta;
        else if (t.acc === 'ACB') netAcb += delta;
      }
    }

    const endQuy = startQuy + netQuy;
    const endAcb = startAcb + netAcb;
    const endTotal = endQuy + endAcb;
    const netChange = endTotal - startTotal;

    // Số dư cuối kỳ tháng này chính là đầu kỳ tháng sau
    prevQuy = endQuy;
    prevAcb = endAcb;

    const isPast = m < '2026-10';
    const status = isPast ? 'closed' : 'open';

    await clientOrPool.query(`
      INSERT INTO ${SCHEMA}.monthly_balances 
        (month, start_date, end_date, start_quy, end_quy, start_acb, end_acb, start_total, end_total, net_change, status, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      ON CONFLICT (month) DO UPDATE SET
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        start_quy = EXCLUDED.start_quy,
        end_quy = EXCLUDED.end_quy,
        start_acb = EXCLUDED.start_acb,
        end_acb = EXCLUDED.end_acb,
        start_total = EXCLUDED.start_total,
        end_total = EXCLUDED.end_total,
        net_change = EXCLUDED.net_change,
        status = EXCLUDED.status,
        updated_at = NOW();
    `, [m, startDate, endDate, startQuy, endQuy, startAcb, endAcb, startTotal, endTotal, netChange, status]);

    results.push({
      month: m,
      startDate,
      endDate,
      startQuy,
      endQuy,
      startAcb,
      endAcb,
      startTotal,
      endTotal,
      netChange,
      status
    });
  }

  return results;
}

/**
 * Lấy toàn bộ số dư các tháng từ PostgreSQL
 */
export async function getMonthlyBalances() {
  const res = await pool.query(`
    SELECT 
      month,
      to_char(start_date, 'YYYY-MM-DD') as "startDate",
      to_char(end_date, 'YYYY-MM-DD') as "endDate",
      start_quy::float as "startQuy",
      end_quy::float as "endQuy",
      start_acb::float as "startAcb",
      end_acb::float as "endAcb",
      start_total::float as "startTotal",
      end_total::float as "endTotal",
      net_change::float as "netChange",
      status,
      updated_at as "updatedAt"
    FROM ${SCHEMA}.monthly_balances
    ORDER BY month ASC;
  `);
  return res.rows;
}

/**
 * Nhập và cập nhật toàn bộ dữ liệu từ Google Sheet vào PostgreSQL (Two-Way Sync: Sheet -> DB)
 * Tuân thủ nghiêm ngặt ACID Transaction
 */
export async function importSheetDataToPostgres(sheetData) {
  if (!sheetData || !Array.isArray(sheetData.tx)) {
    throw new Error('Dữ liệu từ Google Sheet không hợp lệ hoặc thiếu danh sách giao dịch');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let insertedTx = 0;
    let updatedTx = 0;
    let insertedContracts = 0;
    let updatedContracts = 0;

    // Lấy ID giao dịch lớn nhất để tự sinh nếu người dùng thêm dòng không có ID trên Sheet
    const maxIdRes = await client.query(`
      SELECT id FROM ${SCHEMA}.transactions 
      WHERE id ~ '^G[0-9]+$' 
      ORDER BY id DESC LIMIT 1;
    `);
    let nextNum = 1;
    if (maxIdRes.rows.length > 0) {
      const match = maxIdRes.rows[0].id.match(/\d+/);
      if (match) nextNum = parseInt(match[0], 10) + 1;
    }

    for (const t of sheetData.tx) {
      let txId = t.id ? t.id.trim() : '';
      if (!txId) {
        txId = `G${String(nextNum++).padStart(4, '0')}`;
      }

      const txDate = t.date || new Date().toISOString().substring(0, 10);
      const acc = t.acc || 'QUY';
      const dir = t.dir === 'in' ? 'in' : 'out';
      const amt = Number(t.amt) || 0;
      const desc = t.desc || '';
      const type = t.type || '';
      const cat = t.cat || '';
      const contract = t.contract || '';
      const status = t.status || 'posted';
      const flags = Array.isArray(t.flags) ? t.flags : [];
      const doc = t.doc || '';
      const src = t.src || 'Google Sheet';

      // Kiểm tra xem ID đã tồn tại trong DB chưa
      const checkRes = await client.query(`SELECT id FROM ${SCHEMA}.transactions WHERE id = $1;`, [txId]);
      if (checkRes.rows.length > 0) {
        // Cập nhật giao dịch đã có
        await client.query(`
          UPDATE ${SCHEMA}.transactions SET
            date = $2, acc = $3, dir = $4, amt = $5, description = $6,
            type = $7, cat = $8, contract = $9, status = $10, flags = $11,
            doc = $12, src = $13, updated_at = NOW()
          WHERE id = $1;
        `, [txId, txDate, acc, dir, amt, desc, type, cat, contract, status, flags, doc, src]);
        updatedTx++;
      } else {
        // Thêm mới giao dịch
        await client.query(`
          INSERT INTO ${SCHEMA}.transactions 
            (id, date, acc, dir, amt, description, type, cat, contract, status, flags, doc, src)
          VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
        `, [txId, txDate, acc, dir, amt, desc, type, cat, contract, status, flags, doc, src]);
        insertedTx++;
      }
    }

    // 2. Quét và đồng bộ Contracts
    if (Array.isArray(sheetData.contracts)) {
      for (const c of sheetData.contracts) {
        const cId = c.id ? c.id.trim() : '';
        if (!cId || !c.customer) continue;

        const checkC = await client.query(`SELECT id FROM ${SCHEMA}.contracts WHERE id = $1;`, [cId]);
        if (checkC.rows.length > 0) {
          await client.query(`
            UPDATE ${SCHEMA}.contracts SET
              kind = $2, customer = $3, no = $4, tv = $5, signed = $6,
              fee = $7, disc = $8, disc_approved = $9, due = $10, terms = $11,
              note = $12, updated_at = NOW()
            WHERE id = $1;
          `, [
            cId, c.kind || 'KH', c.customer, c.no || '', c.tv || '', c.signed || null,
            Number(c.fee) || 0, Number(c.disc) || 0, Boolean(c.discApproved), c.due || null,
            c.terms || '', c.note || ''
          ]);
          updatedContracts++;
        } else {
          await client.query(`
            INSERT INTO ${SCHEMA}.contracts 
              (id, kind, customer, no, tv, signed, fee, disc, disc_approved, due, terms, note)
            VALUES 
              ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
          `, [
            cId, c.kind || 'KH', c.customer, c.no || '', c.tv || '', c.signed || null,
            Number(c.fee) || 0, Number(c.disc) || 0, Boolean(c.discApproved), c.due || null,
            c.terms || '', c.note || ''
          ]);
          insertedContracts++;
        }
      }
    }

    // 3. Tự động tính toán lại số dư các tháng theo chuẩn ACID
    const balances = await recalculateMonthlyBalances(client);

    await client.query('COMMIT');
    console.log(`✅ [TwoWaySync] Đồng bộ thành công từ Sheet về PostgreSQL: ${insertedTx} mới, ${updatedTx} sửa, ${balances.length} tháng số dư.`);

    return {
      success: true,
      insertedTx,
      updatedTx,
      totalTx: sheetData.tx.length,
      insertedContracts,
      updatedContracts,
      balances
    };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`❌ [TwoWaySync] Lỗi import từ Google Sheet vào PostgreSQL:`, err);
    throw err;
  } finally {
    client.release();
  }
}


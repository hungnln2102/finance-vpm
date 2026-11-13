import { pool, SCHEMA } from '../../config/dbPool.mjs';
import { recalculateMonthlyBalances } from '../ledger/ledgerService.mjs';
import { bootstrapMasterAccount } from '../auth/authService.mjs';


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
        department VARCHAR(128) NOT NULL DEFAULT '',
        hire_date DATE,
        role VARCHAR(64) DEFAULT '',
        base_salary NUMERIC(15, 2) DEFAULT 0,
        allowance NUMERIC(15, 2) DEFAULT 0,
        status VARCHAR(32) DEFAULT 'active'
      );
      ALTER TABLE ${SCHEMA}.staff ADD COLUMN IF NOT EXISTS department VARCHAR(128) NOT NULL DEFAULT '';
      ALTER TABLE ${SCHEMA}.staff ADD COLUMN IF NOT EXISTS hire_date DATE;
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

    // 8. Cost categories and monthly budgets
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.cost_categories (
        code VARCHAR(64) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.cost_budgets (
        month VARCHAR(16) NOT NULL,
        category_code VARCHAR(64) NOT NULL REFERENCES ${SCHEMA}.cost_categories(code),
        amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
        is_enabled BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (month, category_code)
      );
      CREATE INDEX IF NOT EXISTS idx_cost_budgets_month ON ${SCHEMA}.cost_budgets(month);
    `);

    // 9. App Metadata
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.app_metadata (
        key VARCHAR(64) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Register any legacy budget code before preserving its monthly amount.
    await client.query(`
      INSERT INTO ${SCHEMA}.cost_categories (code, name)
      SELECT DISTINCT category_code, category_code
      FROM ${SCHEMA}.app_metadata,
           LATERAL jsonb_each(value) AS month_entry(budget_month, categories),
           LATERAL jsonb_each_text(categories) AS category_entry(category_code, budget_amount)
      WHERE key = 'budget'
        AND jsonb_typeof(value) = 'object'
      ON CONFLICT (code) DO NOTHING;
    `);

    // Migrate the legacy JSON budget map before removing the obsolete metadata key.
    await client.query(`
      INSERT INTO ${SCHEMA}.cost_budgets (month, category_code, amount)
      SELECT budget_month, category_code, budget_amount::numeric
      FROM ${SCHEMA}.app_metadata,
           LATERAL jsonb_each(value) AS month_entry(budget_month, categories),
           LATERAL jsonb_each_text(categories) AS category_entry(category_code, budget_amount)
      WHERE key = 'budget'
        AND jsonb_typeof(value) = 'object'
      ON CONFLICT (month, category_code) DO UPDATE SET
        amount = EXCLUDED.amount,
        updated_at = NOW();
      DELETE FROM ${SCHEMA}.app_metadata WHERE key = 'budget';
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

    // 13. Attendance and payroll source-of-truth tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.attendance_periods (
        month VARCHAR(7) PRIMARY KEY,
        standard_days NUMERIC(6, 2) NOT NULL DEFAULT 0,
        status VARCHAR(16) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'locked', 'paid')),
        note TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ${SCHEMA}.attendance_holidays (
        id BIGSERIAL PRIMARY KEY,
        month VARCHAR(7) NOT NULL REFERENCES ${SCHEMA}.attendance_periods(month) ON DELETE CASCADE,
        holiday_date DATE NOT NULL,
        label VARCHAR(255) NOT NULL DEFAULT 'Ngày lễ',
        is_paid BOOLEAN NOT NULL DEFAULT TRUE,
        UNIQUE (month, holiday_date)
      );
      CREATE INDEX IF NOT EXISTS idx_attendance_holidays_month ON ${SCHEMA}.attendance_holidays(month);

      CREATE TABLE IF NOT EXISTS ${SCHEMA}.attendance_entries (
        id BIGSERIAL PRIMARY KEY,
        month VARCHAR(7) NOT NULL REFERENCES ${SCHEMA}.attendance_periods(month) ON DELETE CASCADE,
        staff_id VARCHAR(32) NOT NULL REFERENCES ${SCHEMA}.staff(id) ON DELETE CASCADE,
        work_date DATE NOT NULL,
        value_code VARCHAR(8) NOT NULL CHECK (value_code IN ('1', '0.5', 'L', 'X', '2')),
        work_units NUMERIC(5, 2) NOT NULL DEFAULT 0,
        pay_multiplier NUMERIC(5, 2) NOT NULL DEFAULT 1,
        status VARCHAR(32) NOT NULL DEFAULT 'posted',
        note TEXT NOT NULL DEFAULT '',
        logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (month, staff_id, work_date)
      );
      CREATE INDEX IF NOT EXISTS idx_attendance_entries_month_staff ON ${SCHEMA}.attendance_entries(month, staff_id);
      CREATE INDEX IF NOT EXISTS idx_attendance_entries_date ON ${SCHEMA}.attendance_entries(work_date);
      ALTER TABLE ${SCHEMA}.attendance_entries ADD COLUMN IF NOT EXISTS logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

      CREATE TABLE IF NOT EXISTS ${SCHEMA}.attendance_logs (
        id BIGSERIAL PRIMARY KEY,
        staff_id VARCHAR(32) NOT NULL REFERENCES ${SCHEMA}.staff(id) ON DELETE CASCADE,
        work_date DATE NOT NULL,
        value_code VARCHAR(8),
        action VARCHAR(16) NOT NULL DEFAULT 'save' CHECK (action IN ('save', 'delete')),
        logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_attendance_logs_staff_date ON ${SCHEMA}.attendance_logs(staff_id, work_date);
      CREATE INDEX IF NOT EXISTS idx_attendance_logs_time ON ${SCHEMA}.attendance_logs(logged_at DESC);

      CREATE TABLE IF NOT EXISTS ${SCHEMA}.staff_benefits (
        id BIGSERIAL PRIMARY KEY,
        month VARCHAR(7) NOT NULL REFERENCES ${SCHEMA}.attendance_periods(month) ON DELETE CASCADE,
        staff_id VARCHAR(32) NOT NULL REFERENCES ${SCHEMA}.staff(id) ON DELETE CASCADE,
        holiday_sunday NUMERIC(8, 2) NOT NULL DEFAULT 0,
        ot NUMERIC(8, 2) NOT NULL DEFAULT 0,
        kpi NUMERIC(15, 2) NOT NULL DEFAULT 0,
        bhxh NUMERIC(15, 2) NOT NULL DEFAULT 0,
        tax NUMERIC(15, 2) NOT NULL DEFAULT 0,
        "time" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (month, staff_id)
      );
      CREATE INDEX IF NOT EXISTS idx_staff_benefits_month ON ${SCHEMA}.staff_benefits(month);

      CREATE TABLE IF NOT EXISTS ${SCHEMA}.payroll_records (
        id BIGSERIAL PRIMARY KEY,
        month VARCHAR(7) NOT NULL REFERENCES ${SCHEMA}.attendance_periods(month) ON DELETE CASCADE,
        staff_id VARCHAR(32) NOT NULL REFERENCES ${SCHEMA}.staff(id) ON DELETE CASCADE,
        base_salary NUMERIC(15, 2) NOT NULL DEFAULT 0,
        allowance NUMERIC(15, 2) NOT NULL DEFAULT 0,
        kpi NUMERIC(15, 2) NOT NULL DEFAULT 0,
        insurance_salary NUMERIC(15, 2) NOT NULL DEFAULT 0,
        dependents INTEGER NOT NULL DEFAULT 0,
        advance NUMERIC(15, 2) NOT NULL DEFAULT 0,
        work_days NUMERIC(6, 2) NOT NULL DEFAULT 0,
        holiday_work_days NUMERIC(6, 2) NOT NULL DEFAULT 0,
        sunday_work_days NUMERIC(6, 2) NOT NULL DEFAULT 0,
        salary_by_days NUMERIC(15, 2) NOT NULL DEFAULT 0,
        extra_salary NUMERIC(15, 2) NOT NULL DEFAULT 0,
        gross_salary NUMERIC(15, 2) NOT NULL DEFAULT 0,
        insurance_employee NUMERIC(15, 2) NOT NULL DEFAULT 0,
        pit_tax NUMERIC(15, 2) NOT NULL DEFAULT 0,
        net_salary NUMERIC(15, 2) NOT NULL DEFAULT 0,
        status VARCHAR(16) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'paid')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (month, staff_id)
      );
      CREATE INDEX IF NOT EXISTS idx_payroll_records_month ON ${SCHEMA}.payroll_records(month);
    `);

    const metadataRes = await client.query(`SELECT key, value FROM ${SCHEMA}.app_metadata WHERE key IN ('att', 'attMonth', 'holidays', 'payroll');`);
    const migrationMeta = Object.fromEntries(metadataRes.rows.map((row) => [row.key, row.value]));
    const currentAttendanceMonth = migrationMeta.attMonth || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const holidayDates = Array.isArray(migrationMeta.holidays) ? migrationMeta.holidays : [];
    const legacyAttendance = migrationMeta.att && typeof migrationMeta.att === 'object' ? migrationMeta.att : {};
    const staffRes = await client.query(`SELECT id, name FROM ${SCHEMA}.staff;`);
    const staffByKey = Object.fromEntries(staffRes.rows.flatMap((staff) => [[staff.id, staff.id], [staff.name, staff.id]]));
    const legacyAttendanceRows = await client.query(`SELECT staff_id, to_char(date, 'YYYY-MM-DD') AS date, val FROM ${SCHEMA}.attendance;`);
    const months = new Set([currentAttendanceMonth, ...legacyAttendanceRows.rows.map((row) => row.date.slice(0, 7))]);
    for (const records of Object.values(legacyAttendance)) {
      const days = records && records.days ? records.days : records;
      for (const dateIso of Object.keys(days || {})) months.add(dateIso.slice(0, 7));
    }
    for (const month of months) {
      const [year, monthNumber] = month.split('-').map(Number);
      const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
      const standardDays = Array.from({ length: daysInMonth }, (_, index) => new Date(Date.UTC(year, monthNumber - 1, index + 1)).getUTCDay())
        .reduce((total, weekday) => total + (weekday === 0 ? 0 : weekday === 6 ? 0.5 : 1), 0);
      await client.query(`
        INSERT INTO ${SCHEMA}.attendance_periods (month, standard_days)
        VALUES ($1, $2)
        ON CONFLICT (month) DO UPDATE SET standard_days = EXCLUDED.standard_days, updated_at = NOW();
      `, [month, standardDays]);
      if (month === currentAttendanceMonth) {
        for (const holidayDate of holidayDates) {
          await client.query(`
            INSERT INTO ${SCHEMA}.attendance_holidays (month, holiday_date)
            VALUES ($1, $2)
            ON CONFLICT (month, holiday_date) DO NOTHING;
          `, [month, holidayDate]);
        }
      }
    }
    for (const row of legacyAttendanceRows.rows) {
      const valueCode = String(row.val);
      if (!staffByKey[row.staff_id] || !['1', '0.5', 'L', 'X', '2'].includes(valueCode)) continue;
      const workUnits = valueCode === '0.5' ? 0.5 : valueCode === 'X' || valueCode === '2' ? 0 : 1;
      const payMultiplier = valueCode === 'X' ? 3 : valueCode === '2' ? 2 : 1;
      await client.query(`
        INSERT INTO ${SCHEMA}.attendance_entries (month, staff_id, work_date, value_code, work_units, pay_multiplier)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (month, staff_id, work_date) DO NOTHING;
      `, [row.date.slice(0, 7), staffByKey[row.staff_id], row.date, valueCode, workUnits, payMultiplier]);
    }
    for (const [storedStaffKey, records] of Object.entries(legacyAttendance)) {
      const staffId = staffByKey[storedStaffKey];
      const days = records && records.days ? records.days : records;
      if (!staffId || !days || typeof days !== 'object') continue;
      for (const [dateIso, rawValue] of Object.entries(days)) {
        const valueCode = String(rawValue);
        if (!['1', '0.5', 'L', 'X', '2'].includes(valueCode)) continue;
        const workUnits = valueCode === '0.5' ? 0.5 : valueCode === 'X' || valueCode === '2' ? 0 : 1;
        const payMultiplier = valueCode === 'X' ? 3 : valueCode === '2' ? 2 : 1;
        await client.query(`
          INSERT INTO ${SCHEMA}.attendance_entries (month, staff_id, work_date, value_code, work_units, pay_multiplier)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (month, staff_id, work_date) DO NOTHING;
        `, [dateIso.slice(0, 7), staffId, dateIso, valueCode, workUnits, payMultiplier]);
      }
    }
    await client.query(`
      INSERT INTO ${SCHEMA}.staff_benefits (month, staff_id, holiday_sunday)
      SELECT
        entry.month,
        entry.staff_id,
        COUNT(*)::numeric AS holiday_sunday
      FROM ${SCHEMA}.attendance_entries entry
      LEFT JOIN ${SCHEMA}.attendance_holidays holiday
        ON holiday.month = entry.month AND holiday.holiday_date = entry.work_date
      WHERE entry.value_code IN ('X', '2')
        AND (holiday.id IS NOT NULL OR EXTRACT(DOW FROM entry.work_date) = 0)
      GROUP BY entry.month, entry.staff_id
      ON CONFLICT (month, staff_id) DO UPDATE SET
        holiday_sunday = EXCLUDED.holiday_sunday,
        "time" = NOW()
      WHERE ${SCHEMA}.staff_benefits.holiday_sunday IS DISTINCT FROM EXCLUDED.holiday_sunday;
    `);
    const legacyPayroll = migrationMeta.payroll && typeof migrationMeta.payroll === 'object' ? migrationMeta.payroll : {};
    for (const [storedStaffKey, values] of Object.entries(legacyPayroll)) {
      const staffId = staffByKey[storedStaffKey];
      if (!staffId || !values || typeof values !== 'object') continue;
      const allowance = Object.values(values.allow || {}).reduce((total, amount) => total + (Number(amount) || 0), 0);
      await client.query(`
        INSERT INTO ${SCHEMA}.payroll_records
          (month, staff_id, allowance, kpi, insurance_salary, dependents, advance)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (month, staff_id) DO NOTHING;
      `, [
        currentAttendanceMonth,
        staffId,
        allowance,
        Number(values.kpi) || 0,
        Number(values.insSalary) || 0,
        Number(values.deps) || 0,
        Number(values.advance) || 0
      ]);
    }
    for (const staff of staffRes.rows) {
      await client.query(`
        INSERT INTO ${SCHEMA}.payroll_records (month, staff_id)
        VALUES ($1, $2)
        ON CONFLICT (month, staff_id) DO NOTHING;
      `, [currentAttendanceMonth, staff.id]);
      await client.query(`
        INSERT INTO ${SCHEMA}.staff_benefits (month, staff_id)
        VALUES ($1, $2)
        ON CONFLICT (month, staff_id) DO NOTHING;
      `, [currentAttendanceMonth, staff.id]);
    }

    await client.query('COMMIT');
    console.log(`✅ Khởi tạo Schema ${SCHEMA} và các bảng thành công!`);
    await recalculateMonthlyBalances(client);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`❌ Lỗi khởi tạo cơ sở dữ liệu PostgreSQL:`, err);
    throw err;
  } finally {
    client.release();
  }
}

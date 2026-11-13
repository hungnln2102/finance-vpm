import { pool } from '../../config/dbPool.mjs';
import { tableName, TABLES } from '../../config/dbSchema.mjs';

function parseAttendanceValue(value) {
  if (value === null || value === undefined || value === '') return undefined;
  if (value === '0.5') return 0.5;
  if (value === '1') return 1;
  if (value === '2') return 2;
  return value;
}

/**
 * Đọc toàn bộ AppState từ PostgreSQL (10 bảng nghiệp vụ)
 */
export async function getFullState() {
  const client = await pool.connect();
  try {
    // 1. Transactions
    const txRes = await client.query(`
      SELECT id, to_char(date, 'YYYY-MM-DD') as date, acc, dir, amt::float as amt, 
             description as "desc", type, cat, contract, status, flags, doc, src,
             proposal_id as "proposalId", receipts 
      FROM ${tableName(TABLES.TRANSACTIONS)} 
      ORDER BY date ASC, id ASC;
    `);

    // 2. Contracts
    const contractsRes = await client.query(`
      SELECT id, kind, customer, no, tv, to_char(signed, 'YYYY-MM-DD') as signed, 
             fee::float as fee, disc::float as disc, disc_approved as "discApproved", 
             to_char(due, 'YYYY-MM-DD') as due, terms, note 
      FROM ${tableName(TABLES.CONTRACTS)} 
      ORDER BY id ASC;
    `);

    // 3. Staff
    const staffRes = await client.query(`
      SELECT id, name, department, to_char(hire_date, 'YYYY-MM-DD') AS "hireDate", role,
             base_salary::float as "baseSalary", allowance::float as allowance, status
      FROM ${tableName(TABLES.STAFF)} 
      ORDER BY id ASC;
    `);

    // 4. Gifts
    const giftItemsRes = await client.query(`
      SELECT id, name, unit, price::float AS price
      FROM ${tableName(TABLES.GIFT_ITEMS)}
      ORDER BY id ASC;
    `);
    const giftMvRes = await client.query(`
      SELECT to_char(d, 'YYYY-MM-DD') as d, item, qty, kind, who, tx, "to", note, ex 
      FROM ${tableName(TABLES.GIFT_MOVEMENTS)} 
      ORDER BY d ASC, id ASC;
    `);

    // 5. Proposals
    const proposalsRes = await client.query(`
      SELECT id, code, title, creator, creator_email as "creatorEmail", 
             department, amount::float, to_char(date, 'YYYY-MM-DD') as date, 
             description, status, resend_sent_at as "resendSentAt", 
             cc_emails as "ccEmails", threads 
      FROM ${tableName(TABLES.PROPOSALS)} 
      ORDER BY id ASC;
    `);

    // 6. Cost Adjustments
    const costAdjRes = await client.query(`
      SELECT id, month, category, old_budget::float as "oldBudget", 
             new_budget::float as "newBudget", reason, approved_by as "approvedBy", 
             status, to_char(created_at, 'YYYY-MM-DD') as "createdAt" 
      FROM ${tableName(TABLES.COST_ADJUSTMENTS)} 
      ORDER BY id ASC;
    `);

    // 7. Cost categories and normalized monthly budgets
    const categoryRes = await client.query(`
      SELECT code, name
      FROM ${tableName(TABLES.COST_CATEGORIES)}
      WHERE is_active = true
      ORDER BY code;
    `);
    const budgetRes = await client.query(`
      SELECT month, category_code AS "category", amount::float AS amount, is_enabled AS "isEnabled"
      FROM ${tableName(TABLES.COST_BUDGETS)}
      ORDER BY month, category_code;
    `);
    const costCategories = Object.fromEntries(categoryRes.rows.map((row) => [row.code, row.name]));
    const budget = {};
    const disabledCostCategories = {};
    for (const row of budgetRes.rows) {
      budget[row.month] ||= {};
      budget[row.month][row.category] = row.amount;
      if (!row.isEnabled) {
        disabledCostCategories[row.month] ||= [];
        disabledCostCategories[row.month].push(row.category);
      }
    }

    // 8. Metadata (locks, close, att, attMonth, holidays)
    const metaRes = await client.query(`SELECT key, value FROM ${tableName(TABLES.APP_METADATA)};`);
    const meta = {};
    for (const r of metaRes.rows) {
      meta[r.key] = r.value;
    }

    // 9. Accounts (Lấy tất cả bao gồm active & inactive để quản lý trong Tab Tài Sản)
    const accountsRes = await client.query(`
      SELECT id, name, type, account_no as "accountNo", bank_name as "bankName", status
      FROM ${tableName(TABLES.ACCOUNTS)}
      ORDER BY CASE id WHEN 'QUY' THEN 1 WHEN 'ACB' THEN 2 WHEN 'MB' THEN 3 ELSE 4 END, id ASC;
    `);

    // 10. Attendance Rows
    const attRowsRes = await client.query(`
      SELECT id, staff_id as "staffId", month, to_char(work_date, 'YYYY-MM-DD') as date,
             value_code as val, status, note,
             to_char(logged_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD HH24:MI:SS') AS time
      FROM ${tableName(TABLES.ATTENDANCE_ENTRIES)}
      ORDER BY work_date DESC, staff_id ASC;
    `);
    const periodRes = await client.query(`
      SELECT month, standard_days::float as "standardDays", status, note
      FROM ${tableName(TABLES.ATTENDANCE_PERIODS)}
      ORDER BY month DESC;
    `);
    const holidayRes = await client.query(`
      SELECT month, to_char(holiday_date, 'YYYY-MM-DD') as date, label
      FROM ${tableName(TABLES.ATTENDANCE_HOLIDAYS)}
      ORDER BY holiday_date ASC;
    `);
    const payrollRes = await client.query(`
      SELECT month, staff_id as "staffId", allowance::float as allowance, kpi::float as kpi,
             insurance_salary::float as "insSalary", dependents as deps, advance::float as advance,
             work_days::float as "workDays", holiday_work_days::float as "holidayWorkDays",
             sunday_work_days::float as "sundayWorkDays", salary_by_days::float as "salaryByDays",
             extra_salary::float as "extraSalary", gross_salary::float as "grossSalary",
             insurance_employee::float as "insuranceEmployee", pit_tax::float as "pitTax",
             net_salary::float as "netSalary", status
      FROM ${tableName(TABLES.PAYROLL_RECORDS)};
    `);
    const benefitRes = await client.query(`
      SELECT month, staff_id AS "staffId", holiday_sunday::float AS "holidaySunday",
             ot::float AS ot, kpi::float AS kpi, bhxh::float AS bhxh,
             tax::float AS tax, "time"
      FROM ${tableName(TABLES.STAFF_BENEFITS)}
      ORDER BY month DESC, staff_id ASC;
    `);
    const attendanceLogRes = await client.query(`
      SELECT id, staff_id AS "staffId", to_char(work_date, 'YYYY-MM-DD') AS date,
             value_code AS val, action, to_char(logged_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD HH24:MI:SS') AS time
      FROM ${tableName(TABLES.ATTENDANCE_LOGS)}
      ORDER BY logged_at DESC, id DESC
      LIMIT 500;
    `);

    const attMonth = periodRes.rows[0]?.month || meta.attMonth || '2026-11';
    const currentPayroll = Object.fromEntries(payrollRes.rows.filter((row) => row.month === attMonth).map((row) => [row.staffId, row]));
    const payrollMeta = meta.payroll || {};
    const staffById = Object.fromEntries(staffRes.rows.map((staff) => [staff.id, staff]));
    const staffIdByName = Object.fromEntries(staffRes.rows.map((staff) => [staff.name, staff.id]));
    const attendanceByStaff = {};
    for (const [storedStaffId, record] of Object.entries(meta.att || {})) {
      const staffId = staffById[storedStaffId] ? storedStaffId : (staffIdByName[storedStaffId] || storedStaffId);
      const staff = staffById[staffId];
      const staffName = staff ? staff.name : staffId;
      const days = record && record.days ? record.days : record;
      attendanceByStaff[staffId] = { days: { ...(days || {}) } };
      if (staffName !== staffId) attendanceByStaff[staffName] = attendanceByStaff[staffId];
    }
    for (const row of attRowsRes.rows) {
      const staff = staffById[row.staffId];
      const record = attendanceByStaff[row.staffId] || { days: {} };
      record.days[row.date] = parseAttendanceValue(row.val);
      attendanceByStaff[row.staffId] = record;
      if (staff) attendanceByStaff[staff.name] = record;
    }

    const staff = staffRes.rows.map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      department: row.department,
      hireDate: row.hireDate,
      base: row.baseSalary || 0,
      kpi: currentPayroll[row.id]?.kpi ?? payrollMeta[row.id]?.kpi ?? 0,
      allow: {
        phone: row.allowance || 0,
        fuel: payrollMeta[row.id]?.allow?.fuel || 0,
        meal: payrollMeta[row.id]?.allow?.meal || 0,
        travel: payrollMeta[row.id]?.allow?.travel || 0
      },
      insSalary: currentPayroll[row.id]?.insSalary ?? payrollMeta[row.id]?.insSalary ?? 0,
      advance: currentPayroll[row.id]?.advance ?? payrollMeta[row.id]?.advance ?? 0,
      deps: currentPayroll[row.id]?.deps ?? payrollMeta[row.id]?.deps ?? 0,
      ...(payrollMeta[row.id]?.oldDays !== undefined ? { oldDays: payrollMeta[row.id].oldDays } : {}),
      ...(payrollMeta[row.id]?.oldTax !== undefined ? { oldTax: payrollMeta[row.id].oldTax } : {}),
      ...(payrollMeta[row.id]?.oldNet !== undefined ? { oldNet: payrollMeta[row.id].oldNet } : {}),
      ...(payrollMeta[row.id]?.oldGross !== undefined ? { oldGross: payrollMeta[row.id].oldGross } : {})
    }));

    // 11. Audit Logs
    const logsRes = await client.query(`
      SELECT id, to_char(timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD HH24:MI:SS') as at,
             action, table_name as "tableName", record_id as "recordId", actor as role, details as what
      FROM ${tableName(TABLES.AUDIT_LOGS)}
      ORDER BY id DESC LIMIT 200;
    `);

    return {
      tx: txRes.rows,
      contracts: contractsRes.rows,
      staff,
      accounts: accountsRes.rows,
      attendanceRows: attRowsRes.rows,
      attendanceLogs: attendanceLogRes.rows,
      benefits: benefitRes.rows,
      gifts: {
        items: giftItemsRes.rows,
        mv: giftMvRes.rows
      },
      proposals: proposalsRes.rows,
      costAdjustments: costAdjRes.rows,
      budget,
      costCategories,
      disabledCostCategories,
      locks: meta.locks || {},
      close: meta.close || {},
      att: attendanceByStaff,
      attMonth,
      holidays: holidayRes.rows.filter((row) => row.month === attMonth).map((row) => row.date),
      webhooks: [],
      log: logsRes.rows
    };
  } finally {
    client.release();
  }
}

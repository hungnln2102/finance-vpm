import { pool } from '../../config/dbPool.mjs';
import { tableName, TABLES } from '../../config/dbSchema.mjs';

/**
 * Đọc toàn bộ AppState từ PostgreSQL (10 bảng nghiệp vụ)
 */
export async function getFullState() {
  const client = await pool.connect();
  try {
    // 1. Transactions
    const txRes = await client.query(`
      SELECT id, to_char(date, 'YYYY-MM-DD') as date, acc, dir, amt::float as amt, 
             description as "desc", type, cat, contract, status, flags, doc, src 
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
      SELECT id, name, role, base_salary::float as "baseSalary", allowance::float as allowance, status 
      FROM ${tableName(TABLES.STAFF)} 
      ORDER BY id ASC;
    `);

    // 4. Gifts
    const giftItemsRes = await client.query(`SELECT id, name, unit, price::float FROM ${tableName(TABLES.GIFT_ITEMS)};`);
    const giftMvRes = await client.query(`
      SELECT to_char(d, 'YYYY-MM-DD') as d, item, qty, kind, who, tx, "to", note, ex 
      FROM ${tableName(TABLES.GIFT_MOVEMENTS)} 
      ORDER BY d ASC;
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

    // 7. Metadata (budget, locks, close, att, attMonth, holidays)
    const metaRes = await client.query(`SELECT key, value FROM ${tableName(TABLES.APP_METADATA)};`);
    const meta = {};
    for (const r of metaRes.rows) {
      meta[r.key] = r.value;
    }

    // 8. Accounts (Lấy tất cả bao gồm active & inactive để quản lý trong Tab Tài Sản)
    const accountsRes = await client.query(`
      SELECT id, name, type, account_no as "accountNo", bank_name as "bankName", status
      FROM ${tableName(TABLES.ACCOUNTS)}
      ORDER BY CASE id WHEN 'QUY' THEN 1 WHEN 'ACB' THEN 2 WHEN 'MB' THEN 3 ELSE 4 END, id ASC;
    `);

    // 9. Attendance Rows
    const attRowsRes = await client.query(`
      SELECT id, staff_id as "staffId", to_char(date, 'YYYY-MM-DD') as date, val, status, note
      FROM ${tableName(TABLES.ATTENDANCE)}
      ORDER BY date DESC, staff_id ASC;
    `);

    // 10. Audit Logs
    const logsRes = await client.query(`
      SELECT id, to_char(timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD HH24:MI:SS') as at,
             action, table_name as "tableName", record_id as "recordId", actor as role, details as what
      FROM ${tableName(TABLES.AUDIT_LOGS)}
      ORDER BY id DESC LIMIT 200;
    `);

    return {
      tx: txRes.rows,
      contracts: contractsRes.rows,
      staff: staffRes.rows,
      accounts: accountsRes.rows,
      attendanceRows: attRowsRes.rows,
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
      attMonth: meta.attMonth || '2026-11',
      holidays: meta.holidays || [],
      webhooks: [],
      log: logsRes.rows
    };
  } finally {
    client.release();
  }
}

import { pool, withTransaction } from '../../config/dbPool.mjs';
import { tableName, TABLES } from '../../config/dbSchema.mjs';

/**
 * Thêm giao dịch mới vào PostgreSQL
 */
export async function insertTransaction(tx) {
  const query = `
    INSERT INTO ${tableName(TABLES.TRANSACTIONS)} (id, date, acc, dir, amt, description, type, cat, contract, status, flags, doc, src, proposal_id, receipts)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING id, to_char(date, 'YYYY-MM-DD') as date, acc, dir, amt::float as amt, 
              description as desc, type, cat, contract, status, flags, doc, src,
              proposal_id as "proposalId", receipts;
  `;
  const values = [
    tx.id, tx.date, tx.acc, tx.dir, tx.amt, tx.desc || '', tx.type || '', tx.cat || '',
    tx.contract || '', tx.status || 'posted', tx.flags || [], tx.doc || '', tx.src || 'Nhập từ Web',
    tx.proposalId || tx.proposal_id || '', JSON.stringify(tx.receipts || [])
  ];
  const res = await pool.query(query, values);
  return res.rows[0];
}

/**
 * Cập nhật giao dịch trong PostgreSQL (hỗ trợ đầy đủ các trường)
 */
export async function updateTransaction(id, updates) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (updates.date !== undefined) { fields.push(`date = $${idx++}`); values.push(updates.date); }
  if (updates.acc !== undefined) { fields.push(`acc = $${idx++}`); values.push(updates.acc); }
  if (updates.dir !== undefined) { fields.push(`dir = $${idx++}`); values.push(updates.dir); }
  if (updates.amt !== undefined) { fields.push(`amt = $${idx++}`); values.push(updates.amt); }
  if (updates.type !== undefined) { fields.push(`type = $${idx++}`); values.push(updates.type); }
  if (updates.desc !== undefined) { fields.push(`description = $${idx++}`); values.push(updates.desc); }
  if (updates.cat !== undefined) { fields.push(`cat = $${idx++}`); values.push(updates.cat); }
  if (updates.contract !== undefined) { fields.push(`contract = $${idx++}`); values.push(updates.contract); }
  if (updates.status !== undefined) { fields.push(`status = $${idx++}`); values.push(updates.status); }
  if (updates.doc !== undefined) { fields.push(`doc = $${idx++}`); values.push(updates.doc); }
  if (updates.proposalId !== undefined || updates.proposal_id !== undefined) {
    fields.push(`proposal_id = $${idx++}`);
    values.push(updates.proposalId ?? updates.proposal_id ?? '');
  }
  if (updates.receipts !== undefined) {
    fields.push(`receipts = $${idx++}`);
    values.push(JSON.stringify(updates.receipts || []));
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `
    UPDATE ${tableName(TABLES.TRANSACTIONS)}
    SET ${fields.join(', ')} 
    WHERE id = $${idx} 
    RETURNING id, to_char(date, 'YYYY-MM-DD') as date, acc, dir, amt::float as amt, 
              description as desc, type, cat, contract, status, flags, doc, src,
              proposal_id as "proposalId", receipts;
  `;
  const res = await pool.query(query, values);
  return res.rows[0];
}

/**
 * Xóa giao dịch trong PostgreSQL
 */
export async function deleteTransaction(id) {
  const res = await pool.query(
    `DELETE FROM ${tableName(TABLES.TRANSACTIONS)} WHERE id = $1 RETURNING id, description as desc, amt::float as amt;`,
    [id]
  );
  return res.rows[0];
}

/**
 * Tự động tính toán lại ma trận số dư đầu kỳ - cuối kỳ cho tất cả các tháng
 * và lưu trực tiếp vào bảng finance_vpm.monthly_balances
 */
export async function recalculateMonthlyBalances(clientOrPool = pool) {
  const txRes = await clientOrPool.query(`
    SELECT id, to_char(date, 'YYYY-MM-DD') as date, acc, dir, amt::float as amt, status 
    FROM ${tableName(TABLES.TRANSACTIONS)}
    WHERE status != 'returned'
    ORDER BY date ASC, id ASC;
  `);

  const txList = txRes.rows;
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const existingMonthsRes = await clientOrPool.query(`SELECT month FROM ${tableName(TABLES.MONTHLY_BALANCES)};`);
  const monthSet = new Set([currentMonth]);
  existingMonthsRes.rows.forEach((r) => monthSet.add(r.month));
  txList.forEach((t) => {
    if (t.date) monthSet.add(t.date.slice(0, 7));
  });
  const months = Array.from(monthSet).sort();

  let prevQuy = 0;
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

    prevQuy = endQuy;
    prevAcb = endAcb;

    const isPast = m < currentMonth;
    const status = isPast ? 'closed' : 'open';

    await clientOrPool.query(`
      INSERT INTO ${tableName(TABLES.MONTHLY_BALANCES)} 
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
    FROM ${tableName(TABLES.MONTHLY_BALANCES)}
    ORDER BY month ASC;
  `);
  return res.rows;
}

/**
 * Chuyển kỳ tháng mới (00:01 ngày 01 hàng tháng)
 */
export async function rolloverNewMonth(targetMonth) {
  return withTransaction(async (client) => {
    const [y, m] = targetMonth.split('-').map(Number);
    const prevY = m === 1 ? y - 1 : y;
    const prevM = m === 1 ? 12 : m - 1;
    const prevMonthStr = `${prevY}-${String(prevM).padStart(2, '0')}`;

    await recalculateMonthlyBalances(client);

    const prevRes = await client.query(
      `SELECT end_quy::float as "endQuy", end_acb::float as "endAcb", end_total::float as "endTotal"
       FROM ${tableName(TABLES.MONTHLY_BALANCES)} WHERE month = $1;`,
      [prevMonthStr]
    );

    const startQuy = prevRes.rows.length > 0 ? prevRes.rows[0].endQuy : 0;
    const startAcb = prevRes.rows.length > 0 ? prevRes.rows[0].endAcb : 0;
    const startTotal = startQuy + startAcb;

    if (prevRes.rows.length > 0) {
      await client.query(
        `UPDATE ${tableName(TABLES.MONTHLY_BALANCES)} SET status = 'closed', updated_at = NOW() WHERE month = $1;`,
        [prevMonthStr]
      );
    }

    const startDate = `${targetMonth}-01`;
    const lastDayNum = new Date(y, m, 0).getDate();
    const endDate = `${targetMonth}-${String(lastDayNum).padStart(2, '0')}`;

    await client.query(`
      INSERT INTO ${tableName(TABLES.MONTHLY_BALANCES)}
        (month, start_date, end_date, start_quy, end_quy, start_acb, end_acb, start_total, end_total, net_change, status, updated_at)
      VALUES ($1, $2, $3, $4, $4, $5, $5, $6, $6, 0, 'open', NOW())
      ON CONFLICT (month) DO UPDATE SET
        start_quy = EXCLUDED.start_quy,
        start_acb = EXCLUDED.start_acb,
        start_total = EXCLUDED.start_total,
        status = 'open',
        updated_at = NOW();
    `, [targetMonth, startDate, endDate, startQuy, startAcb, startTotal]);

    return await getMonthlyBalances();
  });
}

/**
 * Xóa toàn bộ giao dịch quá khứ và reset số dư về kỳ hiện tại = 0 đ
 */
export async function resetLedgerToCurrentMonth() {
  return withTransaction(async (client) => {
    await client.query(`TRUNCATE TABLE ${tableName(TABLES.TRANSACTIONS)} RESTART IDENTITY CASCADE;`);
    await client.query(`TRUNCATE TABLE ${tableName(TABLES.MONTHLY_BALANCES)} RESTART IDENTITY CASCADE;`);
    const balances = await recalculateMonthlyBalances(client);
    return balances;
  });
}

import { pool, withTransaction } from '../../config/dbPool.mjs';
import { tableName, TABLES } from '../../config/dbSchema.mjs';

export async function upsertStaff(s) {
  const query = `
    INSERT INTO ${tableName(TABLES.STAFF)} (id, name, department, hire_date, role, base_salary, allowance, status)
    VALUES ($1, $2, COALESCE($3, ''), $4, $5, $6, $7, $8)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name, department = COALESCE($3, ${tableName(TABLES.STAFF)}.department),
      hire_date = COALESCE($4, ${tableName(TABLES.STAFF)}.hire_date),
      role = EXCLUDED.role, base_salary = EXCLUDED.base_salary,
      allowance = EXCLUDED.allowance, status = EXCLUDED.status
    RETURNING id, name, department, to_char(hire_date, 'YYYY-MM-DD') AS "hireDate", role,
      base_salary::float as "baseSalary", allowance::float as allowance, status;
  `;
  const res = await pool.query(query, [
    s.id, s.name, s.department ?? null, s.hireDate ?? null, s.role || '',
    s.baseSalary || 0, s.allowance || 0, s.status || 'active'
  ]);
  return res.rows[0];
}

export async function deleteStaff(id) {
  const res = await pool.query(`DELETE FROM ${tableName(TABLES.STAFF)} WHERE id = $1 RETURNING *;`, [id]);
  return res.rows[0];
}

function toAttendanceFields(value) {
  const valueCode = String(value);
  if (valueCode === '1') return { valueCode, workUnits: 1, payMultiplier: 1 };
  if (valueCode === '0.5') return { valueCode, workUnits: 0.5, payMultiplier: 1 };
  if (valueCode === 'L') return { valueCode, workUnits: 1, payMultiplier: 1 };
  if (valueCode === 'X') return { valueCode, workUnits: 0, payMultiplier: 3 };
  if (valueCode === '2') return { valueCode, workUnits: 0, payMultiplier: 2 };
  throw new Error('Ký hiệu chấm công không hợp lệ.');
}

function getMonth(dateIso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) throw new Error('Ngày chấm công không hợp lệ.');
  return dateIso.slice(0, 7);
}

function calculateStandardDays(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return Array.from({ length: daysInMonth }, (_, index) => new Date(Date.UTC(year, monthNumber - 1, index + 1)).getUTCDay())
    .reduce((total, weekday) => total + (weekday === 0 ? 0 : weekday === 6 ? 0.5 : 1), 0);
}

async function ensureAttendancePeriod(client, month) {
  await client.query(`
    INSERT INTO ${tableName(TABLES.ATTENDANCE_PERIODS)} (month, standard_days)
    VALUES ($1, $2)
    ON CONFLICT (month) DO NOTHING;
  `, [month, calculateStandardDays(month)]);
}

async function recordAttendanceEffects(client, { staffId, dateIso, valueCode, action }) {
  await client.query(`
    INSERT INTO ${tableName(TABLES.ATTENDANCE_LOGS)} (staff_id, work_date, value_code, action)
    VALUES ($1, $2, $3, $4);
  `, [staffId, dateIso, valueCode, action]);

  const month = getMonth(dateIso);
  const benefitCountResult = await client.query(`
    SELECT COUNT(*)::numeric AS "holidaySunday"
    FROM ${tableName(TABLES.ATTENDANCE_ENTRIES)} entry
    LEFT JOIN ${tableName(TABLES.ATTENDANCE_HOLIDAYS)} holiday
      ON holiday.month = entry.month AND holiday.holiday_date = entry.work_date
    WHERE entry.month = $1
      AND entry.staff_id = $2
      AND entry.value_code IN ('X', '2')
      AND (holiday.id IS NOT NULL OR EXTRACT(DOW FROM entry.work_date) = 0);
  `, [month, staffId]);
  const holidaySunday = Number(benefitCountResult.rows[0].holidaySunday);

  if (holidaySunday === 0) {
    await client.query(`
      UPDATE ${tableName(TABLES.STAFF_BENEFITS)}
      SET holiday_sunday = 0, "time" = NOW()
      WHERE month = $1 AND staff_id = $2;
    `, [month, staffId]);
    return;
  }

  await client.query(`
    INSERT INTO ${tableName(TABLES.STAFF_BENEFITS)} (month, staff_id, holiday_sunday, "time")
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT (month, staff_id) DO UPDATE SET
      holiday_sunday = EXCLUDED.holiday_sunday,
      "time" = NOW();
  `, [month, staffId, holidaySunday]);
}

export async function saveAttendance(staffId, dateIso, val) {
  return withTransaction(async (client) => {
    const month = getMonth(dateIso);
    await ensureAttendancePeriod(client, month);

    if (val === '' || val === null || val === undefined) {
      await client.query(`
        DELETE FROM ${tableName(TABLES.ATTENDANCE_ENTRIES)}
        WHERE month = $1 AND staff_id = $2 AND work_date = $3;
      `, [month, staffId, dateIso]);
      await recordAttendanceEffects(client, { staffId, dateIso, valueCode: null, action: 'delete' });
      return { row: null };
    }

    const fields = toAttendanceFields(val);
    const attRowRes = await client.query(`
      INSERT INTO ${tableName(TABLES.ATTENDANCE_ENTRIES)}
        (month, staff_id, work_date, value_code, work_units, pay_multiplier, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'posted')
      ON CONFLICT (month, staff_id, work_date) DO UPDATE SET
        value_code = EXCLUDED.value_code,
        work_units = EXCLUDED.work_units,
        pay_multiplier = EXCLUDED.pay_multiplier,
        logged_at = NOW(),
        updated_at = NOW()
      RETURNING id, staff_id AS "staffId", to_char(work_date, 'YYYY-MM-DD') AS date,
        value_code AS val, status;
    `, [month, staffId, dateIso, fields.valueCode, fields.workUnits, fields.payMultiplier]);

    await recordAttendanceEffects(client, { staffId, dateIso, valueCode: fields.valueCode, action: 'save' });

    return { row: attRowRes.rows[0] };
  });
}

export async function saveAttendanceBatch(entries) {
  return withTransaction(async (client) => {
    for (const entry of entries) {
      const { staffId, dateIso, val } = entry;
      if (!staffId) throw new Error('Thiếu nhân sự trong dữ liệu chấm công.');
      const month = getMonth(dateIso);
      const fields = toAttendanceFields(val);
      await ensureAttendancePeriod(client, month);

      await client.query(`
        INSERT INTO ${tableName(TABLES.ATTENDANCE_ENTRIES)}
          (month, staff_id, work_date, value_code, work_units, pay_multiplier, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'posted')
        ON CONFLICT (month, staff_id, work_date) DO UPDATE SET
          value_code = EXCLUDED.value_code,
          work_units = EXCLUDED.work_units,
        pay_multiplier = EXCLUDED.pay_multiplier,
        logged_at = NOW(),
          updated_at = NOW();
      `, [month, staffId, dateIso, fields.valueCode, fields.workUnits, fields.payMultiplier]);
      await recordAttendanceEffects(client, { staffId, dateIso, valueCode: fields.valueCode, action: 'save' });
    }

    return true;
  });
}

export async function saveStaffAdvance(staffId, advance, month) {
  return withTransaction(async (client) => {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month || '')) throw new Error('Kỳ lương không hợp lệ.');
    await ensureAttendancePeriod(client, month);

    const result = await client.query(`
      INSERT INTO ${tableName(TABLES.PAYROLL_RECORDS)} (month, staff_id, advance)
      VALUES ($1, $2, $3)
      ON CONFLICT (month, staff_id) DO UPDATE SET advance = EXCLUDED.advance, updated_at = NOW()
      RETURNING staff_id AS "staffId", advance::float AS advance;
    `, [month, staffId, Math.max(0, Number(advance) || 0)]);

    return result.rows[0];
  });
}

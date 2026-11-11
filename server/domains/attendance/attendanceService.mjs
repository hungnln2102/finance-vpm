import { pool, withTransaction } from '../../config/dbPool.mjs';
import { tableName, TABLES } from '../../config/dbSchema.mjs';

export async function upsertStaff(s) {
  const query = `
    INSERT INTO ${tableName(TABLES.STAFF)} (id, name, role, base_salary, allowance, status)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name, role = EXCLUDED.role, base_salary = EXCLUDED.base_salary,
      allowance = EXCLUDED.allowance, status = EXCLUDED.status
    RETURNING id, name, role, base_salary::float as "baseSalary", allowance::float as allowance, status;
  `;
  const res = await pool.query(query, [
    s.id, s.name, s.role || '', s.baseSalary || 0, s.allowance || 0, s.status || 'active'
  ]);
  return res.rows[0];
}

export async function deleteStaff(id) {
  const res = await pool.query(`DELETE FROM ${tableName(TABLES.STAFF)} WHERE id = $1 RETURNING *;`, [id]);
  return res.rows[0];
}

export async function saveAttendance(staffId, dateIso, val) {
  return withTransaction(async (client) => {
    const metaRes = await client.query(`SELECT value FROM ${tableName(TABLES.APP_METADATA)} WHERE key = 'att';`);
    const att = metaRes.rows.length > 0 ? metaRes.rows[0].value : {};
    if (!att[staffId]) att[staffId] = {};
    att[staffId][dateIso] = val;

    await client.query(`
      INSERT INTO ${tableName(TABLES.APP_METADATA)} (key, value, updated_at)
      VALUES ('att', $1::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
    `, [JSON.stringify(att)]);

    const attRowRes = await client.query(`
      INSERT INTO ${tableName(TABLES.ATTENDANCE)} (staff_id, date, val, status, updated_at)
      VALUES ($1, $2, $3, 'Cập nhật từ Web', NOW())
      ON CONFLICT (staff_id, date) DO UPDATE SET val = EXCLUDED.val, updated_at = NOW()
      RETURNING id, staff_id as "staffId", to_char(date, 'YYYY-MM-DD') as date, val, status;
    `, [staffId, dateIso, String(val)]);

    return { att, row: attRowRes.rows[0] };
  });
}

import { pool, withTransaction } from '../../config/dbPool.mjs';
import { tableName, TABLES } from '../../config/dbSchema.mjs';
import { recalculateMonthlyBalances } from '../ledger/ledgerService.mjs';

/**
 * Nhập và cập nhật toàn bộ dữ liệu từ Google Sheet vào PostgreSQL (Two-Way Sync: Sheet -> DB)
 */
export async function importSheetDataToPostgres(sheetData) {
  if (!sheetData || !Array.isArray(sheetData.tx)) {
    throw new Error('Dữ liệu từ Google Sheet không hợp lệ hoặc thiếu danh sách giao dịch');
  }

  return withTransaction(async (client) => {
    let insertedTx = 0;
    let updatedTx = 0;
    let insertedContracts = 0;
    let updatedContracts = 0;

    const maxIdRes = await client.query(`
      SELECT id FROM ${tableName(TABLES.TRANSACTIONS)} 
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

      const checkRes = await client.query(`SELECT id FROM ${tableName(TABLES.TRANSACTIONS)} WHERE id = $1;`, [txId]);
      if (checkRes.rows.length > 0) {
        await client.query(`
          UPDATE ${tableName(TABLES.TRANSACTIONS)} SET
            date = $2, acc = $3, dir = $4, amt = $5, description = $6,
            type = $7, cat = $8, contract = $9, status = $10, flags = $11,
            doc = $12, src = $13, updated_at = NOW()
          WHERE id = $1;
        `, [txId, txDate, acc, dir, amt, desc, type, cat, contract, status, flags, doc, src]);
        updatedTx++;
      } else {
        await client.query(`
          INSERT INTO ${tableName(TABLES.TRANSACTIONS)} 
            (id, date, acc, dir, amt, description, type, cat, contract, status, flags, doc, src)
          VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
        `, [txId, txDate, acc, dir, amt, desc, type, cat, contract, status, flags, doc, src]);
        insertedTx++;
      }
    }

    if (Array.isArray(sheetData.contracts)) {
      for (const c of sheetData.contracts) {
        const cId = c.id ? c.id.trim() : '';
        if (!cId || !c.customer) continue;

        const checkC = await client.query(`SELECT id FROM ${tableName(TABLES.CONTRACTS)} WHERE id = $1;`, [cId]);
        if (checkC.rows.length > 0) {
          await client.query(`
            UPDATE ${tableName(TABLES.CONTRACTS)} SET
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
            INSERT INTO ${tableName(TABLES.CONTRACTS)} 
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

    const balances = await recalculateMonthlyBalances(client);

    return {
      success: true,
      insertedTx,
      updatedTx,
      totalTx: sheetData.tx.length,
      insertedContracts,
      updatedContracts,
      balances
    };
  });
}

import { pool, withTransaction } from '../../config/dbPool.mjs';
import { tableName, TABLES } from '../../config/dbSchema.mjs';

export async function getGiftItems() {
  const res = await pool.query(`
    SELECT id, name, unit, price::float AS price
    FROM ${tableName(TABLES.GIFT_ITEMS)}
    ORDER BY id ASC;
  `);
  return res.rows;
}

export async function createGiftItem(payload) {
  const normalizedId = String(payload.id || '').trim().toUpperCase();
  const normalizedName = String(payload.name || '').trim();
  const normalizedUnit = String(payload.unit || '').trim();
  const numPrice = Number(payload.price);
  const initialQty = Number(payload.initialQty) || 0;

  if (!normalizedId || !normalizedName || !normalizedUnit || Number.isNaN(numPrice) || numPrice < 0) {
    throw new Error('Thông tin sản phẩm không hợp lệ (cần đủ Mã, Tên, Đơn vị tính và Đơn giá >= 0).');
  }

  return withTransaction(async (client) => {
    const existing = await client.query(
      `SELECT id FROM ${tableName(TABLES.GIFT_ITEMS)} WHERE id = $1 FOR UPDATE;`,
      [normalizedId]
    );
    if (existing.rows.length > 0) {
      throw new Error(`Mã sản phẩm ${normalizedId} đã tồn tại trong cơ sở dữ liệu.`);
    }

    const itemRes = await client.query(
      `INSERT INTO ${tableName(TABLES.GIFT_ITEMS)} (id, name, unit, price)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, unit, price::float AS price;`,
      [normalizedId, normalizedName, normalizedUnit, numPrice]
    );
    const savedItem = itemRes.rows[0];

    let initialMovement = null;
    if (initialQty > 0) {
      const todayIso = payload.d || new Date().toISOString().slice(0, 10);
      const mvRes = await client.query(
        `INSERT INTO ${tableName(TABLES.GIFT_MOVEMENTS)} (d, item, qty, kind, who, tx, "to", note, ex)
         VALUES ($1, $2, $3, 'in', $4, '', '', $5, true)
         RETURNING id, to_char(d, 'YYYY-MM-DD') AS d, item, qty, kind, who, tx, "to", note, ex;`,
        [
          todayIso,
          normalizedId,
          initialQty,
          String(payload.who || 'Khởi tạo sản phẩm mới').trim(),
          String(payload.note || 'Nhập kho ban đầu khi tạo sản phẩm').trim()
        ]
      );
      initialMovement = mvRes.rows[0];
    }

    return {
      item: savedItem,
      initialMovement
    };
  });
}

export async function insertGiftMovement(mv) {
  const itemId = String(mv.item || '').trim().toUpperCase();
  const qty = Number(mv.qty) || 0;
  const kind = mv.kind === 'in' ? 'in' : 'out';

  if (!itemId || qty <= 0) {
    throw new Error('Dữ liệu phiếu xuất/nhập không hợp lệ.');
  }

  return withTransaction(async (client) => {
    const itemRes = await client.query(
      `SELECT id, name, unit FROM ${tableName(TABLES.GIFT_ITEMS)} WHERE id = $1 FOR UPDATE;`,
      [itemId]
    );
    if (itemRes.rows.length === 0) {
      throw new Error(`Không tìm thấy sản phẩm mã ${itemId} trong cơ sở dữ liệu.`);
    }

    if (kind === 'out') {
      const stockRes = await client.query(
        `SELECT COALESCE(SUM(CASE WHEN kind = 'in' THEN qty ELSE -qty END), 0)::int AS balance
         FROM ${tableName(TABLES.GIFT_MOVEMENTS)}
         WHERE item = $1;`,
        [itemId]
      );
      const currentBalance = stockRes.rows[0]?.balance || 0;
      if (qty > currentBalance) {
        throw new Error(`Không đủ tồn kho cho ${itemId}: hiện chỉ còn ${currentBalance} ${itemRes.rows[0].unit}.`);
      }
    }

    const query = `
      INSERT INTO ${tableName(TABLES.GIFT_MOVEMENTS)} (d, item, qty, kind, who, tx, "to", note, ex)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, to_char(d, 'YYYY-MM-DD') AS d, item, qty, kind, who, tx, "to", note, ex;
    `;
    const res = await client.query(query, [
      mv.d || new Date().toISOString().slice(0, 10),
      itemId,
      qty,
      kind,
      mv.who || '',
      mv.tx || '',
      mv.to || '',
      mv.note || '',
      mv.ex !== false
    ]);
    return res.rows[0];
  });
}

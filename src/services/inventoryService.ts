import { GiftItem, GiftMovement } from '../types';

export interface StockSummary {
  [itemId: string]: {
    in: number;
    out: number;
    balance: number;
  };
}

export function calculateGiftStock(gifts: { items: GiftItem[]; mv: GiftMovement[] }): StockSummary {
  const stock: StockSummary = {};
  
  for (const item of gifts.items) {
    stock[item.id] = { in: 0, out: 0, balance: 0 };
  }

  for (const m of gifts.mv) {
    if (!stock[m.item]) {
      stock[m.item] = { in: 0, out: 0, balance: 0 };
    }
    stock[m.item][m.kind] += m.qty;
    stock[m.item].balance = stock[m.item].in - stock[m.item].out;
  }

  return stock;
}

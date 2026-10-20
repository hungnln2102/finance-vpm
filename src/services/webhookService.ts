import { BankWebhookLog, Transaction, Direction, AccountKey } from '../types';

export interface WebhookPayload {
  bankTxId: string;
  date: string;
  acc: AccountKey;
  dir: Direction; // 'in' (tiền vào luôn có biến động), 'out' (tiền ra có hoặc không)
  amount: number;
  description: string;
}

export class WebhookService {
  /**
   * Xử lý webhook biến động số dư từ ngân hàng (ACB, Quỹ, v.v.)
   * Tiền vào: Luôn có biến động, tự động match hoặc tạo draft.
   * Tiền ra: Có thể có hoặc không.
   */
  static processWebhook(
    payload: WebhookPayload,
    existingTxList: Transaction[],
    currentWebhooks: BankWebhookLog[]
  ): { newWebhook: BankWebhookLog; matchedTxId?: string } {
    const webhookId = `WH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Thuật toán Auto-Match: Tìm giao dịch chờ (pending_admin hoặc draft) có cùng số tiền và chiều (dir)
    const matchingTx = existingTxList.find(tx => 
      (tx.status === 'draft' || tx.status === 'pending_admin' || tx.status === 'pending') &&
      tx.dir === payload.dir &&
      Math.abs(tx.amt - payload.amount) < 1 &&
      (payload.description.toLowerCase().includes(tx.contract?.toLowerCase() || '') ||
       payload.description.toLowerCase().includes(tx.desc.toLowerCase().slice(0, 10)))
    );

    const matchedTxId = matchingTx ? matchingTx.id : undefined;
    const status: 'matched' | 'unmatched' = matchedTxId ? 'matched' : 'unmatched';

    const newWebhook: BankWebhookLog = {
      id: webhookId,
      bankTxId: payload.bankTxId || `ACB-${Math.floor(Math.random() * 999999)}`,
      date: payload.date || new Date().toISOString().slice(0, 19).replace('T', ' '),
      acc: payload.acc || 'ACB',
      dir: payload.dir,
      amount: payload.amount,
      description: payload.description,
      matchedTxId,
      status,
      rawPayload: payload
    };

    return { newWebhook, matchedTxId };
  }

  /**
   * Tạo payload mẫu giả lập webhook nhận tiền vào hoặc tiền ra
   */
  static generateSampleWebhook(dir: Direction = 'in'): WebhookPayload {
    const amounts = dir === 'in' ? [5000000, 12500000, 25000000, 3200000] : [1500000, 4800000, 12000000];
    const randomAmt = amounts[Math.floor(Math.random() * amounts.length)];
    const sampleDescs = dir === 'in' 
      ? [
          `CK Cua Khach Hang thanh toan hop đồng HD-${Math.floor(Math.random() * 50)}`,
          `Chuyen khoan tu Vu Thi Mai mua an pham`,
          `Nop tien vao tai khoan kinh doanh`
        ]
      : [
          `Thanh toan tien van phong pham thang`,
          `Chuyen tien chi phi van hanh Opex`,
          `Rut tien mat quy`
        ];

    return {
      bankTxId: `FT${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().slice(0, 10),
      acc: 'ACB',
      dir,
      amount: randomAmt,
      description: sampleDescs[Math.floor(Math.random() * sampleDescs.length)]
    };
  }
}

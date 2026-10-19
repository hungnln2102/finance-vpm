import { Transaction, AppState, IssueItem, AccountKey } from '../types';
import { APPROVE_LIMIT, DISC_LIMIT, OPEN_BAL, CATS } from '../data/constants';
import { mon, lastDay, prevMonth, fm, mil, dmy, monthLabel } from '../utils/formatters';
import { calculateDebt } from './debtService';
import { detectAttendanceAlerts } from './payrollService';

export function needsApproval(t: Transaction): boolean {
  return t.dir === 'out' && t.amt >= APPROVE_LIMIT && t.status !== 'migrated';
}

export function txIssues(t: Transaction): string[] {
  const out = [...(t.flags || [])];
  if (t.status !== 'migrated' && !t.doc && t.acc !== 'BT') {
    out.push('Chưa đính chứng từ');
  }
  if ((t.type === 'THU_KH' || t.type === 'THU_TV') && !t.contract) {
    out.push('Chưa gắn hợp đồng');
  }
  return out;
}

export function calculateBalance(
  transactions: Transaction[],
  acc: AccountKey | string,
  until: string,
  openBal = OPEN_BAL
): number {
  let b = openBal[acc] || 0;
  for (const t of transactions) {
    if (t.acc === acc && t.date <= until && t.status !== 'returned') {
      b += t.dir === 'in' ? t.amt : -t.amt;
    }
  }
  return b;
}

export function monthTx(transactions: Transaction[], m: string): Transaction[] {
  return transactions.filter((t) => mon(t.date) === m && t.status !== 'returned');
}

export function opexBy(transactions: Transaction[], m: string): Record<string, number> {
  const r: Record<string, number> = {};
  for (const k in CATS) {
    r[k] = 0;
  }
  for (const t of monthTx(transactions, m)) {
    if (t.type === 'OPEX' && t.cat) {
      r[t.cat] = (r[t.cat] || 0) + t.amt;
    }
  }
  return r;
}

export function minBalance(
  transactions: Transaction[],
  acc: AccountKey | string,
  m: string,
  openBal = OPEN_BAL
): { min: number; minD: string | null } {
  let b = calculateBalance(transactions, acc, lastDay(prevMonth(m)), openBal);
  let min = b;
  let minD: string | null = null;

  const rows = transactions
    .filter((t) => t.acc === acc && mon(t.date) === m && t.status !== 'returned')
    .sort((a, b) => a.date.localeCompare(b.date));

  rows.forEach((t, i) => {
    b += t.dir === 'in' ? t.amt : -t.amt;
    const endOfDay = i === rows.length - 1 || rows[i + 1].date !== t.date;
    if (endOfDay && b < min) {
      min = b;
      minD = t.date;
    }
  });

  return { min, minD };
}

export function detectAllIssues(state: AppState, today: string): IssueItem[] {
  const list: IssueItem[] = [];

  const pendCheck = state.tx.filter((t) => t.status === 'pending').length;
  const pendAppr = state.tx.filter((t) => t.status === 'checked' && needsApproval(t)).length;

  if (pendCheck) {
    list.push({ lvl: 'warn', text: `${pendCheck} giao dịch chờ VPM kiểm tra`, go: 'ledger', f: 'pending' });
  }
  if (pendAppr) {
    list.push({ lvl: 'warn', text: `${pendAppr} khoản chi từ ${fm(APPROVE_LIMIT)} đ chờ chị Giàu duyệt`, go: 'ledger', f: 'approve' });
  }

  const unk = state.tx.filter((t) => t.type === 'THU_KHAC' && (t.flags || []).some((f) => f.startsWith('Chưa rõ')));
  if (unk.length) {
    list.push({ lvl: 'bad', text: `${unk.length} khoản thu ${mil(unk.reduce((s, t) => s + t.amt, 0))} chưa rõ của ai, cho hợp đồng nào`, go: 'ledger', f: 'flag' });
  }

  const off = state.tx.filter((t) => (t.flags || []).includes('Có trong sổ công nợ, không có trong sổ quỹ'));
  if (off.length) {
    list.push({ lvl: 'bad', text: `${off.length} khoản thu chỉ ghi ở sổ công nợ, không thấy tiền về sổ quỹ (${mil(off.reduce((s, t) => s + t.amt, 0))})`, go: 'ledger', f: 'flag' });
  }

  const neg = ['2026-08', '2026-09', '2026-10']
    .map((m) => [m, minBalance(state.tx, 'QUY', m)] as [string, { min: number; minD: string | null }])
    .filter(([, r]) => r.min < 0);

  for (const [m, r] of neg) {
    list.push({ lvl: 'bad', text: `Sổ quỹ âm ${fm(r.min)} đ trong ${monthLabel(m).toLowerCase()} (cuối ngày ${dmy(r.minD || m + '-01')})`, go: 'report' });
  }

  const ov = state.contracts
    .map((c) => [c, calculateDebt(c, state.tx, today)] as const)
    .filter(([, d]) => d.over > 0);

  if (ov.length) {
    list.push({ lvl: 'bad', text: `${ov.length} hợp đồng quá hạn, tổng ${mil(ov.reduce((s, [, d]) => s + d.left, 0))}`, go: 'debt' });
  }

  const disc = state.contracts.filter((c) => !calculateDebt(c, state.tx, today).discOk);
  if (disc.length) {
    list.push({ lvl: 'warn', text: `${disc.length} hợp đồng chiết khấu trên ${DISC_LIMIT * 100}% chưa được duyệt`, go: 'debt' });
  }

  const nodate = state.tx.filter((t) => (t.flags || []).includes('Thiếu ngày giao dịch')).length;
  if (nodate) {
    list.push({ lvl: 'warn', text: `${nodate} dòng nhập từ file cũ thiếu ngày giao dịch`, go: 'ledger', f: 'flag' });
  }

  const attA = detectAttendanceAlerts(state.staff, state.att, state.attMonth, state.holidays).length;
  if (attA) {
    list.push({ lvl: 'warn', text: `${attA} ô chấm công T9 cần xác nhận (ngày lễ, chủ nhật)`, go: 'payroll' });
  }

  return list;
}

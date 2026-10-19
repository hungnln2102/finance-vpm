import { Contract, Transaction } from '../types';
import { DISC_LIMIT } from '../data/constants';
import { days } from '../utils/formatters';

export interface DebtCalculation {
  due: number;
  paid: number;
  left: number;
  over: number;
  rate: number;
  status: 'Thu dư' | 'Xong' | 'Quá hạn' | 'Trong hạn';
  pays: Transaction[];
  discOk: boolean;
}

export function paymentsOf(transactions: Transaction[], contractId: string): Transaction[] {
  return transactions.filter(
    (t) => t.contract === contractId && 
          (t.type === 'THU_KH' || t.type === 'THU_TV') && 
          t.status !== 'returned'
  );
}

export function calculateDebt(contract: Contract, transactions: Transaction[], today: string): DebtCalculation {
  const due = contract.fee - contract.disc;
  const pays = paymentsOf(transactions, contract.id);
  const paid = pays.reduce((sum, t) => sum + t.amt, 0);
  const left = due - paid;
  
  const over = left > 0 && contract.due && contract.due < today ? days(contract.due, today) : 0;
  const rate = contract.fee ? contract.disc / contract.fee : 0;
  
  let status: 'Thu dư' | 'Xong' | 'Quá hạn' | 'Trong hạn' = 'Trong hạn';
  if (left <= 0) {
    status = left < 0 ? 'Thu dư' : 'Xong';
  } else if (over > 0) {
    status = 'Quá hạn';
  } else {
    status = 'Trong hạn';
  }

  const discOk = rate <= DISC_LIMIT || !!contract.discApproved;

  return {
    due,
    paid,
    left,
    over,
    rate,
    status,
    pays,
    discOk
  };
}

export type Role = 'tien' | 'vpm' | 'giau';

export type ActiveTab = 
  | 'overview' 
  | 'ledger' 
  | 'debt' 
  | 'gifts' 
  | 'payroll' 
  | 'report' 
  | 'closing';

export type Direction = 'in' | 'out';

export type TransactionStatus = 'pending' | 'checked' | 'approved' | 'returned' | 'migrated';

export type TransactionType = 
  | 'THU_KH' 
  | 'THU_TV' 
  | 'HOA_HONG' 
  | 'DFAM_CAP' 
  | 'THU_KHAC' 
  | 'OPEX' 
  | 'UNG_PHI' 
  | 'HOAN_UNG' 
  | 'CHUYEN_DFAM' 
  | 'TAM_UNG';

export type OpexCategory = 'LUONG' | 'VP' | 'SUKIEN' | 'CSKH' | 'NOIBO' | 'KHAC' | '';

export type AccountKey = 'QUY' | 'ACB' | 'BT';

export interface Transaction {
  id: string;
  acc: AccountKey | string;
  contract?: string;
  flags: string[];
  status: TransactionStatus;
  doc?: string;
  src?: string;
  date: string; // YYYY-MM-DD
  dir: Direction;
  amt: number;
  desc: string;
  type: TransactionType;
  cat?: OpexCategory | string;
  note?: string;
}

export type ContractKind = 'KH' | 'TV';

export interface Contract {
  id: string;
  kind: ContractKind;
  customer: string;
  no: string;
  tv: string;
  signed: string; // YYYY-MM-DD
  fee: number;
  disc: number;
  discApproved?: boolean;
  due: string; // YYYY-MM-DD
  terms: string;
  note: string;
}

export interface StaffAllowance {
  phone: number;
  fuel: number;
  meal: number;
  travel: number;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  base: number;
  kpi: number;
  allow: StaffAllowance;
  insSalary: number;
  advance: number;
  deps: number;
  oldDays?: number;
  oldTax?: number;
  oldNet?: number;
  oldGross?: number;
}

export interface GiftItem {
  id: string;
  name: string;
  unit: string;
  price: number;
}

export interface GiftMovement {
  d: string; // YYYY-MM-DD
  item: string; // Q01...
  qty: number;
  kind: 'in' | 'out';
  to?: 'TV' | 'SK' | 'KH' | string;
  who: string;
  note?: string;
  ex?: boolean;
  tx?: string;
}

export interface AttendanceRecord {
  days: Record<string, number | string | undefined>; // "YYYY-MM-DD" -> 1, 0.5, "L", "X", 2
  ghost31?: boolean | number;
}

export interface BudgetMap {
  [categoryKey: string]: number;
}

export interface MonthClosing {
  bank?: string | number;
  count?: string | number;
  wage?: boolean;
  [key: string]: any;
}

export interface AuditLog {
  at: string;
  role: Role;
  what: string;
}

export interface SeedData {
  contracts: Contract[];
  tx: Transaction[];
  staff: Staff[];
  attMonth: string;
  holidays: string[];
  att: Record<string, AttendanceRecord>;
  budget?: Record<string, BudgetMap>;
  locks?: Record<string, string>;
  close?: Record<string, MonthClosing>;
}

export interface AppState {
  contracts: Contract[];
  tx: Transaction[];
  staff: Staff[];
  attMonth: string;
  holidays: string[];
  att: Record<string, AttendanceRecord>;
  budget: Record<string, BudgetMap>;
  locks: Record<string, string>;
  close: Record<string, MonthClosing>;
  log: AuditLog[];
  gifts: {
    items: GiftItem[];
    mv: GiftMovement[];
  };
}


export interface UIState {
  view: ActiveTab;
  role: Role;
  month: string; // YYYY-MM
  sel?: string | null;
  ledgerFilter: 'all' | 'pending' | 'approve' | 'flag';
  debtKind: ContractKind;
  debtOnlyOver: boolean;
  editTx: string | null;
}

export interface IssueItem {
  lvl: 'warn' | 'bad' | 'good';
  text: string;
  go: ActiveTab;
  f?: string;
}

export interface RoleDefinition {
  id: Role;
  name: string;
  title: string;
  description: string;
}

export type AccountMap = Record<AccountKey, string>;
export type OpexCategoryMap = Record<string, string>;
export type TransactionTypeMap = Record<string, { l: string; dir: Direction }>;

import { createContext } from 'react';
import { 
  AppState, 
  UIState, 
  Role, 
  ActiveTab, 
  Transaction, 
  Contract, 
  GiftMovement
} from '../types';
import { ToastState } from './actions/useAppUiState';

export interface AppContextType {
  state: AppState;
  ui: UIState;
  toast: ToastState;
  showToast: (msg: string, type?: ToastState['type'], duration?: number) => void;
  hideToast: () => void;
  setView: (view: ActiveTab, filter?: any) => void;
  setRole: (role: Role) => void;
  setMonth: (month: string) => void;
  setDateRange: (from?: string, to?: string) => void;
  setLedgerFilter: (filter: UIState['ledgerFilter']) => void;
  setDebtKind: (kind: 'KH' | 'TV') => void;
  setDebtOnlyOver: (onlyOver: boolean) => void;
  setEditTx: (txId: string | null) => void;
  canDo: (action: string) => boolean;
  addTransaction: (data: {
    date: string;
    acc: string;
    dir?: 'in' | 'out';
    type?: Transaction['type'];
    amt: number;
    cat?: string;
    contract?: string;
    desc: string;
    docFile?: File | null;
  }) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  checkTransaction: (id: string) => void;
  returnTransaction: (id: string, reason?: string) => void;
  approveTransaction: (id: string) => void;
  forwardTransaction: (id: string) => void;
  postTransaction: (id: string) => void;
  rejectTransaction: (id: string, reason?: string) => void;
  simulateWebhook: (options?: { dir?: 'in' | 'out'; amount?: number; desc?: string; acc?: string }) => void;
  matchWebhook: (webhookId: string, txId: string) => void;
  submitProposal: (data: {
    title: string;
    creator: string;
    creatorEmail: string;
    department: string;
    amount: number;
    date: string;
    description: string;
    ccEmails?: string[];
  }) => void;
  reviewProposal: (id: string, status: 'pending_master' | 'approved' | 'rejected', comment?: string) => void;
  addProposalThread: (proposalId: string, content: string, isInboundReply?: boolean) => void;
  addCostAdjustment: (data: {
    month: string;
    category: string;
    oldBudget: number;
    newBudget: number;
    reason: string;
  }) => void;
  approveCostAdjustment: (id: string) => void;
  addContract: (data: Omit<Contract, 'id'>) => void;
  approveDiscount: (id: string) => void;
  addGiftMovement: (mv: Omit<GiftMovement, 'd'>) => void;
  cycleAttendance: (staffId: string, dateIso: string) => void;
  applyAttendanceSuggestions: () => void;
  updateStaffAdvance: (staffId: string, advance: number) => void;
  updateBudget: (month: string, category: string, amount: number) => void;
  updateClosing: (month: string, key: string, value: any) => void;
  lockMonth: (month: string) => void;
  unlockMonth: (month: string) => void;
  resetData: () => void;
  refreshFromDatabase: () => Promise<boolean>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

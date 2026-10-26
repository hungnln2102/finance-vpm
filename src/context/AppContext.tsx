import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  AppState, 
  UIState, 
  Role, 
  ActiveTab, 
  Transaction, 
  Contract, 
  GiftMovement, 
  GiftItem,
  BankWebhookLog,
  Proposal,
  ProposalThread,
  CostAdjustment
} from '../types';
import { SEED_DATA } from '../data/seedData';
import { KEY, TODAY, ROLES } from '../data/constants';
import { dmy, mon, monthLabel, fmt } from '../utils/formatters';
import { needsApproval } from '../services/financeService';
import { detectAttendanceAlerts } from '../services/payrollService';
import { gasService, isGasEnvironment } from '../services/gasService';

export interface ToastState {
  message: string;
  type?: 'info' | 'success' | 'warn' | 'error';
  visible: boolean;
}

interface AppContextType {
  state: AppState;
  ui: UIState;
  toast: ToastState;
  showToast: (msg: string, type?: ToastState['type']) => void;
  hideToast: () => void;
  setView: (view: ActiveTab, filter?: any) => void;
  setRole: (role: Role) => void;
  setMonth: (month: string) => void;
  setLedgerFilter: (filter: UIState['ledgerFilter']) => void;
  setDebtKind: (kind: 'KH' | 'TV') => void;
  setDebtOnlyOver: (onlyOver: boolean) => void;
  setEditTx: (txId: string | null) => void;
  canDo: (action: string) => boolean;
  addTransaction: (data: {
    date: string;
    acc: string;
    type: Transaction['type'];
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function seedInitialGifts(txList: Transaction[]): { items: GiftItem[]; mv: GiftMovement[] } {
  const findId = (d: string) => (txList.find((t) => t.desc.trim().toLowerCase() === d) || {}).id || '';
  const items: GiftItem[] = [
    { id: 'Q01', name: 'Hộp bánh trung thu', unit: 'hộp', price: 271675 },
    { id: 'Q02', name: 'Quà bốc thăm hội thảo', unit: 'phần', price: 666364 },
    { id: 'Q03', name: 'Ấn phẩm, brochure', unit: 'cuốn', price: 14850 },
    { id: 'Q04', name: 'Tờ rơi thẻ', unit: 'tờ', price: 3208 },
    { id: 'Q05', name: 'Hashtag cầm tay', unit: 'cái', price: 76667 },
    { id: 'Q06', name: 'Túi đựng quà', unit: 'cái', price: 5350 }
  ];
  const mv: GiftMovement[] = [
    { d: '2026-09-02', item: 'Q01', qty: 40, kind: 'in', who: 'Mua lô bánh trung thu', tx: findId('bánh trung thu'), ex: true },
    { d: '2026-09-11', item: 'Q03', qty: 300, kind: 'in', who: 'In ấn phẩm', tx: findId('ấn phẩm'), ex: true },
    { d: '2026-09-16', item: 'Q04', qty: 120, kind: 'in', who: 'In 120 tờ rơi thẻ', tx: findId('in 120 tờ rơi thẻ'), ex: false },
    { d: '2026-09-18', item: 'Q05', qty: 3, kind: 'in', who: 'Mua hashtag', tx: findId('hastag'), ex: false },
    { d: '2026-09-18', item: 'Q06', qty: 20, kind: 'in', who: 'Mua túi đựng quà', tx: findId('túi đựng quà'), ex: true },
    { d: '2026-09-19', item: 'Q02', qty: 11, kind: 'in', who: 'Quà bốc thăm HT 19/9 (cọc 30% + phần còn lại)', tx: findId('quà ht 19/9'), ex: false },
    { d: '2026-09-08', item: 'Q01', qty: 12, kind: 'out', to: 'TV', who: 'Nguyễn Hữu Thạch', note: 'Tặng khách dịp trung thu', ex: true },
    { d: '2026-09-08', item: 'Q01', qty: 8, kind: 'out', to: 'TV', who: 'Thái Thị Thanh Thảo', note: 'Tặng khách dịp trung thu', ex: true },
    { d: '2026-09-12', item: 'Q01', qty: 10, kind: 'out', to: 'SK', who: 'Workshop trung thu', note: '', ex: true },
    { d: '2026-09-19', item: 'Q02', qty: 11, kind: 'out', to: 'SK', who: 'Hội thảo 19/9', note: 'Bốc thăm 33 khách đăng ký', ex: false },
    { d: '2026-09-19', item: 'Q03', qty: 120, kind: 'out', to: 'SK', who: 'Hội thảo 19/9', note: '', ex: true },
    { d: '2026-09-19', item: 'Q04', qty: 80, kind: 'out', to: 'SK', who: 'Hội thảo 19/9', note: '', ex: true },
    { d: '2026-09-25', item: 'Q06', qty: 6, kind: 'out', to: 'KH', who: 'Khách Cường', note: 'Gói quà tặng', ex: true }
  ];
  return { items, mv };
}

function seedInitialWebhooks(): BankWebhookLog[] {
  return [
    {
      id: 'WH-001',
      bankTxId: 'ACB-847291823',
      date: '2026-10-15',
      acc: 'ACB',
      dir: 'in',
      amount: 15000000,
      description: 'NGUYEN VAN CUONG THANH TOAN HOP DONG KH012',
      status: 'unmatched'
    },
    {
      id: 'WH-002',
      bankTxId: 'ACB-847291889',
      date: '2026-10-16',
      acc: 'ACB',
      dir: 'in',
      amount: 25000000,
      description: 'DFAM CAP VON KINH DOANH THANG 10 HOI THAO',
      status: 'auto_matched',
      matchedTxId: 'T202610-001'
    },
    {
      id: 'WH-003',
      bankTxId: 'ACB-847292100',
      date: '2026-10-16',
      acc: 'ACB',
      dir: 'out',
      amount: 4500000,
      description: 'THANH TOAN TIEN THUE VAN PHONG THANG 10',
      status: 'unmatched'
    }
  ];
}

function seedInitialProposals(): Proposal[] {
  return [
    {
      id: 'PROP-01',
      code: 'KH-2026-10-01',
      title: 'Kế hoạch Tổ chức Hội thảo Khách hàng & Ra mắt Gói Bảo hiểm VIP Tháng 10',
      creator: 'Nguyễn Thị Thảo',
      creatorEmail: 'thao.nguyen@vpmfinance.vn',
      department: 'Kinh doanh & Phát triển Khách hàng',
      amount: 12500000,
      date: '2026-10-14',
      description: 'Tổ chức workshop chuyên đề "Bảo hiểm Có Giàu - Tích lũy & Thịnh vượng", dự kiến thu hút 35 khách hàng tiềm năng tại Khách sạn Mường Thanh.',
      status: 'pending_master',
      resendSentAt: '2026-10-14 09:30',
      ccEmails: ['thao.nguyen@vpmfinance.vn', 'ketoan@vpmfinance.vn'],
      threads: [
        {
          id: 'TH-01',
          sender: 'Nguyễn Thị Thảo (Operator)',
          role: 'operator',
          content: 'Em đã gửi hồ sơ dự toán chi tiết kèm danh sách khách mời qua email. Kính nhờ Sếp và Kế toán trưởng xem xét phê duyệt ngân sách.',
          createdAt: '2026-10-14 09:30'
        },
        {
          id: 'TH-02',
          sender: 'VPM (Supervisor)',
          role: 'admin',
          content: 'Kế toán đã rà soát chứng từ báo giá địa điểm (8.5tr) và quà tặng bốc thăm (4tr). Đã đủ định mức Opex tháng 10. Chuyển tiếp lên Sếp Mavryk phê duyệt.',
          createdAt: '2026-10-14 14:15'
        },
        {
          id: 'TH-03',
          sender: 'Sếp Mavryk (Master)',
          role: 'master',
          content: 'Kế hoạch tốt. Tuy nhiên cần yêu cầu khách sạn cam kết màn hình LED và tea-break đạt chuẩn. Thảo liên hệ chốt lại rồi anh duyệt chuyển khoản đợt 1.',
          createdAt: '2026-10-14 16:45',
          isInboundReply: true
        }
      ]
    },
    {
      id: 'PROP-02',
      code: 'KH-2026-10-02',
      title: 'Đề xuất In ấn bổ sung Bộ Sales Kit & Quà tặng Tri ân Tư vấn viên',
      creator: 'Trần Văn Nam',
      creatorEmail: 'nam.tran@vpmfinance.vn',
      department: 'Văn phòng & Vận hành',
      amount: 5800000,
      date: '2026-10-12',
      description: 'In ấn 200 cuốn brochure mới, 50 áo đồng phục thương hiệu và 30 túi quà tặng cho đợt tuyển dụng TV mới.',
      status: 'approved',
      resendSentAt: '2026-10-12 10:00',
      ccEmails: ['nam.tran@vpmfinance.vn'],
      threads: [
        {
          id: 'TH-04',
          sender: 'Trần Văn Nam',
          role: 'operator',
          content: 'Đã hoàn tất báo giá nhà in rẻ hơn 10% so với quý trước. Kính đệ trình Sếp.',
          createdAt: '2026-10-12 10:00'
        },
        {
          id: 'TH-05',
          sender: 'Sếp Mavryk (Master)',
          role: 'master',
          content: 'Đồng ý phê duyệt. Kế toán chi tạm ứng theo hợp đồng in ấn.',
          createdAt: '2026-10-12 11:30'
        }
      ]
    }
  ];
}

function seedInitialCostAdjustments(): CostAdjustment[] {
  return [
    {
      id: 'ADJ-01',
      month: '2026-10',
      category: 'SUKIEN',
      oldBudget: 3000000,
      newBudget: 8000000,
      reason: 'Bổ sung ngân sách cho Hội thảo VIP và Workshop trung thu',
      approvedBy: 'Sếp Mavryk',
      status: 'approved',
      createdAt: '2026-10-10'
    }
  ];
}

function loadInitialState(): AppState {
  let saved: any = null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) saved = JSON.parse(raw);
  } catch (e) {
    saved = null;
  }

  const base: AppState = JSON.parse(JSON.stringify(SEED_DATA));
  base.gifts = seedInitialGifts(base.tx);
  base.budget = { '2026-08': { LUONG: 33228000, SUKIEN: 3000000 }, '2026-09': {}, '2026-10': {} };
  base.locks = {};
  base.close = {};
  base.log = [];
  base.webhooks = seedInitialWebhooks();
  base.proposals = seedInitialProposals();
  base.costAdjustments = seedInitialCostAdjustments();

  if (saved && saved.v === 1 && saved.state) {
    const merged = Object.assign(base, saved.state);
    if (!merged.webhooks || merged.webhooks.length === 0) merged.webhooks = seedInitialWebhooks();
    if (!merged.proposals || merged.proposals.length === 0) merged.proposals = seedInitialProposals();
    if (!merged.costAdjustments || merged.costAdjustments.length === 0) merged.costAdjustments = seedInitialCostAdjustments();
    return merged;
  }
  return base;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(loadInitialState);
  const [ui, setUi] = useState<UIState>(() => {
    const defaultUi: UIState = {
      view: 'overview',
      role: 'operator',
      month: '2026-10',
      sel: null,
      ledgerFilter: 'all',
      debtKind: 'KH',
      debtOnlyOver: false,
      editTx: null
    };
    try {
      const saved = localStorage.getItem(KEY + '-ui');
      if (saved) {
        return Object.assign(defaultUi, JSON.parse(saved), { sel: null, editTx: null });
      }
    } catch (e) {}
    return defaultUi;
  });

  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    visible: false
  });

  const showToast = useCallback((message: string, type: ToastState['type'] = 'info') => {
    setToast({ message, type, visible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    if (!toast.visible) return;
    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2800);
    return () => clearTimeout(timer);
  }, [toast.visible]);

  // Load data from Google Apps Script if running inside GAS Web App
  useEffect(() => {
    if (isGasEnvironment()) {
      gasService.fetchInitialData().then((gasData) => {
        if (gasData && gasData.tx && gasData.tx.length > 0) {
          setState((prev) => ({
            ...prev,
            ...gasData
          }));
          showToast('Đã đồng bộ dữ liệu mới nhất từ Google Sheets', 'success');
        }
      });
    }
  }, [showToast]);

  // Persist State to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          v: 1,
          state: {
            tx: state.tx,
            contracts: state.contracts,
            gifts: state.gifts,
            budget: state.budget,
            costAdjustments: state.costAdjustments,
            webhooks: state.webhooks,
            proposals: state.proposals,
            locks: state.locks,
            close: state.close,
            att: state.att,
            staff: state.staff,
            log: state.log
          }
        })
      );
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }, [state]);

  // Persist UI to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        KEY + '-ui',
        JSON.stringify({
          view: ui.view,
          role: ui.role,
          month: ui.month
        })
      );
    } catch (e) {}
  }, [ui.view, ui.role, ui.month]);

  const addLog = useCallback(
    (what: string) => {
      const d = new Date();
      const timeStr = dmy(TODAY) + ' ' + d.toTimeString().slice(0, 5);
      setState((prev) => ({
        ...prev,
        log: [...prev.log, { at: timeStr, role: ui.role, what }]
      }));
    },
    [ui.role]
  );

  const canDo = useCallback(
    (action: string): boolean => {
      const r = ui.role;
      const isOperator = r === 'operator' || r === 'tien';
      const isAdmin = r === 'admin' || r === 'vpm';
      const isMaster = r === 'master' || r === 'giau';

      const permissions: Record<string, boolean> = {
        add: isOperator || isAdmin,
        draft: isOperator,
        check: isAdmin,
        forward: isAdmin,
        return: isAdmin,
        approve: isMaster,
        post: isMaster,
        lock: isAdmin,
        edit: isAdmin,
        att: isOperator || isAdmin,
        gift: isOperator || isAdmin,
        contract: isOperator || isAdmin,
        budget: isMaster || isAdmin,
        submit_proposal: isOperator || isAdmin || isMaster,
        review_proposal: isAdmin || isMaster,
        match_webhook: isAdmin || isMaster
      };
      return !!permissions[action];
    },
    [ui.role]
  );

  const setView = useCallback((view: ActiveTab, filter?: any) => {
    setUi((prev) => ({
      ...prev,
      view,
      ledgerFilter: filter || 'all',
      editTx: null
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const setRole = useCallback(
    (role: Role) => {
      setUi((prev) => ({ ...prev, role, editTx: null }));
      showToast('Đang làm việc với vai trò ' + ROLES[role]);
    },
    [showToast]
  );

  const setMonth = useCallback((month: string) => {
    setUi((prev) => ({ ...prev, month, editTx: null }));
  }, []);

  const setLedgerFilter = useCallback((ledgerFilter: UIState['ledgerFilter']) => {
    setUi((prev) => ({ ...prev, ledgerFilter }));
  }, []);

  const setDebtKind = useCallback((debtKind: 'KH' | 'TV') => {
    setUi((prev) => ({ ...prev, debtKind }));
  }, []);

  const setDebtOnlyOver = useCallback((debtOnlyOver: boolean) => {
    setUi((prev) => ({ ...prev, debtOnlyOver }));
  }, []);

  const setEditTx = useCallback((editTx: string | null) => {
    setUi((prev) => ({ ...prev, editTx }));
    if (editTx) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const addTransaction = useCallback(
    (data: {
      date: string;
      acc: string;
      type: Transaction['type'];
      amt: number;
      cat?: string;
      contract?: string;
      desc: string;
      docFile?: File | null;
    }) => {
      const isLockedMonth = !!state.locks[mon(data.date)];
      if (isLockedMonth) {
        showToast(monthLabel(mon(data.date)) + ' đã khóa sổ', 'error');
        return;
      }

      const nextId = 'N' + String(state.tx.length + 1).padStart(4, '0');
      const isOut = ['OPEX', 'UNG_PHI', 'HOAN_UNG', 'CHUYEN_DFAM', 'TAM_UNG'].includes(data.type);
      
      let initStatus: Transaction['status'] = 'draft';
      if (ui.role === 'admin' || ui.role === 'vpm') {
        initStatus = 'pending_master';
      } else if (ui.role === 'master' || ui.role === 'giau') {
        initStatus = 'posted';
      } else {
        initStatus = 'pending_admin';
      }

      const newTx: Transaction = {
        id: nextId,
        date: data.date,
        acc: data.acc,
        dir: isOut ? 'out' : 'in',
        amt: Math.round(data.amt),
        desc: data.desc.trim(),
        type: data.type,
        cat: data.type === 'OPEX' ? data.cat : '',
        contract: data.contract || '',
        flags: [],
        status: initStatus,
        doc: data.docFile ? data.docFile.name : '',
        src: 'Nhập bởi ' + ROLES[ui.role]
      };

      setState((prev) => {
        const list = [...prev.tx, newTx];
        list.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
        return { ...prev, tx: list };
      });

      gasService.addTransaction(newTx);
      addLog(`Ghi ${newTx.id} · ${newTx.desc} · ${fmt(newTx.amt)} đ`);
      setUi((prev) => ({ ...prev, month: mon(data.date) }));

      if (newTx.status === 'pending_admin' || newTx.status === 'draft') {
        showToast('Đã ghi chứng từ, chuyển Admin xem xét đối chiếu Webhook', 'info');
      } else if (newTx.status === 'pending_master') {
        showToast('Đã ghi chứng từ, chuyển Sếp Mavryk duyệt', 'warn');
      } else {
        showToast('Đã ghi nhận chính thức vào Sổ Cái', 'success');
      }
    },
    [state.locks, state.tx.length, ui.role, addLog, showToast]
  );

  const updateTransaction = useCallback(
    (id: string, updates: Partial<Transaction>) => {
      setState((prev) => {
        const list = prev.tx.map((t) => (t.id === id ? { ...t, ...updates } : t));
        list.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
        return { ...prev, tx: list };
      });
      gasService.updateTransaction(id, updates);
      addLog(`Cập nhật giao dịch ${id}`);
      showToast('Đã lưu phân loại giao dịch', 'success');
    },
    [addLog, showToast]
  );

  const checkTransaction = useCallback(
    (id: string) => {
      const tx = state.tx.find((t) => t.id === id);
      if (!tx) return;
      setState((prev) => ({
        ...prev,
        tx: prev.tx.map((t) => (t.id === id ? { ...t, status: 'pending_master' } : t))
      }));
      gasService.updateTransaction(id, { status: 'pending_master' });
      addLog(`Admin sơ duyệt ${tx.id} · ${tx.desc}`);
      showToast('Đã sơ duyệt, chuyển tiếp Master phê duyệt', 'success');
    },
    [state.tx, addLog, showToast]
  );

  const forwardTransaction = useCallback(
    (id: string) => {
      const tx = state.tx.find((t) => t.id === id);
      if (!tx) return;
      setState((prev) => ({
        ...prev,
        tx: prev.tx.map((t) => (t.id === id ? { ...t, status: 'pending_master' } : t))
      }));
      gasService.updateTransaction(id, { status: 'pending_master' });
      addLog(`Admin chuyển tiếp ${tx.id} lên Master`);
      showToast('Đã chuyển tiếp lên Master phê duyệt', 'success');
    },
    [state.tx, addLog, showToast]
  );

  const postTransaction = useCallback(
    (id: string) => {
      const tx = state.tx.find((t) => t.id === id);
      if (!tx) return;
      setState((prev) => ({
        ...prev,
        tx: prev.tx.map((t) => (t.id === id ? { ...t, status: 'posted' } : t))
      }));
      gasService.updateTransaction(id, { status: 'posted' });
      addLog(`Master phê duyệt cuối cùng đưa vào Sổ Cái: ${tx.id}`);
      showToast('👑 Đã ghi nhận chính thức vào Sổ Cái (Posted)', 'success');
    },
    [state.tx, addLog, showToast]
  );

  const returnTransaction = useCallback(
    (id: string, reason?: string) => {
      const tx = state.tx.find((t) => t.id === id);
      if (!tx) return;
      const noteMsg = reason || 'Admin yêu cầu bổ sung chứng từ';
      setState((prev) => ({
        ...prev,
        tx: prev.tx.map((t) => (t.id === id ? { ...t, status: 'returned', note: noteMsg } : t))
      }));
      gasService.updateTransaction(id, { status: 'returned', note: noteMsg });
      addLog(`Trả lại ${tx.id}: ${noteMsg}`);
      showToast('Đã trả lại cho nhân viên nhập liệu', 'warn');
    },
    [state.tx, addLog, showToast]
  );

  const rejectTransaction = useCallback(
    (id: string, reason?: string) => {
      const tx = state.tx.find((t) => t.id === id);
      if (!tx) return;
      const noteMsg = reason || 'Từ chối giao dịch';
      setState((prev) => ({
        ...prev,
        tx: prev.tx.map((t) => (t.id === id ? { ...t, status: 'rejected', note: noteMsg } : t))
      }));
      gasService.updateTransaction(id, { status: 'rejected', note: noteMsg });
      addLog(`Từ chối giao dịch ${tx.id}: ${noteMsg}`);
      showToast('Đã từ chối giao dịch', 'error');
    },
    [state.tx, addLog, showToast]
  );

  const approveTransaction = useCallback(
    (id: string) => {
      const tx = state.tx.find((t) => t.id === id);
      if (!tx) return;
      setState((prev) => ({
        ...prev,
        tx: prev.tx.map((t) => (t.id === id ? { ...t, status: 'posted' } : t))
      }));
      gasService.updateTransaction(id, { status: 'posted' });
      addLog(`Duyệt chốt sổ ${tx.id} · ${fmt(tx.amt)} đ`);
      showToast('👑 Đã phê duyệt chốt vào Sổ Cái (Posted)', 'success');
    },
    [state.tx, addLog, showToast]
  );

  const simulateWebhook = useCallback(
    (options?: { dir?: 'in' | 'out'; amount?: number; desc?: string; acc?: string }) => {
      const dir = options?.dir || (Math.random() > 0.35 ? 'in' : 'out');
      const amount = options?.amount || [5000000, 10000000, 15000000, 20000000, 25000000, 35000000][Math.floor(Math.random() * 6)];
      const sampleDescsIn = [
        'KHACH HANG NGUYEN VAN CUONG THANH TOAN HD KH012',
        'TU VAN VIEN THAO TRA NO TAM UNG HOP DONG TV03',
        'DFAM CAP VON KINH DOANH THANG 10 HOI THAO',
        'CHI TRA HOA HONG KINH DOANH THANG 9'
      ];
      const sampleDescsOut = [
        'THANH TOAN TIEN THUE MAT BANG VAN PHONG',
        'CHI PHI IN AN BROCHURE AN PHAM HOI THAO',
        'MUA QUA TANG BOC THAM KHACH HANG VIP'
      ];
      const desc = options?.desc || (dir === 'in' ? sampleDescsIn[Math.floor(Math.random() * sampleDescsIn.length)] : sampleDescsOut[Math.floor(Math.random() * sampleDescsOut.length)]);
      const bankTxId = 'ACB-' + Math.floor(100000000 + Math.random() * 900000000);
      const newWebhookId = 'WH-' + String(state.webhooks.length + 1).padStart(3, '0');

      // Check auto-match with existing pending / draft tx
      const matchTx = state.tx.find(
        (t) => t.amt === amount && t.dir === dir && ['draft', 'pending_admin', 'pending'].includes(t.status)
      );

      const newLog: BankWebhookLog = {
        id: newWebhookId,
        bankTxId,
        date: TODAY,
        acc: 'ACB',
        dir,
        amount,
        description: desc,
        status: matchTx ? 'auto_matched' : 'unmatched',
        matchedTxId: matchTx ? matchTx.id : undefined
      };

      setState((prev) => {
        let updatedTx = prev.tx;
        if (matchTx) {
          updatedTx = prev.tx.map((t) =>
            t.id === matchTx.id
              ? {
                  ...t,
                  status: 'pending_master',
                  doc: (t.doc ? t.doc + ', ' : '') + `Biên lai ${bankTxId}`
                }
              : t
          );
        }
        return {
          ...prev,
          webhooks: [newLog, ...prev.webhooks],
          tx: updatedTx
        };
      });

      addLog(`Nhận Webhook ACB ${bankTxId} (${dir === 'in' ? '+' : '-'}${fmt(amount)} đ)`);
      if (matchTx) {
        showToast(`⚡ Webhook Auto-Matched: Khớp tự động chứng từ ${matchTx.id} (${fmt(amount)} đ)!`, 'success');
      } else {
        showToast(`⚡ Nhận biến động ACB: ${dir === 'in' ? '+' : '-'}${fmt(amount)} đ (${bankTxId})`, 'info');
      }
    },
    [state.webhooks.length, state.tx, addLog, showToast]
  );

  const matchWebhook = useCallback(
    (webhookId: string, txId: string) => {
      const wh = state.webhooks.find((w) => w.id === webhookId);
      const tx = state.tx.find((t) => t.id === txId);
      if (!wh || !tx) return;

      setState((prev) => ({
        ...prev,
        webhooks: prev.webhooks.map((w) =>
          w.id === webhookId ? { ...w, status: 'matched', matchedTxId: txId } : w
        ),
        tx: prev.tx.map((t) =>
          t.id === txId
            ? {
                ...t,
                status: t.status === 'draft' ? 'pending_admin' : t.status,
                doc: (t.doc ? t.doc + ', ' : '') + `Biên lai ${wh.bankTxId}`
              }
            : t
        )
      }));

      addLog(`Khớp Webhook ${wh.bankTxId} với chứng từ ${tx.id}`);
      showToast(`Đã khớp biên lai ${wh.bankTxId} với chứng từ ${tx.id}`, 'success');
    },
    [state.webhooks, state.tx, addLog, showToast]
  );

  const submitProposal = useCallback(
    (data: {
      title: string;
      creator: string;
      creatorEmail: string;
      department: string;
      amount: number;
      date: string;
      description: string;
      ccEmails?: string[];
    }) => {
      const nextNum = state.proposals.length + 1;
      const code = `KH-2026-10-${String(nextNum).padStart(2, '0')}`;
      const newProp: Proposal = {
        id: `PROP-${String(nextNum).padStart(2, '0')}`,
        code,
        title: data.title.trim(),
        creator: data.creator.trim(),
        creatorEmail: data.creatorEmail.trim(),
        department: data.department.trim(),
        amount: Math.round(data.amount),
        date: data.date || TODAY,
        description: data.description.trim(),
        status: 'pending_admin',
        resendSentAt: TODAY + ' ' + new Date().toTimeString().slice(0, 5),
        ccEmails: data.ccEmails || [data.creatorEmail],
        threads: [
          {
            id: `TH-${Date.now()}`,
            sender: `${data.creator} (Operator)`,
            role: 'operator',
            content: `Khởi tạo kế hoạch đệ trình qua Resend. Tự động CC tới: ${data.creatorEmail}`,
            createdAt: TODAY + ' ' + new Date().toTimeString().slice(0, 5)
          }
        ]
      };

      setState((prev) => ({
        ...prev,
        proposals: [newProp, ...prev.proposals]
      }));

      addLog(`Lập kế hoạch đệ trình ${newProp.code} · ${fmt(newProp.amount)} đ`);
      showToast(`Đã đệ trình kế hoạch ${newProp.code} (Resend Email Outbound & CC nhân viên)`, 'success');
    },
    [state.proposals.length, addLog, showToast]
  );

  const reviewProposal = useCallback(
    (id: string, status: 'pending_master' | 'approved' | 'rejected', comment?: string) => {
      const prop = state.proposals.find((p) => p.id === id);
      if (!prop) return;

      const newThread: ProposalThread = {
        id: `TH-${Date.now()}`,
        sender: ROLES[ui.role],
        role: ui.role,
        content: comment || (status === 'approved' ? 'Phê duyệt kế hoạch.' : status === 'pending_master' ? 'Sơ duyệt chuyển lên Master.' : 'Từ chối kế hoạch.'),
        createdAt: TODAY + ' ' + new Date().toTimeString().slice(0, 5)
      };

      setState((prev) => ({
        ...prev,
        proposals: prev.proposals.map((p) =>
          p.id === id
            ? {
                ...p,
                status,
                threads: [...p.threads, newThread]
              }
            : p
        )
      }));

      addLog(`${ROLES[ui.role]} cập nhật trạng thái đề xuất ${prop.code} ➔ ${status}`);
      showToast(`Đã cập nhật đệ trình: ${status === 'approved' ? 'Phê duyệt' : status === 'pending_master' ? 'Chuyển Master' : 'Từ chối'}`, 'success');
    },
    [state.proposals, ui.role, addLog, showToast]
  );

  const addProposalThread = useCallback(
    (proposalId: string, content: string, isInboundReply?: boolean) => {
      if (!content.trim()) return;
      const newThread: ProposalThread = {
        id: `TH-${Date.now()}`,
        sender: ROLES[ui.role],
        role: ui.role,
        content: content.trim(),
        createdAt: TODAY + ' ' + new Date().toTimeString().slice(0, 5),
        isInboundReply
      };

      setState((prev) => ({
        ...prev,
        proposals: prev.proposals.map((p) =>
          p.id === proposalId
            ? { ...p, threads: [...p.threads, newThread] }
            : p
        )
      }));

      addLog(`Phản hồi trao đổi kế hoạch ${proposalId}`);
      showToast(isInboundReply ? 'Đã nhận nội dung giải trình qua Email (Inbound Threading)' : 'Đã đăng trao đổi', 'success');
    },
    [ui.role, addLog, showToast]
  );

  const addCostAdjustment = useCallback(
    (data: {
      month: string;
      category: string;
      oldBudget: number;
      newBudget: number;
      reason: string;
    }) => {
      const nextId = `ADJ-${String(state.costAdjustments.length + 1).padStart(2, '0')}`;
      const isMaster = ui.role === 'master' || ui.role === 'giau';
      const newAdj: CostAdjustment = {
        id: nextId,
        month: data.month,
        category: data.category,
        oldBudget: data.oldBudget,
        newBudget: data.newBudget,
        reason: data.reason.trim(),
        status: isMaster ? 'approved' : 'pending',
        approvedBy: isMaster ? 'Sếp Mavryk' : undefined,
        createdAt: TODAY
      };

      setState((prev) => {
        let updatedBudget = prev.budget;
        if (newAdj.status === 'approved') {
          const mBudget = { ...(prev.budget[data.month] || {}) };
          mBudget[data.category] = data.newBudget;
          updatedBudget = { ...prev.budget, [data.month]: mBudget };
        }
        return {
          ...prev,
          costAdjustments: [newAdj, ...prev.costAdjustments],
          budget: updatedBudget
        };
      });

      addLog(`Điều chỉnh chi phí định mức ${newAdj.category} tháng ${data.month}`);
      showToast(newAdj.status === 'approved' ? 'Đã phê duyệt điều chỉnh chi phí' : 'Đã gửi yêu cầu điều chỉnh cost', 'success');
    },
    [state.costAdjustments.length, ui.role, addLog, showToast]
  );

  const approveCostAdjustment = useCallback(
    (id: string) => {
      const adj = state.costAdjustments.find((a) => a.id === id);
      if (!adj) return;

      setState((prev) => {
        const mBudget = { ...(prev.budget[adj.month] || {}) };
        mBudget[adj.category] = adj.newBudget;

        return {
          ...prev,
          costAdjustments: prev.costAdjustments.map((a) =>
            a.id === id ? { ...a, status: 'approved', approvedBy: 'Sếp Mavryk' } : a
          ),
          budget: {
            ...prev.budget,
            [adj.month]: mBudget
          }
        };
      });

      addLog(`Master phê duyệt điều chỉnh cost ${adj.id}`);
      showToast('Đã phê duyệt điều chỉnh định mức cost', 'success');
    },
    [state.costAdjustments, addLog, showToast]
  );

  const addContract = useCallback(
    (data: Omit<Contract, 'id'>) => {
      const nextNum = state.contracts.filter((c) => c.kind === data.kind).length + 1;
      const nextId = data.kind + String(nextNum).padStart(2, '0');
      const newContract: Contract = {
        ...data,
        id: nextId
      };

      setState((prev) => ({
        ...prev,
        contracts: [...prev.contracts, newContract]
      }));

      gasService.addContract(newContract);
      addLog(`Thêm hợp đồng ${newContract.id} · ${newContract.customer}`);
      const rate = newContract.fee ? newContract.disc / newContract.fee : 0;
      if (rate > 0.3) {
        showToast('Đã thêm, chiết khấu chờ chị Giàu duyệt', 'warn');
      } else {
        showToast('Đã thêm hợp đồng', 'success');
      }
    },
    [state.contracts, addLog, showToast]
  );

  const approveDiscount = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        contracts: prev.contracts.map((c) => (c.id === id ? { ...c, discApproved: true } : c))
      }));
      gasService.addContract({ ...state.contracts.find((c) => c.id === id)!, discApproved: true });
      addLog(`Duyệt chiết khấu ${id}`);
      showToast('Đã duyệt chiết khấu', 'success');
    },
    [state.contracts, addLog, showToast]
  );

  const addGiftMovement = useCallback(
    (mv: Omit<GiftMovement, 'd'>) => {
      const newMv: GiftMovement = {
        ...mv,
        d: TODAY
      };

      setState((prev) => ({
        ...prev,
        gifts: {
          ...prev.gifts,
          mv: [...prev.gifts.mv, newMv]
        }
      }));

      gasService.addGiftMovement(newMv);

      const itemObj = state.gifts.items.find((i) => i.id === mv.item);
      const name = itemObj ? itemObj.name : mv.item;
      addLog(`${mv.kind === 'out' ? 'Xuất' : 'Nhập'} ${mv.qty} ${name}`);
      showToast(`Đã ghi phiếu ${mv.kind === 'out' ? 'xuất' : 'nhập'}`, 'success');
    },
    [state.gifts.items, addLog, showToast]
  );

  const cycleAttendance = useCallback(
    (staffId: string, dateIso: string) => {
      const staffMember = state.staff.find((s) => s.id === staffId);
      if (!staffMember) return;

      const cycle: (number | string | undefined)[] = [undefined, 1, 0.5, 'L', 'X', 2];

      setState((prev) => {
        const staffName = staffMember.name;
        const currentRecord = prev.att[staffName] || { days: {} };
        const currentVal = currentRecord.days[dateIso];
        const nextIdx = (cycle.indexOf(currentVal) + 1) % cycle.length;
        const nextVal = cycle[nextIdx];

        const updatedDays = { ...currentRecord.days };
        if (nextVal === undefined) {
          delete updatedDays[dateIso];
        } else {
          updatedDays[dateIso] = nextVal;
        }

        gasService.saveAttendance(staffMember.name, dateIso, nextVal ?? '');

        return {
          ...prev,
          att: {
            ...prev.att,
            [staffName]: { days: updatedDays }
          }
        };
      });
    },
    [state.staff]
  );

  const applyAttendanceSuggestions = useCallback(() => {
    const alerts = detectAttendanceAlerts(state.staff, state.att, state.attMonth, state.holidays);
    setState((prev) => {
      const newAtt = { ...prev.att };
      for (const a of alerts) {
        if (!newAtt[a.s]) newAtt[a.s] = { days: {} };
        newAtt[a.s].days[a.d] = prev.holidays.includes(a.d) ? 'L' : 2;
      }
      return { ...prev, att: newAtt };
    });
    addLog('Sửa chấm công ngày lễ, chủ nhật T9');
    showToast('Đã áp dụng đề xuất chấm công', 'success');
  }, [state.staff, state.att, state.attMonth, state.holidays, addLog, showToast]);

  const updateStaffAdvance = useCallback(
    (staffId: string, advance: number) => {
      setState((prev) => ({
        ...prev,
        staff: prev.staff.map((s) => (s.id === staffId ? { ...s, advance: Math.max(0, advance) } : s))
      }));
    },
    []
  );

  const updateBudget = useCallback(
    (month: string, category: string, amount: number) => {
      setState((prev) => {
        const monthBudget = { ...(prev.budget[month] || {}) };
        if (amount > 0) {
          monthBudget[category] = amount;
        } else {
          delete monthBudget[category];
        }
        return {
          ...prev,
          budget: {
            ...prev.budget,
            [month]: monthBudget
          }
        };
      });
      addLog(`Giao ngân sách ${monthLabel(month)}`);
      gasService.updateBudget(month, category, amount);
      showToast('Đã lưu ngân sách', 'success');
    },
    [addLog, showToast]
  );

  const updateClosing = useCallback((month: string, key: string, value: any) => {
    setState((prev) => {
      const monthClose = { ...(prev.close[month] || {}) };
      monthClose[key] = value;
      return {
        ...prev,
        close: {
          ...prev.close,
          [month]: monthClose
        }
      };
    });
  }, []);

  const lockMonth = useCallback(
    (month: string) => {
      setState((prev) => ({
        ...prev,
        locks: {
          ...prev.locks,
          [month]: TODAY
        }
      }));
      gasService.setMonthLock(month, true, ui.role);
      addLog(`Khóa sổ ${monthLabel(month)}`);
      showToast(`Đã khóa sổ ${monthLabel(month).toLowerCase()}`, 'success');
    },
    [ui.role, addLog, showToast]
  );

  const unlockMonth = useCallback(
    (month: string) => {
      setState((prev) => {
        const newLocks = { ...prev.locks };
        delete newLocks[month];
        return { ...prev, locks: newLocks };
      });
      gasService.setMonthLock(month, false, ui.role);
      addLog(`Mở khóa ${monthLabel(month)}`);
      showToast('Đã mở khóa', 'info');
    },
    [ui.role, addLog, showToast]
  );

  const resetData = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem(KEY + '-ui');
    } catch (e) {}
    const fresh = loadInitialState();
    setState(fresh);
    gasService.syncFullState(fresh);
    showToast('Đã khôi phục dữ liệu gốc từ 8 file khách', 'success');
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        state,
        ui,
        toast,
        showToast,
        hideToast,
        setView,
        setRole,
        setMonth,
        setLedgerFilter,
        setDebtKind,
        setDebtOnlyOver,
        setEditTx,
        canDo,
        addTransaction,
        updateTransaction,
        checkTransaction,
        returnTransaction,
        approveTransaction,
        forwardTransaction,
        postTransaction,
        rejectTransaction,
        simulateWebhook,
        matchWebhook,
        submitProposal,
        reviewProposal,
        addProposalThread,
        addCostAdjustment,
        approveCostAdjustment,
        addContract,
        approveDiscount,
        addGiftMovement,
        cycleAttendance,
        applyAttendanceSuggestions,
        updateStaffAdvance,
        updateBudget,
        updateClosing,
        lockMonth,
        unlockMonth,
        resetData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

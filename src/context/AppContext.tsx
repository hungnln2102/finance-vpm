import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  AppState, 
  UIState, 
  Role, 
  ActiveTab, 
  Transaction, 
  Contract, 
  GiftMovement, 
  GiftItem 
} from '../types';
import { SEED_DATA } from '../data/seedData';
import { KEY, TODAY, ROLES } from '../data/constants';
import { dmy, mon, monthLabel, fmt } from '../utils/formatters';
import { needsApproval } from '../services/financeService';
import { detectAttendanceAlerts } from '../services/payrollService';

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
  returnTransaction: (id: string) => void;
  approveTransaction: (id: string) => void;
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

  if (saved && saved.v === 1 && saved.state) {
    return Object.assign(base, saved.state);
  }
  return base;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(loadInitialState);
  const [ui, setUi] = useState<UIState>(() => {
    const defaultUi: UIState = {
      view: 'overview',
      role: 'tien',
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
      const permissions: Record<string, boolean> = {
        add: r === 'tien' || r === 'vpm',
        check: r === 'vpm',
        approve: r === 'giau',
        lock: r === 'vpm',
        edit: r === 'vpm',
        att: r === 'tien' || r === 'vpm',
        gift: r === 'tien' || r === 'vpm',
        contract: r === 'tien' || r === 'vpm',
        budget: r === 'giau' || r === 'vpm'
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
        status: ui.role === 'vpm' ? 'checked' : 'pending',
        doc: data.docFile ? data.docFile.name : '',
        src: 'Nhập bởi ' + ROLES[ui.role]
      };

      setState((prev) => {
        const list = [...prev.tx, newTx];
        list.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
        return { ...prev, tx: list };
      });

      addLog(`Ghi ${newTx.id} · ${newTx.desc} · ${fmt(newTx.amt)} đ`);
      setUi((prev) => ({ ...prev, month: mon(data.date) }));

      if (newTx.status === 'pending') {
        showToast('Đã ghi, chờ VPM kiểm tra', 'info');
      } else if (needsApproval(newTx)) {
        showToast('Đã ghi, chờ chị Giàu duyệt', 'warn');
      } else {
        showToast('Đã ghi vào sổ', 'success');
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
        tx: prev.tx.map((t) => (t.id === id ? { ...t, status: 'checked' } : t))
      }));
      addLog(`Kiểm tra ${tx.id} · ${tx.desc}`);
      showToast(needsApproval(tx) ? 'Đã kiểm, chuyển chị Giàu duyệt' : 'Đã kiểm, giao dịch hoàn tất', 'success');
    },
    [state.tx, addLog, showToast]
  );

  const returnTransaction = useCallback(
    (id: string) => {
      const tx = state.tx.find((t) => t.id === id);
      if (!tx) return;
      setState((prev) => ({
        ...prev,
        tx: prev.tx.map((t) => (t.id === id ? { ...t, status: 'returned', note: 'VPM yêu cầu bổ sung chứng từ' } : t))
      }));
      addLog(`Trả lại ${tx.id}`);
      showToast('Đã trả lại cho Tiên', 'warn');
    },
    [state.tx, addLog, showToast]
  );

  const approveTransaction = useCallback(
    (id: string) => {
      const tx = state.tx.find((t) => t.id === id);
      if (!tx) return;
      setState((prev) => ({
        ...prev,
        tx: prev.tx.map((t) => (t.id === id ? { ...t, status: 'approved' } : t))
      }));
      addLog(`Duyệt chi ${tx.id} · ${fmt(tx.amt)} đ`);
      showToast('Đã duyệt chi', 'success');
    },
    [state.tx, addLog, showToast]
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
      addLog(`Duyệt chiết khấu ${id}`);
      showToast('Đã duyệt chiết khấu', 'success');
    },
    [addLog, showToast]
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
      addLog(`Khóa sổ ${monthLabel(month)}`);
      showToast(`Đã khóa sổ ${monthLabel(month).toLowerCase()}`, 'success');
    },
    [addLog, showToast]
  );

  const unlockMonth = useCallback(
    (month: string) => {
      setState((prev) => {
        const newLocks = { ...prev.locks };
        delete newLocks[month];
        return { ...prev, locks: newLocks };
      });
      addLog(`Mở khóa ${monthLabel(month)}`);
      showToast('Đã mở khóa', 'info');
    },
    [addLog, showToast]
  );

  const resetData = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem(KEY + '-ui');
    } catch (e) {}
    const fresh = loadInitialState();
    setState(fresh);
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

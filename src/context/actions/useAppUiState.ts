import { useState, useCallback, useEffect, useRef } from 'react';
import { UIState, Role, ActiveTab } from '../../types';
import { KEY, TODAY, ROLES } from '../../data/constants';
import { mon } from '../../utils/formatters';

export interface ToastState {
  id: number;
  message: string;
  type?: 'info' | 'success' | 'warn' | 'error' | 'loading';
  visible: boolean;
  duration: number;
}

export function useAppUiState() {
  const currentRealMonth = mon(TODAY);

  const [ui, setUi] = useState<UIState>(() => {
    const defaultUi: UIState = {
      view: 'overview',
      role: 'operator',
      month: currentRealMonth,
      sel: null,
      ledgerFilter: 'all',
      debtKind: 'KH',
      debtOnlyOver: false,
      editTx: null
    };
    try {
      const saved = localStorage.getItem(KEY + '-ui');
      if (saved) {
        const parsed = JSON.parse(saved);
        const m = parsed.month && parsed.month >= currentRealMonth ? parsed.month : currentRealMonth;
        return Object.assign(defaultUi, parsed, { month: m, sel: null, editTx: null });
      }
    } catch (e) {}
    return defaultUi;
  });

  const [toast, setToast] = useState<ToastState>({
    id: 0,
    message: '',
    type: 'info',
    visible: false,
    duration: 3800
  });

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const showToast = useCallback((message: string, type: ToastState['type'] = 'info', duration?: number) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }

    const isProcessing = type === 'loading' || (type === 'info' && message.trim().toLowerCase().startsWith('đang '));
    const effectiveDuration =
      duration !== undefined
        ? duration
        : type === 'error'
        ? 5500
        : isProcessing
        ? 12000
        : 3800;

    setToast({
      id: Date.now() + Math.random(),
      message,
      type: isProcessing && type === 'info' ? 'loading' : type,
      visible: true,
      duration: effectiveDuration
    });

    if (effectiveDuration > 0) {
      toastTimerRef.current = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
        toastTimerRef.current = null;
      }, effectiveDuration);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

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

  const setDateRange = useCallback((dateFrom?: string, dateTo?: string) => {
    setUi((prev) => ({ ...prev, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }));
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

  return {
    ui,
    setUi,
    toast,
    showToast,
    hideToast,
    canDo,
    setView,
    setRole,
    setMonth,
    setDateRange,
    setLedgerFilter,
    setDebtKind,
    setDebtOnlyOver,
    setEditTx
  };
}

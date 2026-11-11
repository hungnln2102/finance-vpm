import { useCallback } from 'react';
import { AppState, UIState, GiftMovement } from '../../types';
import { KEY, TODAY } from '../../data/constants';
import { monthLabel } from '../../utils/formatters';
import { detectAttendanceAlerts } from '../../services/payrollService';
import { apiClient } from '../../services/apiClient';
import { loadInitialState } from '../initialState';
import { ToastState } from './useAppUiState';

interface UseOperationsActionsProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  ui: UIState;
  addLog: (what: string) => void;
  showToast: (message: string, type?: ToastState['type']) => void;
}

export function useOperationsActions({
  state,
  setState,
  ui,
  addLog,
  showToast
}: UseOperationsActionsProps) {
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

      apiClient.addGiftMovement(newMv);
      const itemObj = state.gifts.items.find((i) => i.id === mv.item);
      const name = itemObj ? itemObj.name : mv.item;
      addLog(`${mv.kind === 'out' ? 'Xuất' : 'Nhập'} ${mv.qty} ${name}`);
      showToast(`Đã ghi phiếu ${mv.kind === 'out' ? 'xuất' : 'nhập'}`, 'success');
    },
    [state.gifts.items, addLog, showToast, setState]
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

        apiClient.saveAttendance(staffId, dateIso, nextVal ?? '');

        return {
          ...prev,
          att: {
            ...prev.att,
            [staffName]: { days: updatedDays }
          }
        };
      });
    },
    [state.staff, setState]
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
  }, [state.staff, state.att, state.attMonth, state.holidays, addLog, showToast, setState]);

  const updateStaffAdvance = useCallback(
    (staffId: string, advance: number) => {
      setState((prev) => ({
        ...prev,
        staff: prev.staff.map((s) => (s.id === staffId ? { ...s, advance: Math.max(0, advance) } : s))
      }));
    },
    [setState]
  );

  const updateClosing = useCallback(
    (month: string, key: string, value: any) => {
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
    },
    [setState]
  );

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
    [addLog, showToast, setState]
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
    [addLog, showToast, setState]
  );

  const resetData = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem(KEY + '-ui');
    } catch (e) {}
    const fresh = loadInitialState();
    setState(fresh);
    showToast('Đã khôi phục dữ liệu gốc từ 8 file khách', 'success');
  }, [showToast, setState]);

  const refreshFromDatabase = useCallback(async () => {
    try {
      const [dbData, accountsData] = await Promise.all([apiClient.getState(), apiClient.getAccounts()]);
      if (dbData) {
        setState((prev) => ({
          ...prev,
          ...dbData,
          tx: Array.isArray(dbData.tx) ? dbData.tx : prev.tx,
          contracts: Array.isArray(dbData.contracts) && dbData.contracts.length > 0 ? dbData.contracts : prev.contracts,
          proposals: Array.isArray(dbData.proposals) && dbData.proposals.length > 0 ? dbData.proposals : prev.proposals,
          costAdjustments: Array.isArray(dbData.costAdjustments) && dbData.costAdjustments.length > 0 ? dbData.costAdjustments : prev.costAdjustments,
          staff: prev.staff,
          accounts: Array.isArray(accountsData) && accountsData.length > 0 ? accountsData : (dbData.accounts || prev.accounts)
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [setState]);

  return {
    addGiftMovement,
    cycleAttendance,
    applyAttendanceSuggestions,
    updateStaffAdvance,
    updateClosing,
    lockMonth,
    unlockMonth,
    resetData,
    refreshFromDatabase
  };
}

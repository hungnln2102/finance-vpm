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
  const addGiftItem = useCallback(
    async (payload: {
      id: string;
      name: string;
      unit: string;
      price: number;
      initialQty?: number;
      who?: string;
      note?: string;
    }): Promise<boolean> => {
      const res = await apiClient.addGiftItem(payload);
      if (!res.success || !res.data?.item) {
        showToast(res.error || 'Lỗi khi lưu sản phẩm mới vào PostgreSQL', 'error');
        return false;
      }

      const { item: savedItem, initialMovement } = res.data;
      setState((prev) => ({
        ...prev,
        gifts: {
          items: [...prev.gifts.items, savedItem],
          mv: initialMovement ? [...prev.gifts.mv, initialMovement] : prev.gifts.mv
        }
      }));

      addLog(`Tạo sản phẩm mới ${savedItem.id} · ${savedItem.name}`);
      showToast(`Đã lưu sản phẩm ${savedItem.id} · ${savedItem.name} vào cơ sở dữ liệu`, 'success');
      return true;
    },
    [addLog, showToast, setState]
  );

  const addGiftMovement = useCallback(
    async (mv: Omit<GiftMovement, 'd'>): Promise<boolean> => {
      const newMv: GiftMovement = {
        ...mv,
        d: TODAY
      };

      const res = await apiClient.addGiftMovement(newMv);
      if (!res.success || !res.data) {
        showToast(res.error || 'Lỗi khi lưu phiếu kho vào PostgreSQL', 'error');
        return false;
      }

      const savedMv = res.data;
      setState((prev) => ({
        ...prev,
        gifts: {
          ...prev.gifts,
          mv: [...prev.gifts.mv, savedMv]
        }
      }));

      const itemObj = state.gifts.items.find((i) => i.id === savedMv.item);
      const name = itemObj ? itemObj.name : savedMv.item;
      addLog(`${savedMv.kind === 'out' ? 'Xuất' : 'Nhập'} ${savedMv.qty} ${name}`);
      showToast(`Đã ghi phiếu ${savedMv.kind === 'out' ? 'xuất' : 'nhập'} vào cơ sở dữ liệu`, 'success');
      return true;
    },
    [state.gifts.items, addLog, showToast, setState]
  );

  const cycleAttendance = useCallback(
    async (staffId: string, dateIso: string) => {
      const staffMember = state.staff.find((s) => s.id === staffId);
      if (!staffMember) return;

      const cycle: (number | string | undefined)[] = [undefined, 1, 0.5, 'L', 'X', 2];
      const currentRecord = state.att[staffId] || { days: {} };
      const currentVal = currentRecord.days[dateIso];
      const nextIdx = (cycle.indexOf(currentVal) + 1) % cycle.length;
      const nextVal = cycle[nextIdx];
      const saved = await apiClient.saveAttendance(staffId, dateIso, nextVal ?? '', staffMember.name);
      if (!saved) {
        showToast('Không thể lưu chấm công. Vui lòng thử lại.', 'error');
        return;
      }

      setState((prev) => {
        const currentRecord = prev.att[staffId] || { days: {} };

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
            [staffId]: { days: updatedDays }
          }
        };
      });
    },
    [state.staff, state.att, setState, showToast]
  );

  const applyAttendanceSuggestions = useCallback(async () => {
    const alerts = detectAttendanceAlerts(state.staff, state.att, state.attMonth, state.holidays);
    const updates = alerts.map((alert) => ({
      staffId: alert.staffId,
      dateIso: alert.d,
      val: state.holidays.includes(alert.d) ? 'L' : 2
    }));
    if (updates.length === 0) return;

    const saved = await apiClient.saveAttendanceBatch(updates);
    if (!saved) {
      showToast('Không thể lưu đề xuất chấm công. Vui lòng thử lại.', 'error');
      return;
    }

    setState((prev) => {
      const newAtt = { ...prev.att };
      for (const update of updates) {
        const currentRecord = newAtt[update.staffId] || { days: {} };
        newAtt[update.staffId] = {
          days: {
            ...currentRecord.days,
            [update.dateIso]: update.val
          }
        };
      }
      return { ...prev, att: newAtt };
    });
    addLog(`Sửa chấm công ngày lễ, chủ nhật ${state.attMonth}`);
    showToast('Đã áp dụng đề xuất chấm công', 'success');
  }, [state.staff, state.att, state.attMonth, state.holidays, addLog, showToast, setState]);

  const updateStaffAdvance = useCallback(
    async (staffId: string, advance: number) => {
      const normalizedAdvance = Math.max(0, advance || 0);
      const saved = await apiClient.updateStaffAdvance(staffId, normalizedAdvance, state.attMonth);
      if (!saved) {
        showToast('Không thể lưu tạm ứng. Vui lòng thử lại.', 'error');
        return;
      }
      setState((prev) => ({
        ...prev,
        staff: prev.staff.map((s) => (s.id === staffId ? { ...s, advance: normalizedAdvance } : s))
      }));
    },
    [setState, showToast, state.attMonth]
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
    addGiftItem,
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

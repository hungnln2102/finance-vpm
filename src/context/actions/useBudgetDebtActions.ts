import { useCallback } from 'react';
import { AppState, UIState, CostAdjustment, Contract } from '../../types';
import { TODAY } from '../../data/constants';
import { monthLabel } from '../../utils/formatters';
import { apiClient } from '../../services/apiClient';
import { ToastState } from './useAppUiState';

interface UseBudgetDebtActionsProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  ui: UIState;
  addLog: (what: string) => void;
  showToast: (message: string, type?: ToastState['type']) => void;
}

export function useBudgetDebtActions({
  state,
  setState,
  ui,
  addLog,
  showToast
}: UseBudgetDebtActionsProps) {
  const addCostAdjustment = useCallback(
    (data: {
      month: string;
      category: string;
      oldBudget: number;
      newBudget: number;
      reason: string;
    }) => {
      const nextId = `ADJ-${String(state.costAdjustments.length + 1).padStart(2, '0')}`;
      const newAdj: CostAdjustment = {
        id: nextId,
        month: data.month,
        category: data.category,
        oldBudget: data.oldBudget,
        newBudget: data.newBudget,
        reason: data.reason.trim(),
        status: 'pending',
        approvedBy: undefined,
        createdAt: TODAY
      };

      setState((prev) => ({
        ...prev,
        costAdjustments: [newAdj, ...prev.costAdjustments]
      }));

      apiClient.addCostAdjustment(newAdj);
      addLog(`Tạo phiếu đề xuất điều chỉnh chi phí định mức ${newAdj.category} tháng ${data.month}`);
      showToast('Đã gửi yêu cầu điều chỉnh cost (Chờ phê duyệt)', 'info');
    },
    [state.costAdjustments.length, addLog, showToast, setState]
  );

  const approveCostAdjustment = useCallback(
    (id: string) => {
      const adj = state.costAdjustments.find((a) => a.id === id);
      if (!adj) return;

      const approvedAdj = { ...adj, status: 'approved' as const, approvedBy: 'Sếp Mavryk' };

      setState((prev) => {
        const mBudget = { ...(prev.budget[adj.month] || {}) };
        mBudget[adj.category] = adj.newBudget;

        return {
          ...prev,
          costAdjustments: prev.costAdjustments.map((a) =>
            a.id === id ? approvedAdj : a
          ),
          budget: {
            ...prev.budget,
            [adj.month]: mBudget
          }
        };
      });

      apiClient.addCostAdjustment(approvedAdj);
      apiClient.updateCostBudget(adj.month, adj.category, adj.newBudget);
      addLog(`Master phê duyệt điều chỉnh cost ${adj.id}`);
      showToast('Đã phê duyệt điều chỉnh định mức cost', 'success');
    },
    [state.costAdjustments, addLog, showToast, setState]
  );

  const rejectCostAdjustment = useCallback(
    (id: string) => {
      const adj = state.costAdjustments.find((a) => a.id === id);
      if (!adj) return;

      const rejectedAdj = { ...adj, status: 'rejected' as const, approvedBy: 'Sếp Mavryk (Từ chối)' };

      setState((prev) => ({
        ...prev,
        costAdjustments: prev.costAdjustments.map((a) =>
          a.id === id ? rejectedAdj : a
        )
      }));

      apiClient.addCostAdjustment(rejectedAdj);
      addLog(`Master từ chối điều chỉnh cost ${adj.id}`);
      showToast('Đã từ chối điều chỉnh định mức cost', 'warn');
    },
    [state.costAdjustments, addLog, showToast, setState]
  );

  const toggleCostCategoryStatus = useCallback(
    (month: string, category: string) => {
      setState((prev) => {
        const map = { ...(prev.disabledCostCategories || {}) };
        const currentList = [...(map[month] || [])];
        const isOff = currentList.includes(category);
        const nextList = isOff 
          ? currentList.filter((c) => c !== category)
          : [...currentList, category];
        map[month] = nextList;
        return {
          ...prev,
          disabledCostCategories: map
        };
      });
      const isEnabled = (state.disabledCostCategories?.[month] || []).includes(category);
      apiClient.setCostBudgetStatus(month, category, isEnabled);
      addLog(`Thay đổi trạng thái On/Off chi phí ${category} tháng ${month}`);
    },
    [addLog, setState]
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
      apiClient.updateCostBudget(month, category, amount);
      addLog(`Giao ngân sách ${monthLabel(month)}`);
      showToast('Đã lưu ngân sách', 'success');
    },
    [addLog, showToast, setState]
  );

  const addCostCategory = useCallback(
    (month: string, code: string, name: string, amount: number) => {
      const categoryCode = code.trim().toUpperCase();
      const categoryName = name.trim();

      if (!categoryCode || !categoryName || amount <= 0) return;

      setState((prev) => {
        if (prev.costCategories[categoryCode]) return prev;

        return {
          ...prev,
          costCategories: {
            ...prev.costCategories,
            [categoryCode]: categoryName
          },
          budget: {
            ...prev.budget,
            [month]: {
              ...(prev.budget[month] || {}),
              [categoryCode]: amount
            }
          }
        };
      });
      void (async () => {
        const categorySaved = await apiClient.addCostCategory({ code: categoryCode, name: categoryName });
        if (categorySaved) await apiClient.updateCostBudget(month, categoryCode, amount);
      })();
      addLog(`Thêm danh mục chi phí ${categoryCode} · ${categoryName} tháng ${month}`);
      showToast('Đã thêm danh mục cost', 'success');
    },
    [addLog, showToast, setState]
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

      apiClient.addContract(newContract);
      addLog(`Thêm hợp đồng ${newContract.id} · ${newContract.customer}`);
      const rate = newContract.fee ? newContract.disc / newContract.fee : 0;
      if (rate > 0.3) {
        showToast('Đã thêm, chiết khấu chờ chị Giàu duyệt', 'warn');
      } else {
        showToast('Đã thêm hợp đồng', 'success');
      }
    },
    [state.contracts, addLog, showToast, setState]
  );

  const approveDiscount = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        contracts: prev.contracts.map((c) => (c.id === id ? { ...c, discApproved: true } : c))
      }));
      apiClient.approveContractDiscount(id);
      addLog(`Duyệt chiết khấu ${id}`);
      showToast('Đã duyệt chiết khấu', 'success');
    },
    [addLog, showToast, setState]
  );

  return {
    addCostAdjustment,
    approveCostAdjustment,
    rejectCostAdjustment,
    toggleCostCategoryStatus,
    updateBudget,
    addCostCategory,
    addContract,
    approveDiscount
  };
}

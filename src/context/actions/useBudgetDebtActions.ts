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

      apiClient.addCostAdjustment(newAdj);
      addLog(`Điều chỉnh chi phí định mức ${newAdj.category} tháng ${data.month}`);
      showToast(newAdj.status === 'approved' ? 'Đã phê duyệt điều chỉnh chi phí' : 'Đã gửi yêu cầu điều chỉnh cost', 'success');
    },
    [state.costAdjustments.length, ui.role, addLog, showToast, setState]
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
      addLog(`Master phê duyệt điều chỉnh cost ${adj.id}`);
      showToast('Đã phê duyệt điều chỉnh định mức cost', 'success');
    },
    [state.costAdjustments, addLog, showToast, setState]
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
    updateBudget,
    addContract,
    approveDiscount
  };
}

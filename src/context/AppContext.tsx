import React, { useState, useEffect, useCallback } from 'react';
import { 
  AppState, 
  Transaction, 
  Contract, 
  GiftMovement, 
  BankWebhookLog,
  Proposal,
  CostAdjustment
} from '../types';
import { KEY, TODAY } from '../data/constants';
import { dmy } from '../utils/formatters';
import { apiClient } from '../services/apiClient';
import { loadInitialState } from './initialState';
import { useAppUiState, ToastState } from './actions/useAppUiState';
import { useTransactionActions } from './actions/useTransactionActions';
import { useProposalActions } from './actions/useProposalActions';
import { useBudgetDebtActions } from './actions/useBudgetDebtActions';
import { useOperationsActions } from './actions/useOperationsActions';
import { AppContext, AppContextType } from './AppContextInstance';

export type { ToastState, AppContextType };

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(loadInitialState);

  const {
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
  } = useAppUiState();

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

  // Load data from Backend API (PostgreSQL + Google Sheet Sync) với auto-retry nếu backend khởi động chậm
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const fetchData = () => {
      Promise.all([apiClient.getState(), apiClient.getAccounts()]).then(([dbData, accountsData]) => {
        if (cancelled) return;
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
          showToast('Đã kết nối PostgreSQL (schema: finance_vpm)', 'success');
        } else {
          // Nếu chưa kết nối được Backend, retry sau 2.5s để đồng bộ tự động ngay khi backend online
          timer = setTimeout(fetchData, 2500);
        }
      });
    };

    fetchData();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
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
            costCategories: state.costCategories,
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

  const txActions = useTransactionActions({
    state,
    setState,
    ui,
    setUi,
    addLog,
    showToast
  });

  const proposalActions = useProposalActions({
    state,
    setState,
    ui,
    addLog,
    showToast
  });

  const budgetDebtActions = useBudgetDebtActions({
    state,
    setState,
    ui,
    addLog,
    showToast
  });

  const operationsActions = useOperationsActions({
    state,
    setState,
    ui,
    addLog,
    showToast
  });

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
        setDateRange,
        setLedgerFilter,
        setDebtKind,
        setDebtOnlyOver,
        setEditTx,
        canDo,
        ...txActions,
        ...proposalActions,
        ...budgetDebtActions,
        ...operationsActions
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

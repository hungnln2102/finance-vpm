import React, { useState } from 'react';
import { useApp } from './../../context/useApp';
import { TODAY } from '../../data/constants';
import { calculateDebt } from '../../services/debtService';
import { DebtKpiTiles } from './components/DebtKpiTiles';
import { DebtTable } from './components/DebtTable';
import { DebtCreateModal } from './components/DebtCreateModal';

export const DebtView: React.FC = () => {
  const { 
    state, 
    ui, 
    canDo, 
    setDebtKind, 
    setDebtOnlyOver, 
    addContract, 
    approveDiscount 
  } = useApp();

  const k = ui.debtKind;
  const onlyOver = ui.debtOnlyOver;
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Summary Metrics
  const currentKindContracts = state.contracts.filter((c) => c.kind === k);
  const allDebts = currentKindContracts.map((c) => calculateDebt(c, state.tx, TODAY));
  const totDue = allDebts.reduce((s, d) => s + d.due, 0);
  const totPaid = allDebts.reduce((s, d) => s + d.paid, 0);
  const totLeft = allDebts.reduce((s, d) => s + (d.left > 0 ? d.left : 0), 0);
  const totOver = allDebts.reduce((s, d) => s + (d.over > 0 ? d.left : 0), 0);
  const overdueCount = allDebts.filter((d) => d.over > 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 4 Summary Tiles */}
      <DebtKpiTiles
        kind={k}
        totalContracts={currentKindContracts.length}
        totDue={totDue}
        totPaid={totPaid}
        totLeft={totLeft}
        totOver={totOver}
        overdueCount={overdueCount}
      />

      {/* Main Table Card với nút + Tạo công nợ & 2 cột Thu - Chi */}
      <DebtTable
        kind={k}
        contracts={state.contracts}
        transactions={state.tx}
        onlyOver={onlyOver}
        canApproveDisc={canDo('approve')}
        totalKH={state.contracts.filter((c) => c.kind === 'KH').length}
        totalTV={state.contracts.filter((c) => c.kind === 'TV').length}
        overdueCount={overdueCount}
        onSetKind={setDebtKind}
        onSetOnlyOver={setDebtOnlyOver}
        onApproveDiscount={approveDiscount}
        onOpenCreateModal={() => setShowCreateModal(true)}
      />

      {/* Modal Popup Tạo Công Nợ (Thu hoặc Chi) */}
      <DebtCreateModal
        show={showCreateModal}
        defaultKind={k}
        onClose={() => setShowCreateModal(false)}
        onAddContract={addContract}
      />
    </div>
  );
};

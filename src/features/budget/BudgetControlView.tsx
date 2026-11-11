import React, { useState } from 'react';
import { useApp } from './../../context/useApp';
import { CATS } from '../../data/constants';
import { mon } from '../../utils/formatters';
import { BudgetKpiCards } from './components/BudgetKpiCards';
import { BudgetVarianceTable } from './components/BudgetVarianceTable';
import { BudgetAdjustmentLog } from './components/BudgetAdjustmentLog';
import { BudgetAdjustmentModal } from './components/BudgetAdjustmentModal';

export const BudgetControlView: React.FC = () => {
  const { state, ui, canDo, updateBudget, addCostAdjustment, approveCostAdjustment } = useApp();
  const m = ui.month;

  const monthBudget = state.budget[m] || {};
  
  // Calculate actual OPEX spend in the selected month from posted transactions
  const opexTx = state.tx.filter(
    (t) => mon(t.date) === m && t.dir === 'out' && t.type === 'OPEX' && (t.status === 'posted' || t.status === 'approved')
  );

  const actualByCat: Record<string, number> = {};
  for (const t of opexTx) {
    const c = t.cat || 'KHAC';
    actualByCat[c] = (actualByCat[c] || 0) + t.amt;
  }

  const allCategories = Object.keys(CATS);
  const totalBudget = allCategories.reduce((s, c) => s + (monthBudget[c] || 0), 0);
  const totalActual = allCategories.reduce((s, c) => s + (actualByCat[c] || 0), 0);
  const totalVariance = totalBudget - totalActual;
  const isOverBudget = totalActual > totalBudget && totalBudget > 0;

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const monthAdjustments = (state.costAdjustments || []).filter((a) => a.month === m);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* KPI Cards Summary */}
      <BudgetKpiCards
        month={m}
        totalBudget={totalBudget}
        totalActual={totalActual}
        totalVariance={totalVariance}
        isOverBudget={isOverBudget}
        opexCount={opexTx.length}
      />

      {/* Main Budget Variance Table */}
      <BudgetVarianceTable
        month={m}
        allCategories={allCategories}
        monthBudget={monthBudget}
        actualByCat={actualByCat}
        totalBudget={totalBudget}
        totalActual={totalActual}
        totalVariance={totalVariance}
        isOverBudget={isOverBudget}
        canEditBudget={canDo('budget')}
        onUpdateBudget={updateBudget}
        onOpenAdjustModal={() => setShowAdjustModal(true)}
      />

      {/* Cost Adjustments Log & Master Approval */}
      <BudgetAdjustmentLog
        month={m}
        adjustments={monthAdjustments}
        uiRole={ui.role}
        onApprove={approveCostAdjustment}
      />

      {/* Modal Yêu Cầu Điều Chỉnh Cost */}
      <BudgetAdjustmentModal
        show={showAdjustModal}
        month={m}
        monthBudget={monthBudget}
        onClose={() => setShowAdjustModal(false)}
        onSubmit={addCostAdjustment}
      />
    </div>
  );
};

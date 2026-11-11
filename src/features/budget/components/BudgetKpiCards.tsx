import React from 'react';
import { mil, monthLabel } from '../../../utils/formatters';

interface BudgetKpiCardsProps {
  month: string;
  totalBudget: number;
  totalActual: number;
  totalVariance: number;
  isOverBudget: boolean;
  opexCount: number;
}

export const BudgetKpiCards: React.FC<BudgetKpiCardsProps> = ({
  month,
  totalBudget,
  totalActual,
  totalVariance,
  isOverBudget,
  opexCount,
}) => {
  return (
    <div className="kpi-grid">
      <div className="card-box kpi-card">
        <div className="kpi-label">Tổng Định Mức Ngân Sách</div>
        <div className="kpi-val" style={{ color: 'var(--teal)' }}>{mil(totalBudget)}</div>
        <div className="kpi-sub">Kế hoạch Opex giao {monthLabel(month)}</div>
      </div>
      <div className="card-box kpi-card">
        <div className="kpi-label">Thực Chi Thực Tế (Sổ Cái)</div>
        <div className="kpi-val" style={{ color: isOverBudget ? 'var(--bad)' : 'var(--ochre)' }}>
          {mil(totalActual)}
        </div>
        <div className="kpi-sub">{opexCount} khoản chi Opex đã chốt Sổ Cái</div>
      </div>
      <div className="card-box kpi-card">
        <div className="kpi-label">Độ Lệch Variance (Dư/Vượt)</div>
        <div className="kpi-val" style={{ color: totalVariance >= 0 ? 'var(--good)' : 'var(--bad)' }}>
          {totalVariance >= 0 ? '+' : ''}{mil(totalVariance)}
        </div>
        <div className="kpi-sub">{totalVariance >= 0 ? 'Trong hạn mức an toàn' : 'Cảnh báo: Thực chi vượt định mức'}</div>
      </div>
      <div className="card-box kpi-card">
        <div className="kpi-label">Tỷ Lệ Thực Hiện Kế Hoạch</div>
        <div className="kpi-val" style={{ color: totalBudget > 0 ? (totalActual / totalBudget > 1 ? 'var(--bad)' : 'var(--good)') : 'var(--muted)' }}>
          {totalBudget > 0 ? `${Math.round((totalActual / totalBudget) * 100)}%` : '—'}
        </div>
        <div className="kpi-sub">{totalBudget > 0 ? 'So với tổng ngân sách tháng' : 'Chưa giao định mức'}</div>
      </div>
    </div>
  );
};

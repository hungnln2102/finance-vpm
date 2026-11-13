import React from 'react';
import { fmt, monthLabel } from '../../../utils/formatters';
import { Target, TrendingDown, BarChart3, PieChart } from 'lucide-react';

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
  const pct = totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0;

  return (
    <div className="ledger-kpi-grid">
      {/* Thẻ 1: TỔNG ĐỊNH MỨC NGÂN SÁCH */}
      <div className="ledger-kpi-card">
        <div className="ledger-kpi-card-header">
          <span className="ledger-kpi-card-title">TỔNG ĐỊNH MỨC OPEX</span>
          <div className="ledger-kpi-badge teal">
            <Target size={18} strokeWidth={2.4} />
          </div>
        </div>

        <div className="ledger-kpi-card-value">
          <span style={{ color: 'var(--teal)' }}>
            {fmt(totalBudget)}
          </span>{' '}
          <span style={{ fontSize: '18px', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px', color: 'var(--muted)' }}>
            đ
          </span>
        </div>

        <div className="ledger-kpi-card-footer">
          <span className="footer-label">Kế hoạch giao:</span>
          <span className="footer-val" style={{ color: 'var(--teal)' }}>
            {monthLabel(month)}
          </span>
        </div>
      </div>

      {/* Thẻ 2: THỰC CHI THỰC TẾ (SỔ CÁI) */}
      <div className="ledger-kpi-card">
        <div className="ledger-kpi-card-header">
          <span className="ledger-kpi-card-title">THỰC CHI SỔ CÁI</span>
          <div className={`ledger-kpi-badge ${isOverBudget ? 'bad' : 'ochre'}`}>
            <TrendingDown size={18} strokeWidth={2.4} />
          </div>
        </div>

        <div className="ledger-kpi-card-value">
          <span style={{ color: isOverBudget ? 'var(--bad)' : 'var(--ink)' }}>
            {fmt(totalActual)}
          </span>{' '}
          <span style={{ fontSize: '18px', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px', color: 'var(--muted)' }}>
            đ
          </span>
        </div>

        <div className="ledger-kpi-card-footer">
          <span className="footer-label">Giao dịch Opex đã chốt:</span>
          <span className="footer-val" style={{ color: isOverBudget ? 'var(--bad)' : 'var(--ochre)' }}>
            {opexCount} khoản chi
          </span>
        </div>
      </div>

      {/* Thẻ 3: ĐỘ LỆCH VARIANCE */}
      <div className="ledger-kpi-card">
        <div className="ledger-kpi-card-header">
          <span className="ledger-kpi-card-title">ĐỘ LỆCH VARIANCE</span>
          <div className={`ledger-kpi-badge ${totalVariance < 0 ? 'bad' : 'good'}`}>
            <BarChart3 size={18} strokeWidth={2.4} />
          </div>
        </div>

        <div className="ledger-kpi-card-value">
          <span style={{ color: totalVariance < 0 ? 'var(--bad)' : 'var(--good)' }}>
            {totalVariance < 0 ? fmt(totalVariance) : '0'}
          </span>{' '}
          <span style={{ fontSize: '18px', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px', color: 'var(--muted)' }}>
            đ
          </span>
        </div>

        <div className="ledger-kpi-card-footer">
          <span className="footer-label">Tình trạng ngân sách:</span>
          <span className="footer-val" style={{ color: totalVariance < 0 ? 'var(--bad)' : 'var(--good)' }}>
            {totalVariance < 0 ? 'Vượt định mức chi' : 'Trong hạn mức an toàn'}
          </span>
        </div>
      </div>

      {/* Thẻ 4: TỶ LỆ THỰC HIỆN KẾ HOẠCH */}
      <div className="ledger-kpi-card">
        <div className="ledger-kpi-card-header">
          <span className="ledger-kpi-card-title">TỶ LỆ THỰC HIỆN</span>
          <div className={`ledger-kpi-badge ${totalBudget > 0 ? (pct > 100 ? 'bad' : 'teal') : 'ochre'}`}>
            <PieChart size={18} strokeWidth={2.4} />
          </div>
        </div>

        <div className="ledger-kpi-card-value">
          <span style={{ color: totalBudget > 0 ? (pct > 100 ? 'var(--bad)' : 'var(--good)') : 'var(--muted)' }}>
            {totalBudget > 0 ? `${pct}%` : '—'}
          </span>
          {totalBudget > 0 && (
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--muted)', marginLeft: '8px' }}>
              {pct > 100 ? '(Vượt trần)' : '(Đã giải ngân)'}
            </span>
          )}
        </div>

        <div className="ledger-kpi-card-footer" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '6px' }}>
          {totalBudget > 0 ? (
            <div style={{ width: '100%', height: '5px', background: 'var(--soft)', borderRadius: '3px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${Math.min(100, pct)}%`, 
                  height: '100%', 
                  background: pct > 100 ? 'var(--bad)' : pct >= 85 ? 'var(--ochre)' : 'var(--teal)',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease'
                }} 
              />
            </div>
          ) : (
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic' }}>
              Chưa thiết lập định mức tháng này
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

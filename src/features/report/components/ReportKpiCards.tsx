import React from 'react';
import { fmt } from '../../../utils/formatters';
import { ArrowDownLeft, ArrowUpRight, Activity, Target } from 'lucide-react';

interface ReportKpiCardsProps {
  totalIn: number;
  inCount: number;
  prevTotalIn: number;
  totalOut: number;
  outCount: number;
  totOp: number;
  totB: number;
}

export const ReportKpiCards: React.FC<ReportKpiCardsProps> = ({
  totalIn,
  inCount,
  prevTotalIn,
  totalOut,
  outCount,
  totOp,
  totB
}) => {
  const netCashflow = totalIn - totalOut;
  const isNetPositive = netCashflow >= 0;
  const opexVariance = totB - totOp;
  const isOverBudget = totB > 0 && opexVariance < 0;
  const opexPct = totB > 0 ? Math.round((totOp / totB) * 100) : 0;

  const inGrowth =
    prevTotalIn > 0
      ? Math.round(((totalIn - prevTotalIn) / prevTotalIn) * 100)
      : null;

  return (
    <div className="ledger-kpi-grid">
      {/* Thẻ 1: TỔNG THU TRONG KỲ */}
      <div className="ledger-kpi-card">
        <div className="ledger-kpi-card-header">
          <span className="ledger-kpi-card-title">TỔNG THU TRONG KỲ</span>
          <div className="ledger-kpi-badge good">
            <ArrowDownLeft size={18} strokeWidth={2.4} />
          </div>
        </div>

        <div className="ledger-kpi-card-value">
          <span style={{ color: 'var(--good)' }}>+{fmt(totalIn)}</span>{' '}
          <span style={{ fontSize: '18px', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px', color: 'var(--muted)' }}>
            đ
          </span>
        </div>

        <div className="ledger-kpi-card-footer">
          <span className="footer-label">Số phiếu thu ({inCount}):</span>
          <span className="footer-val" style={{ color: inGrowth !== null && inGrowth < 0 ? 'var(--ochre)' : 'var(--good)' }}>
            {inGrowth !== null ? `${inGrowth >= 0 ? '+' : ''}${inGrowth}% so tháng trước` : `${inCount} giao dịch`}
          </span>
        </div>
      </div>

      {/* Thẻ 2: TỔNG CHI TRONG KỲ */}
      <div className="ledger-kpi-card">
        <div className="ledger-kpi-card-header">
          <span className="ledger-kpi-card-title">TỔNG CHI TRONG KỲ</span>
          <div className="ledger-kpi-badge bad">
            <ArrowUpRight size={18} strokeWidth={2.4} />
          </div>
        </div>

        <div className="ledger-kpi-card-value">
          <span style={{ color: 'var(--bad)' }}>−{fmt(totalOut)}</span>{' '}
          <span style={{ fontSize: '18px', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px', color: 'var(--muted)' }}>
            đ
          </span>
        </div>

        <div className="ledger-kpi-card-footer">
          <span className="footer-label">Trong đó Chi OPEX:</span>
          <span className="footer-val" style={{ color: 'var(--ink)' }}>
            {fmt(totOp)} đ ({outCount} phiếu)
          </span>
        </div>
      </div>

      {/* Thẻ 3: LƯU CHUYỂN TIỀN THUẦN (NET CASHFLOW) */}
      <div className="ledger-kpi-card">
        <div className="ledger-kpi-card-header">
          <span className="ledger-kpi-card-title">LƯU CHUYỂN TIỀN THUẦN</span>
          <div className={`ledger-kpi-badge ${isNetPositive ? 'teal' : 'bad'}`}>
            <Activity size={18} strokeWidth={2.4} />
          </div>
        </div>

        <div className="ledger-kpi-card-value">
          <span style={{ color: isNetPositive ? 'var(--teal)' : 'var(--bad)' }}>
            {isNetPositive && netCashflow > 0 ? `+${fmt(netCashflow)}` : fmt(netCashflow)}
          </span>{' '}
          <span style={{ fontSize: '18px', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px', color: 'var(--muted)' }}>
            đ
          </span>
        </div>

        <div className="ledger-kpi-card-footer">
          <span className="footer-label">Cân đối Thu − Chi:</span>
          <span className="footer-val" style={{ color: isNetPositive ? 'var(--good)' : 'var(--bad)' }}>
            {netCashflow > 0 ? 'Thặng dư dòng tiền' : netCashflow < 0 ? 'Thâm hụt trong kỳ' : 'Cân bằng (0 đ)'}
          </span>
        </div>
      </div>

      {/* Thẻ 4: KIỂM SOÁT CHI PHÍ OPEX / NGÂN SÁCH */}
      <div className="ledger-kpi-card">
        <div className="ledger-kpi-card-header">
          <span className="ledger-kpi-card-title">OPEX / NGÂN SÁCH THÁNG</span>
          <div className={`ledger-kpi-badge ${isOverBudget ? 'bad' : 'ochre'}`}>
            <Target size={18} strokeWidth={2.4} />
          </div>
        </div>

        <div className="ledger-kpi-card-value">
          <span style={{ color: isOverBudget ? 'var(--bad)' : 'var(--ink)' }}>
            {totB > 0 ? `${opexPct}%` : fmt(totOp)}
          </span>
          {totB > 0 ? (
            <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--muted)', marginLeft: '8px' }}>
              ({fmt(totOp)} / {fmt(totB)} đ)
            </span>
          ) : (
            <span style={{ fontSize: '18px', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px', color: 'var(--muted)', marginLeft: '4px' }}>
              đ
            </span>
          )}
        </div>

        <div className="ledger-kpi-card-footer">
          <span className="footer-label">Độ lệch ngân sách:</span>
          <span className="footer-val" style={{ color: isOverBudget ? 'var(--bad)' : 'var(--good)' }}>
            {totB <= 0
              ? 'Chưa giao định mức'
              : isOverBudget
                ? `${fmt(opexVariance)} đ (Vượt trần)`
                : 'Trong hạn mức an toàn'}
          </span>
        </div>
      </div>
    </div>
  );
};

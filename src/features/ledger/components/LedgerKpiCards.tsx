import React from 'react';
import { fmt, fm } from '../../../utils/formatters';
import { DollarSign, Calendar, Clock, CheckCircle2 } from 'lucide-react';

interface LedgerKpiCardsProps {
  totalFund: number;
  quyBal: number;
  acbBal: number;
  totalIn: number;
  countIn: number;
  totalOut: number;
  countOut: number;
  totalCount: number;
}

export const LedgerKpiCards: React.FC<LedgerKpiCardsProps> = ({
  totalFund,
  quyBal,
  acbBal,
  totalIn,
  countIn,
  totalOut,
  countOut,
  totalCount
}) => {
  return (
    <div className="ledger-kpi-grid">
      {/* Thẻ 1: TỔNG QUỸ */}
      <div className="ledger-kpi-card">
        <div className="ledger-kpi-card-header">
          <span className="ledger-kpi-card-title">TỔNG QUỸ</span>
          <div className="ledger-kpi-badge teal">
            <DollarSign size={18} strokeWidth={2.5} />
          </div>
        </div>

        <div className="ledger-kpi-card-value">
          <span style={{ color: totalFund < 0 ? 'var(--bad)' : 'var(--ink)' }}>
            {fmt(totalFund)}
          </span>{' '}
          <span style={{ fontSize: '18px', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px', color: 'var(--muted)' }}>
            đ
          </span>
        </div>

        <div className="ledger-kpi-card-footer">
          <span className="footer-label">Quỹ mặt / ACB:</span>
          <span className="footer-val" style={{ color: 'var(--ochre)' }}>
            {fm(quyBal)} / {fm(acbBal)}
          </span>
        </div>
      </div>

      {/* Thẻ 2: TỔNG THU */}
      <div className="ledger-kpi-card">
        <div className="ledger-kpi-card-header">
          <span className="ledger-kpi-card-title">TỔNG THU</span>
          <div className="ledger-kpi-badge good">
            <Calendar size={18} strokeWidth={2.2} />
          </div>
        </div>

        <div className="ledger-kpi-card-value">
          <span style={{ color: 'var(--good)' }}>+{fmt(totalIn)}</span>{' '}
          <span style={{ fontSize: '18px', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px', color: 'var(--muted)' }}>
            đ
          </span>
        </div>

        <div className="ledger-kpi-card-footer">
          <span className="footer-label">Số lượng phiếu thu:</span>
          <span className="footer-val" style={{ color: 'var(--good)' }}>
            {countIn} khoản
          </span>
        </div>
      </div>

      {/* Thẻ 3: TỔNG CHI */}
      <div className="ledger-kpi-card">
        <div className="ledger-kpi-card-header">
          <span className="ledger-kpi-card-title">TỔNG CHI</span>
          <div className="ledger-kpi-badge bad">
            <Clock size={18} strokeWidth={2.2} />
          </div>
        </div>

        <div className="ledger-kpi-card-value">
          <span style={{ color: 'var(--bad)' }}>-{fmt(totalOut)}</span>{' '}
          <span style={{ fontSize: '18px', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px', color: 'var(--muted)' }}>
            đ
          </span>
        </div>

        <div className="ledger-kpi-card-footer">
          <span className="footer-label">Số lượng phiếu chi:</span>
          <span className="footer-val" style={{ color: 'var(--bad)' }}>
            {countOut} khoản
          </span>
        </div>
      </div>

      {/* Thẻ 4: TỔNG GIAO DỊCH */}
      <div className="ledger-kpi-card">
        <div className="ledger-kpi-card-header">
          <span className="ledger-kpi-card-title">TỔNG SỐ GIAO DỊCH</span>
          <div className="ledger-kpi-badge ochre">
            <CheckCircle2 size={18} strokeWidth={2.2} />
          </div>
        </div>

        <div className="ledger-kpi-card-value">
          <span>{totalCount}</span>{' '}
          <span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--muted)' }}>
            giao dịch
          </span>
        </div>

        <div className="ledger-kpi-card-footer">
          <span className="footer-label">Phân bổ Thu / Chi:</span>
          <span className="footer-val" style={{ color: 'var(--teal)' }}>
            {countIn} thu · {countOut} chi
          </span>
        </div>
      </div>
    </div>
  );
};

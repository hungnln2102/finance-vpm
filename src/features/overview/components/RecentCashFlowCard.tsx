import React from 'react';
import { useApp } from './../../../context/useApp';
import { ACC, TYPES } from '../../../data/constants';
import { fm, dmy } from '../../../utils/formatters';
import { monthTx } from '../../../services/financeService';
import { ArrowUpRight, ArrowDownLeft, Receipt, ChevronRight } from 'lucide-react';

export const RecentCashFlowCard: React.FC = () => {
  const { state, ui, setView } = useApp();

  const mTx = monthTx(state.tx, ui.month);

  // Lấy các giao dịch trọng yếu (giá trị lớn nhất hoặc gần nhất trong tháng)
  const topTransactions = [...mTx]
    .sort((a, b) => b.amt - a.amt)
    .slice(0, 6);

  return (
    <section className="card-box recent-cashflow-card">
      <div className="card-header-flex">
        <div className="card-title-group">
          <div className="action-title-icon flow-icon">
            <Receipt size={18} color="#3b82f6" />
          </div>
          <div>
            <h2 className="card-title" style={{ margin: 0 }}>Giao Dịch Dòng Tiền Trọng Yếu</h2>
            <p className="card-subtitle-text">
              Các khoản thu/chi giá trị lớn nhất trong kỳ {ui.month}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary xs"
          onClick={() => setView('ledger')}
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <span>Xem tất cả ({mTx.length})</span>
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="table-scroll">
        <table className="recent-tx-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Tài khoản</th>
              <th>Nghiệp vụ</th>
              <th>Nội dung diễn giải</th>
              <th className="num">Số tiền (đ)</th>
            </tr>
          </thead>
          <tbody>
            {topTransactions.length > 0 ? (
              topTransactions.map((t) => {
                const isIncome = t.dir === 'in';
                const typeLabel = TYPES[t.type]?.l || t.type;
                const accLabel = t.acc === 'ACB' ? 'TK ACB' : t.acc === 'QUY' ? 'Quỹ mặt' : 'Bù trừ';

                return (
                  <tr key={t.id}>
                    <td className="tx-date-cell">{dmy(t.date)}</td>
                    <td>
                      <span className={`acc-badge acc-${t.acc.toLowerCase()}`}>
                        {accLabel}
                      </span>
                    </td>
                    <td>
                      <div className="tx-type-tag">
                        {isIncome ? (
                          <ArrowDownLeft size={13} color="#10b981" />
                        ) : (
                          <ArrowUpRight size={13} color="#ef4444" />
                        )}
                        <span>{typeLabel}</span>
                      </div>
                    </td>
                    <td className="tx-desc-cell" title={t.desc}>
                      {t.desc}
                      {t.contract && <span className="contract-code">[{t.contract}]</span>}
                    </td>
                    <td className={`num tx-amt-cell ${isIncome ? 'text-good' : 'text-bad'}`}>
                      {isIncome ? `+${fm(t.amt)}` : `-${fm(t.amt)}`}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                  Không có giao dịch nào trong tháng {ui.month}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};


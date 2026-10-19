import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATS, TYPES, ACC } from '../../data/constants';
import { fmt, fm, mil, monthLabel, lastDay, prevMonth } from '../../utils/formatters';
import { opexBy, monthTx, calculateBalance } from '../../services/financeService';
import { BarChart3, Settings2 } from 'lucide-react';

export const ReportView: React.FC = () => {
  const { state, ui, canDo, updateBudget } = useApp();
  const m = ui.month;

  const rows = monthTx(state.tx, m);
  const op = opexBy(state.tx, m);
  const b = state.budget[m] || {};

  const totOp = Object.values(op).reduce((a, c) => a + c, 0);
  const totB = Object.values(b).reduce((a, c) => a + (+c || 0), 0);

  // Group by direction
  const byDir = (dir: 'in' | 'out') => {
    const r: Record<string, number> = {};
    for (const t of rows) {
      if (t.dir === dir) {
        r[t.type] = (r[t.type] || 0) + t.amt;
      }
    }
    return r;
  };

  const ins = byDir('in');
  const outs = byDir('out');

  const maxVal = Math.max(
    ...Object.keys(CATS).map((k) => Math.max(op[k] || 0, +b[k] || 0)),
    1
  );

  const prevM = prevMonth(m);
  const accBal = (a: string) => ({
    open: calculateBalance(state.tx, a, lastDay(prevM)),
    close: calculateBalance(state.tx, a, lastDay(m))
  });

  const [budgetInputs, setBudgetInputs] = useState<Record<string, number>>(() => ({ ...b }));
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    Object.entries(budgetInputs).forEach(([catKey, amount]) => {
      updateBudget(m, catKey, amount);
    });
    setShowBudgetForm(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 4 Summary Tiles */}
      <div className="tiles-grid">
        <div className="metric-tile">
          <div className="metric-tile-header">
            <span className="metric-key">Chi phí vận hành</span>
          </div>
          <span className="metric-val">{fm(totOp)}</span>
          <span className="metric-note">
            {totB > 0 ? `Ngân sách ${mil(totB)}` : 'Chưa giao ngân sách'}
          </span>
        </div>

        <div className="metric-tile">
          <div className="metric-tile-header">
            <span className="metric-key">Ứng phí hộ khách</span>
          </div>
          <span className="metric-val">{fm(outs.UNG_PHI || 0)}</span>
          <span className="metric-note">Không tính vào chi phí, theo dõi qua công nợ</span>
        </div>

        <div className="metric-tile good">
          <div className="metric-tile-header">
            <span className="metric-key">Khách, TV trả nợ</span>
          </div>
          <span className="metric-val">{fm((ins.THU_KH || 0) + (ins.THU_TV || 0))}</span>
          <span className="metric-note">Mọi tài khoản ghi nhận trong tháng</span>
        </div>

        <div className={`metric-tile ${accBal('QUY').close < 0 ? 'bad' : ''}`}>
          <div className="metric-tile-header">
            <span className="metric-key">Tồn sổ quỹ cuối kỳ</span>
          </div>
          <span className="metric-val">{fm(accBal('QUY').close)}</span>
          <span className="metric-note">Đầu kỳ: {fm(accBal('QUY').open)}</span>
        </div>
      </div>

      {/* Expense vs Budget Section */}
      <section className="card-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} style={{ color: 'var(--teal)' }} />
              <span>Chi phí vận hành so với ngân sách</span>
            </div>
            <small>vạch đen đánh dấu ngân sách chị Giàu giao</small>
          </h2>

          {canDo('budget') && (
            <button
              type="button"
              className="btn xs"
              onClick={() => setShowBudgetForm(!showBudgetForm)}
            >
              <Settings2 size={13} />
              <span>{showBudgetForm ? 'Đóng form' : `Giao ngân sách ${monthLabel(m).toLowerCase()}`}</span>
            </button>
          )}
        </div>

        {/* Bar chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.entries(CATS).map(([k, label]) => {
            const v = op[k] || 0;
            const bud = +b[k] || 0;
            const isOver = bud > 0 && v > bud;

            return (
              <div key={k} className="budget-bar-row">
                <span style={{ fontWeight: 500 }}>{label}</span>
                <div className="bar-track">
                  <div
                    className={`bar-fill ${isOver ? 'over' : ''}`}
                    style={{ width: `${Math.min(100, (v / maxVal) * 100)}%` }}
                  />
                  {bud > 0 && (
                    <div
                      className="bar-budget-marker"
                      style={{ left: `${Math.min(100, (bud / maxVal) * 100)}%` }}
                      title={`Ngân sách: ${fmt(bud)} đ`}
                    />
                  )}
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--f-num)' }}>
                  <div style={{ fontWeight: 600 }}>{fmt(v)}</div>
                  {bud > 0 && (
                    <div style={{ fontSize: '11px', color: isOver ? 'var(--bad)' : 'var(--muted)', fontWeight: isOver ? 700 : 400 }}>
                      NS {fmt(bud)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Budget Form */}
        {showBudgetForm && canDo('budget') && (
          <form onSubmit={handleBudgetSubmit} className="form-grid" style={{ marginTop: '16px', padding: '16px', background: 'var(--soft)', borderRadius: 'var(--radius-md)' }}>
            {Object.entries(CATS).map(([k, label]) => (
              <div key={k} className="form-group">
                <label>{label}</label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  value={budgetInputs[k] ?? ''}
                  placeholder="0"
                  onChange={(e) =>
                    setBudgetInputs((prev) => ({
                      ...prev,
                      [k]: Number(e.target.value) || 0
                    }))
                  }
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button type="submit" className="btn primary">
                Lưu ngân sách
              </button>
              <button type="button" className="btn" onClick={() => setShowBudgetForm(false)}>
                Hủy
              </button>
            </div>
          </form>
        )}
      </section>

      {/* 2-Column: Cash Flow by Type & Account Balances */}
      <div className="grid-2col">
        {/* Cash Flow */}
        <section className="card-box">
          <h2 className="card-title">
            <span>Dòng tiền theo loại</span>
          </h2>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Loại tiền</th>
                  <th className="num">Thu</th>
                  <th className="num">Chi</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(TYPES).map(([k, t]) => (
                  <tr key={k}>
                    <td>{t.l}</td>
                    <td className="num" style={{ color: ins[k] ? 'var(--good)' : undefined, fontWeight: ins[k] ? 600 : 400 }}>
                      {ins[k] ? fmt(ins[k]) : '—'}
                    </td>
                    <td className="num" style={{ color: outs[k] ? 'var(--bad)' : undefined, fontWeight: outs[k] ? 600 : 400 }}>
                      {outs[k] ? fmt(outs[k]) : '—'}
                    </td>
                  </tr>
                ))}
                <tr className="total">
                  <td>Tổng</td>
                  <td className="num" style={{ color: 'var(--good)' }}>
                    {fmt(Object.values(ins).reduce((a, c) => a + c, 0))}
                  </td>
                  <td className="num" style={{ color: 'var(--bad)' }}>
                    {fmt(Object.values(outs).reduce((a, c) => a + c, 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Account Balances */}
        <section className="card-box">
          <h2 className="card-title">
            <span>Số dư theo tài khoản</span>
          </h2>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Tài khoản</th>
                  <th className="num">Đầu kỳ</th>
                  <th className="num">Cuối kỳ</th>
                </tr>
              </thead>
              <tbody>
                {(['QUY', 'ACB'] as const).map((accKey) => {
                  const bal = accBal(accKey);
                  return (
                    <tr key={accKey}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{ACC[accKey]}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Mã: {accKey}</div>
                      </td>
                      <td className="num">{fm(bal.open)}</td>
                      <td className="num" style={{ fontWeight: 700, color: bal.close < 0 ? 'var(--bad)' : 'var(--teal)' }}>
                        {fm(bal.close)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)', lineHeight: 1.45 }}>
            Tài khoản ACB mới chỉ có các khoản thu ghi trong file công nợ; cần sao kê ngân hàng đầy đủ để ghi nhận chính xác các khoản chi phát sinh từ tài khoản này.
          </p>
        </section>
      </div>
    </div>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import { TODAY, OLD, CATS } from '../../data/constants';
import { fm, mil, dmy, fmt, monthLabel } from '../../utils/formatters';
import { calculateBalance, opexBy, detectAllIssues } from '../../services/financeService';
import { calculateDebt } from '../../services/debtService';
import { ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react';

export const OverviewView: React.FC = () => {
  const { state, setView } = useApp();

  const quy = calculateBalance(state.tx, 'QUY', TODAY);
  const acb = calculateBalance(state.tx, 'ACB', TODAY);

  const khDebts = state.contracts.filter((c) => c.kind === 'KH').map((c) => calculateDebt(c, state.tx, TODAY));
  const tvDebts = state.contracts.filter((c) => c.kind === 'TV').map((c) => calculateDebt(c, state.tx, TODAY));

  const overKH = khDebts.reduce((sum, d) => sum + (d.over > 0 ? d.left : 0), 0);
  const overTV = tvDebts.reduce((sum, d) => sum + (d.over > 0 ? d.left : 0), 0);
  const recvKH = khDebts.reduce((sum, d) => sum + d.due, 0);

  const opexSum = (m: string) => Object.values(opexBy(state.tx, m)).reduce((a, b) => a + b, 0);
  const o10 = opexSum('2026-10');
  const o9 = opexSum('2026-09');

  const wage10 = opexBy(state.tx, '2026-10').LUONG || 0;
  const other8 = opexBy(state.tx, '2026-08').KHAC || 0;
  const fundEndOct = calculateBalance(state.tx, 'QUY', '2026-10-31');

  const issues = detectAllIssues(state, TODAY);

  const monthsTrend = ['2026-08', '2026-09', '2026-10'];
  const trendData = monthsTrend.map((m) => opexBy(state.tx, m));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 4 Metric Tiles */}
      <div className="tiles-grid">
        <div className={`metric-tile ${quy < 0 ? 'bad' : ''}`}>
          <div className="metric-tile-header">
            <span className="metric-key">Tồn sổ quỹ</span>
          </div>
          <span className="metric-val">{fm(quy)}</span>
          <span className="metric-note">Cộng dồn từ 01/08, chưa có sao kê đối chiếu</span>
        </div>

        <div className="metric-tile">
          <div className="metric-tile-header">
            <span className="metric-key">Đã về TK ACB</span>
          </div>
          <span className="metric-val">{fm(acb)}</span>
          <span className="metric-note">Tiền khách, tư vấn trả qua tài khoản cá nhân</span>
        </div>

        <div className="metric-tile bad">
          <div className="metric-tile-header">
            <span className="metric-key">Nợ quá hạn</span>
          </div>
          <span className="metric-val">{fm(overKH + overTV)}</span>
          <span className="metric-note">Khách {mil(overKH)} · đội ngũ {mil(overTV)}</span>
        </div>

        <div className="metric-tile">
          <div className="metric-tile-header">
            <span className="metric-key">Chi phí vận hành T10</span>
          </div>
          <span className="metric-val">{fm(o10)}</span>
          <span className="metric-note">T9: {mil(o9)} · tính đến {dmy(TODAY)}</span>
        </div>
      </div>

      {/* Grid: Issues & Comparison */}
      <div className="grid-2col">
        {/* Section 1: Issues list */}
        <section className="card-box">
          <h2 className="card-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} style={{ color: issues.length ? 'var(--warn)' : 'var(--good)' }} />
              <span>Việc cần xử lý</span>
            </div>
            <small>{issues.length} mục</small>
          </h2>

          <ul className="issues-list">
            {issues.length > 0 ? (
              issues.map((item, idx) => (
                <li key={idx} className={`issue-item ${item.lvl}`}>
                  <i className="issue-dot" />
                  <span style={{ fontSize: '13px', lineHeight: 1.4 }}>{item.text}</span>
                  <button
                    type="button"
                    className="btn xs"
                    onClick={() => setView(item.go, item.f)}
                  >
                    <span>Xem</span>
                    <ArrowUpRight size={13} />
                  </button>
                </li>
              ))
            ) : (
              <li className="issue-item good">
                <CheckCircle2 size={16} style={{ color: 'var(--good)' }} />
                <span>Không còn việc tồn đọng</span>
                <span />
              </li>
            )}
          </ul>
        </section>

        {/* Section 2: Old vs Sổ gốc comparison */}
        <section className="card-box">
          <h2 className="card-title">
            <span>Báo cáo cũ so với sổ gốc</span>
            <small>cùng dữ liệu, khác cách tính</small>
          </h2>

          <div className="vs-grid">
            <div className="vs-cell vs-header">Chỉ tiêu</div>
            <div className="vs-cell vs-header">File cũ</div>
            <div className="vs-cell vs-header">Sổ gốc</div>

            <div className="vs-cell">Phải thu khách (sau chiết khấu)</div>
            <div className="vs-cell vs-old">{fmt(OLD.receivableKH)}</div>
            <div className="vs-cell vs-new">{fmt(recvKH)}</div>

            <div className="vs-cell">Nợ khách quá hạn</div>
            <div className="vs-cell vs-old">{fmt(OLD.overdueKH)}</div>
            <div className="vs-cell vs-new">{fmt(overKH)}</div>

            <div className="vs-cell">Chi lương, thưởng tháng 10</div>
            <div className="vs-cell vs-old">{fmt(OLD.wageOct)}</div>
            <div className="vs-cell vs-new">{fmt(wage10)}</div>

            <div className="vs-cell">"Chi phí khác" tháng 8</div>
            <div className="vs-cell vs-old">{fmt(OLD.otherAug)}</div>
            <div className="vs-cell vs-new">{fmt(other8)}</div>

            <div className="vs-cell">Tồn sổ quỹ cuối tháng 10</div>
            <div className="vs-cell vs-old">{fm(OLD.fundOct)}</div>
            <div className="vs-cell vs-new">{fm(fundEndOct)}</div>
          </div>

          <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)', lineHeight: 1.45 }}>
            File cũ: tổng công nợ bỏ sót 2 dòng; tổng hợp T10 trỏ sai dòng; T8 tính hoàn ứng 33,55 tr và phí hợp đồng khách vào chi phí; T10 không mang số dư T9 sang.
          </p>
        </section>
      </div>

      {/* Section 3: Cost Trend Table */}
      <section className="card-box">
        <h2 className="card-title">
          <span>Chi phí vận hành theo nhóm</span>
          <small>tháng 8 → 10/2026, triệu đồng</small>
        </h2>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nhóm chi phí</th>
                {monthsTrend.map((m) => (
                  <th key={m} className="num">{monthLabel(m).replace('Tháng ', 'T')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(CATS).map(([k, label]) => (
                <tr key={k}>
                  <td>{label}</td>
                  {trendData.map((d, i) => (
                    <td key={i} className="num">
                      {((d[k] || 0) / 1e6).toLocaleString('vi-VN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="total">
                <td>Tổng chi phí vận hành</td>
                {trendData.map((d, i) => (
                  <td key={i} className="num">
                    {(Object.values(d).reduce((a, b) => a + b, 0) / 1e6).toLocaleString('vi-VN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

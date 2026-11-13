import React from 'react';
import { fmt } from '../../../utils/formatters';
import { BarChart3, ArrowUpRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface ReportOpexVsBudgetCardProps {
  categoryNames: Record<string, string>;
  opexActual: Record<string, number>;
  monthBudget: Record<string, number>;
  disabledCategories?: string[];
  onNavigateBudget: () => void;
}

export const ReportOpexVsBudgetCard: React.FC<ReportOpexVsBudgetCardProps> = ({
  categoryNames,
  opexActual,
  monthBudget,
  disabledCategories = [],
  onNavigateBudget
}) => {
  const entries = Object.entries(categoryNames);
  const totalActual = Object.values(opexActual).reduce((a, b) => a + b, 0);
  const totalBudget = entries.reduce((sum, [k]) => {
    if (disabledCategories.includes(k)) return sum;
    return sum + (Number(monthBudget[k]) || 0);
  }, 0);
  const totalVariance = totalBudget - totalActual;

  return (
    <section className="card-box">
      <div className="card-header-flex">
        <div className="card-title-group">
          <div className="action-title-icon opex-icon">
            <BarChart3 size={18} color="#0d9488" />
          </div>
          <div>
            <h2 className="card-title" style={{ margin: 0 }}>
              Kiểm Soát Chi Phí Vận Hành (OPEX) So Với Ngân Sách
            </h2>
            <p className="card-subtitle-text">
              Đối chiếu thực chi Sổ Cái với định mức ngân sách tháng (Độ lệch chỉ tính khi vượt định mức)
            </p>
          </div>
        </div>

        <button type="button" className="btn xs" onClick={onNavigateBudget}>
          <span>Quản lý định mức Cost</span>
          <ArrowUpRight size={13} />
        </button>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Danh mục chi phí</th>
              <th className="num">Định mức (đ)</th>
              <th className="num">Thực chi (đ)</th>
              <th style={{ width: '220px' }}>Tiến độ sử dụng</th>
              <th className="num">Tỷ trọng OPEX</th>
              <th className="num">Độ lệch (Vượt trần)</th>
              <th>Đánh giá</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([code, label]) => {
              const isDisabled = disabledCategories.includes(code);
              const bud = isDisabled ? 0 : Number(monthBudget[code]) || 0;
              const actual = opexActual[code] || 0;
              const variance = bud - actual;
              const isOver = bud > 0 ? actual > bud : actual > 0;
              const usagePct = bud > 0 ? Math.round((actual / bud) * 100) : actual > 0 ? 100 : 0;
              const sharePct = totalActual > 0 ? ((actual / totalActual) * 100).toFixed(1) : '0.0';

              const barColor = isOver
                ? 'var(--bad)'
                : usagePct >= 85
                  ? 'var(--ochre)'
                  : 'var(--teal)';

              return (
                <tr key={code} style={{ opacity: isDisabled ? 0.55 : 1 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="chip ochre" style={{ fontWeight: 700 }}>{code}</span>
                      <span style={{ fontWeight: 600 }}>{label}</span>
                      {isDisabled && <span className="chip">Tạm tắt</span>}
                    </div>
                  </td>
                  <td className="num" style={{ color: bud > 0 ? 'var(--ink)' : 'var(--muted)' }}>
                    {bud > 0 ? fmt(bud) : '—'}
                  </td>
                  <td className="num" style={{ fontWeight: actual > 0 ? 700 : 400, color: isOver ? 'var(--bad)' : 'var(--ink)' }}>
                    {actual > 0 ? fmt(actual) : '0'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '7px', background: 'var(--soft)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(100, usagePct)}%`,
                            height: '100%',
                            background: barColor,
                            borderRadius: '4px',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                      <span style={{ fontFamily: 'var(--f-num)', fontSize: '11.5px', fontWeight: 600, minWidth: '38px', textAlign: 'right', color: isOver ? 'var(--bad)' : 'var(--muted)' }}>
                        {bud > 0 ? `${usagePct}%` : '—'}
                      </span>
                    </div>
                  </td>
                  <td className="num" style={{ color: 'var(--muted)' }}>
                    {sharePct}%
                  </td>
                  <td className="num" style={{ fontWeight: 700, color: variance < 0 ? 'var(--bad)' : 'var(--muted)' }}>
                    {variance < 0 ? `${fmt(variance)} đ` : '—'}
                  </td>
                  <td>
                    {isDisabled ? (
                      <span className="chip">Đang tạm tắt</span>
                    ) : isOver ? (
                      <span className="chip bad">
                        <XCircle size={12} />
                        <span>{bud > 0 ? 'Vượt định mức' : 'Chi ngoài định mức'}</span>
                      </span>
                    ) : usagePct >= 85 ? (
                      <span className="chip warn">
                        <AlertTriangle size={12} />
                        <span>Sắp chạm trần</span>
                      </span>
                    ) : (
                      <span className="chip good">
                        <CheckCircle2 size={12} />
                        <span>An toàn</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="total">
              <td>Tổng cộng Chi phí vận hành (OPEX)</td>
              <td className="num">{fmt(totalBudget)} đ</td>
              <td className="num" style={{ color: totalVariance < 0 ? 'var(--bad)' : 'var(--ink)' }}>
                {fmt(totalActual)} đ
              </td>
              <td>
                <span style={{ fontFamily: 'var(--f-num)', fontSize: '12px', color: 'var(--muted)' }}>
                  {totalBudget > 0 ? `Thực hiện ${Math.round((totalActual / totalBudget) * 100)}%` : '—'}
                </span>
              </td>
              <td className="num">100%</td>
              <td className="num" style={{ color: totalVariance < 0 ? 'var(--bad)' : 'var(--muted)' }}>
                {totalVariance < 0 ? `${fmt(totalVariance)} đ` : '—'}
              </td>
              <td>
                {totalVariance < 0 ? (
                  <span className="chip bad">Vượt ngân sách</span>
                ) : (
                  <span className="chip good">Trong ngân sách</span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};

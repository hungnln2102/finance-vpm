import React from 'react';
import { Target, PlusCircle } from 'lucide-react';
import { CATS } from '../../../data/constants';
import { fmt, monthLabel } from '../../../utils/formatters';

interface BudgetVarianceTableProps {
  month: string;
  allCategories: string[];
  monthBudget: Record<string, number>;
  actualByCat: Record<string, number>;
  totalBudget: number;
  totalActual: number;
  totalVariance: number;
  isOverBudget: boolean;
  canEditBudget: boolean;
  onUpdateBudget: (month: string, category: string, amount: number) => void;
  onOpenAdjustModal: () => void;
}

export const BudgetVarianceTable: React.FC<BudgetVarianceTableProps> = ({
  month,
  allCategories,
  monthBudget,
  actualByCat,
  totalBudget,
  totalActual,
  totalVariance,
  isOverBudget,
  canEditBudget,
  onUpdateBudget,
  onOpenAdjustModal,
}) => {
  return (
    <section className="card-box">
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <div>
          <h2 className="card-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} style={{ color: 'var(--teal)' }} />
              <span>Bảng Kiểm Soát Ngân Sách & Phân Tích Độ Lệch (Variance Analysis)</span>
            </div>
            <small>{monthLabel(month)} · Mọi số liệu tự động đồng bộ realtime từ chứng từ Sổ Cái chính thức</small>
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn primary xs"
            onClick={onOpenAdjustModal}
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <PlusCircle size={13} />
            <span>Yêu cầu điều chỉnh cost</span>
          </button>
        </div>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Danh mục Chi phí (Opex)</th>
              <th className="num">Định mức Ngân sách</th>
              <th className="num">Thực chi Sổ Cái</th>
              <th className="num">Độ lệch (Variance)</th>
              <th className="num">Tỷ lệ</th>
              <th>Đánh giá kiểm soát</th>
              {canEditBudget && <th style={{ textAlign: 'right' }}>Thiết lập</th>}
            </tr>
          </thead>
          <tbody>
            {allCategories.map((c) => {
              const b = monthBudget[c] || 0;
              const a = actualByCat[c] || 0;
              const variance = b - a;
              const pct = b > 0 ? Math.round((a / b) * 100) : a > 0 ? 999 : 0;
              const isOver = a > b && b > 0;
              const isNear = pct >= 85 && !isOver;

              return (
                <tr key={c}>
                  <td style={{ fontFamily: 'var(--f-num)', fontWeight: 600 }}>{c}</td>
                  <td style={{ fontWeight: 600 }}>{CATS[c]}</td>
                  <td className="num" style={{ fontWeight: 700 }}>
                    {b > 0 ? `${fmt(b)} đ` : <span style={{ color: 'var(--muted)' }}>Chưa giao</span>}
                  </td>
                  <td className="num" style={{ fontWeight: 700, color: isOver ? 'var(--bad)' : undefined }}>
                    {a > 0 ? `${fmt(a)} đ` : <span style={{ color: 'var(--muted)' }}>0 đ</span>}
                  </td>
                  <td className="num" style={{ fontWeight: 700, color: variance >= 0 ? 'var(--good)' : 'var(--bad)' }}>
                    {b > 0 ? `${variance >= 0 ? '+' : ''}${fmt(variance)} đ` : '—'}
                  </td>
                  <td className="num" style={{ fontFamily: 'var(--f-num)' }}>
                    {b > 0 ? `${pct}%` : '—'}
                  </td>
                  <td>
                    {b === 0 && a === 0 && <span className="chip">Chưa phát sinh</span>}
                    {b === 0 && a > 0 && <span className="chip bad">Chi ngoài định mức</span>}
                    {b > 0 && !isOver && !isNear && <span className="chip good">Trong định mức</span>}
                    {b > 0 && isNear && <span className="chip warn">Cảnh báo (&gt;85%)</span>}
                    {b > 0 && isOver && <span className="chip bad">Vượt định mức</span>}
                  </td>
                  {canEditBudget && (
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn xs"
                        onClick={() => {
                          const val = prompt(`Nhập ngân sách mới cho ${CATS[c]}:`, String(b));
                          if (val !== null && !isNaN(Number(val))) {
                            onUpdateBudget(month, c, Number(val));
                          }
                        }}
                      >
                        Sửa
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: 'var(--soft)', fontWeight: 700 }}>
              <td colSpan={2}>TỔNG CỘNG OPEX {monthLabel(month).toUpperCase()}</td>
              <td className="num">{fmt(totalBudget)} đ</td>
              <td className="num" style={{ color: isOverBudget ? 'var(--bad)' : undefined }}>{fmt(totalActual)} đ</td>
              <td className="num" style={{ color: totalVariance >= 0 ? 'var(--good)' : 'var(--bad)' }}>
                {totalVariance >= 0 ? '+' : ''}{fmt(totalVariance)} đ
              </td>
              <td className="num">{totalBudget > 0 ? `${Math.round((totalActual / totalBudget) * 100)}%` : '—'}</td>
              <td colSpan={canEditBudget ? 2 : 1}>
                {totalVariance >= 0 ? (
                  <span className="chip good">Đạt chỉ tiêu ngân sách</span>
                ) : (
                  <span className="chip bad">Vượt tổng định mức chi</span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};

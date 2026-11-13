import React from 'react';
import { Target, PlusCircle, CheckCircle2, AlertTriangle, AlertCircle, Edit3, XCircle, Power, PowerOff } from 'lucide-react';
import { fmt, monthLabel } from '../../../utils/formatters';

interface BudgetVarianceTableProps {
  month: string;
  allCategories: string[];
  categoryNames: Record<string, string>;
  monthBudget: Record<string, number>;
  actualByCat: Record<string, number>;
  totalBudget: number;
  totalActual: number;
  totalVariance: number;
  isOverBudget: boolean;
  canEditBudget: boolean;
  disabledCategories?: string[];
  onToggleCategory?: (category: string) => void;
  onUpdateBudget: (month: string, category: string, amount: number) => void;
  onOpenCreateModal: () => void;
  onOpenAdjustModal: (category?: string) => void;
}

export const BudgetVarianceTable: React.FC<BudgetVarianceTableProps> = ({
  month,
  allCategories,
  categoryNames,
  monthBudget,
  actualByCat,
  totalBudget,
  totalActual,
  totalVariance,
  isOverBudget,
  canEditBudget,
  disabledCategories = [],
  onToggleCategory,
  onOpenCreateModal,
  onOpenAdjustModal,
}) => {
  return (
    <section className="card-box" style={{ padding: '20px 22px' }}>
      {/* Header Bảng */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h2 className="card-title" style={{ margin: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} style={{ color: 'var(--teal)' }} />
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
                Bảng Kiểm Soát Ngân Sách & Phân Tích Độ Lệch (Variance Analysis)
              </span>
            </div>
            <small style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px', display: 'block' }}>
              {monthLabel(month)} · Mọi số liệu tự động đồng bộ realtime từ chứng từ Sổ Cái chính thức
            </small>
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn primary xs"
            onClick={onOpenCreateModal}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 14px', fontWeight: 600 }}
          >
            <PlusCircle size={14} />
            <span>Thêm cost</span>
          </button>
        </div>
      </div>

      {/* Bảng Chi Tiết */}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th style={{ width: '90px' }}>Mã</th>
              <th>Danh mục Chi phí (Opex)</th>
              <th className="num" style={{ width: '160px' }}>Định mức Ngân sách</th>
              <th className="num" style={{ width: '160px' }}>Thực chi Sổ Cái</th>
              <th className="num" style={{ width: '160px' }}>Độ lệch (Variance)</th>
              <th style={{ width: '180px' }}>Đánh giá kiểm soát</th>
              <th style={{ textAlign: 'right', width: '170px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {allCategories.map((c) => {
              const b = monthBudget[c] || 0;
              const a = actualByCat[c] || 0;
              const variance = b - a;
              const pct = b > 0 ? Math.round((a / b) * 100) : a > 0 ? 100 : 0;
              const isOver = a > b && b > 0;
              const isNear = pct >= 85 && !isOver;
              const isUnbudgeted = b === 0 && a > 0;
              const isOff = disabledCategories.includes(c);

              return (
                <tr 
                  key={c}
                  style={{
                    opacity: isOff ? 0.6 : 1,
                    backgroundColor: isOff ? 'rgba(0,0,0,0.1)' : undefined,
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  {/* Mã */}
                  <td>
                    <span 
                      style={{
                        fontFamily: 'var(--f-num)',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: isOff ? 'var(--line)' : 'var(--soft)',
                        color: isOff ? 'var(--muted)' : 'var(--ink)'
                      }}
                    >
                      {c}
                    </span>
                  </td>

                  {/* Tên danh mục */}
                  <td style={{ fontWeight: 600, color: isOff ? 'var(--muted)' : 'var(--ink)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{categoryNames[c] || c}</span>
                      {isOff && (
                        <span style={{ fontSize: '10.5px', color: 'var(--bad)', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', background: 'rgba(239, 68, 68, 0.12)' }}>
                          TẠM TẮT
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Định mức */}
                  <td className="num" style={{ fontWeight: 700, fontFamily: 'var(--f-num)' }}>
                    {b > 0 ? `${fmt(b)} đ` : <span style={{ color: 'var(--muted)', fontWeight: 500 }}>Chưa giao</span>}
                  </td>

                  {/* Thực chi */}
                  <td 
                    className="num" 
                    style={{ 
                      fontWeight: 700, 
                      fontFamily: 'var(--f-num)',
                      color: isOver || isUnbudgeted ? 'var(--bad)' : a > 0 ? 'var(--ink)' : 'var(--muted)' 
                    }}
                  >
                    {a > 0 ? `${fmt(a)} đ` : '0 đ'}
                  </td>

                  {/* Độ lệch (Chỉ tính và hiển thị khi âm / vượt định mức) */}
                  <td 
                    className="num" 
                    style={{ 
                      fontWeight: 700, 
                      fontFamily: 'var(--f-num)',
                      color: variance < 0 ? 'var(--bad)' : 'var(--muted)' 
                    }}
                  >
                    {variance < 0 ? `${fmt(variance)} đ` : '—'}
                  </td>

                  {/* Đánh giá kiểm soát */}
                  <td>
                    {isOff ? (
                      <span className="chip" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--bad)', border: '1px solid rgba(239, 68, 68, 0.25)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <PowerOff size={11} /> Tạm tắt chi phí
                      </span>
                    ) : (
                      <>
                        {b === 0 && a === 0 && (
                          <span className="chip" style={{ opacity: 0.7 }}>Chưa phát sinh</span>
                        )}
                        {isUnbudgeted && (
                          <span className="chip bad" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <XCircle size={11} /> Chi ngoài định mức
                          </span>
                        )}
                        {b > 0 && !isOver && !isNear && (
                          <span className="chip good" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={11} /> Trong định mức
                          </span>
                        )}
                        {b > 0 && isNear && (
                          <span className="chip warn" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={11} /> Cảnh báo (&gt;85%)
                          </span>
                        )}
                        {b > 0 && isOver && (
                          <span className="chip bad" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle size={11} /> Vượt định mức
                          </span>
                        )}
                      </>
                    )}
                  </td>

                  {/* Cột Thao tác: Sửa, On/Off */}
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn xs"
                        onClick={() => onOpenAdjustModal(c)}
                        title={`Lập phiếu điều chỉnh ngân sách cho ${categoryNames[c] || c}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px' }}
                      >
                        <Edit3 size={11} />
                        <span>Sửa</span>
                      </button>

                      {onToggleCategory && (
                        <button
                          type="button"
                          className="btn xs"
                          onClick={() => onToggleCategory(c)}
                        title={isOff ? `Bấm để BẬT lại chi phí ${categoryNames[c] || c}` : `Bấm để TẠM TẮT chi phí ${categoryNames[c] || c}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            fontWeight: 700,
                            fontSize: '11px',
                            backgroundColor: isOff ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                            borderColor: isOff ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                            color: isOff ? 'var(--bad)' : 'var(--good)',
                            cursor: 'pointer'
                          }}
                        >
                          {isOff ? <PowerOff size={11} /> : <Power size={11} />}
                          <span>{isOff ? 'OFF' : 'ON'}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: 'var(--soft)', fontWeight: 700, borderTop: '2px solid var(--line)' }}>
              <td colSpan={2} style={{ padding: '12px 10px' }}>
                TỔNG CỘNG OPEX {monthLabel(month).toUpperCase()}
              </td>
              <td className="num" style={{ fontFamily: 'var(--f-num)', padding: '12px 10px' }}>
                {fmt(totalBudget)} đ
              </td>
              <td 
                className="num" 
                style={{ 
                  fontFamily: 'var(--f-num)', 
                  padding: '12px 10px',
                  color: isOverBudget ? 'var(--bad)' : 'var(--ink)' 
                }}
              >
                {fmt(totalActual)} đ
              </td>
              <td 
                className="num" 
                style={{ 
                  fontFamily: 'var(--f-num)', 
                  padding: '12px 10px',
                  color: totalVariance < 0 ? 'var(--bad)' : 'var(--muted)' 
                }}
              >
                {totalVariance < 0 ? `${fmt(totalVariance)} đ` : '—'}
              </td>
              <td style={{ padding: '12px 10px' }}>
                {totalVariance >= 0 ? (
                  <span className="chip good" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={11} /> Đạt chỉ tiêu ngân sách
                  </span>
                ) : (
                  <span className="chip bad" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={11} /> Vượt tổng định mức chi
                  </span>
                )}
              </td>
              <td style={{ padding: '12px 10px', textAlign: 'right', color: 'var(--muted)', fontSize: '11px' }}>
                {allCategories.filter(c => !disabledCategories.includes(c)).length} Bật · {disabledCategories.length} Tắt
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATS } from '../../data/constants';
import { fmt, mil, mon, monthLabel } from '../../utils/formatters';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  PlusCircle, 
  ShieldCheck, 
  Clock, 
  Layers, 
  ArrowRight,
  PieChart
} from 'lucide-react';

export const BudgetControlView: React.FC = () => {
  const { state, ui, canDo, updateBudget, addCostAdjustment, approveCostAdjustment } = useApp();
  const m = ui.month;

  const monthBudget = state.budget[m] || {};
  
  // Calculate actual OPEX spend in the selected month from posted transactions
  const opexTx = state.tx.filter(
    (t) => mon(t.date) === m && t.dir === 'out' && t.type === 'OPEX' && (t.status === 'posted' || t.status === 'approved')
  );

  const actualByCat: Record<string, number> = {};
  for (const t of opexTx) {
    const c = t.cat || 'KHAC';
    actualByCat[c] = (actualByCat[c] || 0) + t.amt;
  }

  const allCategories = Object.keys(CATS);
  const totalBudget = allCategories.reduce((s, c) => s + (monthBudget[c] || 0), 0);
  const totalActual = allCategories.reduce((s, c) => s + (actualByCat[c] || 0), 0);
  const totalVariance = totalBudget - totalActual;
  const isOverBudget = totalActual > totalBudget && totalBudget > 0;

  // Form State for Cost Adjustment
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustCat, setAdjustCat] = useState('SUKIEN');
  const [newBudget, setNewBudget] = useState<number | ''>('');
  const [reason, setReason] = useState('');

  const currentBudgetForCat = monthBudget[adjustCat] || 0;

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBudget === '' || Number(newBudget) < 0) return;

    addCostAdjustment({
      month: m,
      category: adjustCat,
      oldBudget: currentBudgetForCat,
      newBudget: Number(newBudget),
      reason: reason.trim()
    });

    setNewBudget('');
    setReason('');
    setShowAdjustModal(false);
  };

  const monthAdjustments = (state.costAdjustments || []).filter((a) => a.month === m);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* KPI Cards Summary */}
      <div className="kpi-grid">
        <div className="card-box kpi-card">
          <div className="kpi-label">Tổng Định Mức Ngân Sách</div>
          <div className="kpi-val" style={{ color: 'var(--teal)' }}>{mil(totalBudget)}</div>
          <div className="kpi-sub">Kế hoạch Opex giao {monthLabel(m)}</div>
        </div>
        <div className="card-box kpi-card">
          <div className="kpi-label">Thực Chi Thực Tế (Sổ Cái)</div>
          <div className="kpi-val" style={{ color: isOverBudget ? 'var(--bad)' : 'var(--ochre)' }}>
            {mil(totalActual)}
          </div>
          <div className="kpi-sub">{opexTx.length} khoản chi Opex đã chốt Sổ Cái</div>
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

      {/* Main Budget Variance Table */}
      <section className="card-box">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div>
            <h2 className="card-title">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} style={{ color: 'var(--teal)' }} />
                <span>Bảng Kiểm Soát Ngân Sách & Phân Tích Độ Lệch (Variance Analysis)</span>
              </div>
              <small>{monthLabel(m)} · Mọi số liệu tự động đồng bộ realtime từ chứng từ Sổ Cái chính thức</small>
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn primary xs"
              onClick={() => setShowAdjustModal(true)}
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
                {canDo('budget') && <th style={{ textAlign: 'right' }}>Thiết lập</th>}
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
                    {canDo('budget') && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn xs"
                          onClick={() => {
                            const val = prompt(`Nhập ngân sách mới cho ${CATS[c]}:`, String(b));
                            if (val !== null && !isNaN(Number(val))) {
                              updateBudget(m, c, Number(val));
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
                <td colSpan={2}>TỔNG CỘNG OPEX {monthLabel(m).toUpperCase()}</td>
                <td className="num">{fmt(totalBudget)} đ</td>
                <td className="num" style={{ color: isOverBudget ? 'var(--bad)' : undefined }}>{fmt(totalActual)} đ</td>
                <td className="num" style={{ color: totalVariance >= 0 ? 'var(--good)' : 'var(--bad)' }}>
                  {totalVariance >= 0 ? '+' : ''}{fmt(totalVariance)} đ
                </td>
                <td className="num">{totalBudget > 0 ? `${Math.round((totalActual / totalBudget) * 100)}%` : '—'}</td>
                <td colSpan={canDo('budget') ? 2 : 1}>
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

      {/* Cost Adjustments Log & Master Approval */}
      <section className="card-box">
        <h2 className="card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} style={{ color: 'var(--ochre)' }} />
            <span>Phiếu Yêu Cầu & Lịch Sử Điều Chỉnh Cost Trong Tháng</span>
          </div>
          <small>Quy trình kiểm soát thay đổi định mức qua Master phê duyệt</small>
        </h2>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Mã phiếu</th>
                <th>Kỳ</th>
                <th>Danh mục Opex</th>
                <th className="num">Định mức cũ</th>
                <th className="num">Định mức mới</th>
                <th>Lý do điều chỉnh</th>
                <th>Người duyệt</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {monthAdjustments.map((adj) => (
                <tr key={adj.id}>
                  <td style={{ fontFamily: 'var(--f-num)', fontWeight: 600 }}>{adj.id}</td>
                  <td>{monthLabel(adj.month)}</td>
                  <td><b>{CATS[adj.category] || adj.category}</b></td>
                  <td className="num">{fmt(adj.oldBudget)} đ</td>
                  <td className="num" style={{ fontWeight: 700, color: 'var(--teal)' }}>{fmt(adj.newBudget)} đ</td>
                  <td>{adj.reason}</td>
                  <td>{adj.approvedBy || '—'}</td>
                  <td>
                    {adj.status === 'approved' ? (
                      <span className="chip good" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={11} /> Đã duyệt
                      </span>
                    ) : (
                      <span className="chip warn" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={11} /> Chờ Master
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {(ui.role === 'master' || ui.role === 'giau') && adj.status === 'pending' && (
                      <button
                        type="button"
                        className="btn xs primary"
                        onClick={() => approveCostAdjustment(adj.id)}
                        style={{ background: 'var(--good)', borderColor: 'var(--good)' }}
                      >
                        <ShieldCheck size={11} /> Duyệt cost
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {monthAdjustments.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                    Chưa có phiếu điều chỉnh cost nào trong {monthLabel(m)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Yêu Cầu Điều Chỉnh Cost */}
      {showAdjustModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card-box" style={{ width: '520px', maxWidth: '92vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} style={{ color: 'var(--teal)' }} />
                <span>Lập Phiếu Điều Chỉnh Cost {monthLabel(m)}</span>
              </h3>
              <button type="button" className="btn xs" onClick={() => setShowAdjustModal(false)}>
                Đóng
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="form-grid">
              <div className="form-group wide">
                <label>Danh mục chi phí Opex</label>
                <select value={adjustCat} onChange={(e) => setAdjustCat(e.target.value)}>
                  {Object.entries(CATS).map(([k, label]) => (
                    <option key={k} value={k}>{label} ({k})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Định mức hiện tại</label>
                <input
                  type="text"
                  disabled
                  value={`${fmt(currentBudgetForCat)} đ`}
                  style={{ background: 'var(--soft)', fontWeight: 600 }}
                />
              </div>

              <div className="form-group">
                <label>Định mức mới đề xuất (đ)</label>
                <input
                  type="number"
                  min="0"
                  step="500000"
                  required
                  placeholder="vd 8000000"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>

              <div className="form-group wide">
                <label>Lý do và căn cứ điều chỉnh cost</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Giải trình lý do tăng/giảm định mức ngân sách so với kế hoạch ban đầu..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn" onClick={() => setShowAdjustModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn primary">
                  Gửi phiếu điều chỉnh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

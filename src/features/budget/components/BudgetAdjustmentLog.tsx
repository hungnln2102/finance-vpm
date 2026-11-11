import React from 'react';
import { Layers, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { CATS } from '../../../data/constants';
import { fmt, monthLabel } from '../../../utils/formatters';
import { CostAdjustment, Role } from '../../../types';

interface BudgetAdjustmentLogProps {
  month: string;
  adjustments: CostAdjustment[];
  uiRole: Role;
  onApprove: (id: string) => void;
}

export const BudgetAdjustmentLog: React.FC<BudgetAdjustmentLogProps> = ({
  month,
  adjustments,
  uiRole,
  onApprove,
}) => {
  return (
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
            {adjustments.map((adj) => (
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
                  {(uiRole === 'master' || uiRole === 'giau') && adj.status === 'pending' && (
                    <button
                      type="button"
                      className="btn xs primary"
                      onClick={() => onApprove(adj.id)}
                      style={{ background: 'var(--good)', borderColor: 'var(--good)' }}
                    >
                      <ShieldCheck size={11} /> Duyệt cost
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {adjustments.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                  Chưa có phiếu điều chỉnh cost nào trong {monthLabel(month)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

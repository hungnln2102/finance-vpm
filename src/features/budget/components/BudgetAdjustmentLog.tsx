import React from 'react';
import { Layers, CheckCircle2, Clock, ShieldCheck, FileCheck, XCircle } from 'lucide-react';
import { CATS } from '../../../data/constants';
import { fmt, monthLabel } from '../../../utils/formatters';
import { CostAdjustment, Role } from '../../../types';

interface BudgetAdjustmentLogProps {
  month: string;
  adjustments: CostAdjustment[];
  uiRole: Role;
  onApprove: (id: string) => void;
  onReject?: (id: string) => void;
}

export const BudgetAdjustmentLog: React.FC<BudgetAdjustmentLogProps> = ({
  month,
  adjustments,
  uiRole,
  onApprove,
  onReject,
}) => {
  return (
    <section className="card-box" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="card-title" style={{ margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} style={{ color: 'var(--ochre)' }} />
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
              Phiếu Yêu Cầu & Lịch Sử Điều Chỉnh Cost Trong Tháng
            </span>
            <span style={{ fontSize: '11px', color: 'var(--ochre)', backgroundColor: 'var(--ochre-soft)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              {adjustments.length} phiếu
            </span>
          </div>
          <small style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px', display: 'block' }}>
            Quy trình kiểm soát phê duyệt hoặc từ chối thay đổi định mức qua Master theo chuẩn ACID
          </small>
        </h2>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th style={{ width: '130px' }}>Mã phiếu</th>
              <th style={{ width: '100px' }}>Kỳ</th>
              <th style={{ width: '180px' }}>Danh mục Opex</th>
              <th className="num" style={{ width: '140px' }}>Định mức cũ</th>
              <th className="num" style={{ width: '140px' }}>Định mức mới</th>
              <th>Lý do điều chỉnh</th>
              <th style={{ width: '130px' }}>Người duyệt</th>
              <th style={{ width: '130px' }}>Trạng thái</th>
              <th style={{ textAlign: 'right', width: '180px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {adjustments.map((adj) => (
              <tr key={adj.id}>
                <td style={{ fontFamily: 'var(--f-num)', fontWeight: 700, color: 'var(--teal)' }}>
                  {adj.id}
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>{monthLabel(adj.month)}</td>
                <td>
                  <b>{CATS[adj.category] || adj.category}</b>
                </td>
                <td className="num" style={{ fontFamily: 'var(--f-num)', color: 'var(--muted)' }}>
                  {fmt(adj.oldBudget)} đ
                </td>
                <td className="num" style={{ fontFamily: 'var(--f-num)', fontWeight: 700, color: 'var(--teal)' }}>
                  {fmt(adj.newBudget)} đ
                </td>
                <td style={{ color: 'var(--ink)' }}>{adj.reason}</td>
                <td style={{ color: adj.approvedBy ? 'var(--ink)' : 'var(--muted)' }}>
                  {adj.approvedBy || '—'}
                </td>
                <td>
                  {adj.status === 'approved' ? (
                    <span className="chip good" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={11} /> Đã duyệt
                    </span>
                  ) : adj.status === 'rejected' ? (
                    <span className="chip bad" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <XCircle size={11} /> Đã từ chối
                    </span>
                  ) : (
                    <span className="chip warn" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} /> Chờ Master
                    </span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {adj.status === 'pending' ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn xs primary"
                        onClick={() => onApprove(adj.id)}
                        style={{ background: 'var(--good)', borderColor: 'var(--good)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                        title="Chấp thuận định mức mới"
                      >
                        <ShieldCheck size={12} /> Phê duyệt
                      </button>
                      {onReject && (
                        <button
                          type="button"
                          className="btn xs"
                          onClick={() => onReject(adj.id)}
                          style={{ 
                            background: 'rgba(239, 68, 68, 0.12)', 
                            borderColor: 'rgba(239, 68, 68, 0.35)', 
                            color: 'var(--bad)', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '4px', 
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          title="Từ chối yêu cầu điều chỉnh cost này"
                        >
                          <XCircle size={12} /> Từ chối
                        </button>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {adj.status === 'approved' ? 'Đã hoàn tất' : 'Đã kết thúc'}
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {adjustments.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <FileCheck size={24} style={{ color: 'var(--teal)', opacity: 0.6 }} />
                    <span style={{ fontSize: '13px' }}>Chưa có phiếu điều chỉnh cost nào trong {monthLabel(month)}</span>
                    <span style={{ fontSize: '11px', opacity: 0.7 }}>Mọi thay đổi định mức Opex đều sẽ được ghi nhận và lưu trữ kiểm toán tại đây.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

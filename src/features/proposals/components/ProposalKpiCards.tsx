import React from 'react';
import { Mail } from 'lucide-react';
import { mil } from '../../../utils/formatters';
import { Proposal } from '../../../types';

interface ProposalKpiCardsProps {
  proposals: Proposal[];
}

export const ProposalKpiCards: React.FC<ProposalKpiCardsProps> = ({ proposals }) => {
  const totalCount = proposals.length;
  const totalProposedAmount = proposals.reduce((s, p) => s + p.amount, 0);
  const approvedAmount = proposals.filter((p) => p.status === 'approved').reduce((s, p) => s + p.amount, 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px' }}>
      <div className="card-box kpi-card">
        <div className="kpi-label">Tổng số Hồ sơ Đệ trình</div>
        <div className="kpi-val" style={{ color: 'var(--teal)' }}>{totalCount}</div>
        <div className="kpi-sub">Kế hoạch các phòng ban gửi duyệt</div>
      </div>
      <div className="card-box kpi-card">
        <div className="kpi-label">Tổng Ngân sách Đề xuất</div>
        <div className="kpi-val" style={{ color: 'var(--ochre)' }}>{mil(totalProposedAmount)}</div>
        <div className="kpi-sub">Tổng dự toán tất cả hồ sơ</div>
      </div>
      <div className="card-box kpi-card">
        <div className="kpi-label">Ngân sách Đã Master Duyệt</div>
        <div className="kpi-val" style={{ color: 'var(--good)' }}>{mil(approvedAmount)}</div>
        <div className="kpi-sub">Đã cấp phép chi thực tế</div>
      </div>
      <div className="card-box kpi-card">
        <div className="kpi-label">Cổng Email Tự Động</div>
        <div className="kpi-val" style={{ color: '#f97316', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Mail size={20} /> Resend Ready
        </div>
        <div className="kpi-sub">Outbound CC nhân viên & Inbound Threading</div>
      </div>
    </div>
  );
};

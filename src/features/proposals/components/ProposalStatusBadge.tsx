import React from 'react';
import { Proposal } from '../../../types';
import { ShieldCheck, Sparkles, Clock, XCircle } from 'lucide-react';

interface ProposalStatusBadgeProps {
  status: Proposal['status'];
}

export const ProposalStatusBadge: React.FC<ProposalStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'approved':
      return (
        <span className="chip good" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
          <ShieldCheck size={12} /> Đã phê duyệt
        </span>
      );
    case 'pending_master':
      return (
        <span className="chip" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
          <Sparkles size={11} /> Chờ Master duyệt
        </span>
      );
    case 'pending_admin':
      return (
        <span className="chip warn" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          <Clock size={11} /> Chờ Admin xem xét
        </span>
      );
    case 'rejected':
      return (
        <span className="chip bad" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          <XCircle size={11} /> Từ chối
        </span>
      );
    default:
      return <span className="chip">Bản nháp</span>;
  }
};

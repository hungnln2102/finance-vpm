import React, { useState } from 'react';
import { useApp } from './../../context/useApp';
import { ProposalKpiCards } from './components/ProposalKpiCards';
import { ProposalListTable } from './components/ProposalListTable';
import { ProposalCreateModal } from './components/ProposalCreateModal';

export const ProposalsView: React.FC = () => {
  const { state, ui, canDo, submitProposal, reviewProposal, addProposalThread } = useApp();

  const proposals = state.proposals || [];
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleAddThread = (proposalId: string, content: string, isInbound = false) => {
    addProposalThread(proposalId, content, isInbound);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 4 Thẻ KPI Kế Hoạch Nằm Trên 1 Hàng Ngang */}
      <ProposalKpiCards proposals={proposals} />

      {/* Bảng Danh Sách Hợp Nhất (Gom 2 Bảng Thành 1 Bảng 7 Cột + Dropdown Accordion Nhật Ký Trao Đổi) */}
      <ProposalListTable
        proposals={proposals}
        txList={state.tx || []}
        uiRole={ui.role}
        canReview={canDo('review_proposal')}
        onOpenCreateModal={() => setShowCreateModal(true)}
        onReview={reviewProposal}
        onAddThread={handleAddThread}
      />

      {/* Modal Lập Kế Hoạch Mới */}
      <ProposalCreateModal
        show={showCreateModal}
        uiRole={ui.role}
        onClose={() => setShowCreateModal(false)}
        onSubmit={submitProposal}
      />
    </div>
  );
};

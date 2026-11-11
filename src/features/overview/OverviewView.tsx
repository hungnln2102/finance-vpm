import React, { useState } from 'react';
import { ExecutiveKpiCards } from './components/ExecutiveKpiCards';
import { ActionCenterCard } from './components/ActionCenterCard';
import { OpexBreakdownCard } from './components/OpexBreakdownCard';
import { RecentCashFlowCard } from './components/RecentCashFlowCard';
import { LegacyAuditModal } from './components/LegacyAuditModal';
import { FileSpreadsheet } from 'lucide-react';

export const OverviewView: React.FC = () => {
  const [showAuditModal, setShowAuditModal] = useState(false);

  return (
    <div className="overview-container" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Khối 1: Thẻ KPI Chỉ Số Tài Chính Cấp Cao */}
      <ExecutiveKpiCards />

      {/* Khối 2: Cảnh Báo & Việc Cần Xử Lý Thông Minh */}
      <ActionCenterCard />

      {/* Khối 3: Grid 2 cột: Cơ cấu Chi Phí Vận Hành & Giao Dịch Dòng Tiền Trọng Yếu */}
      <div className="overview-grid-2col">
        <OpexBreakdownCard />
        <RecentCashFlowCard />
      </div>

      {/* Khối Footer: Nút tra cứu đối chiếu số liệu cũ */}
      <div className="overview-footer-strip">
        <button
          type="button"
          className="btn-legacy-audit"
          onClick={() => setShowAuditModal(true)}
          title="Xem bảng đối chiếu chi tiết giữa File Excel cũ và Sổ Gốc ACID"
        >
          <FileSpreadsheet size={15} />
          <span>Tra cứu đối chiếu sai lệch File Excel cũ (16/10/2026)</span>
        </button>
      </div>

      {/* Modal tra cứu file cũ */}
      <LegacyAuditModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
      />
    </div>
  );
};

export default OverviewView;

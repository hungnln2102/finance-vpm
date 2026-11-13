import React, { useState } from 'react';
import { useApp } from './../../context/useApp';
import { opexBy, monthTx } from '../../services/financeService';
import { ExecutiveKpiCards } from './components/ExecutiveKpiCards';
import { ActionCenterCard } from './components/ActionCenterCard';
import { OpexBreakdownCard } from './components/OpexBreakdownCard';
import { RecentCashFlowCard } from './components/RecentCashFlowCard';
import { LegacyAuditModal } from './components/LegacyAuditModal';
import { ReportAccountBalanceTable } from '../report/components/ReportAccountBalanceTable';
import { ReportOpexVsBudgetCard } from '../report/components/ReportOpexVsBudgetCard';
import { ReportCashflowBreakdown } from '../report/components/ReportCashflowBreakdown';
import { FileSpreadsheet, Printer } from 'lucide-react';

export const OverviewView: React.FC = () => {
  const { state, ui, setView } = useApp();
  const [showAuditModal, setShowAuditModal] = useState(false);

  const m = ui.month;
  const rows = monthTx(state.tx, m);
  const op = opexBy(state.tx, m);
  const b = state.budget[m] || {};
  const disabledCats = state.disabledCostCategories?.[m] || [];

  return (
    <div className="overview-container" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Khối 1: 5 Thẻ KPI Chỉ Số Tài Chính Cấp Cao */}
      <ExecutiveKpiCards />

      {/* Khối 2: Trung Tâm Cảnh Báo & Việc Cần Xử Lý Thông Minh */}
      <ActionCenterCard />

      {/* Khối 3: Bảng Đối Soát Số Dư Đầu Kỳ - Thu - Chi - Cuối Kỳ Theo Tài Khoản PostgreSQL */}
      <ReportAccountBalanceTable
        month={m}
        accounts={state.accounts}
        transactions={state.tx}
      />

      {/* Khối 4: Kiểm Soát Chi Phí Vận Hành (OPEX) So Với Ngân Sách Tháng */}
      <ReportOpexVsBudgetCard
        categoryNames={state.costCategories}
        opexActual={op}
        monthBudget={b}
        disabledCategories={disabledCats}
        onNavigateBudget={() => setView('budget')}
      />

      {/* Khối 5: Phân Tích Dòng Tiền Theo Loại Nghiệp Vụ & Điểm Nhấn Liên Phân Hệ (Kế hoạch, Công nợ, Quà tặng) */}
      <ReportCashflowBreakdown
        month={m}
        monthTransactions={rows}
        proposals={state.proposals}
        contracts={state.contracts}
        gifts={state.gifts}
        onNavigate={(tab) => setView(tab)}
      />

      {/* Khối 6: Grid 2 cột: Cơ Cấu Tỷ Trọng OPEX (Biến động 3 tháng) & Giao Dịch Dòng Tiền Trọng Yếu */}
      <div className="overview-grid-2col">
        <OpexBreakdownCard />
        <RecentCashFlowCard />
      </div>

      {/* Khối Footer: Nút tra cứu đối chiếu số liệu cũ & In báo cáo */}
      <div className="overview-footer-strip" style={{ gap: '12px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn-legacy-audit"
          onClick={() => setShowAuditModal(true)}
          title="Xem bảng đối chiếu chi tiết giữa File Excel cũ và Sổ Gốc ACID"
        >
          <FileSpreadsheet size={15} />
          <span>Tra cứu đối chiếu sai lệch File Excel cũ (16/10/2026)</span>
        </button>

        <button
          type="button"
          className="btn-legacy-audit"
          onClick={() => window.print()}
          title="In hoặc xuất PDF báo cáo tổng quan tháng"
        >
          <Printer size={15} />
          <span>In / Xuất PDF Báo Cáo Tháng</span>
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

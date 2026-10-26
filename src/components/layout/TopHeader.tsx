import React from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { ROLE_DEFINITIONS, WORKFLOW_ROLES, TODAY } from '../../data/constants';
import { dmy, monthLabel } from '../../utils/formatters';
import { Calendar, UserCheck, Zap, Bell, CheckCircle2 } from 'lucide-react';

const VIEW_TITLES: Record<string, { title: string; subtitle: (month: string) => string }> = {
  overview: {
    title: 'Tổng quan Dòng tiền & P&L',
    subtitle: () => `Tình hình tài chính đến ngày ${dmy(TODAY)}/2026 · Tự động tính toán realtime theo chuẩn ACID`
  },
  ledger: {
    title: 'Sổ Giao Dịch Gốc & Webhook',
    subtitle: (m) => `Lưu trữ hóa đơn chứng từ gốc · Bắt biến động số dư ACB & Khớp lệnh 3 cấp · ${monthLabel(m)}`
  },
  proposals: {
    title: 'Kế Hoạch & Đệ Trình Phê Duyệt',
    subtitle: () => 'Hồ sơ đệ trình ngân sách · Tích hợp Resend Email Outbound & Luồng giải trình Inbound'
  },
  budget: {
    title: 'Quản Lý Ngân Sách & Cost Tháng',
    subtitle: (m) => `Cấu hình định mức chi phí Opex · Phân tích độ lệch thực chi (Variance Analysis) ${monthLabel(m)}`
  },
  debt: {
    title: 'Công Nợ Cá Nhân & Đội Ngũ',
    subtitle: () => `Theo dõi công nợ hợp đồng & tư vấn viên · Trả nợ từng phần / tất toán tại ngày ${dmy(TODAY)}`
  },
  gifts: {
    title: 'Kho Quà Tặng & Ấn Phẩm',
    subtitle: () => 'Nhập/Xuất kho vật phẩm quà tặng · Khấu trừ 50% TV · Link trực tiếp Sổ giao dịch gốc'
  },
  payroll: {
    title: 'Chấm Công & Tính Lương Tự Động',
    subtitle: () => 'Bảng chấm công tương tác · Nghỉ lễ tự động · Khấu trừ tạm ứng & Thuế TNCN'
  },
  report: {
    title: 'Báo Cáo Tài Chính & P&L',
    subtitle: (m) => `Báo cáo Lãi/Lỗ chuyên sâu · Doanh thu, Opex, Lợi nhuận ròng ${monthLabel(m)}`
  },
  closing: {
    title: 'Khóa Sổ Tháng & Audit Trail',
    subtitle: (m) => `Đóng băng dữ liệu chống sửa lùi ngày · Chuyển số dư lũy kế sang tháng mới · ${monthLabel(m)}`
  }
};

export const TopHeader: React.FC = () => {
  const { state, ui, setMonth, setRole, setView, simulateWebhook } = useApp();

  const currentViewConfig = VIEW_TITLES[ui.view] || VIEW_TITLES.overview;
  const rolesList: Role[] = WORKFLOW_ROLES;

  const unmatchedWebhookCount = (state.webhooks || []).filter((w) => w.status === 'unmatched').length;

  return (
    <header className="top-header">
      <div className="header-title-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1>{currentViewConfig.title}</h1>
          <span className="badge-tag live-badge">
            <CheckCircle2 size={12} color="#10b981" /> ACID Realtime
          </span>
        </div>
        <div className="header-subtitle">{currentViewConfig.subtitle(ui.month)}</div>
      </div>

      <div className="top-controls">
        <label htmlFor="month-select" className="control-label">
          <Calendar size={15} />
          <span>Kỳ</span>
          <select
            id="month-select"
            value={ui.month}
            onChange={(e) => setMonth(e.target.value)}
            aria-label="Chọn kỳ tháng"
          >
            <option value="2026-08">Tháng 8/2026</option>
            <option value="2026-09">Tháng 9/2026</option>
            <option value="2026-10">Tháng 10/2026</option>
          </select>
        </label>

        {/* Nút Giả lập Webhook ACB & Nút Hộp thư Webhook */}
        <div className="webhook-action-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary webhook-sim-btn"
            onClick={() => simulateWebhook()}
            title="Mô phỏng ngân hàng ACB bắn Webhook biến động số dư tiền vào/ra thời gian thực"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.15), rgba(249, 115, 22, 0.25))',
              border: '1px solid rgba(249, 115, 22, 0.4)',
              color: '#f97316',
              fontWeight: 600,
              fontSize: '12.5px',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <Zap size={14} />
            <span>Simulate Webhook ACB</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary webhook-badge-btn"
            onClick={() => setView('ledger', 'webhook')}
            title="Xem danh sách biến động số dư ACB và đối soát"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12.5px',
              padding: '6px 11px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <Bell size={14} />
            <span>Webhook ({state.webhooks ? state.webhooks.length : 0})</span>
            {unmatchedWebhookCount > 0 && (
              <span
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '1px 6px',
                  fontSize: '10px',
                  fontWeight: 700,
                  marginLeft: '2px'
                }}
              >
                {unmatchedWebhookCount} mới
              </span>
            )}
          </button>
        </div>

        {/* Phân ngạch 3 cấp Role Switcher */}
        <div className="role-switcher" role="group" aria-label="Đang làm việc với vai trò">
          {rolesList.map((r) => {
            const def = ROLE_DEFINITIONS[r];
            const isActive = ui.role === r || (r === 'operator' && ui.role === 'tien') || (r === 'admin' && ui.role === 'vpm') || (r === 'master' && ui.role === 'giau');
            return (
              <button
                key={r}
                type="button"
                className={`role-btn ${isActive ? 'active' : ''}`}
                onClick={() => setRole(r)}
                aria-pressed={isActive}
                title={def.description}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <UserCheck size={13} style={{ opacity: isActive ? 1 : 0.6 }} />
                  <span>{def.name} · {def.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

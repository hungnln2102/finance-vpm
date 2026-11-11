import React, { useMemo } from 'react';
import { useApp } from './../../context/useApp';
import { ROLE_DEFINITIONS, TODAY } from '../../data/constants';
import { dmy, monthLabel, generateAvailableMonths } from '../../utils/formatters';
import { Calendar, UserCheck, CheckCircle2 } from 'lucide-react';

const VIEW_TITLES: Record<string, { title: string; subtitle: (month: string) => string }> = {
  overview: {
    title: 'Tổng quan Dòng tiền & P&L',
    subtitle: () => `Tình hình tài chính đến ngày ${dmy(TODAY)}/2026 · Tự động tính toán realtime theo chuẩn ACID`
  },
  ledger: {
    title: 'Sổ Giao Dịch Gốc',
    subtitle: (m) => `Lưu trữ hóa đơn chứng từ gốc · Kiểm soát dòng tiền & Phê duyệt 3 cấp · ${monthLabel(m)}`
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
  const { state, ui, setMonth, setDateRange } = useApp();

  const currentViewConfig = VIEW_TITLES[ui.view] || VIEW_TITLES.overview;
  const currentRoleDef = ROLE_DEFINITIONS[ui.role] || ROLE_DEFINITIONS.master;

  // Tự động sinh danh mục tháng linh hoạt từ quá khứ đến hiện tại thời gian thực và tương lai
  const availableMonths = useMemo(() => {
    const existing = state.tx.map((t) => (t.date ? t.date.slice(0, 7) : ''));
    return generateAvailableMonths('2026-08', 3, existing);
  }, [state.tx]);

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
        {/* Bộ chọn kỳ tháng kế toán linh hoạt */}
        <label htmlFor="month-select" className="control-label">
          <Calendar size={15} />
          <span>Kỳ</span>
          <select
            id="month-select"
            value={ui.month}
            onChange={(e) => {
              setMonth(e.target.value);
              setDateRange('', '');
            }}
            aria-label="Chọn kỳ tháng"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        </label>

        {/* Bộ lọc khoảng ngày dd/mm/yyyy - dd/mm/yyyy */}
        <div className="control-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} />
          <input
            type="date"
            value={ui.dateFrom || ''}
            onChange={(e) => setDateRange(e.target.value, ui.dateTo)}
            title="Từ ngày (dd/mm/yyyy)"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ink)',
              fontFamily: 'var(--f-num)',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          />
          <span style={{ color: 'var(--muted)', fontSize: '12px' }}>—</span>
          <input
            type="date"
            value={ui.dateTo || ''}
            onChange={(e) => setDateRange(ui.dateFrom, e.target.value)}
            title="Đến ngày (dd/mm/yyyy)"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ink)',
              fontFamily: 'var(--f-num)',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          />
          {(ui.dateFrom || ui.dateTo) && (
            <button
              type="button"
              className="btn xs"
              onClick={() => setDateRange('', '')}
              title="Đặt lại khoảng ngày"
              style={{
                padding: '1px 5px',
                fontSize: '10px',
                lineHeight: 1,
                borderRadius: '4px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: 'none'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Profile Badge hiển thị người dùng hiện tại */}
        <div className="user-profile-badge" title={currentRoleDef.description}>
          <div className="user-avatar-circle">
            <UserCheck size={14} />
          </div>
          <div className="user-info-text">
            <span className="user-name">{currentRoleDef.name}</span>
            <span className="user-role-label">{currentRoleDef.title}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { ROLE_DEFINITIONS, TODAY } from '../../data/constants';
import { dmy, monthLabel } from '../../utils/formatters';
import { Calendar, UserCheck } from 'lucide-react';

const VIEW_TITLES: Record<string, { title: string; subtitle: (month: string) => string }> = {
  overview: {
    title: 'Tổng quan',
    subtitle: () => `Tình hình đến ngày ${dmy(TODAY)}/2026 · mọi số tự tính từ sổ giao dịch gốc`
  },
  ledger: {
    title: 'Sổ giao dịch gốc',
    subtitle: (m) => `Mỗi lần tiền vào hoặc ra nhập đúng một dòng · ${monthLabel(m)}`
  },
  debt: {
    title: 'Công nợ',
    subtitle: () => `Tự tính từ hợp đồng và các khoản thu trong sổ gốc · xét quá hạn tại ${dmy(TODAY)}`
  },
  gifts: {
    title: 'Quà & ấn phẩm',
    subtitle: () => 'Nhập từ khoản chi mua quà, xuất theo phiếu, tồn tự tính'
  },
  payroll: {
    title: 'Chấm công & lương',
    subtitle: () => 'Kỳ lương tháng 9/2026 · ngày công lấy thẳng từ bảng chấm công'
  },
  report: {
    title: 'Báo cáo tháng',
    subtitle: (m) => `${monthLabel(m)} · chi phí vận hành tách khỏi tiền ứng hộ khách`
  },
  closing: {
    title: 'Khóa sổ tháng',
    subtitle: (m) => `${monthLabel(m)} · VPM đối chiếu 5 điểm rồi khóa`
  }
};

export const TopHeader: React.FC = () => {
  const { ui, setMonth, setRole } = useApp();

  const currentViewConfig = VIEW_TITLES[ui.view] || VIEW_TITLES.overview;
  const rolesList: Role[] = ['tien', 'vpm', 'giau'];

  return (
    <header className="top-header">
      <div className="header-title-box">
        <h1>{currentViewConfig.title}</h1>
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

        <div className="role-switcher" role="group" aria-label="Đang làm việc với vai trò">
          {rolesList.map((r) => {
            const def = ROLE_DEFINITIONS[r];
            const isActive = ui.role === r;
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

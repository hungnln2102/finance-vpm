import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import { 
  LayoutDashboard, 
  BookOpen, 
  CreditCard, 
  Gift, 
  Users, 
  BarChart3, 
  Lock,
  RotateCcw,
  Send,
  Target
} from 'lucide-react';
import { detectAllIssues, needsApproval } from '../../services/financeService';
import { TODAY } from '../../data/constants';

interface NavItemConfig {
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
}

export const RailNav: React.FC = () => {
  const { state, ui, setView, resetData } = useApp();
  const [resetArmed, setResetArmed] = useState(false);

  const navItems: NavItemConfig[] = [
    { id: 'overview', label: 'Tổng quan', icon: <LayoutDashboard size={18} /> },
    { id: 'ledger', label: 'Sổ giao dịch gốc', icon: <BookOpen size={18} /> },
    { id: 'proposals', label: 'Kế hoạch & đệ trình', icon: <Send size={18} /> },
    { id: 'budget', label: 'Ngân sách & Cost', icon: <Target size={18} /> },
    { id: 'debt', label: 'Công nợ', icon: <CreditCard size={18} /> },
    { id: 'gifts', label: 'Quà & ấn phẩm', icon: <Gift size={18} /> },
    { id: 'payroll', label: 'Chấm công & lương', icon: <Users size={18} /> },
    { id: 'report', label: 'Báo cáo tháng', icon: <BarChart3 size={18} /> },
    { id: 'closing', label: 'Khóa sổ tháng', icon: <Lock size={18} /> }
  ];

  // Calculate badge counts
  const badIssuesCount = detectAllIssues(state, TODAY).filter((i) => i.lvl === 'bad').length;
  const pendingTxCount = state.tx.filter(
    (t) => t.status === 'draft' || t.status === 'pending_admin' || t.status === 'pending_master' || t.status === 'pending'
  ).length;
  const pendingProposalCount = (state.proposals || []).filter(
    (p) => p.status === 'pending_admin' || p.status === 'pending_master'
  ).length;

  const badges: Partial<Record<ActiveTab, number>> = {
    overview: badIssuesCount,
    ledger: pendingTxCount,
    proposals: pendingProposalCount
  };

  const handleResetClick = () => {
    if (resetArmed) {
      resetData();
      setResetArmed(false);
    } else {
      setResetArmed(true);
      setTimeout(() => setResetArmed(false), 4500);
    }
  };

  return (
    <aside className="rail-sidebar">
      <div className="rail-brand">
        <b className="rail-brand-title">Sổ Gốc BKD TTNG</b>
        <span className="rail-brand-sub">Bảo Hiểm Có Giàu · do VPM thiết kế</span>
      </div>

      <nav className="rail-nav" aria-label="Phân hệ chức năng">
        {navItems.map((item) => {
          const isActive = ui.view === item.id;
          const badgeCount = badges[item.id] || 0;

          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setView(item.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="nav-item-icon">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {badgeCount > 0 && <span className="nav-badge">{badgeCount}</span>}
            </button>
          );
        })}
      </nav>

      <div className="rail-footer">
        <span>Bản demo React + TS dựng từ 8 file khách gửi ngày 16/10/2026. Dữ liệu lưu cục bộ trên trình duyệt.</span>
        <button
          type="button"
          className="rail-footer-reset"
          onClick={handleResetClick}
          style={resetArmed ? { color: 'var(--bad)', textDecoration: 'none', fontWeight: 700 } : undefined}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RotateCcw size={13} />
            <span>{resetArmed ? 'Bấm lần nữa để xác nhận xóa' : 'Khôi phục dữ liệu ban đầu'}</span>
          </div>
        </button>
      </div>
    </aside>
  );
};

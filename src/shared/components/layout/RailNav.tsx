import React, { useState } from 'react';
import { useApp } from '../../../context/useApp';
import { ActiveTab } from '../../../types';
import { ROLE_DEFINITIONS } from '../../../data/constants';
import { 
  LayoutDashboard, 
  BookOpen, 
  CreditCard, 
  Gift, 
  Users, 
  BarChart3, 
  Lock,
  Send,
  Target,
  UserCheck,
  LogOut,
  ChevronUp
} from 'lucide-react';
import { detectAllIssues } from '../../../services/financeService';
import { TODAY } from '../../../data/constants';
import { useAuth } from '../../../context/AuthContext';

interface NavItemConfig {
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
}

export const RailNav: React.FC = () => {
  const { state, ui, setView, showToast } = useApp();
  const { user, logout } = useAuth();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

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

  const currentRoleDef = ROLE_DEFINITIONS[ui.role] || ROLE_DEFINITIONS.master;

  const handleLogout = async () => {
    await logout();
    setAccountMenuOpen(false);
    showToast('\u0110\u00e3 \u0111\u0103ng xu\u1ea5t phi\u00ean hi\u1ec7n t\u1ea1i.', 'success');
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

      <div className={`rail-account ${accountMenuOpen ? 'open' : ''}`}>
        {accountMenuOpen && (
          <div className="rail-account-menu">
            <div className="rail-account-menu-label">{'\u0054\u00e0i kho\u1ea3n hi\u1ec7n t\u1ea1i'}</div>
            <div className="rail-account-menu-role">{currentRoleDef.description}</div>
            <button type="button" className="rail-logout-button" onClick={handleLogout}>
              <LogOut size={15} />
              <span>{'\u0110\u0103ng xu\u1ea5t'}</span>
            </button>
          </div>
        )}
        <button
          type="button"
          className="rail-account-trigger"
          onClick={() => setAccountMenuOpen((open) => !open)}
          aria-expanded={accountMenuOpen}
          aria-label={'\u004d\u1edf menu t\u00e0i kho\u1ea3n'}
        >
          <span className="rail-account-avatar"><UserCheck size={16} /></span>
          <span className="rail-account-copy">
            <strong>{user?.displayName || currentRoleDef.name}</strong>
            <small>{currentRoleDef.title}</small>
          </span>
          <ChevronUp className="rail-account-chevron" size={16} />
        </button>
      </div>
    </aside>
  );
};

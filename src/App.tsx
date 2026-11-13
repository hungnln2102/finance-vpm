import React, { useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/useApp';
import { RailNav } from './shared/components/layout/RailNav';
import { TopHeader } from './shared/components/layout/TopHeader';
import { Toast } from './shared/components/common/Toast';
import { OverviewView } from './features/overview/OverviewView';
import { LedgerView } from './features/ledger/LedgerView';
import { ProposalsView } from './features/proposals/ProposalsView';
import { BudgetControlView } from './features/budget/BudgetControlView';
import { DebtView } from './features/debt/DebtView';
import { GiftsView } from './features/gifts/GiftsView';
import { PayrollView } from './features/payroll/PayrollView';
import { ReportView } from './features/report/ReportView';
import { ClosingView } from './features/closing/ClosingView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './features/auth/LoginView';

const RoleSessionBridge: React.FC<{ role: 'operator' | 'admin' | 'master' }> = ({ role }) => {
  const { setRole } = useApp();
  useEffect(() => setRole(role), [role, setRole]);
  return null;
};

const MainWorkstation: React.FC = () => {
  const { ui } = useApp();

  return (
    <div className="app-layout">
      <RailNav />
      <main className="main-content">
        <TopHeader />
        
        {ui.view === 'overview' && <OverviewView />}
        {ui.view === 'ledger' && <LedgerView />}
        {ui.view === 'proposals' && <ProposalsView />}
        {ui.view === 'budget' && <BudgetControlView />}
        {ui.view === 'debt' && <DebtView />}
        {ui.view === 'gifts' && <GiftsView />}
        {ui.view === 'payroll' && <PayrollView />}
        {ui.view === 'report' && <ReportView />}
        {ui.view === 'closing' && <ClosingView />}
      </main>
      <Toast />
    </div>
  );
};

export const App: React.FC = () => {
  const AuthenticatedApp: React.FC = () => {
    const { user, loading } = useAuth();
    if (loading) return <div className="auth-loading">Đang kiểm tra phiên đăng nhập...</div>;
    if (!user) return <LoginView />;
    return <AppProvider><RoleSessionBridge role={user.role} /><MainWorkstation /></AppProvider>;
  };

  return (
    <AuthProvider><AuthenticatedApp /></AuthProvider>
  );
};

export default App;

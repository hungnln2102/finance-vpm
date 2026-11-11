import React from 'react';
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
  return (
    <AppProvider>
      <MainWorkstation />
    </AppProvider>
  );
};

export default App;

import React from 'react';
import { useApp } from './../../context/useApp';
import { monthLabel, prevMonth } from '../../utils/formatters';
import { opexBy, monthTx } from '../../services/financeService';
import { FileBarChart2, Lock, Unlock, Printer } from 'lucide-react';
import { ReportKpiCards } from './components/ReportKpiCards';
import { ReportAccountBalanceTable } from './components/ReportAccountBalanceTable';
import { ReportOpexVsBudgetCard } from './components/ReportOpexVsBudgetCard';
import { ReportCashflowBreakdown } from './components/ReportCashflowBreakdown';

export const ReportView: React.FC = () => {
  const { state, ui, setView } = useApp();
  const m = ui.month;
  const prevM = prevMonth(m);

  const rows = monthTx(state.tx, m);
  const prevRows = monthTx(state.tx, prevM);
  const op = opexBy(state.tx, m);
  const b = state.budget[m] || {};
  const disabledCats = state.disabledCostCategories?.[m] || [];

  const totOp = Object.values(op).reduce((a, c) => a + c, 0);
  const totB = Object.entries(state.costCategories).reduce((sum, [code]) => {
    if (disabledCats.includes(code)) return sum;
    return sum + (Number(b[code]) || 0);
  }, 0);

  let totalIn = 0;
  let inCount = 0;
  let totalOut = 0;
  let outCount = 0;

  for (const t of rows) {
    if (t.dir === 'in') {
      totalIn += t.amt;
      inCount++;
    } else {
      totalOut += t.amt;
      outCount++;
    }
  }

  const prevTotalIn = prevRows
    .filter((t) => t.dir === 'in')
    .reduce((s, t) => s + t.amt, 0);

  const isLocked = Boolean(state.locks[m]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header Banner Kỳ Báo Cáo */}
      <div
        className="card-box"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderLeft: '4px solid var(--teal)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="ledger-kpi-badge teal">
            <FileBarChart2 size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 className="card-title" style={{ margin: 0 }}>
                Báo Cáo Tài Chính & Lưu Chuyển Tiền Tệ — {monthLabel(m)}
              </h2>
              {isLocked ? (
                <span className="chip good">
                  <Lock size={11} />
                  <span>Đã khóa sổ ({state.locks[m]})</span>
                </span>
              ) : (
                <span className="chip ochre">
                  <Unlock size={11} />
                  <span>Đang mở sổ (Realtime ACID)</span>
                </span>
              )}
            </div>
            <p className="card-subtitle-text" style={{ marginTop: '3px' }}>
              Tổng hợp trực tiếp từ {rows.length} giao dịch Sổ Cái, {state.accounts?.length || 4} tài khoản thanh khoản và ngân sách OPEX trong PostgreSQL
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn xs"
            onClick={() => window.print()}
            title="In hoặc xuất PDF báo cáo tháng"
          >
            <Printer size={14} />
            <span>In / Xuất PDF</span>
          </button>
        </div>
      </div>

      {/* Khối 1: 4 Thẻ KPI Tài Chính Cấp Cao */}
      <ReportKpiCards
        totalIn={totalIn}
        inCount={inCount}
        prevTotalIn={prevTotalIn}
        totalOut={totalOut}
        outCount={outCount}
        totOp={totOp}
        totB={totB}
      />

      {/* Khối 2: Bảng Đối Soát Số Dư & Biến Động Theo Tài Khoản (PostgreSQL) */}
      <ReportAccountBalanceTable
        month={m}
        accounts={state.accounts}
        transactions={state.tx}
      />

      {/* Khối 3: Kiểm Soát Chi Phí Vận Hành (OPEX) So Với Ngân Sách */}
      <ReportOpexVsBudgetCard
        categoryNames={state.costCategories}
        opexActual={op}
        monthBudget={b}
        disabledCategories={disabledCats}
        onNavigateBudget={() => setView('budget')}
      />

      {/* Khối 4: Phân Tích Dòng Tiền Theo Loại Nghiệp Vụ & Tóm Tắt Liên Phân Hệ */}
      <ReportCashflowBreakdown
        month={m}
        monthTransactions={rows}
        proposals={state.proposals}
        contracts={state.contracts}
        gifts={state.gifts}
        onNavigate={(tab) => setView(tab)}
      />
    </div>
  );
};

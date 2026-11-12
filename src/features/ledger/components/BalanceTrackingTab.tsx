import React from 'react';
import { useApp } from './../../../context/useApp';
import { mon, lastDay, prevMonth } from '../../../utils/formatters';
import { calculateBalance } from '../../../services/financeService';
import { TODAY } from '../../../data/constants';

import { BalanceLiveKpis } from './balance/BalanceLiveKpis';
import { BalanceMatrixTable, MonthBalanceRow } from './balance/BalanceMatrixTable';

export const BalanceTrackingTab: React.FC = () => {
  const { state, ui, setMonth } = useApp();
  // 1. Thu thập danh sách các tháng
  const monthSet = new Set<string>();
  const realCurrentMonth = mon(TODAY);
  monthSet.add(realCurrentMonth);
  if (ui.month) monthSet.add(ui.month);
  state.tx.forEach((t) => {
    if (t.date) monthSet.add(mon(t.date));
  });

  const months = Array.from(monthSet).sort((a, b) => a.localeCompare(b));

  // 2. Danh sách tài khoản active (ON) từ Tab Tài Sản
  const activeAccounts = (state.accounts && state.accounts.length > 0)
    ? state.accounts.filter((a) => a.status === 'active')
    : [
        { id: 'QUY', name: 'Quỹ tiền mặt văn phòng', type: 'cash', status: 'active' },
        { id: 'ACB', name: 'Ngân hàng ACB', type: 'bank', status: 'active' }
      ];

  // 3. Tính toán số dư hiện tại của toàn hệ thống (Realtime)
  const latestTxDate = state.tx.reduce((max, t) => (t.date > max ? t.date : max), TODAY);
  const accountBalances: Record<string, number> = {};
  let liveTotal = 0;

  activeAccounts.forEach((acc) => {
    const bal = calculateBalance(state.tx, acc.id, latestTxDate);
    accountBalances[acc.id] = bal;
    liveTotal += bal;
  });

  // 4. Xây dựng ma trận số dư theo từng tháng với cột ĐỘNG theo activeAccounts
  const matrix: MonthBalanceRow[] = months.map((m, idx) => {
    const prevM = prevMonth(m);
    const isLocked = !!state.locks[m];
    const isCurrentActive = m === ui.month;
    const isPast = idx < months.length - 1 && m < mon(TODAY);

    const rowAccBalances: Record<string, { id: string; start: number; end: number; net: number }> = {};
    let startTotal = 0;
    let endTotal = 0;

    activeAccounts.forEach((acc) => {
      const start = calculateBalance(state.tx, acc.id, lastDay(prevM));
      const end = calculateBalance(state.tx, acc.id, lastDay(m));
      const net = end - start;
      rowAccBalances[acc.id] = { id: acc.id, start, end, net };
      startTotal += start;
      endTotal += end;
    });

    const netChange = endTotal - startTotal;

    return {
      month: m,
      isLocked,
      isCurrentActive,
      isPast,
      accountBalances: rowAccBalances,
      startTotal,
      endTotal,
      netChange
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Các Thẻ KPI Số Dư Tức Thời (Sinh Động Theo Tài Khoản Active) */}
      <BalanceLiveKpis 
        activeAccounts={activeAccounts} 
        accountBalances={accountBalances} 
        liveTotal={liveTotal} 
      />

      {/* Bảng Ma Trận Số Dư Các Tháng (Header 2 Tầng Cột ĐỘNG) */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>
              Bảng Theo Dõi Số Dư Đầu Kỳ & Cuối Kỳ Theo Tháng
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
              Cột số dư tự động sinh động theo các tài khoản đang <b>BẬT (ON)</b> tại Tab Tài Sản. Số dư đầu kỳ lấy ngày 01 hàng tháng, cuối kỳ cập nhật Realtime.
            </p>
          </div>
        </div>

        <BalanceMatrixTable 
          matrix={matrix} 
          activeAccounts={activeAccounts} 
          onSelectMonth={setMonth} 
        />
      </div>
    </div>
  );
};

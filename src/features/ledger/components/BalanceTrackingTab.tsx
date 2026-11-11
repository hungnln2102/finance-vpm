import React, { useState } from 'react';
import { useApp } from './../../../context/useApp';
import { apiClient } from '../../../services/apiClient';
import { mon, lastDay, prevMonth } from '../../../utils/formatters';
import { calculateBalance } from '../../../services/financeService';
import { TODAY } from '../../../data/constants';

import { BalanceLiveKpis } from './balance/BalanceLiveKpis';
import { BalanceSyncActions } from './balance/BalanceSyncActions';
import { BalanceMatrixTable, MonthBalanceRow } from './balance/BalanceMatrixTable';

export const BalanceTrackingTab: React.FC = () => {
  const { state, ui, setMonth, showToast, refreshFromDatabase } = useApp();
  const [isSyncingSheetToDb, setIsSyncingSheetToDb] = useState(false);
  const [isSyncingDbToSheet, setIsSyncingDbToSheet] = useState(false);
  const [isClearingLedger, setIsClearingLedger] = useState(false);
  const [isRollingOver, setIsRollingOver] = useState(false);

  // Chiều 1: Kéo toàn bộ dữ liệu từ Google Sheet về nạp/cập nhật vào PostgreSQL (Sheet -> DB)
  const handleSyncSheetToDb = async () => {
    setIsSyncingSheetToDb(true);
    showToast('Đang kết nối Google Sheet để xuất dữ liệu mới nhất về PostgreSQL...', 'loading');
    try {
      const res = await apiClient.syncSheetToDb();
      if (res && res.success) {
        showToast(
          `Đồng bộ thành công: ${res.insertedTx || 0} GD mới, ${res.updatedTx || 0} GD cập nhật từ Google Sheet!`,
          'success',
          4500
        );
        await refreshFromDatabase();
      } else {
        showToast(res.error || 'Có lỗi khi đồng bộ từ Google Sheet', 'error', 5500);
      }
    } catch (e: any) {
      showToast('Lỗi khi đồng bộ Sheet -> DB: ' + e.message, 'error', 5500);
    } finally {
      setIsSyncingSheetToDb(false);
    }
  };

  // Chiều 2: Đẩy toàn bộ dữ liệu từ PostgreSQL lên làm mới Google Sheet (DB -> Sheet)
  const handleSyncDbToSheet = async () => {
    setIsSyncingDbToSheet(true);
    showToast('Đang đẩy toàn bộ cơ sở dữ liệu PostgreSQL lên Google Sheet...', 'loading');
    try {
      const res = await apiClient.syncDbToSheet();
      if (res && res.success) {
        showToast(
          `Đã đẩy toàn bộ PostgreSQL lên Google Sheet (${res.txCount || 0} GD, ${res.contractCount || 0} HĐ, ${res.balanceCount || 0} kỳ số dư)!`,
          'success',
          4500
        );
      } else {
        showToast(res.error || 'Có lỗi khi đẩy dữ liệu lên Google Sheet', 'error', 5500);
      }
    } catch (e: any) {
      showToast('Lỗi khi đồng bộ DB -> Sheet: ' + e.message, 'error', 5500);
    } finally {
      setIsSyncingDbToSheet(false);
    }
  };

  // Xóa toàn bộ dữ liệu Sổ Giao Dịch Gốc & Đưa số dư về 0 đ
  const handleClearLedger = async () => {
    if (!window.confirm('⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ giao dịch trong Sổ Giao Dịch Gốc và đưa số dư về 0 đ? Hành động này sẽ đồng bộ làm sạch cả cơ sở dữ liệu và Google Sheet.')) {
      return;
    }
    setIsClearingLedger(true);
    showToast('Đang tiến hành xóa sạch Sổ Giao Dịch Gốc...', 'loading');
    try {
      const res = await apiClient.clearLedger();
      if (res && res.success) {
        showToast('Đã xóa toàn bộ giao dịch sổ gốc và reset số dư về 0 đ!', 'success', 4500);
        await refreshFromDatabase();
      } else {
        showToast(res.error || 'Có lỗi khi xóa sổ giao dịch', 'error', 5500);
      }
    } catch (e: any) {
      showToast('Lỗi xóa sổ giao dịch: ' + e.message, 'error', 5500);
    } finally {
      setIsClearingLedger(false);
    }
  };

  // Kích hoạt chạy Cron tạo kỳ tháng mới thủ công (Số dư đầu kỳ = Số dư cuối kỳ tháng trước)
  const handleTriggerRollover = async () => {
    if (!window.confirm('Kích hoạt tạo dòng kỳ tháng mới theo chuẩn kế toán: Số dư đầu kỳ tháng mới = Số dư cuối kỳ tháng trước?')) {
      return;
    }
    setIsRollingOver(true);
    showToast('Đang tính toán ma trận và khởi tạo tháng mới...', 'loading');
    try {
      const res = await apiClient.triggerRollover();
      if (res && res.success) {
        showToast(`Đã tạo thành công kỳ mới ${res.data?.targetMonth || ''}!`, 'success', 4500);
        await refreshFromDatabase();
      } else {
        showToast(res.error || 'Có lỗi khi chuyển kỳ tháng mới', 'error', 5500);
      }
    } catch (e: any) {
      showToast('Lỗi chuyển kỳ tháng mới: ' + e.message, 'error', 5500);
    } finally {
      setIsRollingOver(false);
    }
  };

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

          <BalanceSyncActions
            isSyncingSheetToDb={isSyncingSheetToDb}
            isSyncingDbToSheet={isSyncingDbToSheet}
            isClearingLedger={isClearingLedger}
            isRollingOver={isRollingOver}
            onSyncSheetToDb={handleSyncSheetToDb}
            onSyncDbToSheet={handleSyncDbToSheet}
            onClearLedger={handleClearLedger}
            onTriggerRollover={handleTriggerRollover}
          />
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

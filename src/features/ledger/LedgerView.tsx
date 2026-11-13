import React, { useState, useEffect } from 'react';
import { useApp } from './../../context/useApp';
import { mil, dmy, mon, lastDay, monthLabel, prevMonth } from '../../utils/formatters';
import { calculateBalance } from '../../services/financeService';
import { TransactionModal } from './components/TransactionModal';
import { LedgerKpiCards } from './components/LedgerKpiCards';
import { BalanceTrackingTab } from './components/BalanceTrackingTab';
import { AssetsManagementTab } from './components/assets/AssetsManagementTab';
import { LedgerDataTable } from './components/table/LedgerDataTable';
import { LedgerPagination } from './components/table/LedgerPagination';
import { 
  PlusCircle, 
  FileText,
  Lock,
  Landmark,
  Briefcase,
  Zap
} from 'lucide-react';

export const LedgerView: React.FC = () => {
  const { 
    state, 
    ui, 
    canDo, 
    setLedgerFilter, 
    setEditTx,
    updateTransaction,
    simulateWebhook
  } = useApp();

  const m = ui.month;
  const f = ui.ledgerFilter;
  const locked = !!state.locks[m];
  const [subTab, setSubTab] = useState<'transactions' | 'balances' | 'assets'>('transactions');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 1. Filtering transactions by month or date range
  const baseRows = state.tx.filter((t) => {
    if (ui.dateFrom && t.date < ui.dateFrom) return false;
    if (ui.dateTo && t.date > ui.dateTo) return false;
    if (!ui.dateFrom && !ui.dateTo) {
      return mon(t.date) === m;
    }
    return true;
  });

  // Kiểm tra điều kiện "chưa liệt kê": Có cờ unlisted hoặc chưa có proposalId và chưa có cat/contract
  const isUnlistedTx = (t: import('../../types').Transaction) => {
    return (
      (t.flags && t.flags.includes('unlisted')) ||
      (t.dir === 'out' && !t.proposalId && !t.cat && t.status !== 'migrated') ||
      (t.dir === 'in' && !t.contract && t.type === 'THU_KH' && t.status !== 'migrated')
    );
  };

  const countUnlisted = baseRows.filter(isUnlistedTx).length;

  // 2. Filter by All / In / Out / Unlisted
  let rows = baseRows;
  if (f === 'in') {
    rows = baseRows.filter((t) => t.dir === 'in');
  } else if (f === 'out') {
    rows = baseRows.filter((t) => t.dir === 'out');
  } else if (f === 'unlisted') {
    rows = baseRows.filter(isUnlistedTx);
  }

  // Counts & Totals for KPI cards & Tabs
  const countAll = baseRows.length;
  const countIn = baseRows.filter((t) => t.dir === 'in').length;
  const countOut = baseRows.filter((t) => t.dir === 'out').length;

  const totalIn = baseRows.filter((t) => t.dir === 'in').reduce((s, t) => s + t.amt, 0);
  const totalOut = baseRows.filter((t) => t.dir === 'out').reduce((s, t) => s + t.amt, 0);

  const prevM = prevMonth(m);
  const currentQuyBal = calculateBalance(state.tx, 'QUY', ui.dateTo || lastDay(m));
  const currentAcbBal = calculateBalance(state.tx, 'ACB', ui.dateTo || lastDay(m));
  const activeAccountsList = (state.accounts && state.accounts.length > 0)
    ? state.accounts.filter((a) => a.status === 'active')
    : [{ id: 'QUY' }, { id: 'ACB' }];
  const totalFund = activeAccountsList.reduce(
    (sum, a) => sum + calculateBalance(state.tx, a.id, ui.dateTo || lastDay(m)),
    0
  );

  // Pagination logic
  useEffect(() => {
    setCurrentPage(1);
  }, [f, m, ui.dateFrom, ui.dateTo, pageSize]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const pagedRows = rows.slice(startIndex, startIndex + pageSize);

  const editingTx = ui.editTx ? state.tx.find((t) => t.id === ui.editTx) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {locked && (
        <div style={{ padding: '12px 16px', background: 'var(--ochre-soft)', color: 'var(--ochre)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <Lock size={16} />
          <span>{monthLabel(m)} đã khóa sổ. Muốn điều chỉnh số liệu, VPM cần mở khóa ở mục <b>Khóa sổ tháng</b>.</span>
        </div>
      )}

      {/* Sub-tab chuyển đổi giữa Sổ Chi Tiết & Bảng Số Dư Đầu Kỳ - Cuối Kỳ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setSubTab('transactions')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: subTab === 'transactions' ? 600 : 500,
            background: subTab === 'transactions' ? 'var(--teal-soft)' : 'transparent',
            color: subTab === 'transactions' ? 'var(--teal)' : 'var(--muted)',
            border: subTab === 'transactions' ? '1px solid var(--teal)' : '1px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <FileText size={15} />
          <span>Sổ Giao Dịch Chi Tiết ({countAll})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('balances')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: subTab === 'balances' ? 600 : 500,
            background: subTab === 'balances' ? 'var(--teal-soft)' : 'transparent',
            color: subTab === 'balances' ? 'var(--teal)' : 'var(--muted)',
            border: subTab === 'balances' ? '1px solid var(--teal)' : '1px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Landmark size={15} />
          <span>Theo Dõi Số Dư Đầu Kỳ & Cuối Kỳ</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('assets')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: subTab === 'assets' ? 600 : 500,
            background: subTab === 'assets' ? 'var(--teal-soft)' : 'transparent',
            color: subTab === 'assets' ? 'var(--teal)' : 'var(--muted)',
            border: subTab === 'assets' ? '1px solid var(--teal)' : '1px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Briefcase size={15} />
          <span>Tài Sản Doanh Nghiệp ({state.accounts?.length || 2})</span>
        </button>
      </div>

      {subTab === 'balances' ? (
        <BalanceTrackingTab />
      ) : subTab === 'assets' ? (
        <AssetsManagementTab />
      ) : (
        <>
          {/* 1. Bốn thẻ biểu thị dữ liệu tổng hợp */}
          <LedgerKpiCards
            totalFund={totalFund}
            quyBal={currentQuyBal}
            acbBal={currentAcbBal}
            totalIn={totalIn}
            countIn={countIn}
            totalOut={totalOut}
            countOut={countOut}
            totalCount={baseRows.length}
          />

          {/* 2. Main Table Card */}
          <section className="card-box">
            {/* Controls and Filter Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 className="card-title">
                  <span>
                    {f === 'unlisted'
                      ? 'Giao dịch Chưa Liệt Kê (Chờ khớp Kế hoạch / OPEX)'
                      : f === 'in'
                      ? 'Giao dịch thu tiền'
                      : f === 'out'
                      ? 'Giao dịch chi tiền'
                      : ui.dateFrom || ui.dateTo
                      ? `Sổ Giao Dịch (${dmy(ui.dateFrom || `${m}-01`)} — ${dmy(ui.dateTo || lastDay(m))})`
                      : `Sổ Giao Dịch Gốc · ${monthLabel(m)}`}
                  </span>
                  <small>
                    {rows.length} dòng · thu {mil(totalIn)} · chi {mil(totalOut)}
                  </small>
                </h2>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <button
                    type="button"
                    className={`btn xs ${f === 'all' || !['in', 'out', 'unlisted'].includes(f) ? 'primary' : ''}`}
                    onClick={() => setLedgerFilter('all')}
                  >
                    Tất cả ({countAll})
                  </button>
                  <button
                    type="button"
                    className={`btn xs ${f === 'unlisted' ? 'primary' : ''}`}
                    onClick={() => setLedgerFilter('unlisted')}
                    style={
                      f === 'unlisted'
                        ? { backgroundColor: '#ea580c', borderColor: '#ea580c', color: '#fff', fontWeight: 600 }
                        : { borderColor: countUnlisted > 0 ? '#ea580c' : undefined, color: countUnlisted > 0 ? '#ea580c' : 'var(--muted)', fontWeight: countUnlisted > 0 ? 600 : 400 }
                    }
                    title="Các giao dịch đã trừ/cộng tiền tài sản nhưng chưa làm rõ nguồn tiền (chưa khớp Kế hoạch hoặc Chi phí khác)"
                  >
                    ⚡ Chưa liệt kê ({countUnlisted})
                  </button>
                  <button
                    type="button"
                    className={`btn xs ${f === 'in' ? 'primary' : ''}`}
                    onClick={() => setLedgerFilter('in')}
                  >
                    Thu ({countIn})
                  </button>
                  <button
                    type="button"
                    className={`btn xs ${f === 'out' ? 'primary' : ''}`}
                    onClick={() => setLedgerFilter('out')}
                  >
                    Chi ({countOut})
                  </button>
                </div>

                {/* Nút Giả lập Webhook/Biên lai ACB về trừ tiền ngay vào tài sản */}
                <button
                  type="button"
                  className="btn xs"
                  onClick={() => simulateWebhook()}
                  title="Nhận một biên lai ngân hàng ACB mới: Tiền bị trừ/cộng ngay vào tài sản và giao dịch nằm trong Chưa liệt kê"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: '#ea580c',
                    borderColor: 'rgba(234, 88, 12, 0.4)',
                    background: 'rgba(234, 88, 12, 0.06)'
                  }}
                >
                  <Zap size={13} />
                  <span>+ Webhook / Biên lai về</span>
                </button>

                {canDo('add') && (
                  <button
                    type="button"
                    className="btn primary xs"
                    onClick={() => setIsCreateModalOpen(true)}
                    disabled={locked}
                    title={locked ? `${monthLabel(m)} đã khóa sổ` : 'Nhập giao dịch mới'}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 600,
                      padding: '5px 12px'
                    }}
                  >
                    <PlusCircle size={14} />
                    <span>Giao dịch mới</span>
                  </button>
                )}
              </div>
            </div>

            {/* Transactions Table Component */}
            <LedgerDataTable
              rows={pagedRows}
              editTxId={ui.editTx}
              canEdit={canDo('edit')}
              locked={locked}
              proposals={state.proposals}
              contracts={state.contracts}
              isUnlistedTab={f === 'unlisted'}
              onEditTx={setEditTx}
              onUpdateTx={updateTransaction}
            />

            {/* Pagination Component */}
            <LedgerPagination
              pageSize={pageSize}
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              totalRows={rows.length}
              startIndex={startIndex}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setCurrentPage(1);
              }}
              onPageChange={setCurrentPage}
            />
          </section>
        </>
      )}

      {/* Modal Nhập mới & Sửa giao dịch */}
      <TransactionModal
        isOpen={isCreateModalOpen || !!editingTx}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditTx(null);
        }}
        editingTx={editingTx}
        currentMonth={m}
      />
    </div>
  );
};

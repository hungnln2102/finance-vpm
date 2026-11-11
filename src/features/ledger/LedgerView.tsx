import React, { useState, useEffect } from 'react';
import { useApp } from './../../context/useApp';
import { Transaction } from '../../types';
import { TYPES, CATS } from '../../data/constants';
import { fmt, mil, dmy, fm, mon, lastDay, monthLabel, prevMonth } from '../../utils/formatters';
import { txIssues, calculateBalance } from '../../services/financeService';
import { TransactionModal } from './components/TransactionModal';
import { LedgerKpiCards } from './components/LedgerKpiCards';
import { BalanceTrackingTab } from './components/BalanceTrackingTab';
import { 
  PlusCircle, 
  Edit3, 
  AlertCircle, 
  FileText,
  Lock,
  Landmark
} from 'lucide-react';

export const LedgerView: React.FC = () => {
  const { 
    state, 
    ui, 
    canDo, 
    setLedgerFilter, 
    setEditTx
  } = useApp();

  const m = ui.month;
  const f = ui.ledgerFilter;
  const locked = !!state.locks[m];
  const [subTab, setSubTab] = useState<'transactions' | 'balances'>('transactions');
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

  // 2. Filter by All / In / Out
  let rows = baseRows;
  if (f === 'in') {
    rows = baseRows.filter((t) => t.dir === 'in');
  } else if (f === 'out') {
    rows = baseRows.filter((t) => t.dir === 'out');
  }

  // Counts & Totals for KPI cards & Tabs
  const countAll = baseRows.length;
  const countIn = baseRows.filter((t) => t.dir === 'in').length;
  const countOut = baseRows.filter((t) => t.dir === 'out').length;

  const totalIn = baseRows.filter((t) => t.dir === 'in').reduce((s, t) => s + t.amt, 0);
  const totalOut = baseRows.filter((t) => t.dir === 'out').reduce((s, t) => s + t.amt, 0);

  const prevM = prevMonth(m);
  const openingQuy = calculateBalance(state.tx, 'QUY', lastDay(prevM));
  const openingAcb = calculateBalance(state.tx, 'ACB', lastDay(prevM));

  const currentQuyBal = calculateBalance(state.tx, 'QUY', ui.dateTo || lastDay(m));
  const currentAcbBal = calculateBalance(state.tx, 'ACB', ui.dateTo || lastDay(m));
  const totalFund = currentQuyBal + currentAcbBal;

  // Pagination logic
  useEffect(() => {
    setCurrentPage(1);
  }, [f, m, ui.dateFrom, ui.dateTo, pageSize]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const pagedRows = rows.slice(startIndex, startIndex + pageSize);

  const getPaginationRange = (curr: number, total: number) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (curr <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (curr >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', curr - 1, curr, curr + 1, '...', total];
  };

  // Editing transaction
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
      </div>

      {subTab === 'balances' ? (
        <BalanceTrackingTab />
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
                {f === 'in'
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
                className={`btn xs ${f === 'all' || !['in', 'out'].includes(f) ? 'primary' : ''}`}
                onClick={() => setLedgerFilter('all')}
              >
                Tất cả ({countAll})
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

        {/* Transactions Table */}
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Mã</th>
                <th>Tài khoản</th>
                <th>Diễn giải & Chứng từ</th>
                <th>Phân loại</th>
                <th className="num">Thu</th>
                <th className="num">Chi</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((t) => {
                const issues = txIssues(t);

                return (
                  <tr key={t.id} style={ui.editTx === t.id ? { background: 'var(--teal-soft)' } : undefined}>
                    <td style={{ whiteSpace: 'nowrap', fontFamily: 'var(--f-num)' }}>{dmy(t.date)}</td>
                    <td style={{ fontFamily: 'var(--f-num)', fontWeight: 600 }}>{t.id}</td>
                    <td>
                      <span className="chip">{t.acc}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{t.desc}</div>
                      {issues.map((iss, idx) => (
                        <div key={idx} style={{ color: 'var(--bad)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                          <AlertCircle size={11} />
                          <span>{iss}</span>
                        </div>
                      ))}
                      {t.doc && (
                        <span style={{ fontSize: '11px', color: 'var(--teal)', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                          <FileText size={11} />
                          <span>{t.doc}</span>
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 500 }}>{TYPES[t.type]?.l || t.type}</div>
                      {t.cat && (
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          {CATS[t.cat] || t.cat}
                        </div>
                      )}
                      {t.contract && (
                        <div style={{ fontSize: '11px', color: 'var(--teal)' }}>
                          HĐ: {t.contract}
                        </div>
                      )}
                    </td>
                    <td className="num" style={{ color: t.dir === 'in' ? 'var(--good)' : undefined, fontWeight: t.dir === 'in' ? 600 : 400 }}>
                      {t.dir === 'in' ? fmt(t.amt) : ''}
                    </td>
                    <td className="num" style={{ color: t.dir === 'out' ? 'var(--bad)' : undefined, fontWeight: t.dir === 'out' ? 600 : 400 }}>
                      {t.dir === 'out' ? fmt(t.amt) : ''}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {canDo('edit') && !locked && (
                        <button
                          type="button"
                          className="btn xs"
                          onClick={() => setEditTx(t.id)}
                          title="Sửa phân loại hoặc thông tin"
                        >
                          <Edit3 size={12} />
                          <span>Sửa</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                    Không có giao dịch nào phù hợp bộ lọc
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Thanh phân trang ở cuối bảng */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderTop: '1px solid var(--line)', flexWrap: 'wrap', gap: '12px' }}>
          {/* Bên trái: Chọn số dòng hiển thị */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: 'var(--muted)' }}>
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{ padding: '3px 8px', fontSize: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)' }}
            >
              <option value={10}>10 dòng</option>
              <option value={20}>20 dòng</option>
              <option value={50}>50 dòng</option>
              <option value={100}>100 dòng</option>
            </select>
            <span>
              {rows.length > 0
                ? `Hiển thị ${startIndex + 1} - ${Math.min(startIndex + pageSize, rows.length)} trên tổng số ${rows.length} giao dịch`
                : '0 giao dịch'}
            </span>
          </div>

          {/* Bên phải: Nút số trang 1, 2, 3 ... 7, 8, 9 ... N, N+1, N+2 */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                className="btn xs"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                style={{ padding: '4px 8px' }}
              >
                Trước
              </button>

              {getPaginationRange(safeCurrentPage, totalPages).map((p, idx) => {
                if (typeof p === 'string') {
                  return (
                    <span key={`dots-${idx}`} style={{ padding: '0 4px', color: 'var(--muted)', fontSize: '12px' }}>
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={p}
                    type="button"
                    className={`btn xs ${p === safeCurrentPage ? 'primary' : ''}`}
                    onClick={() => setCurrentPage(p)}
                    style={{ minWidth: '28px', padding: '4px 6px', fontWeight: p === safeCurrentPage ? 700 : 500 }}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                className="btn xs"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                style={{ padding: '4px 8px' }}
              >
                Sau
              </button>
            </div>
          )}
        </div>
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

import React, { useMemo } from 'react';
import { AccountItem, Transaction } from '../../../types';
import { ACC } from '../../../data/constants';
import { fmt, lastDay, prevMonth, mon } from '../../../utils/formatters';
import { calculateBalance } from '../../../services/financeService';
import { Landmark, Wallet } from 'lucide-react';

interface ReportAccountBalanceTableProps {
  month: string;
  accounts?: AccountItem[];
  transactions: Transaction[];
}

export const ReportAccountBalanceTable: React.FC<ReportAccountBalanceTableProps> = ({
  month,
  accounts,
  transactions
}) => {
  const prevM = prevMonth(month);
  const openUntil = lastDay(prevM);
  const closeUntil = lastDay(month);

  const accountRows = useMemo(() => {
    const activeAccounts: AccountItem[] =
      accounts && accounts.length > 0
        ? accounts.filter((a) => a.status !== 'inactive')
        : Object.entries(ACC).map(([id, name]) => ({
            id,
            name,
            type: id === 'QUY' ? 'cash' : 'bank',
            status: 'active'
          }));

    const knownIds = new Set(activeAccounts.map((a) => a.id));
    for (const t of transactions) {
      if (t.acc && t.acc !== 'BT' && !knownIds.has(t.acc)) {
        knownIds.add(t.acc);
        activeAccounts.push({
          id: t.acc,
          name: ACC[t.acc as keyof typeof ACC] || `Tài khoản ${t.acc}`,
          type: t.acc === 'QUY' ? 'cash' : 'bank',
          status: 'active'
        });
      }
    }

    return activeAccounts.map((acc) => {
      const open = calculateBalance(transactions, acc.id, openUntil);
      let inMonth = 0;
      let outMonth = 0;

      for (const t of transactions) {
        if (t.acc === acc.id && mon(t.date) === month && t.status !== 'returned') {
          if (t.dir === 'in') inMonth += t.amt;
          else outMonth += t.amt;
        }
      }

      const net = inMonth - outMonth;
      const close = calculateBalance(transactions, acc.id, closeUntil);

      return {
        ...acc,
        open,
        inMonth,
        outMonth,
        net,
        close
      };
    });
  }, [accounts, transactions, month, openUntil, closeUntil]);

  const totals = useMemo(() => {
    return accountRows.reduce(
      (acc, r) => ({
        open: acc.open + r.open,
        inMonth: acc.inMonth + r.inMonth,
        outMonth: acc.outMonth + r.outMonth,
        net: acc.net + r.net,
        close: acc.close + r.close
      }),
      { open: 0, inMonth: 0, outMonth: 0, net: 0, close: 0 }
    );
  }, [accountRows]);

  return (
    <section className="card-box">
      <div className="card-header-flex">
        <div className="card-title-group">
          <div className="action-title-icon opex-icon">
            <Landmark size={18} color="#0d9488" />
          </div>
          <div>
            <h2 className="card-title" style={{ margin: 0 }}>
              Đối Soát Số Dư & Biến Động Theo Tài Khoản
            </h2>
            <p className="card-subtitle-text">
              Cân đối thanh khoản Đầu kỳ + Thu trong kỳ − Chi trong kỳ = Cuối kỳ ({accountRows.length} tài khoản PostgreSQL)
            </p>
          </div>
        </div>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Tài khoản / Quỹ</th>
              <th className="num">Đầu kỳ (đ)</th>
              <th className="num">Tổng Thu (+)</th>
              <th className="num">Tổng Chi (−)</th>
              <th className="num">Biến động ròng</th>
              <th className="num">Số dư cuối kỳ (đ)</th>
            </tr>
          </thead>
          <tbody>
            {accountRows.map((r) => (
              <tr key={r.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`chip ${r.id === 'QUY' ? 'ochre' : 'teal'}`} style={{ fontWeight: 700 }}>
                      {r.id}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Wallet size={11} />
                        <span>
                          {r.type === 'cash' ? 'Tiền mặt tại quỹ' : r.bankName || 'Tài khoản ngân hàng'}
                          {r.accountNo ? ` · STK: ${r.accountNo}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="num" style={{ color: r.open < 0 ? 'var(--bad)' : 'var(--ink)' }}>
                  {fmt(r.open)}
                </td>
                <td className="num" style={{ color: r.inMonth > 0 ? 'var(--good)' : 'var(--muted)', fontWeight: r.inMonth > 0 ? 600 : 400 }}>
                  {r.inMonth > 0 ? `+${fmt(r.inMonth)}` : '—'}
                </td>
                <td className="num" style={{ color: r.outMonth > 0 ? 'var(--bad)' : 'var(--muted)', fontWeight: r.outMonth > 0 ? 600 : 400 }}>
                  {r.outMonth > 0 ? `−${fmt(r.outMonth)}` : '—'}
                </td>
                <td
                  className="num"
                  style={{
                    fontWeight: 600,
                    color: r.net > 0 ? 'var(--good)' : r.net < 0 ? 'var(--bad)' : 'var(--muted)'
                  }}
                >
                  {r.net > 0 ? `+${fmt(r.net)}` : r.net < 0 ? fmt(r.net) : '—'}
                </td>
                <td
                  className="num"
                  style={{
                    fontWeight: 800,
                    fontSize: '14px',
                    color: r.close < 0 ? 'var(--bad)' : 'var(--teal)'
                  }}
                >
                  {fmt(r.close)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="total">
              <td>Tổng cộng thanh khoản toàn hệ thống</td>
              <td className="num">{fmt(totals.open)}</td>
              <td className="num" style={{ color: 'var(--good)' }}>
                {totals.inMonth > 0 ? `+${fmt(totals.inMonth)}` : '0'}
              </td>
              <td className="num" style={{ color: 'var(--bad)' }}>
                {totals.outMonth > 0 ? `−${fmt(totals.outMonth)}` : '0'}
              </td>
              <td
                className="num"
                style={{
                  color: totals.net > 0 ? 'var(--good)' : totals.net < 0 ? 'var(--bad)' : 'var(--ink)'
                }}
              >
                {totals.net > 0 ? `+${fmt(totals.net)}` : fmt(totals.net)}
              </td>
              <td
                className="num"
                style={{
                  color: totals.close < 0 ? 'var(--bad)' : 'var(--teal)',
                  fontSize: '14.5px'
                }}
              >
                {fmt(totals.close)} đ
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};

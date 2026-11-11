import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Lock, 
  CheckCircle2, 
  Activity, 
  ArrowRight 
} from 'lucide-react';
import { fmt, monthLabel } from '../../../../utils/formatters';
import { AccountItem } from '../../../../types';

export interface MonthAccountBalance {
  id: string;
  start: number;
  end: number;
  net: number;
}

export interface MonthBalanceRow {
  month: string;
  isLocked: boolean;
  isCurrentActive: boolean;
  isPast: boolean;
  accountBalances: Record<string, MonthAccountBalance>;
  startTotal: number;
  endTotal: number;
  netChange: number;
}

interface BalanceMatrixTableProps {
  matrix: MonthBalanceRow[];
  activeAccounts: AccountItem[];
  onSelectMonth: (month: string) => void;
}

// Bảng màu cho header từng tài khoản để phân biệt trực quan
const ACCOUNT_COLORS = [
  'var(--teal)',
  '#c084fc', // purple
  '#38bdf8', // sky blue
  '#f59e0b', // amber
  '#ec4899', // pink
  '#10b981'  // emerald
];

export const BalanceMatrixTable: React.FC<BalanceMatrixTableProps> = ({ 
  matrix, 
  activeAccounts,
  onSelectMonth 
}) => {
  const subDividerStyle = '1px dashed rgba(148, 163, 184, 0.18)';
  const accCount = Math.max(1, activeAccounts.length);

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table 
        className="data-table" 
        style={{ 
          width: '100%', 
          minWidth: `${Math.max(1050, 420 + accCount * 220)}px`,
          borderCollapse: 'collapse', 
          fontSize: '13px', 
          tableLayout: 'fixed' 
        }}
      >
        <colgroup>
          <col style={{ width: '11%' }} /> {/* Kỳ tháng */}
          {activeAccounts.map((acc) => (
            <React.Fragment key={acc.id}>
              <col style={{ width: `${Math.floor(48 / (accCount * 2))}%` }} />
              <col style={{ width: `${Math.floor(48 / (accCount * 2))}%` }} />
            </React.Fragment>
          ))}
          <col style={{ width: '9%' }} /> {/* Tổng quỹ - Đầu kỳ */}
          <col style={{ width: '9%' }} /> {/* Tổng quỹ - Cuối kỳ */}
          <col style={{ width: '11%' }} /> {/* Biến động ròng */}
          <col style={{ width: '12%' }} /> {/* Trạng thái kỳ */}
        </colgroup>
        <thead>
          <tr style={{ backgroundColor: 'var(--panel-2)', borderBottom: '1px solid var(--line)' }}>
            <th rowSpan={2} style={{ padding: '12px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
              KỲ THÁNG
            </th>
            {activeAccounts.map((acc, idx) => {
              const displayName = acc.name
                .replace(/^SỐ DƯ TÀI KHOẢN\s*/i, '')
                .replace(/^SỐ DƯ QUỸ\s*/i, '')
                .trim();
              return (
                <th 
                  key={acc.id} 
                  colSpan={2} 
                  title={`${acc.name} (${acc.id})`}
                  style={{ 
                    padding: '8px 6px', 
                    textAlign: 'center', 
                    borderLeft: '1px solid var(--line)', 
                    color: ACCOUNT_COLORS[idx % ACCOUNT_COLORS.length],
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {displayName.toUpperCase()} ({acc.id})
                </th>
              );
            })}
            <th colSpan={2} style={{ padding: '8px 10px', textAlign: 'center', borderLeft: '1px solid var(--line)', color: 'var(--good)' }}>
              TỔNG QUỸ KHẢ DỤNG
            </th>
            <th rowSpan={2} style={{ padding: '12px 8px', textAlign: 'center', borderLeft: '1px solid var(--line)' }}>
              BIẾN ĐỘNG RÒNG
            </th>
            <th rowSpan={2} style={{ padding: '12px 8px', textAlign: 'center', borderLeft: '1px solid var(--line)' }}>
              TRẠNG THÁI KỲ
            </th>
          </tr>
          <tr style={{ backgroundColor: 'var(--panel-2)', borderBottom: '1px solid var(--line)', fontSize: '11px', color: 'var(--muted)' }}>
            {activeAccounts.map((acc) => (
              <React.Fragment key={acc.id}>
                <th style={{ padding: '6px 8px', textAlign: 'center', borderLeft: '1px solid var(--line)' }}>Đầu kỳ (01)</th>
                <th style={{ padding: '6px 8px', textAlign: 'center', borderLeft: subDividerStyle }}>Cuối kỳ</th>
              </React.Fragment>
            ))}
            <th style={{ padding: '6px 8px', textAlign: 'center', borderLeft: '1px solid var(--line)' }}>Đầu kỳ</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderLeft: subDividerStyle }}>Cuối kỳ</th>
          </tr>
        </thead>
        <tbody>
          {matrix.map((row) => {
            const isNetUp = row.netChange >= 0;
            return (
              <tr
                key={row.month}
                style={{
                  borderBottom: '1px solid var(--line)',
                  backgroundColor: row.isCurrentActive ? 'rgba(66, 194, 187, 0.04)' : undefined,
                  transition: 'background-color 0.15s ease'
                }}
              >
                <td style={{ padding: '12px 6px', textAlign: 'center', fontWeight: 600 }}>
                  <button
                    onClick={() => onSelectMonth(row.month)}
                    className="btn btn-ghost btn-sm"
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: row.isCurrentActive ? 'var(--teal)' : 'var(--ink)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}
                    title="Bấm để lọc sổ chi tiết theo tháng này"
                  >
                    <span>{monthLabel(row.month)}</span>
                    <ArrowRight size={12} style={{ opacity: 0.6 }} />
                  </button>
                </td>

                {/* Các cặp cột động cho từng tài khoản active */}
                {activeAccounts.map((acc) => {
                  const b = row.accountBalances[acc.id] || { start: 0, end: 0, net: 0 };
                  return (
                    <React.Fragment key={acc.id}>
                      <td style={{ padding: '12px 8px', textAlign: 'center', borderLeft: '1px solid var(--line)' }}>
                        <span className={`tabular-nums ${b.start < 0 ? 'text-bad font-semibold' : ''}`}>
                          {fmt(b.start)} đ
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', borderLeft: subDividerStyle }}>
                        <span className={`tabular-nums font-semibold ${b.end < 0 ? 'text-bad' : ''}`}>
                          {fmt(b.end)} đ
                        </span>
                      </td>
                    </React.Fragment>
                  );
                })}

                {/* Tổng Quỹ Khả Dụng */}
                <td style={{ padding: '12px 8px', textAlign: 'center', borderLeft: '1px solid var(--line)' }}>
                  <span className="tabular-nums text-muted">
                    {fmt(row.startTotal)} đ
                  </span>
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', borderLeft: subDividerStyle, color: 'var(--good)' }}>
                  <span className="tabular-nums font-bold">
                    {fmt(row.endTotal)} đ
                  </span>
                </td>

                {/* Biến Động Ròng */}
                <td style={{ padding: '12px 8px', textAlign: 'center', borderLeft: '1px solid var(--line)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: isNetUp ? 'var(--good)' : 'var(--bad)', fontWeight: 600 }} className="tabular-nums">
                    {isNetUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{isNetUp ? '+' : ''}{fmt(row.netChange)} đ</span>
                  </div>
                </td>

                {/* Trạng Thái Kỳ */}
                <td style={{ padding: '12px 8px', textAlign: 'center', borderLeft: '1px solid var(--line)' }}>
                  {row.isLocked ? (
                    <span className="badge badge-error" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '3px 8px' }}>
                      <Lock size={12} />
                      <span>Đã chốt sổ</span>
                    </span>
                  ) : row.isPast ? (
                    <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '3px 8px' }}>
                      <CheckCircle2 size={12} />
                      <span>Đã chốt cuối kỳ</span>
                    </span>
                  ) : (
                    <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '3px 8px' }}>
                      <Activity size={12} />
                      <span>Realtime</span>
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

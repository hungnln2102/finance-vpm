import React, { useState } from 'react';
import { Contract, ContractKind, Transaction } from '../../../types';
import { DISC_LIMIT, TODAY } from '../../../data/constants';
import { fmt, dmy } from '../../../utils/formatters';
import { calculateDebt } from '../../../services/debtService';
import { CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface DebtTableProps {
  kind: ContractKind;
  contracts: Contract[];
  transactions: Transaction[];
  onlyOver: boolean;
  canApproveDisc: boolean;
  totalKH: number;
  totalTV: number;
  overdueCount: number;
  onSetKind: (k: ContractKind) => void;
  onSetOnlyOver: (onlyOver: boolean) => void;
  onApproveDiscount: (id: string) => void;
}

export const DebtTable: React.FC<DebtTableProps> = ({
  kind,
  contracts,
  transactions,
  onlyOver,
  canApproveDisc,
  totalKH,
  totalTV,
  overdueCount,
  onSetKind,
  onSetOnlyOver,
  onApproveDiscount,
}) => {
  const [expandedContract, setExpandedContract] = useState<string | null>(null);

  let list = contracts.filter((c) => c.kind === kind);
  if (onlyOver) {
    list = list.filter((c) => calculateDebt(c, transactions, TODAY).over > 0);
  }

  return (
    <section className="card-box">
      {/* Sub-tab Kind Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={`btn ${kind === 'KH' ? 'primary' : ''}`}
            onClick={() => onSetKind('KH')}
          >
            Công nợ khách hàng ({totalKH})
          </button>
          <button
            type="button"
            className={`btn ${kind === 'TV' ? 'primary' : ''}`}
            onClick={() => onSetKind('TV')}
          >
            Công nợ đội ngũ / tư vấn ({totalTV})
          </button>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
          <input
            type="checkbox"
            checked={onlyOver}
            onChange={(e) => onSetOnlyOver(e.target.checked)}
          />
          <span>Chỉ hiện nợ quá hạn ({overdueCount})</span>
        </label>
      </div>

      {/* Table */}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Khách hàng / HĐ</th>
              <th className="num">Phí HĐ</th>
              <th className="num">Chiết khấu</th>
              <th className="num">Phải thu</th>
              <th className="num">Đã thu</th>
              <th className="num">Còn nợ</th>
              <th>Hạn thanh toán</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const d = calculateDebt(c, transactions, TODAY);
              const isExpanded = expandedContract === c.id;

              return (
                <React.Fragment key={c.id}>
                  <tr>
                    <td style={{ fontFamily: 'var(--f-num)', fontWeight: 600 }}>{c.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.customer}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        {c.no ? `Số HĐ: ${c.no}` : ''} {c.tv ? `TV: ${c.tv}` : ''}
                      </div>
                    </td>
                    <td className="num">{fmt(c.fee)}</td>
                    <td className="num">
                      <div>{c.disc ? fmt(c.disc) : '—'}</div>
                      {c.fee > 0 && c.disc > 0 && (
                        <div style={{ fontSize: '11px', color: d.rate > DISC_LIMIT ? 'var(--bad)' : 'var(--muted)' }}>
                          {(d.rate * 100).toFixed(1)}%
                        </div>
                      )}
                      {!d.discOk && (
                        <div style={{ fontSize: '11px', color: 'var(--bad)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <AlertTriangle size={11} />
                          <span>Chờ duyệt</span>
                        </div>
                      )}
                    </td>
                    <td className="num" style={{ fontWeight: 600 }}>{fmt(d.due)}</td>
                    <td className="num" style={{ color: 'var(--good)', fontWeight: 600 }}>
                      {d.paid ? fmt(d.paid) : '—'}
                    </td>
                    <td className="num" style={{ color: d.left > 0 ? (d.over > 0 ? 'var(--bad)' : 'var(--ink)') : 'var(--muted)', fontWeight: 600 }}>
                      {d.left !== 0 ? fmt(d.left) : '0'}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '12.5px' }}>{dmy(c.due)}</td>
                    <td>
                      {d.status === 'Quá hạn' ? (
                        <span className="chip bad">Quá hạn {d.over} ngày</span>
                      ) : d.status === 'Xong' ? (
                        <span className="chip good">Xong</span>
                      ) : d.status === 'Thu dư' ? (
                        <span className="chip warn">Thu dư</span>
                      ) : (
                        <span className="chip">Trong hạn</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        {!d.discOk && canApproveDisc && (
                          <button
                            type="button"
                            className="btn xs primary"
                            onClick={() => onApproveDiscount(c.id)}
                          >
                            <CheckCircle size={12} />
                            <span>Duyệt CK</span>
                          </button>
                        )}

                        {d.pays.length > 0 && (
                          <button
                            type="button"
                            className="btn xs"
                            onClick={() => setExpandedContract(isExpanded ? null : c.id)}
                            title="Xem chi tiết các đợt tiền đã thanh toán"
                          >
                            <span>{d.pays.length} GD</span>
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expandable Payment Breakdown */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={10} style={{ background: 'var(--soft)', padding: '12px 18px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                          Lịch sử thu tiền của hợp đồng {c.id} ({c.customer}):
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {d.pays.map((p) => (
                            <li key={p.id}>
                              <b>{dmy(p.date)}</b> · {p.id} · <span style={{ color: 'var(--good)' }}>+{fmt(p.amt)} đ</span> · ({p.acc}) · {p.desc}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {list.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                  Không có hợp đồng nào phù hợp bộ lọc
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

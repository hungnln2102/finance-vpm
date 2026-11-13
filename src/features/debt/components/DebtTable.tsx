import React, { useState } from 'react';
import { Contract, ContractKind, Transaction } from '../../../types';
import { DISC_LIMIT, TODAY } from '../../../data/constants';
import { fmt, dmy } from '../../../utils/formatters';
import { calculateDebt } from '../../../services/debtService';
import { CheckCircle, AlertTriangle, ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';

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
  onAddInvoice: (contract: Contract, data: Omit<Contract, 'id' | 'kind' | 'flow' | 'customer' | 'tv'>) => void;
  onOpenCreateModal?: () => void;
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
  onAddInvoice,
  onOpenCreateModal,
}) => {
  const [expandedContract, setExpandedContract] = useState<string | null>(null);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceFee, setInvoiceFee] = useState<number | ''>('');
  const [invoiceDue, setInvoiceDue] = useState('');

  let list = contracts.filter((c) => c.kind === kind);
  if (onlyOver) {
    list = list.filter((c) => calculateDebt(c, transactions, TODAY).over > 0);
  }

  return (
    <section className="card-box" style={{ padding: '20px 22px' }}>
      {/* Sub-tab Kind Filter & Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className={`btn xs ${kind === 'KH' ? 'primary' : ''}`}
            onClick={() => onSetKind('KH')}
          >
            Công nợ khách hàng ({totalKH})
          </button>
          <button
            type="button"
            className={`btn xs ${kind === 'TV' ? 'primary' : ''}`}
            onClick={() => onSetKind('TV')}
          >
            Công nợ đội ngũ / tư vấn ({totalTV})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={onlyOver}
              onChange={(e) => onSetOnlyOver(e.target.checked)}
            />
            <span>Chỉ hiện nợ quá hạn ({overdueCount})</span>
          </label>

          {onOpenCreateModal && (
            <button
              type="button"
              className="btn primary xs"
              onClick={onOpenCreateModal}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 14px', fontWeight: 600 }}
            >
              <PlusCircle size={14} />
              <span>+ Tạo công nợ</span>
            </button>
          )}
        </div>
      </div>

      {/* Table với 2 cột rõ ràng Thu và Chi */}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th style={{ width: '85px' }}>Mã</th>
              <th>Khách hàng / Đối tượng</th>
              <th className="num" style={{ width: '125px' }}>Tổng giá trị</th>
              <th className="num" style={{ width: '110px' }}>Chiết khấu</th>
              <th className="num" style={{ width: '150px' }}>Thu (Tiền vào)</th>
              <th className="num" style={{ width: '150px' }}>Chi (Tiền ra)</th>
              <th className="num" style={{ width: '130px' }}>Còn nợ</th>
              <th style={{ width: '110px' }}>Hạn TT</th>
              <th style={{ width: '120px' }}>Trạng thái</th>
              <th style={{ textAlign: 'right', width: '100px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const d = calculateDebt(c, transactions, TODAY);
              const isExpanded = expandedContract === c.id;
              const isThu = c.flow === 'in' || (!c.flow && c.kind === 'KH');
              const submitInvoice = (event: React.FormEvent) => {
                event.preventDefault();
                if (!invoiceNo.trim() || !invoiceFee || !invoiceDue) return;
                onAddInvoice(c, { no: invoiceNo.trim(), signed: TODAY, fee: Number(invoiceFee), disc: 0, due: invoiceDue, terms: '', note: '' });
                setInvoiceNo(''); setInvoiceFee(''); setInvoiceDue('');
              };

              return (
                <React.Fragment key={c.id}>
                  <tr>
                    {/* Mã */}
                    <td style={{ fontFamily: 'var(--f-num)', fontWeight: 700, color: isThu ? 'var(--good)' : '#ea580c' }}>
                      {c.id}
                    </td>

                    {/* Đối tượng */}
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{c.customer}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        {c.no ? `Số HĐ: ${c.no}` : ''} {c.tv ? `TV: ${c.tv}` : ''}
                      </div>
                    </td>

                    {/* Tổng giá trị */}
                    <td className="num" style={{ fontFamily: 'var(--f-num)', fontWeight: 600 }}>
                      {fmt(c.fee)} đ
                    </td>

                    {/* Chiết khấu */}
                    <td className="num">
                      <div>{c.disc ? `${fmt(c.disc)} đ` : '—'}</div>
                      {c.fee > 0 && c.disc > 0 && (
                        <div style={{ fontSize: '11px', color: d.rate > DISC_LIMIT ? 'var(--bad)' : 'var(--muted)' }}>
                          {(d.rate * 100).toFixed(1)}%
                        </div>
                      )}
                      {!d.discOk && (
                        <div style={{ fontSize: '11px', color: 'var(--bad)', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                          <AlertTriangle size={11} />
                          <span>Chờ duyệt</span>
                        </div>
                      )}
                    </td>

                    {/* Cột 1: Thu (Tiền vào) */}
                    <td className="num">
                      {isThu ? (
                        <div>
                          <div style={{ color: 'var(--good)', fontWeight: 700, fontFamily: 'var(--f-num)' }}>
                            +{fmt(d.paid)} đ
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                            Phải thu: {fmt(d.due)} đ
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--muted)' }}>—</span>
                      )}
                    </td>

                    {/* Cột 2: Chi (Tiền ra) */}
                    <td className="num">
                      {!isThu ? (
                        <div>
                          <div style={{ color: '#ea580c', fontWeight: 700, fontFamily: 'var(--f-num)' }}>
                            -{fmt(d.paid)} đ
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                            Phải chi: {fmt(d.due)} đ
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--muted)' }}>—</span>
                      )}
                    </td>

                    {/* Còn nợ */}
                    <td className="num" style={{ color: d.left > 0 ? (d.over > 0 ? 'var(--bad)' : 'var(--ink)') : 'var(--muted)', fontWeight: 700, fontFamily: 'var(--f-num)' }}>
                      {d.left !== 0 ? `${fmt(d.left)} đ` : '0 đ'}
                    </td>

                    {/* Hạn thanh toán */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: '12.5px', fontFamily: 'var(--f-num)' }}>
                      {dmy(c.due)}
                    </td>

                    {/* Trạng thái */}
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

                    {/* Thao tác */}
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        {!d.discOk && canApproveDisc && (
                          <button
                            type="button"
                            className="btn xs primary"
                            onClick={() => onApproveDiscount(c.id)}
                            title="Duyệt chiết khấu"
                          >
                            <CheckCircle size={12} />
                            <span>Duyệt CK</span>
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn xs"
                          onClick={() => setExpandedContract(isExpanded ? null : c.id)}
                          title="Xem chi tiết hóa đơn và các đợt thanh toán"
                          aria-expanded={isExpanded}
                        >
                          <span>{d.pays.length > 0 ? `${d.pays.length} GD` : 'Hóa đơn'}</span>
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expandable Invoice and Payment Breakdown */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={10} style={{ background: 'var(--soft)', padding: '12px 18px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                          Hóa đơn / hợp đồng {c.id} ({c.customer})
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(140px, 1fr))', gap: '8px 18px', fontSize: '12px', marginBottom: '10px' }}>
                          <span>Số HĐ: <b>{c.no || 'Chưa có'}</b></span>
                          <span>Ký ngày: <b>{c.signed ? dmy(c.signed) : 'Chưa có'}</b></span>
                          <span>Hạn thanh toán: <b>{c.due ? dmy(c.due) : 'Chưa có'}</b></span>
                          <span>Giá trị phải thu/chi: <b>{fmt(d.due)} đ</b></span>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                          Lịch sử đối soát ({d.pays.length} giao dịch)
                        </div>
                        {d.pays.length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {d.pays.map((p) => (
                              <li key={p.id}>
                                <b>{dmy(p.date)}</b> · {p.id} · <span style={{ color: p.dir === 'out' ? 'var(--bad)' : 'var(--good)', fontWeight: 600 }}>{p.dir === 'out' ? '-' : '+'}{fmt(p.amt)} đ</span> · ({p.acc}) · {p.desc}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                            Chưa có giao dịch thanh toán được khớp với hóa đơn này.
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                  {isExpanded && (
                    <tr>
                      <td colSpan={10} style={{ background: 'var(--soft)', padding: '10px 18px' }}>
                        <form onSubmit={submitInvoice} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                          <label className="form-group" style={{ margin: 0 }}><span>Số hóa đơn mới</span><input required value={invoiceNo} onChange={(event) => setInvoiceNo(event.target.value)} placeholder="VD: 8288153" /></label>
                          <label className="form-group" style={{ margin: 0 }}><span>Giá trị (đ)</span><input required type="number" min="1000" step="1000" value={invoiceFee} onChange={(event) => setInvoiceFee(event.target.value === '' ? '' : Number(event.target.value))} /></label>
                          <label className="form-group" style={{ margin: 0 }}><span>Hạn thanh toán</span><input required type="date" value={invoiceDue} onChange={(event) => setInvoiceDue(event.target.value)} /></label>
                          <button type="submit" className="btn xs primary">+ Thêm hóa đơn</button>
                        </form>
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

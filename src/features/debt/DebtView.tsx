import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Contract, ContractKind } from '../../types';
import { TODAY, DISC_LIMIT } from '../../data/constants';
import { fmt, mil, dmy, fm } from '../../utils/formatters';
import { calculateDebt } from '../../services/debtService';
import { PlusCircle, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export const DebtView: React.FC = () => {
  const { 
    state, 
    ui, 
    canDo, 
    setDebtKind, 
    setDebtOnlyOver, 
    addContract, 
    approveDiscount 
  } = useApp();

  const k = ui.debtKind;
  const onlyOver = ui.debtOnlyOver;

  // Form State
  const [customer, setCustomer] = useState('');
  const [no, setNo] = useState('');
  const [tv, setTv] = useState('');
  const [fee, setFee] = useState<number | ''>('');
  const [disc, setDisc] = useState<number | ''>('');
  const [due, setDue] = useState('');
  const [expandedContract, setExpandedContract] = useState<string | null>(null);

  // Filter contracts
  let list = state.contracts.filter((c) => c.kind === k);
  if (onlyOver) {
    list = list.filter((c) => calculateDebt(c, state.tx, TODAY).over > 0);
  }

  // Summary Metrics
  const allDebts = state.contracts.filter((c) => c.kind === k).map((c) => calculateDebt(c, state.tx, TODAY));
  const totDue = allDebts.reduce((s, d) => s + d.due, 0);
  const totPaid = allDebts.reduce((s, d) => s + d.paid, 0);
  const totLeft = allDebts.reduce((s, d) => s + (d.left > 0 ? d.left : 0), 0);
  const totOver = allDebts.reduce((s, d) => s + (d.over > 0 ? d.left : 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fee || Number(fee) <= 0 || !customer.trim()) return;

    addContract({
      kind: k,
      customer: customer.trim(),
      no: k === 'KH' ? no.trim() : '',
      tv: k === 'TV' ? tv.trim() : '',
      signed: TODAY,
      fee: Number(fee),
      disc: Number(disc) || 0,
      due: due || TODAY,
      terms: '',
      note: ''
    });

    setCustomer('');
    setNo('');
    setTv('');
    setFee('');
    setDisc('');
    setDue('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 4 Summary Tiles */}
      <div className="tiles-grid">
        <div className="metric-tile">
          <div className="metric-tile-header">
            <span className="metric-key">Tổng phải thu (sau CK)</span>
          </div>
          <span className="metric-val">{fm(totDue)}</span>
          <span className="metric-note">{state.contracts.filter((c) => c.kind === k).length} hợp đồng {k === 'KH' ? 'khách hàng' : 'tư vấn'}</span>
        </div>

        <div className="metric-tile good">
          <div className="metric-tile-header">
            <span className="metric-key">Đã thu về</span>
          </div>
          <span className="metric-val">{fm(totPaid)}</span>
          <span className="metric-note">Tiền đã về sổ quỹ hoặc tài khoản cá nhân</span>
        </div>

        <div className="metric-tile">
          <div className="metric-tile-header">
            <span className="metric-key">Còn phải thu</span>
          </div>
          <span className="metric-val">{fm(totLeft)}</span>
          <span className="metric-note">Chưa thu hết theo hạn cam kết</span>
        </div>

        <div className={`metric-tile ${totOver > 0 ? 'bad' : ''}`}>
          <div className="metric-tile-header">
            <span className="metric-key">Quá hạn</span>
          </div>
          <span className="metric-val">{fm(totOver)}</span>
          <span className="metric-note">{allDebts.filter((d) => d.over > 0).length} hợp đồng đã quá ngày hẹn</span>
        </div>
      </div>

      {/* Add Contract Form */}
      {canDo('contract') && (
        <section className="card-box" style={{ borderLeft: '4px solid var(--teal)' }}>
          <h2 className="card-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={18} style={{ color: 'var(--teal)' }} />
              <span>Thêm hợp đồng {k === 'KH' ? 'khách hàng' : 'tư vấn'} mới</span>
            </div>
            <small>chiết khấu trên {DISC_LIMIT * 100}% cần chị Giàu duyệt</small>
          </h2>

          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>{k === 'KH' ? 'Tên khách hàng' : 'Tên khách / tư vấn'}</label>
              <input
                type="text"
                required
                placeholder="vd Nguyễn Văn A"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
              />
            </div>

            {k === 'KH' ? (
              <div className="form-group">
                <label>Số hợp đồng bảo hiểm</label>
                <input
                  type="text"
                  placeholder="vd 8288152"
                  value={no}
                  onChange={(e) => setNo(e.target.value)}
                />
              </div>
            ) : (
              <div className="form-group">
                <label>Tư vấn phụ trách</label>
                <input
                  type="text"
                  placeholder="vd Nguyễn Hữu Thạch"
                  value={tv}
                  onChange={(e) => setTv(e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label>Phí hợp đồng (đ)</label>
              <input
                type="number"
                min="1000"
                step="1000"
                required
                placeholder="vd 15000000"
                value={fee}
                onChange={(e) => setFee(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Chiết khấu (đ)</label>
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="vd 3000000"
                value={disc}
                onChange={(e) => setDisc(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Hạn thanh toán</label>
              <input
                type="date"
                required
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            </div>

            <div style={{ marginTop: '6px' }}>
              <button type="submit" className="btn primary">
                Thêm hợp đồng
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Main Table Card */}
      <section className="card-box">
        {/* Sub-tab Kind Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`btn ${k === 'KH' ? 'primary' : ''}`}
              onClick={() => setDebtKind('KH')}
            >
              Công nợ khách hàng ({state.contracts.filter((c) => c.kind === 'KH').length})
            </button>
            <button
              type="button"
              className={`btn ${k === 'TV' ? 'primary' : ''}`}
              onClick={() => setDebtKind('TV')}
            >
              Công nợ đội ngũ / tư vấn ({state.contracts.filter((c) => c.kind === 'TV').length})
            </button>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={onlyOver}
              onChange={(e) => setDebtOnlyOver(e.target.checked)}
            />
            <span>Chỉ hiện nợ quá hạn ({allDebts.filter((d) => d.over > 0).length})</span>
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
                const d = calculateDebt(c, state.tx, TODAY);
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
                          {!d.discOk && canDo('approve') && (
                            <button
                              type="button"
                              className="btn xs primary"
                              onClick={() => approveDiscount(c.id)}
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
    </div>
  );
};

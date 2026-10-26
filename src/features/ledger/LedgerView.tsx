import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction, TransactionType } from '../../types';
import { ACC, TYPES, CATS, APPROVE_LIMIT, TODAY } from '../../data/constants';
import { fmt, mil, dmy, fm, mon, lastDay, monthLabel, prevMonth } from '../../utils/formatters';
import { txIssues, needsApproval, calculateBalance } from '../../services/financeService';
import { 
  Filter, 
  PlusCircle, 
  Check, 
  CornerUpLeft, 
  CheckCircle, 
  Edit3, 
  AlertCircle, 
  FileText,
  Lock,
  Zap,
  Link2,
  ShieldCheck,
  XCircle,
  ArrowRight,
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const LedgerView: React.FC = () => {
  const { 
    state, 
    ui, 
    canDo, 
    setLedgerFilter, 
    setEditTx, 
    addTransaction, 
    updateTransaction,
    checkTransaction, 
    returnTransaction, 
    approveTransaction,
    forwardTransaction,
    postTransaction,
    rejectTransaction,
    simulateWebhook,
    matchWebhook
  } = useApp();

  const m = ui.month;
  const f = ui.ledgerFilter;
  const locked = !!state.locks[m];
  const [showWebhookDrawer, setShowWebhookDrawer] = useState(false);
  const [selectedTxForMatch, setSelectedTxForMatch] = useState<string>('');

  // Filtering transactions
  let rows = state.tx.filter((t) => mon(t.date) === m);
  if (f === 'pending') {
    rows = state.tx.filter((t) => t.status === 'draft' || t.status === 'pending_admin' || t.status === 'pending');
  } else if (f === 'approve') {
    rows = state.tx.filter((t) => t.status === 'pending_master' || (t.status === 'checked' && needsApproval(t)));
  } else if (f === 'flag') {
    rows = rows.filter((t) => txIssues(t).length > 0);
  }

  const prevM = prevMonth(m);
  const openingQuy = calculateBalance(state.tx, 'QUY', lastDay(prevM));
  const openingAcb = calculateBalance(state.tx, 'ACB', lastDay(prevM));

  const totalIn = rows.filter((t) => t.dir === 'in').reduce((s, t) => s + t.amt, 0);
  const totalOut = rows.filter((t) => t.dir === 'out').reduce((s, t) => s + t.amt, 0);

  // Form State
  const editingTx = ui.editTx ? state.tx.find((t) => t.id === ui.editTx) : null;

  const [date, setDate] = useState(m === mon(TODAY) ? TODAY : `${m}-01`);
  const [acc, setAcc] = useState('QUY');
  const [type, setType] = useState<TransactionType>('OPEX');
  const [amt, setAmt] = useState<number | ''>('');
  const [cat, setCat] = useState('');
  const [contract, setContract] = useState('');
  const [desc, setDesc] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);

  useEffect(() => {
    if (editingTx) {
      setDate(editingTx.date);
      setAcc(editingTx.acc);
      setType(editingTx.type);
      setAmt(editingTx.amt);
      setCat(editingTx.cat || '');
      setContract(editingTx.contract || '');
      setDesc(editingTx.desc);
    } else {
      setDate(m === mon(TODAY) ? TODAY : `${m}-01`);
      setAmt('');
      setCat('');
      setContract('');
      setDesc('');
      setDocFile(null);
    }
  }, [editingTx, m]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amt || Number(amt) <= 0) return;

    if (editingTx) {
      updateTransaction(editingTx.id, {
        date,
        acc,
        type,
        dir: TYPES[type].dir,
        amt: Number(amt),
        cat: type === 'OPEX' ? cat : '',
        contract,
        desc: desc.trim()
      });
      setEditTx(null);
    } else {
      addTransaction({
        date,
        acc,
        type,
        amt: Number(amt),
        cat: type === 'OPEX' ? cat : '',
        contract,
        desc: desc.trim(),
        docFile
      });
      setAmt('');
      setDesc('');
      setCat('');
      setContract('');
      setDocFile(null);
    }
  };

  const renderStatusChip = (t: Transaction) => {
    if (t.status === 'migrated') {
      return <span className="chip">Từ file cũ</span>;
    }

    if (t.status === 'rejected' || t.status === 'returned') {
      return (
        <span className="chip bad" title={t.note || 'Từ chối / Yêu cầu sửa'}>
          <XCircle size={11} style={{ marginRight: '3px' }} />
          Từ chối: {t.note || 'Thiếu chứng từ'}
        </span>
      );
    }

    if (t.status === 'posted' || t.status === 'approved') {
      return (
        <span className="chip good" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
          <ShieldCheck size={12} />
          <span>Sổ Cái (Posted)</span>
        </span>
      );
    }

    if (t.status === 'draft') {
      return (
        <span className="chip" style={{ background: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8' }}>
          <Clock size={11} style={{ marginRight: '3px' }} />
          Bản nháp
        </span>
      );
    }

    if (t.status === 'pending_admin' || t.status === 'pending') {
      return (
        <span className="chip warn" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          <Clock size={11} />
          <span>Chờ Admin</span>
        </span>
      );
    }

    if (t.status === 'pending_master' || t.status === 'checked') {
      return (
        <span className="chip" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
          <Sparkles size={11} />
          <span>Chờ Master</span>
        </span>
      );
    }

    return <span className="chip">{t.status}</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Form Section */}
      {canDo('add') && !locked && f === 'all' && (
        <section className="card-box" style={{ borderLeft: '4px solid var(--teal)' }}>
          <h2 className="card-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={18} style={{ color: 'var(--teal)' }} />
              <span>{editingTx ? `Sửa phân loại giao dịch ${editingTx.id}` : 'Nhập giao dịch mới'}</span>
            </div>
            <small>{editingTx ? 'chỉ VPM được sửa' : `chi từ ${fmt(APPROVE_LIMIT)} đ sẽ cần chị Giàu duyệt`}</small>
          </h2>

          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>Ngày giao dịch</label>
              <input
                type="date"
                required
                value={date}
                min={`${m}-01`}
                max={lastDay(m)}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Tài khoản</label>
              <select value={acc} onChange={(e) => setAcc(e.target.value)}>
                {Object.entries(ACC)
                  .filter(([k]) => k !== 'BT')
                  .map(([k, name]) => (
                    <option key={k} value={k}>{name}</option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label>Loại tiền</label>
              <select
                value={type}
                onChange={(e) => {
                  const val = e.target.value as TransactionType;
                  setType(val);
                  if (val !== 'OPEX') setCat('');
                }}
              >
                {Object.entries(TYPES).map(([k, t]) => (
                  <option key={k} value={k}>
                    {t.dir === 'in' ? 'Thu · ' : 'Chi · '}{t.l}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Số tiền (đ)</label>
              <input
                type="number"
                min="1000"
                step="1000"
                required
                placeholder="vd 1500000"
                value={amt}
                onChange={(e) => setAmt(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Nhóm chi phí</label>
              <select
                value={cat}
                disabled={type !== 'OPEX'}
                onChange={(e) => setCat(e.target.value)}
              >
                <option value="">—</option>
                {Object.entries(CATS).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Hợp đồng liên kết</label>
              <select value={contract} onChange={(e) => setContract(e.target.value)}>
                <option value="">—</option>
                {state.contracts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} · {c.customer} ({c.kind})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group wide">
              <label>Diễn giải</label>
              <input
                type="text"
                required
                placeholder="vd Ship quà sinh nhật khách Liên"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Chứng từ đính kèm</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setDocFile(e.target.files?.[0] || null)}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button type="submit" className="btn primary">
                {editingTx ? 'Lưu phân loại' : 'Ghi vào sổ'}
              </button>
              {editingTx && (
                <button type="button" className="btn" onClick={() => setEditTx(null)}>
                  Hủy
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      {locked && (
        <div style={{ padding: '12px 16px', background: 'var(--ochre-soft)', color: 'var(--ochre)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <Lock size={16} />
          <span>{monthLabel(m)} đã khóa sổ. Muốn điều chỉnh số liệu, VPM cần mở khóa ở mục <b>Khóa sổ tháng</b>.</span>
        </div>
      )}

      {/* Webhook ACB Matching Panel */}
      <section className="card-box" style={{ borderLeft: '4px solid #f97316', background: 'rgba(249, 115, 22, 0.03)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div>
            <h2 className="card-title" style={{ color: '#f97316' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} />
                <span>Đối Soát Biến Động Số Dư ACB (Bank Webhook Engine)</span>
                <span className="chip" style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#f97316', fontWeight: 600 }}>
                  {state.webhooks ? state.webhooks.length : 0} logs
                </span>
              </div>
              <small>Tự động ghi nhận biến động số dư ngân hàng ACB thời gian thực & 1-click Auto-Match với chứng từ sổ gốc</small>
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn xs"
              onClick={() => simulateWebhook()}
              style={{ background: '#f97316', color: '#fff', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Zap size={12} />
              <span>Simulate Webhook</span>
            </button>
            <button
              type="button"
              className="btn xs"
              onClick={() => setShowWebhookDrawer(!showWebhookDrawer)}
            >
              {showWebhookDrawer ? 'Thu gọn panel' : 'Mở danh sách Webhook'}
            </button>
          </div>
        </div>

        {showWebhookDrawer && (
          <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
            <div className="table-scroll">
              <table style={{ fontSize: '12.5px' }}>
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Mã Webhook</th>
                    <th>Biến động</th>
                    <th>Nội dung chuyển khoản</th>
                    <th>Trạng thái khớp</th>
                    <th>Chứng từ đối soát</th>
                    <th style={{ textAlign: 'right' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {(state.webhooks || []).map((w) => (
                    <tr key={w.id}>
                      <td style={{ fontFamily: 'var(--f-num)', whiteSpace: 'nowrap' }}>{dmy(w.date)}</td>
                      <td style={{ fontFamily: 'var(--f-num)', fontWeight: 600, color: '#f97316' }}>{w.bankTxId}</td>
                      <td className="num" style={{ color: w.dir === 'in' ? 'var(--good)' : 'var(--bad)', fontWeight: 700 }}>
                        {w.dir === 'in' ? '+' : '-'}{fmt(w.amount)} đ
                      </td>
                      <td style={{ maxWidth: '280px' }}>{w.description}</td>
                      <td>
                        {w.status === 'auto_matched' && (
                          <span className="chip good" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCircle size={11} /> Auto-Match
                          </span>
                        )}
                        {w.status === 'matched' && (
                          <span className="chip good" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Link2 size={11} /> Đã khớp
                          </span>
                        )}
                        {w.status === 'unmatched' && (
                          <span className="chip warn" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={11} /> Chưa khớp
                          </span>
                        )}
                      </td>
                      <td style={{ fontFamily: 'var(--f-num)', fontWeight: 600 }}>
                        {w.matchedTxId ? (
                          <span style={{ color: 'var(--teal)' }}>{w.matchedTxId}</span>
                        ) : (
                          <select
                            style={{ fontSize: '11.5px', padding: '2px 6px' }}
                            value={selectedTxForMatch}
                            onChange={(e) => setSelectedTxForMatch(e.target.value)}
                          >
                            <option value="">-- Chọn chứng từ ghép --</option>
                            {state.tx
                              .filter((t) => t.dir === w.dir && t.status !== 'posted')
                              .slice(0, 10)
                              .map((txItem) => (
                                <option key={txItem.id} value={txItem.id}>
                                  {txItem.id} · {txItem.desc.slice(0, 25)} ({fmt(txItem.amt)} đ)
                                </option>
                              ))}
                          </select>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {w.status === 'unmatched' && selectedTxForMatch && (
                          <button
                            type="button"
                            className="btn xs primary"
                            onClick={() => {
                              matchWebhook(w.id, selectedTxForMatch);
                              setSelectedTxForMatch('');
                            }}
                          >
                            <Link2 size={11} /> Khớp
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Main Table Card */}
      <section className="card-box">
        {/* Controls and Filter Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 className="card-title">
              <span>
                {f === 'pending'
                  ? 'Giao dịch chờ Admin xem xét'
                  : f === 'approve'
                  ? 'Giao dịch chờ Master phê duyệt (Sổ cái)'
                  : f === 'flag'
                  ? `Dòng có cảnh báo · ${monthLabel(m)}`
                  : `Sổ Giao Dịch Gốc · ${monthLabel(m)}`}
              </span>
              <small>
                {rows.length} dòng · thu {mil(totalIn)} · chi {mil(totalOut)}
              </small>
            </h2>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button
              type="button"
              className={`btn xs ${f === 'all' ? 'primary' : ''}`}
              onClick={() => setLedgerFilter('all')}
            >
              Tất cả ({state.tx.filter((t) => mon(t.date) === m).length})
            </button>
            <button
              type="button"
              className={`btn xs ${f === 'pending' ? 'primary' : ''}`}
              onClick={() => setLedgerFilter('pending')}
            >
              Chờ Admin ({state.tx.filter((t) => t.status === 'draft' || t.status === 'pending_admin' || t.status === 'pending').length})
            </button>
            <button
              type="button"
              className={`btn xs ${f === 'approve' ? 'primary' : ''}`}
              onClick={() => setLedgerFilter('approve')}
            >
              Chờ Master ({state.tx.filter((t) => t.status === 'pending_master' || (t.status === 'checked' && needsApproval(t))).length})
            </button>
            <button
              type="button"
              className={`btn xs ${f === 'flag' ? 'primary' : ''}`}
              onClick={() => setLedgerFilter('flag')}
            >
              Có cảnh báo ({state.tx.filter((t) => mon(t.date) === m && txIssues(t).length > 0).length})
            </button>
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
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác phê duyệt</th>
              </tr>
            </thead>
            <tbody>
              {f === 'all' && (
                <tr style={{ background: 'var(--soft)', fontWeight: 600 }}>
                  <td colSpan={5}>Số dư đầu kỳ {monthLabel(m)}</td>
                  <td colSpan={2} className="num">
                    Quỹ: {fm(openingQuy)} · ACB: {fm(openingAcb)}
                  </td>
                  <td colSpan={2} />
                </tr>
              )}

              {rows.map((t) => {
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
                    <td>{renderStatusChip(t)}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        {/* 1. Nút cho Operator gửi duyệt Admin nếu là bản nháp */}
                        {t.status === 'draft' && (
                          <button
                            type="button"
                            className="btn xs primary"
                            onClick={() => updateTransaction(t.id, { status: 'pending_admin' })}
                            title="Gửi chứng từ lên Admin xem xét"
                          >
                            <ArrowRight size={12} />
                            <span>Gửi Admin</span>
                          </button>
                        )}

                        {/* 2. Nút cho Admin xem xét & sơ duyệt */}
                        {(canDo('forward') || canDo('check')) && (t.status === 'pending_admin' || t.status === 'pending') && (
                          <>
                            <button
                              type="button"
                              className="btn xs primary"
                              onClick={() => forwardTransaction(t.id)}
                              title="Sơ duyệt đối chiếu hợp lệ, chuyển tiếp Master"
                            >
                              <Check size={12} />
                              <span>Sơ duyệt</span>
                            </button>
                            <button
                              type="button"
                              className="btn xs danger"
                              onClick={() => returnTransaction(t.id, 'Yêu cầu kiểm tra lại chứng từ gốc')}
                              title="Trả lại cho nhân viên làm lại"
                            >
                              <CornerUpLeft size={12} />
                              <span>Trả lại</span>
                            </button>
                          </>
                        )}

                        {/* 3. Nút cho Master phê duyệt cuối cùng vào Sổ Cái */}
                        {(canDo('post') || canDo('approve')) && (t.status === 'pending_master' || t.status === 'checked') && (
                          <>
                            <button
                              type="button"
                              className="btn xs primary"
                              onClick={() => postTransaction(t.id)}
                              style={{ background: 'var(--good)', borderColor: 'var(--good)' }}
                              title="Master phê duyệt cuối cùng, ghi chính thức vào Sổ Cái"
                            >
                              <ShieldCheck size={12} />
                              <span>Chốt Sổ Cái</span>
                            </button>
                            <button
                              type="button"
                              className="btn xs danger"
                              onClick={() => rejectTransaction(t.id, 'Master từ chối giao dịch')}
                              title="Từ chối phê duyệt"
                            >
                              <XCircle size={12} />
                              <span>Từ chối</span>
                            </button>
                          </>
                        )}

                        {/* Nút sửa phân loại chi phí */}
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
                      </div>
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                    Không có giao dịch nào phù hợp bộ lọc
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

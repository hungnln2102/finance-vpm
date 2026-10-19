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
  Lock
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
    approveTransaction 
  } = useApp();

  const m = ui.month;
  const f = ui.ledgerFilter;
  const locked = !!state.locks[m];

  // Filtering transactions
  let rows = state.tx.filter((t) => mon(t.date) === m);
  if (f === 'pending') {
    rows = state.tx.filter((t) => t.status === 'pending');
  } else if (f === 'approve') {
    rows = state.tx.filter((t) => t.status === 'checked' && needsApproval(t));
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

    if (t.status === 'returned') {
      return <span className="chip bad">Trả lại: {t.note || 'Thiếu chứng từ'}</span>;
    }

    const steps = [
      { key: 'pending', label: 'Tiên nhập' },
      { key: 'checked', label: 'VPM kiểm' }
    ];
    if (needsApproval(t)) {
      steps.push({ key: 'approved', label: 'Chị Giàu duyệt' });
    }

    const stepOrder: Record<string, number> = { pending: 0, checked: 1, approved: 2 };
    const currentStep = stepOrder[t.status] ?? 0;
    const isFinished = needsApproval(t) ? t.status === 'approved' : t.status !== 'pending';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ display: 'flex', gap: '3px' }}>
          {steps.map((st, i) => (
            <span
              key={st.key}
              style={{
                fontSize: '11px',
                padding: '2px 7px',
                borderRadius: '8px',
                background: i <= currentStep ? 'var(--teal-soft)' : 'var(--soft)',
                color: i <= currentStep ? 'var(--teal)' : 'var(--muted)',
                fontWeight: i <= currentStep ? 600 : 400
              }}
            >
              {st.label}
            </span>
          ))}
        </div>
        {isFinished && <span className="chip good">Xong</span>}
      </div>
    );
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

      {/* Main Table Card */}
      <section className="card-box">
        {/* Controls and Filter Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 className="card-title">
              <span>
                {f === 'pending'
                  ? 'Giao dịch chờ VPM kiểm tra'
                  : f === 'approve'
                  ? 'Giao dịch chờ chị Giàu duyệt'
                  : f === 'flag'
                  ? `Dòng có cảnh báo · ${monthLabel(m)}`
                  : `Giao dịch ${monthLabel(m)}`}
              </span>
              <small>
                {rows.length} dòng · thu {mil(totalIn)} · chi {mil(totalOut)}
              </small>
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
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
              Chờ VPM kiểm ({state.tx.filter((t) => t.status === 'pending').length})
            </button>
            <button
              type="button"
              className={`btn xs ${f === 'approve' ? 'primary' : ''}`}
              onClick={() => setLedgerFilter('approve')}
            >
              Chờ Giàu duyệt ({state.tx.filter((t) => t.status === 'checked' && needsApproval(t)).length})
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
                <th style={{ textAlign: 'right' }}>Thao tác</th>
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
                const isNeedApproval = needsApproval(t);

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
                        {canDo('check') && t.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              className="btn xs primary"
                              onClick={() => checkTransaction(t.id)}
                              title="Xác nhận kiểm tra chứng từ"
                            >
                              <Check size={12} />
                              <span>Kiểm</span>
                            </button>
                            <button
                              type="button"
                              className="btn xs danger"
                              onClick={() => returnTransaction(t.id)}
                              title="Trả lại yêu cầu bổ sung"
                            >
                              <CornerUpLeft size={12} />
                              <span>Trả</span>
                            </button>
                          </>
                        )}

                        {canDo('approve') && t.status === 'checked' && isNeedApproval && (
                          <button
                            type="button"
                            className="btn xs primary"
                            onClick={() => approveTransaction(t.id)}
                            style={{ background: 'var(--good)', borderColor: 'var(--good)' }}
                          >
                            <CheckCircle size={12} />
                            <span>Duyệt chi</span>
                          </button>
                        )}

                        {canDo('edit') && !locked && (
                          <button
                            type="button"
                            className="btn xs"
                            onClick={() => setEditTx(t.id)}
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

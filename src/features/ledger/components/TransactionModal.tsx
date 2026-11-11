import React, { useState, useEffect } from 'react';
import { useApp } from './../../../context/useApp';
import { Transaction, TransactionType } from '../../../types';
import { ACC, TYPES, CATS, APPROVE_LIMIT, TODAY } from '../../../data/constants';
import { fmt, lastDay, mon } from '../../../utils/formatters';
import { PlusCircle, Edit3, X } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTx?: Transaction | null;
  currentMonth: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  editingTx,
  currentMonth
}) => {
  const { state, addTransaction, updateTransaction } = useApp();

  const [date, setDate] = useState(() => {
    if (editingTx) return editingTx.date;
    return currentMonth === mon(TODAY) ? TODAY : `${currentMonth}-01`;
  });
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
      setDocFile(null);
    } else {
      setDate(currentMonth === mon(TODAY) ? TODAY : `${currentMonth}-01`);
      setAcc('QUY');
      setType('OPEX');
      setAmt('');
      setCat('');
      setContract('');
      setDesc('');
      setDocFile(null);
    }
  }, [editingTx, currentMonth, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-window"
        style={{ maxWidth: '640px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {editingTx ? (
              <Edit3 size={20} color="var(--teal)" />
            ) : (
              <PlusCircle size={20} color="var(--teal)" />
            )}
            <div>
              <h3 className="modal-title">
                {editingTx ? `Sửa phân loại giao dịch ${editingTx.id}` : 'Nhập giao dịch mới'}
              </h3>
              <p className="modal-sub">
                {editingTx
                  ? 'Chỉ VPM hoặc Master được sửa'
                  : `Chi từ ${fmt(APPROVE_LIMIT)} đ sẽ cần chị Giàu duyệt`}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Đóng modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div className="form-group">
                <label>Ngày giao dịch</label>
                <input
                  type="date"
                  required
                  value={date}
                  min="2026-01-01"
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

              <div className="form-group wide">
                <label>Chứng từ đính kèm</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ gap: '10px' }}>
            <button type="button" className="btn" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn primary">
              {editingTx ? 'Lưu phân loại' : 'Ghi vào sổ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


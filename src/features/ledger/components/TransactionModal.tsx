import React, { useState, useEffect } from 'react';
import { useApp } from './../../../context/useApp';
import { Transaction, TransactionType } from '../../../types';
import { CATS, APPROVE_LIMIT, TODAY } from '../../../data/constants';
import { fmt, mon } from '../../../utils/formatters';
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

  // Danh sách tài khoản đang kích hoạt (ON) từ Database (state.accounts), fallback về danh mục chuẩn
  const activeAccountsFromDb = (state.accounts || []).filter((a) => a.status === 'active');
  const accountList = activeAccountsFromDb.length > 0
    ? activeAccountsFromDb
    : (state.accounts && state.accounts.length > 0)
    ? state.accounts
    : [
        { id: 'QUY', name: 'Sổ quỹ văn phòng (Tiền mặt)' },
        { id: 'ACB', name: 'Tài khoản ACB (Ngân hàng Á Châu)' }
      ];

  const [date, setDate] = useState(() => {
    if (editingTx) return editingTx.date;
    return currentMonth === mon(TODAY) ? TODAY : `${currentMonth}-01`;
  });
  
  const [acc, setAcc] = useState(() => {
    if (editingTx) return editingTx.acc;
    return accountList[0]?.id || 'QUY';
  });

  // Phân chia 2 loại tiền duy nhất: Thu ('in') hoặc Chi ('out')
  const [dir, setDir] = useState<'in' | 'out'>('out');
  const [amt, setAmt] = useState<number | ''>('');
  const [cat, setCat] = useState('');
  const [desc, setDesc] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);

  useEffect(() => {
    if (editingTx) {
      setDate(editingTx.date);
      setAcc(editingTx.acc);
      const isOut = editingTx.dir === 'out' || ['OPEX', 'UNG_PHI', 'HOAN_UNG', 'CHUYEN_DFAM', 'TAM_UNG'].includes(editingTx.type);
      setDir(isOut ? 'out' : 'in');
      setAmt(editingTx.amt);
      setCat(editingTx.cat || '');
      setDesc(editingTx.desc);
      setDocFile(null);
    } else {
      setDate(currentMonth === mon(TODAY) ? TODAY : `${currentMonth}-01`);
      setAcc(accountList[0]?.id || 'QUY');
      setDir('out');
      setAmt('');
      setCat('');
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

  const isFormValid = Boolean(
    amt && 
    Number(amt) > 0 && 
    (dir === 'in' || (dir === 'out' && cat)) && 
    desc.trim()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amt || Number(amt) <= 0) return;
    if (dir === 'out' && !cat) return;
    if (!desc.trim()) return;

    // Loại nghiệp vụ kế toán
    const resolvedType: TransactionType = dir === 'out' ? 'OPEX' : 'THU_KHAC';

    if (editingTx) {
      updateTransaction(editingTx.id, {
        date,
        acc,
        dir,
        type: resolvedType,
        amt: Number(amt),
        cat: dir === 'out' ? cat : '',
        contract: '',
        desc: desc.trim()
      });
    } else {
      addTransaction({
        date,
        acc,
        dir,
        type: resolvedType,
        amt: Number(amt),
        cat: dir === 'out' ? cat : '',
        contract: '',
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
        style={{ maxWidth: '600px' }}
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
              
              {/* 1. Ngày giao dịch */}
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

              {/* 2. Tài khoản (Lấy từ bảng Database accounts) */}
              <div className="form-group">
                <label>Tài khoản</label>
                <select value={acc} onChange={(e) => setAcc(e.target.value)}>
                  {accountList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Loại tiền: Phân rõ 2 loại Thu và Chi */}
              <div className="form-group">
                <label>Loại tiền</label>
                <select
                  value={dir}
                  onChange={(e) => {
                    const newDir = e.target.value as 'in' | 'out';
                    setDir(newDir);
                    if (newDir === 'in') setCat('');
                  }}
                  style={{
                    fontWeight: 600,
                    color: dir === 'in' ? 'var(--good)' : 'var(--bad)'
                  }}
                >
                  <option value="in" style={{ color: 'var(--good)', fontWeight: 600 }}>
                    Thu (Tiền vào +)
                  </option>
                  <option value="out" style={{ color: 'var(--bad)', fontWeight: 600 }}>
                    Chi (Tiền ra -)
                  </option>
                </select>
              </div>

              {/* 4. Số tiền: Bắt buộc nhập > 0 */}
              <div className="form-group">
                <label>
                  Số tiền (đ) <span style={{ color: 'var(--bad)', fontWeight: 700 }}>*</span>
                </label>
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

              {/* 5. Nhóm chi phí: Bắt buộc chọn khi là Chi */}
              {dir === 'out' && (
                <div className="form-group wide">
                  <label>
                    Nhóm chi phí <span style={{ color: 'var(--bad)', fontWeight: 700 }}>*</span>
                  </label>
                  <select
                    value={cat}
                    required
                    onChange={(e) => setCat(e.target.value)}
                  >
                    <option value="">— Chọn nhóm chi phí (Bắt buộc) —</option>
                    {Object.entries(CATS).map(([k, label]) => (
                      <option key={k} value={k}>{label} ({k})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 6. Diễn giải */}
              <div className="form-group wide">
                <label>
                  Diễn giải <span style={{ color: 'var(--bad)', fontWeight: 700 }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={dir === 'in' ? 'vd Thu tiền hoàn ứng văn phòng' : 'vd Ship quà sinh nhật khách Liên'}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>

              {/* 7. Chứng từ đính kèm */}
              <div className="form-group wide">
                <label>Chứng từ đính kèm (Tùy chọn)</label>
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
            <button 
              type="submit" 
              disabled={!isFormValid}
              className="btn primary"
              style={{
                backgroundColor: dir === 'in' ? '#16a34a' : 'var(--teal)',
                borderColor: dir === 'in' ? '#16a34a' : 'var(--teal)',
                opacity: !isFormValid ? 0.45 : 1,
                cursor: !isFormValid ? 'not-allowed' : 'pointer'
              }}
              title={!isFormValid ? 'Vui lòng nhập số tiền hợp lệ và chọn nhóm chi phí' : undefined}
            >
              {editingTx ? 'Lưu thay đổi' : (dir === 'in' ? 'Ghi khoản Thu' : 'Ghi khoản Chi')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

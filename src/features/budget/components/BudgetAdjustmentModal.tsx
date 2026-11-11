import React, { useState } from 'react';
import { Target } from 'lucide-react';
import { CATS } from '../../../data/constants';
import { fmt, monthLabel } from '../../../utils/formatters';

interface BudgetAdjustmentModalProps {
  show: boolean;
  month: string;
  monthBudget: Record<string, number>;
  onClose: () => void;
  onSubmit: (data: {
    month: string;
    category: string;
    oldBudget: number;
    newBudget: number;
    reason: string;
  }) => void;
}

export const BudgetAdjustmentModal: React.FC<BudgetAdjustmentModalProps> = ({
  show,
  month,
  monthBudget,
  onClose,
  onSubmit,
}) => {
  const [adjustCat, setAdjustCat] = useState('SUKIEN');
  const [newBudget, setNewBudget] = useState<number | ''>('');
  const [reason, setReason] = useState('');

  if (!show) return null;

  const currentBudgetForCat = monthBudget[adjustCat] || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBudget === '' || Number(newBudget) < 0) return;

    onSubmit({
      month,
      category: adjustCat,
      oldBudget: currentBudgetForCat,
      newBudget: Number(newBudget),
      reason: reason.trim()
    });

    setNewBudget('');
    setReason('');
    onClose();
  };

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card-box" style={{ width: '520px', maxWidth: '92vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} style={{ color: 'var(--teal)' }} />
            <span>Lập Phiếu Điều Chỉnh Cost {monthLabel(month)}</span>
          </h3>
          <button type="button" className="btn xs" onClick={onClose}>
            Đóng
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group wide">
            <label>Danh mục chi phí Opex</label>
            <select value={adjustCat} onChange={(e) => setAdjustCat(e.target.value)}>
              {Object.entries(CATS).map(([k, label]) => (
                <option key={k} value={k}>{label} ({k})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Định mức hiện tại</label>
            <input
              type="text"
              disabled
              value={`${fmt(currentBudgetForCat)} đ`}
              style={{ background: 'var(--soft)', fontWeight: 600 }}
            />
          </div>

          <div className="form-group">
            <label>Định mức mới đề xuất (đ)</label>
            <input
              type="number"
              min="0"
              step="500000"
              required
              placeholder="vd 8000000"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>

          <div className="form-group wide">
            <label>Lý do và căn cứ điều chỉnh cost</label>
            <textarea
              rows={3}
              required
              placeholder="Giải trình lý do tăng/giảm định mức ngân sách so với kế hoạch ban đầu..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)' }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button type="button" className="btn" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn primary">
              Gửi phiếu điều chỉnh
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

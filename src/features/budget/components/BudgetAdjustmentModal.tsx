import React, { useState, useEffect, useMemo } from 'react';
import { Target, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { fmt, monthLabel } from '../../../utils/formatters';
import { CustomSelect, CustomSelectOption } from '../../../shared/components/common/CustomSelect';

interface BudgetAdjustmentModalProps {
  show: boolean;
  month: string;
  monthBudget: Record<string, number>;
  categoryNames: Record<string, string>;
  initialCategory?: string;
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
  categoryNames,
  initialCategory,
  onClose,
  onSubmit,
}) => {
  const [adjustCat, setAdjustCat] = useState('VP');
  const [newBudget, setNewBudget] = useState<number | ''>('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (show) {
      const defaultCat = initialCategory || 'VP';
      setAdjustCat(defaultCat);
      const cur = monthBudget[defaultCat] || 0;
      setNewBudget(cur > 0 ? cur : '');
      setReason('');
    }
  }, [show, initialCategory, monthBudget]);

  const categoryOptions: CustomSelectOption[] = useMemo(() => {
    return Object.entries(categoryNames).map(([k, label]) => ({
      value: k,
      label: label,
      badge: k,
      badgeColor: 'ochre'
    }));
  }, [categoryNames]);

  if (!show) return null;

  const currentBudgetForCat = monthBudget[adjustCat] || 0;
  const numNew = newBudget === '' ? 0 : Number(newBudget);
  const diff = numNew - currentBudgetForCat;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBudget === '' || Number(newBudget) < 0) return;

    onSubmit({
      month,
      category: adjustCat,
      oldBudget: currentBudgetForCat,
      newBudget: Number(newBudget),
      reason: reason.trim() || 'Điều chỉnh định mức chi phí theo kế hoạch hoạt động thực tế'
    });

    setNewBudget('');
    setReason('');
    onClose();
  };

  return (
    <div 
      className="modal-backdrop" 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,0,0,0.65)', 
        backdropFilter: 'blur(4px)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 1000 
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="card-box" 
        style={{ 
          width: '540px', 
          maxWidth: '92vw',
          boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
          border: '1px solid var(--line)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--ink)' }}>
            <Target size={18} style={{ color: 'var(--teal)' }} />
            <span>Lập Phiếu Điều Chỉnh Cost {monthLabel(month)}</span>
          </h3>
          <button type="button" className="btn btn-ghost xs" onClick={onClose} style={{ color: 'var(--muted)' }}>
            Đóng
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Chọn danh mục */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>
              1. Danh mục chi phí Opex:
            </label>
            <CustomSelect
              value={adjustCat}
              options={categoryOptions}
              onChange={(val) => {
                setAdjustCat(val);
                const cur = monthBudget[val] || 0;
                setNewBudget(cur > 0 ? cur : '');
              }}
              minWidth="100%"
              width="100%"
            />
          </div>

          {/* Hai ô định mức */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>
                Định mức hiện tại:
              </label>
              <input
                type="text"
                disabled
                value={`${fmt(currentBudgetForCat)} đ`}
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--line)',
                  background: 'var(--soft)',
                  fontWeight: 700,
                  fontFamily: 'var(--f-num)',
                  color: 'var(--ink)',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>
                Định mức mới đề xuất (đ):
              </label>
              <input
                type="number"
                min="0"
                step="100000"
                required
                placeholder="VD: 15000000"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value === '' ? '' : Number(e.target.value))}
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--line)',
                  background: 'var(--panel)',
                  fontWeight: 700,
                  fontFamily: 'var(--f-num)',
                  color: 'var(--teal)'
                }}
              />
            </div>
          </div>

          {/* Card so sánh biến động */}
          {newBudget !== '' && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                background: diff >= 0 ? 'rgba(20, 184, 166, 0.08)' : 'rgba(234, 88, 12, 0.08)',
                border: `1px solid ${diff >= 0 ? 'rgba(20, 184, 166, 0.25)' : 'rgba(234, 88, 12, 0.25)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '12.5px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {diff >= 0 ? (
                  <TrendingUp size={16} style={{ color: 'var(--teal)' }} />
                ) : (
                  <TrendingDown size={16} style={{ color: '#ea580c' }} />
                )}
                <span>
                  <b>{categoryNames[adjustCat] || adjustCat}</b>: {fmt(currentBudgetForCat)} đ
                </span>
                <ArrowRight size={13} style={{ color: 'var(--muted)' }} />
                <span style={{ fontWeight: 700, color: 'var(--teal)' }}>
                  {fmt(numNew)} đ
                </span>
              </div>
              <div style={{ fontWeight: 700, fontFamily: 'var(--f-num)', color: diff >= 0 ? 'var(--teal)' : '#ea580c' }}>
                {diff >= 0 ? `+${fmt(diff)} đ (Tăng)` : `${fmt(diff)} đ (Giảm)`}
              </div>
            </div>
          )}

          {/* Lý do và căn cứ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>
              Lý do điều chỉnh (Bắt buộc):
            </label>
            <textarea
              rows={3}
              required
              placeholder="Nhập lý do chi tiết điều chỉnh định mức cost để gửi Master xem xét phê duyệt..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--line)',
                background: 'var(--panel)',
                color: 'var(--ink)',
                fontSize: '13px',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
            <span style={{ fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic' }}>
              💡 Khi bấm Hoàn tất, hệ thống sẽ tạo log phiếu ở trạng thái "Chờ duyệt". Bảng trên vẫn giữ nguyên giá cũ cho đến khi được Master phê duyệt.
            </span>
          </div>

          {/* Nút hành động */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px', borderTop: '1px solid var(--line)', paddingTop: '14px' }}>
            <button type="button" className="btn xs" onClick={onClose}>
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn xs primary"
              disabled={newBudget === '' || Number(newBudget) < 0 || !reason.trim()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 14px', fontWeight: 600 }}
            >
              Hoàn tất
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

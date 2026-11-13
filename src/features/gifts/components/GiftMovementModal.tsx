import React, { useState, useEffect } from 'react';
import { GiftItem, GiftMovement } from '../../../types';
import { StockSummary } from '../../../services/inventoryService';
import { fmt } from '../../../utils/formatters';
import { PlusCircle, ArrowDownRight, ArrowUpRight, AlertTriangle, X } from 'lucide-react';

interface GiftMovementModalProps {
  show: boolean;
  items: GiftItem[];
  stock: StockSummary;
  initialItemId?: string;
  onClose: () => void;
  onSubmit: (mv: Omit<GiftMovement, 'd'>) => Promise<boolean> | void;
  onError: (message: string) => void;
}

export const GiftMovementModal: React.FC<GiftMovementModalProps> = ({
  show,
  items,
  stock,
  initialItemId,
  onClose,
  onSubmit,
  onError
}) => {
  const [kind, setKind] = useState<'out' | 'in'>('out');
  const [item, setItem] = useState<string>(items[0]?.id || 'Q01');
  const [qty, setQty] = useState<number | ''>('');
  const [to, setTo] = useState<string>('TV');
  const [who, setWho] = useState<string>('');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (show) {
      setKind('out');
      setItem(initialItemId || items[0]?.id || 'Q01');
      setQty('');
      setTo('TV');
      setWho('');
      setNote('');
    }
  }, [show, initialItemId, items]);

  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, onClose]);

  if (!show) return null;

  const selectedItem = items.find((i) => i.id === item);
  const currentStock = stock[item] || { in: 0, out: 0, balance: 0 };
  const numQty = Number(qty) || 0;
  const totalVal = (selectedItem?.price || 0) * numQty;
  const isOverStock = kind === 'out' && numQty > currentStock.balance;
  const tvDeduction = kind === 'out' && to === 'TV' ? totalVal * 0.5 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qty || Number(qty) <= 0 || !who.trim()) return;

    if (kind === 'out' && Number(qty) > currentStock.balance) {
      onError(`Không đủ tồn kho: hiện chỉ còn ${currentStock.balance} ${selectedItem?.unit || ''}`);
      return;
    }

    const res = await onSubmit({
      item,
      qty: Number(qty),
      kind,
      to: kind === 'out' ? to : undefined,
      who: who.trim(),
      note: note.trim() || undefined
    });

    if (res !== false) {
      onClose();
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-window"
        style={{
          maxWidth: '560px',
          borderTop: `4px solid ${kind === 'out' ? 'var(--ochre)' : 'var(--good)'}`
        }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={18} style={{ color: kind === 'out' ? 'var(--ochre)' : 'var(--good)' }} />
              <span>Tạo Phiếu {kind === 'out' ? 'Xuất Kho' : 'Nhập Kho'} Quà & Ấn Phẩm</span>
            </h3>
            <p className="modal-sub">
              Xuất cho Tư vấn (TV) sẽ tự động ghi nhận khấu trừ 50% giá trị quà
            </p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} title="Đóng (ESC)">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ gap: '16px' }}>
            {/* Segmented Tab: Xuất kho / Nhập kho */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px', display: 'block' }}>
                Loại phiếu kho:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'var(--soft)', padding: '4px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                <button
                  type="button"
                  onClick={() => setKind('out')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '13px',
                    background: kind === 'out' ? 'var(--ochre)' : 'transparent',
                    color: kind === 'out' ? '#fff' : 'var(--muted)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <ArrowUpRight size={15} />
                  <span>Xuất kho (Quà tặng)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setKind('in')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '13px',
                    background: kind === 'in' ? 'var(--good)' : 'transparent',
                    color: kind === 'in' ? '#fff' : 'var(--muted)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <ArrowDownRight size={15} />
                  <span>Nhập kho (Bổ sung)</span>
                </button>
              </div>
            </div>

            {/* Chọn vật phẩm + Số lượng */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Vật phẩm *</label>
                <select value={item} onChange={(e) => setItem(e.target.value)}>
                  {items.map((it) => {
                    const bal = stock[it.id]?.balance || 0;
                    return (
                      <option key={it.id} value={it.id}>
                        {it.id} · {it.name} (Tồn: {bal} {it.unit})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label>Số lượng ({selectedItem?.unit || 'đơn vị'}) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="vd 10"
                  value={qty}
                  onChange={(e) => setQty(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
            </div>

            {/* Cảnh báo vượt tồn kho */}
            {isOverStock && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bad-soft)',
                  color: 'var(--bad)',
                  fontSize: '12.5px',
                  fontWeight: 600
                }}
              >
                <AlertTriangle size={16} />
                <span>
                  Số lượng xuất ({numQty}) vượt quá tồn kho khả dụng hiện tại ({currentStock.balance} {selectedItem?.unit}).
                </span>
              </div>
            )}

            {/* Đối tượng nhận (chỉ khi Xuất kho) */}
            {kind === 'out' && (
              <div className="form-group">
                <label>Đối tượng nhận *</label>
                <select value={to} onChange={(e) => setTo(e.target.value)}>
                  <option value="TV">Tư vấn (TV - tự động trừ 50% lương)</option>
                  <option value="SK">Sự kiện, hội thảo (SK)</option>
                  <option value="KH">Khách hàng trực tiếp (KH)</option>
                </select>
              </div>
            )}

            {/* Người nhận / Mục đích */}
            <div className="form-group">
              <label>{kind === 'out' ? 'Người nhận / Mục đích xuất *' : 'Nguồn nhập / Người phụ trách *'}</label>
              <input
                type="text"
                required
                placeholder={
                  kind === 'out'
                    ? 'vd Nguyễn Hữu Thạch (Tặng khách dịp trung thu)'
                    : 'vd Nhập bổ sung quà sự kiện tháng 11'
                }
                value={who}
                onChange={(e) => setWho(e.target.value)}
              />
            </div>

            {/* Ghi chú bổ sung */}
            <div className="form-group">
              <label>Ghi chú (Tùy chọn)</label>
              <input
                type="text"
                placeholder="Ghi chú thêm về chứng từ, chương trình hoặc đợt tặng..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* Khung tóm tắt giá trị phiếu */}
            <div
              style={{
                background: 'var(--soft)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                border: '1px solid var(--line)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <div style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                Thành tiền ({numQty || 0} × {fmt(selectedItem?.price || 0)} đ):{' '}
                <b style={{ fontFamily: 'var(--f-num)', color: 'var(--ink)', fontSize: '14px' }}>
                  {fmt(totalVal)} đ
                </b>
              </div>
              {tvDeduction > 0 && (
                <div style={{ fontSize: '12px', color: 'var(--bad)', fontWeight: 700, fontFamily: 'var(--f-num)' }}>
                  Khấu trừ TV 50%: −{fmt(tvDeduction)} đ
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer" style={{ gap: '10px' }}>
            <button type="button" className="btn" onClick={onClose}>
              Hủy
            </button>
            <button
              type="submit"
              className="btn primary"
              disabled={!qty || Number(qty) <= 0 || !who.trim() || isOverStock}
            >
              {kind === 'out' ? 'Ghi phiếu xuất kho' : 'Ghi phiếu nhập kho'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

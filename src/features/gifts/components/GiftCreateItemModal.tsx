import React, { useState, useEffect, useMemo } from 'react';
import { GiftItem } from '../../../types';
import { fmt } from '../../../utils/formatters';
import { PackagePlus, X, AlertCircle, Database } from 'lucide-react';

interface GiftCreateItemModalProps {
  show: boolean;
  existingItems: GiftItem[];
  onClose: () => void;
  onSubmit: (data: {
    id: string;
    name: string;
    unit: string;
    price: number;
    initialQty?: number;
    note?: string;
  }) => Promise<boolean>;
}

const COMMON_UNITS = ['hộp', 'phần', 'cuốn', 'tờ', 'cái', 'bộ'];

export const GiftCreateItemModal: React.FC<GiftCreateItemModalProps> = ({
  show,
  existingItems,
  onClose,
  onSubmit
}) => {
  const suggestedId = useMemo(() => {
    let maxNum = 0;
    for (const it of existingItems) {
      const m = it.id.match(/^Q(\d+)$/i);
      if (m) {
        const n = parseInt(m[1], 10);
        if (n > maxNum) maxNum = n;
      }
    }
    return `Q${String(maxNum + 1).padStart(2, '0')}`;
  }, [existingItems]);

  const [id, setId] = useState(suggestedId);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('cái');
  const [price, setPrice] = useState<number | ''>('');
  const [initialQty, setInitialQty] = useState<number | ''>(0);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      setId(suggestedId);
      setName('');
      setUnit('cái');
      setPrice('');
      setInitialQty(0);
      setNote('');
      setSubmitting(false);
      setError('');
    }
  }, [show, suggestedId]);

  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, onClose]);

  if (!show) return null;

  const normalizedId = id.trim().toUpperCase();
  const isDuplicateId = existingItems.some((it) => it.id.toUpperCase() === normalizedId);
  const numPrice = Number(price) || 0;
  const numInitialQty = Number(initialQty) || 0;
  const initialTotalValue = numPrice * numInitialQty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!normalizedId || !name.trim() || !unit.trim() || price === '' || Number(price) < 0) {
      setError('Vui lòng nhập đầy đủ Mã, Tên sản phẩm, Đơn vị tính và Đơn giá hợp lệ.');
      return;
    }

    if (isDuplicateId) {
      setError(`Mã sản phẩm "${normalizedId}" đã tồn tại trong cơ sở dữ liệu.`);
      return;
    }

    setSubmitting(true);
    const ok = await onSubmit({
      id: normalizedId,
      name: name.trim(),
      unit: unit.trim(),
      price: Number(price),
      initialQty: numInitialQty > 0 ? numInitialQty : 0,
      note: note.trim() || undefined
    });
    setSubmitting(false);

    if (ok) {
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
          borderTop: '4px solid var(--teal)'
        }}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PackagePlus size={18} style={{ color: 'var(--teal)' }} />
              <span>Tạo Sản Phẩm / Ấn Phẩm Mới</span>
            </h3>
            <p className="modal-sub" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Database size={12} style={{ color: 'var(--teal)' }} />
              <span>Lưu trực tiếp vào bảng PostgreSQL (finance_vpm.gift_items)</span>
            </p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} title="Đóng (ESC)">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ gap: '16px' }}>
            {/* Mã sản phẩm + Đơn vị tính */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '12px' }}>
              <div className="form-group">
                <label>Mã sản phẩm *</label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="VD: Q07"
                  value={id}
                  onChange={(e) => {
                    setId(e.target.value.toUpperCase());
                    setError('');
                  }}
                />
              </div>

              <div className="form-group">
                <label>Đơn vị tính *</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    required
                    maxLength={24}
                    placeholder="VD: hộp, cái, cuốn..."
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                  {COMMON_UNITS.map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUnit(u)}
                      className={`chip ${unit === u ? 'teal' : ''}`}
                      style={{ cursor: 'pointer', border: 'none', fontSize: '11px', padding: '1px 8px' }}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cảnh báo trùng mã */}
            {(isDuplicateId || error) && (
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
                <AlertCircle size={16} />
                <span>{error || `Mã sản phẩm "${normalizedId}" đã tồn tại. Vui lòng chọn mã khác.`}</span>
              </div>
            )}

            {/* Tên sản phẩm */}
            <div className="form-group">
              <label>Tên sản phẩm / Ấn phẩm *</label>
              <input
                type="text"
                required
                maxLength={200}
                placeholder="VD: Lịch để bàn 2027, Bình giữ nhiệt thương hiệu..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Đơn giá + Số lượng nhập kho ban đầu */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Đơn giá chuẩn (đ/{unit || 'đơn vị'}) *</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  placeholder="VD: 150000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label>Tồn đầu / Nhập kho ban đầu ({unit || 'đơn vị'})</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Mặc định: 0"
                  value={initialQty}
                  onChange={(e) => setInitialQty(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
            </div>

            {numInitialQty > 0 && (
              <div className="form-group">
                <label>Ghi chú phiếu nhập ban đầu (Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="VD: Nhập kho lô đầu tiên khi khởi tạo sản phẩm"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            )}

            {/* Preview tóm tắt */}
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
                Đơn giá: <b style={{ fontFamily: 'var(--f-num)', color: 'var(--ink)' }}>{fmt(numPrice)} đ/{unit || 'đơn vị'}</b>
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                Giá trị tồn ban đầu ({numInitialQty} {unit}):{' '}
                <b style={{ fontFamily: 'var(--f-num)', color: 'var(--good)', fontSize: '14px' }}>
                  {fmt(initialTotalValue)} đ
                </b>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ gap: '10px' }}>
            <button type="button" className="btn" onClick={onClose} disabled={submitting}>
              Hủy
            </button>
            <button
              type="submit"
              className="btn primary"
              disabled={submitting || !normalizedId || !name.trim() || !unit.trim() || price === '' || Number(price) < 0 || isDuplicateId}
            >
              <PackagePlus size={15} />
              <span>{submitting ? 'Đang lưu DB...' : 'Lưu sản phẩm vào DB'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

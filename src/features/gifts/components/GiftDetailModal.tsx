import React, { useEffect } from 'react';
import { GiftItem, GiftMovement } from '../../../types';
import { fmt, dmy } from '../../../utils/formatters';
import { ArrowDownRight, ArrowUpRight, Package, PlusCircle, X, History } from 'lucide-react';

interface GiftDetailModalProps {
  item: GiftItem | null;
  stock: {
    in: number;
    out: number;
    balance: number;
  };
  movements: GiftMovement[];
  canCreate?: boolean;
  onClose: () => void;
  onOpenCreateForItem?: (itemId: string) => void;
}

export const GiftDetailModal: React.FC<GiftDetailModalProps> = ({
  item,
  stock,
  movements,
  canCreate,
  onClose,
  onOpenCreateForItem
}) => {
  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  const itemMovements = [...movements].filter((m) => m.item === item.id).reverse();
  const totalInValue = stock.in * item.price;
  const totalOutValue = stock.out * item.price;
  const totalStockValue = stock.balance * item.price;

  let itemTvDeduction = 0;
  for (const m of itemMovements) {
    if (m.kind === 'out' && m.to === 'TV') {
      itemTvDeduction += m.qty * item.price * 0.5;
    }
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-window" style={{ maxWidth: '860px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="ledger-kpi-badge teal">
              <Package size={18} />
            </div>
            <div>
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{item.name}</span>
                <span className="chip teal">{item.id}</span>
              </h3>
              <p className="modal-sub">
                Đơn giá chuẩn: <b style={{ fontFamily: 'var(--f-num)', color: 'var(--ink)' }}>{fmt(item.price)} đ/{item.unit}</b> · Nhật ký biến động xuất/nhập kho chi tiết
              </p>
            </div>
          </div>

          <button type="button" className="modal-close-btn" onClick={onClose} title="Đóng (ESC)">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* 4 chỉ số tổng hợp của riêng vật phẩm */}
          <div className="tiles-grid">
            <div className="metric-tile">
              <div className="metric-tile-header">
                <span className="metric-key">Tổng đã nhập</span>
              </div>
              <span className="metric-val" style={{ color: 'var(--good)', fontSize: '20px' }}>
                {stock.in} {item.unit}
              </span>
              <span className="metric-note" style={{ fontFamily: 'var(--f-num)' }}>
                Giá trị: {fmt(totalInValue)} đ
              </span>
            </div>

            <div className="metric-tile">
              <div className="metric-tile-header">
                <span className="metric-key">Tổng đã xuất</span>
              </div>
              <span className="metric-val" style={{ color: 'var(--ochre)', fontSize: '20px' }}>
                {stock.out} {item.unit}
              </span>
              <span className="metric-note" style={{ fontFamily: 'var(--f-num)' }}>
                Giá trị: {fmt(totalOutValue)} đ
              </span>
            </div>

            <div className={`metric-tile ${stock.balance < 5 ? 'bad' : 'good'}`}>
              <div className="metric-tile-header">
                <span className="metric-key">Tồn kho hiện tại</span>
              </div>
              <span className="metric-val" style={{ fontSize: '20px' }}>
                {stock.balance} {item.unit}
              </span>
              <span className="metric-note" style={{ fontFamily: 'var(--f-num)' }}>
                Giá trị tồn: {fmt(totalStockValue)} đ
              </span>
            </div>

            <div className="metric-tile warn">
              <div className="metric-tile-header">
                <span className="metric-key">Khấu trừ TV 50%</span>
              </div>
              <span className="metric-val" style={{ fontSize: '20px' }}>
                {fmt(itemTvDeduction)} đ
              </span>
              <span className="metric-note">Tính trên các phiếu xuất Tư vấn</span>
            </div>
          </div>

          {/* Bảng lịch sử biến động của vật phẩm */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
                <History size={16} style={{ color: 'var(--teal)' }} />
                <span>Lịch sử xuất / nhập của {item.name}</span>
                <span className="chip">{itemMovements.length} lượt</span>
              </div>
            </div>

            {itemMovements.length === 0 ? (
              <div
                style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  background: 'var(--soft)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--muted)',
                  fontSize: '13px'
                }}
              >
                Chưa có lịch sử xuất hoặc nhập kho nào cho vật phẩm <b>{item.name}</b>.
              </div>
            ) : (
              <div className="table-scroll" style={{ maxHeight: '340px', border: '1px solid var(--line)' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      <th>Loại phiếu</th>
                      <th className="num">Số lượng</th>
                      <th className="num">Thành tiền (đ)</th>
                      <th>Đối tượng</th>
                      <th>Người nhận / Mục đích</th>
                      <th className="num">Khấu trừ TV (50%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemMovements.map((m, idx) => {
                      const val = item.price * m.qty;
                      const tvDed = m.kind === 'out' && m.to === 'TV' ? val * 0.5 : 0;

                      return (
                        <tr key={`${m.d}-${idx}`}>
                          <td style={{ whiteSpace: 'nowrap', fontFamily: 'var(--f-num)' }}>{dmy(m.d)}</td>
                          <td>
                            {m.kind === 'in' ? (
                              <span className="chip good">
                                <ArrowDownRight size={12} />
                                <span>Nhập kho</span>
                              </span>
                            ) : (
                              <span className="chip bad">
                                <ArrowUpRight size={12} />
                                <span>Xuất kho</span>
                              </span>
                            )}
                          </td>
                          <td className="num">
                            <b>{m.qty}</b> {item.unit}
                          </td>
                          <td className="num">{fmt(val)}</td>
                          <td>
                            {m.to === 'TV' ? (
                              <span className="chip ochre">Tư vấn</span>
                            ) : m.to === 'SK' ? (
                              <span className="chip teal">Sự kiện</span>
                            ) : m.to === 'KH' ? (
                              <span className="chip good">Khách hàng</span>
                            ) : (
                              <span className="chip">—</span>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{m.who}</div>
                            {m.note && <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{m.note}</div>}
                          </td>
                          <td className="num">
                            {tvDed > 0 ? (
                              <span style={{ color: 'var(--bad)', fontWeight: 600, fontFamily: 'var(--f-num)' }}>
                                −{fmt(tvDed)} đ
                              </span>
                            ) : (
                              <span style={{ color: 'var(--muted)' }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ gap: '10px' }}>
          {canCreate && onOpenCreateForItem && (
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                const targetId = item.id;
                onClose();
                onOpenCreateForItem(targetId);
              }}
            >
              <PlusCircle size={15} />
              <span>Tạo phiếu cho {item.id}</span>
            </button>
          )}
          <button type="button" className="btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

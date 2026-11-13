import React, { useState } from 'react';
import { useApp } from './../../context/useApp';
import { GiftItem } from '../../types';
import { fmt, dmy, fm } from '../../utils/formatters';
import { calculateGiftStock } from '../../services/inventoryService';
import { PlusCircle, PackagePlus, Package, ArrowDownRight, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { GiftItemCard } from './components/GiftItemCard';
import { GiftDetailModal } from './components/GiftDetailModal';
import { GiftMovementModal } from './components/GiftMovementModal';
import { GiftCreateItemModal } from './components/GiftCreateItemModal';

type GiftStockFilter = 'all' | 'in_stock' | 'out_of_stock';

export const GiftsView: React.FC = () => {
  const { state, canDo, addGiftItem, addGiftMovement, showToast } = useApp();

  const stock = calculateGiftStock(state.gifts);

  // Filter & Modal states
  const [stockFilter, setStockFilter] = useState<GiftStockFilter>('all');
  const [selectedItem, setSelectedItem] = useState<GiftItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);
  const [createInitialItemId, setCreateInitialItemId] = useState<string | undefined>(undefined);

  const canManageGift = canDo('gift');

  // Total Calculations & Filter Counts
  let totalInValue = 0;
  let totalOutValue = 0;
  let totalStockValue = 0;
  let totalTvDeduction = 0;
  let countInStock = 0;
  let countOutOfStock = 0;

  for (const it of state.gifts.items) {
    const st = stock[it.id] || { in: 0, out: 0, balance: 0 };
    totalInValue += st.in * it.price;
    totalOutValue += st.out * it.price;
    totalStockValue += (st.in - st.out) * it.price;
    if (st.balance > 0) {
      countInStock++;
    } else {
      countOutOfStock++;
    }
  }

  const countAll = state.gifts.items.length;

  const filteredItems = state.gifts.items.filter((it) => {
    const bal = stock[it.id]?.balance || 0;
    if (stockFilter === 'in_stock') return bal > 0;
    if (stockFilter === 'out_of_stock') return bal <= 0;
    return true;
  });

  for (const m of state.gifts.mv) {
    if (m.kind === 'out' && m.to === 'TV') {
      const it = state.gifts.items.find((i) => i.id === m.item);
      if (it) {
        totalTvDeduction += m.qty * it.price * 0.5;
      }
    }
  }

  const handleOpenCreateModal = (itemId?: string) => {
    setCreateInitialItemId(itemId);
    setShowCreateModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 4 Summary Tiles */}
      <div className="tiles-grid">
        <div className="metric-tile">
          <div className="metric-tile-header">
            <span className="metric-key">Giá trị nhập kho</span>
          </div>
          <span className="metric-val">{fm(totalInValue)}</span>
          <span className="metric-note">Từ các khoản chi mua quà trong sổ quỹ</span>
        </div>

        <div className="metric-tile">
          <div className="metric-tile-header">
            <span className="metric-key">Đã xuất kho</span>
          </div>
          <span className="metric-val">{fm(totalOutValue)}</span>
          <span className="metric-note">Xuất tặng KH, TV, Hội thảo sự kiện</span>
        </div>

        <div className="metric-tile good">
          <div className="metric-tile-header">
            <span className="metric-key">Giá trị tồn kho</span>
          </div>
          <span className="metric-val">{fm(totalStockValue)}</span>
          <span className="metric-note">Tổng giá trị hiện còn trong kho</span>
        </div>

        <div className="metric-tile warn">
          <div className="metric-tile-header">
            <span className="metric-key">Khấu trừ TV 50%</span>
          </div>
          <span className="metric-val">{fm(totalTvDeduction)}</span>
          <span className="metric-note">Thu hồi 50% tiền quà qua thu nhập tư vấn</span>
        </div>
      </div>

      {/* Khu vực các thẻ sản phẩm kèm Bộ lọc phân loại (Tất cả / Còn hàng / Hết hàng) & Button "+ Tạo sản phẩm" */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          {/* Cụm hạng mục phân loại: Tất cả · Còn hàng · Hết hàng */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setStockFilter('all')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: stockFilter === 'all' ? 700 : 500,
                background: stockFilter === 'all' ? 'var(--teal-soft)' : 'var(--panel)',
                color: stockFilter === 'all' ? 'var(--teal)' : 'var(--muted)',
                border: stockFilter === 'all' ? '1px solid var(--teal)' : '1px solid var(--line)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Package size={14} />
              <span>Tất cả ({countAll})</span>
            </button>

            <button
              type="button"
              onClick={() => setStockFilter('in_stock')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: stockFilter === 'in_stock' ? 700 : 500,
                background: stockFilter === 'in_stock' ? 'var(--good-soft)' : 'var(--panel)',
                color: stockFilter === 'in_stock' ? 'var(--good)' : 'var(--muted)',
                border: stockFilter === 'in_stock' ? '1px solid var(--good)' : '1px solid var(--line)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <CheckCircle2 size={14} />
              <span>Còn hàng ({countInStock})</span>
            </button>

            <button
              type="button"
              onClick={() => setStockFilter('out_of_stock')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: stockFilter === 'out_of_stock' ? 700 : 500,
                background: stockFilter === 'out_of_stock' ? 'var(--bad-soft)' : 'var(--panel)',
                color: stockFilter === 'out_of_stock' ? 'var(--bad)' : 'var(--muted)',
                border: stockFilter === 'out_of_stock' ? '1px solid var(--bad)' : '1px solid var(--line)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <AlertCircle size={14} />
              <span>Hết hàng ({countOutOfStock})</span>
            </button>
          </div>

          {canManageGift && (
            <button
              type="button"
              className="btn primary"
              onClick={() => setShowCreateItemModal(true)}
            >
              <PackagePlus size={16} />
              <span>+ Tạo sản phẩm</span>
            </button>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div
            className="card-box"
            style={{
              padding: '28px 18px',
              textAlign: 'center',
              color: 'var(--muted)',
              fontSize: '13.5px'
            }}
          >
            {stockFilter === 'in_stock'
              ? 'Hiện chưa có sản phẩm nào trong trạng thái Còn hàng.'
              : stockFilter === 'out_of_stock'
                ? 'Không có sản phẩm nào bị Hết hàng.'
                : 'Chưa có sản phẩm nào trong kho.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {filteredItems.map((it) => {
              const st = stock[it.id] || { in: 0, out: 0, balance: 0 };
              return (
                <GiftItemCard
                  key={it.id}
                  item={it}
                  stock={st}
                  onClick={(clickedItem) => setSelectedItem(clickedItem)}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Movement History Table */}
      <section className="card-box">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <h2 className="card-title" style={{ margin: 0 }}>
            <span>Lịch sử xuất / nhập kho</span>
            <small>{state.gifts.mv.length} phiếu</small>
          </h2>

          {canManageGift && (
            <button
              type="button"
              className="btn primary"
              onClick={() => handleOpenCreateModal()}
            >
              <PlusCircle size={16} />
              <span>+ Tạo phiếu xuất / nhập</span>
            </button>
          )}
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Loại</th>
                <th>Vật phẩm</th>
                <th className="num">Số lượng</th>
                <th className="num">Giá trị (đ)</th>
                <th>Đối tượng</th>
                <th>Người nhận / Diễn giải</th>
                <th>Khấu trừ TV (50%)</th>
              </tr>
            </thead>
            <tbody>
              {[...state.gifts.mv].reverse().map((m, idx) => {
                const it = state.gifts.items.find((i) => i.id === m.item);
                const val = (it ? it.price : 0) * m.qty;
                const tvDed = m.kind === 'out' && m.to === 'TV' ? val * 0.5 : 0;

                return (
                  <tr key={idx}>
                    <td style={{ whiteSpace: 'nowrap', fontFamily: 'var(--f-num)' }}>{dmy(m.d)}</td>
                    <td>
                      {m.kind === 'in' ? (
                        <span className="chip good">
                          <ArrowDownRight size={12} />
                          <span>Nhập</span>
                        </span>
                      ) : (
                        <span className="chip bad">
                          <ArrowUpRight size={12} />
                          <span>Xuất</span>
                        </span>
                      )}
                    </td>
                    <td>
                      <b>{it ? it.name : m.item}</b>
                    </td>
                    <td className="num">
                      <b>{m.qty}</b> {it?.unit}
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
                      <div>{m.who}</div>
                      {m.note && <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{m.note}</div>}
                    </td>
                    <td>
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
      </section>

      {/* Modal Chi Tiết Lịch Sử Từng Vật Phẩm */}
      <GiftDetailModal
        item={selectedItem}
        stock={selectedItem ? stock[selectedItem.id] || { in: 0, out: 0, balance: 0 } : { in: 0, out: 0, balance: 0 }}
        movements={state.gifts.mv}
        canCreate={canManageGift}
        onClose={() => setSelectedItem(null)}
        onOpenCreateForItem={(itemId) => handleOpenCreateModal(itemId)}
      />

      {/* Modal Tạo Sản Phẩm Mới (Lưu trực tiếp PostgreSQL) */}
      <GiftCreateItemModal
        show={showCreateItemModal}
        existingItems={state.gifts.items}
        onClose={() => setShowCreateItemModal(false)}
        onSubmit={(data) => addGiftItem(data)}
      />

      {/* Modal Tạo Phiếu Xuất / Nhập Kho */}
      <GiftMovementModal
        show={showCreateModal}
        items={state.gifts.items}
        stock={stock}
        initialItemId={createInitialItemId}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(mv) => addGiftMovement(mv)}
        onError={(msg) => showToast(msg, 'error')}
      />
    </div>
  );
};

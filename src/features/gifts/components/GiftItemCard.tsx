import React, { useState } from 'react';
import { GiftItem } from '../../../types';
import { fmt } from '../../../utils/formatters';
import { ArrowDownRight, ArrowUpRight, Package, History } from 'lucide-react';

interface GiftItemCardProps {
  item: GiftItem;
  stock: {
    in: number;
    out: number;
    balance: number;
  };
  onClick: (item: GiftItem) => void;
}

export const GiftItemCard: React.FC<GiftItemCardProps> = ({ item, stock, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const remain = stock.balance;
  const stockValue = remain * item.price;

  const isOut = remain <= 0;
  const isLow = remain > 0 && remain < 5;

  const statusBadge = isOut
    ? { label: 'Hết hàng', cls: 'bad' }
    : isLow
      ? { label: 'Sắp hết', cls: 'warn' }
      : { label: 'Còn hàng', cls: 'good' };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(item);
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="card-box"
      style={{
        padding: '16px 18px',
        gap: '12px',
        cursor: 'pointer',
        border: hovered ? '1px solid var(--teal)' : '1px solid var(--line)',
        boxShadow: hovered ? '0 8px 24px rgba(14, 106, 104, 0.16)' : 'var(--shadow-sm)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.18s ease',
        position: 'relative'
      }}
    >
      {/* Header: Mã vật phẩm + Badge trạng thái + Đơn giá */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="chip teal" style={{ fontWeight: 700 }}>{item.id}</span>
          <span className={`chip ${statusBadge.cls}`}>{statusBadge.label}</span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--f-num)', fontWeight: 600 }}>
          {fmt(item.price)} đ/{item.unit}
        </span>
      </div>

      {/* Tên vật phẩm */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Package size={16} style={{ color: 'var(--teal)', flexShrink: 0 }} />
        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink)', lineHeight: 1.3 }}>
          {item.name}
        </div>
      </div>

      {/* Bộ 3 chỉ số cốt lõi: Nhập - Xuất - Tồn */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '8px',
          background: 'var(--soft)',
          padding: '10px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--line)'
        }}
      >
        {/* Nhập (In) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '10.5px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <ArrowDownRight size={11} style={{ color: 'var(--good)' }} />
            Nhập
          </span>
          <span style={{ fontFamily: 'var(--f-num)', fontSize: '15px', fontWeight: 700, color: 'var(--good)' }}>
            {stock.in} <small style={{ fontSize: '11px', fontWeight: 500, color: 'var(--muted)' }}>{item.unit}</small>
          </span>
        </div>

        {/* Đã Xuất (Out) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderLeft: '1px solid var(--line)', paddingLeft: '8px' }}>
          <span style={{ fontSize: '10.5px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <ArrowUpRight size={11} style={{ color: 'var(--ochre)' }} />
            Đã xuất
          </span>
          <span style={{ fontFamily: 'var(--f-num)', fontSize: '15px', fontWeight: 700, color: 'var(--ochre)' }}>
            {stock.out} <small style={{ fontSize: '11px', fontWeight: 500, color: 'var(--muted)' }}>{item.unit}</small>
          </span>
        </div>

        {/* Tồn kho (Balance) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderLeft: '1px solid var(--line)', paddingLeft: '8px' }}>
          <span style={{ fontSize: '10.5px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--muted)' }}>
            Tồn kho
          </span>
          <span
            style={{
              fontFamily: 'var(--f-num)',
              fontSize: '16px',
              fontWeight: 800,
              color: isOut ? 'var(--bad)' : isLow ? 'var(--warn)' : 'var(--good)'
            }}
          >
            {remain} <small style={{ fontSize: '11px', fontWeight: 500 }}>{item.unit}</small>
          </span>
        </div>
      </div>

      {/* Footer: Giá trị tồn & Hint bấm xem lịch sử */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2px' }}>
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
          Giá trị tồn: <b style={{ fontFamily: 'var(--f-num)', color: 'var(--ink)' }}>{fmt(stockValue)} đ</b>
        </span>
        <span
          style={{
            fontSize: '11.5px',
            fontWeight: 600,
            color: hovered ? 'var(--teal)' : 'var(--muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'color 0.15s ease'
          }}
        >
          <History size={12} />
          <span>Bấm xem lịch sử</span>
        </span>
      </div>
    </div>
  );
};

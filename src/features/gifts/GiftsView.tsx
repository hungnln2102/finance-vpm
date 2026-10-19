import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GiftItem } from '../../types';
import { fmt, mil, dmy, fm } from '../../utils/formatters';
import { calculateGiftStock } from '../../services/inventoryService';
import { PlusCircle, Package, ArrowDownRight, ArrowUpRight, ShieldCheck } from 'lucide-react';

export const GiftsView: React.FC = () => {
  const { state, canDo, addGiftMovement, showToast } = useApp();

  const stock = calculateGiftStock(state.gifts);

  // Form state
  const [kind, setKind] = useState<'out' | 'in'>('out');
  const [item, setItem] = useState(state.gifts.items[0]?.id || 'Q01');
  const [qty, setQty] = useState<number | ''>('');
  const [to, setTo] = useState('TV');
  const [who, setWho] = useState('');
  const [note, setNote] = useState('');

  // Total Calculations
  let totalInValue = 0;
  let totalOutValue = 0;
  let totalStockValue = 0;
  let totalTvDeduction = 0;

  for (const it of state.gifts.items) {
    const st = stock[it.id] || { in: 0, out: 0, balance: 0 };
    totalInValue += st.in * it.price;
    totalOutValue += st.out * it.price;
    totalStockValue += (st.in - st.out) * it.price;
  }

  for (const m of state.gifts.mv) {
    if (m.kind === 'out' && m.to === 'TV') {
      const it = state.gifts.items.find((i) => i.id === m.item);
      if (it) {
        totalTvDeduction += (m.qty * it.price) * 0.5;
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qty || Number(qty) <= 0 || !who.trim()) return;

    const currentStock = stock[item] || { in: 0, out: 0, balance: 0 };
    if (kind === 'out' && Number(qty) > currentStock.balance) {
      showToast(`Không đủ tồn kho: hiện chỉ còn ${currentStock.balance}`, 'error');
      return;
    }

    addGiftMovement({
      item,
      qty: Number(qty),
      kind,
      to: kind === 'out' ? to : undefined,
      who: who.trim(),
      note: note.trim()
    });

    setQty('');
    setWho('');
    setNote('');
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

      {/* Stock Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
        {state.gifts.items.map((it) => {
          const st = stock[it.id] || { in: 0, out: 0, balance: 0 };
          const remain = st.in - st.out;

          return (
            <div key={it.id} className="card-box" style={{ padding: '14px 16px', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="chip teal">{it.id}</span>
                <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--f-num)' }}>
                  {fmt(it.price)} đ/{it.unit}
                </span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>{it.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  Nhập: <b>{st.in}</b> · Xuất: <b>{st.out}</b>
                </span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: remain < 5 ? 'var(--bad)' : 'var(--good)' }}>
                  Tồn: {remain} {it.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Section */}
      {canDo('gift') && (
        <section className="card-box" style={{ borderLeft: '4px solid var(--teal)' }}>
          <h2 className="card-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={18} style={{ color: 'var(--teal)' }} />
              <span>Tạo phiếu xuất / nhập quà & ấn phẩm</span>
            </div>
            <small>xuất cho Tư vấn sẽ tự động tính khấu trừ 50% giá trị quà</small>
          </h2>

          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>Loại phiếu</label>
              <select value={kind} onChange={(e) => setKind(e.target.value as 'out' | 'in')}>
                <option value="out">Xuất kho</option>
                <option value="in">Nhập kho</option>
              </select>
            </div>

            <div className="form-group">
              <label>Vật phẩm</label>
              <select value={item} onChange={(e) => setItem(e.target.value)}>
                {state.gifts.items.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.id} · {it.name} (Tồn: {stock[it.id]?.balance || 0} {it.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Số lượng</label>
              <input
                type="number"
                min="1"
                required
                placeholder="vd 10"
                value={qty}
                onChange={(e) => setQty(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>

            {kind === 'out' && (
              <div className="form-group">
                <label>Đối tượng nhận</label>
                <select value={to} onChange={(e) => setTo(e.target.value)}>
                  <option value="TV">Tư vấn (TV - trừ 50% lương)</option>
                  <option value="SK">Sự kiện, hội thảo (SK)</option>
                  <option value="KH">Khách hàng trực tiếp (KH)</option>
                </select>
              </div>
            )}

            <div className="form-group wide">
              <label>Người nhận / Mục đích</label>
              <input
                type="text"
                required
                placeholder="vd Nguyễn Hữu Thạch (Tặng khách dịp trung thu)"
                value={who}
                onChange={(e) => setWho(e.target.value)}
              />
            </div>

            <div style={{ marginTop: '6px' }}>
              <button type="submit" className="btn primary">
                {kind === 'out' ? 'Ghi phiếu xuất' : 'Ghi phiếu nhập'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Movement History Table */}
      <section className="card-box">
        <h2 className="card-title">
          <span>Lịch sử xuất / nhập kho</span>
          <small>{state.gifts.mv.length} phiếu</small>
        </h2>

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
    </div>
  );
};

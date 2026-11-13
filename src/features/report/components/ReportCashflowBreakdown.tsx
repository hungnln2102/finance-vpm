import React, { useState, useMemo } from 'react';
import { Transaction, Proposal, Contract, GiftItem, GiftMovement, ActiveTab } from '../../../types';
import { TYPES } from '../../../data/constants';
import { fmt, mon } from '../../../utils/formatters';
import { Layers, FileCheck2, FileText, Gift, ArrowUpRight } from 'lucide-react';

interface ReportCashflowBreakdownProps {
  month: string;
  monthTransactions: Transaction[];
  proposals: Proposal[];
  contracts: Contract[];
  gifts: {
    items: GiftItem[];
    mv: GiftMovement[];
  };
  onNavigate: (tab: ActiveTab) => void;
}

type CashflowFilter = 'all' | 'in' | 'out';

export const ReportCashflowBreakdown: React.FC<ReportCashflowBreakdownProps> = ({
  month,
  monthTransactions,
  proposals,
  contracts,
  gifts,
  onNavigate
}) => {
  const [flowFilter, setFlowFilter] = useState<CashflowFilter>('all');

  const typeStats = useMemo(() => {
    const map: Record<string, { inAmt: number; outAmt: number; count: number }> = {};
    for (const k of Object.keys(TYPES)) {
      map[k] = { inAmt: 0, outAmt: 0, count: 0 };
    }

    for (const t of monthTransactions) {
      const key = t.type && map[t.type] ? t.type : 'THU_KHAC';
      if (!map[key]) map[key] = { inAmt: 0, outAmt: 0, count: 0 };
      if (t.dir === 'in') map[key].inAmt += t.amt;
      else map[key].outAmt += t.amt;
      map[key].count += 1;
    }

    return Object.entries(TYPES).map(([code, def]) => ({
      code,
      label: def.l,
      defaultDir: def.dir,
      inAmt: map[code]?.inAmt || 0,
      outAmt: map[code]?.outAmt || 0,
      count: map[code]?.count || 0
    }));
  }, [monthTransactions]);

  const totalIn = typeStats.reduce((s, r) => s + r.inAmt, 0);
  const totalOut = typeStats.reduce((s, r) => s + r.outAmt, 0);
  const totalVolume = totalIn + totalOut;

  const filteredTypeRows = useMemo(() => {
    return typeStats.filter((r) => {
      if (flowFilter === 'in') return r.defaultDir === 'in' || r.inAmt > 0;
      if (flowFilter === 'out') return r.defaultDir === 'out' || r.outAmt > 0;
      return true;
    });
  }, [typeStats, flowFilter]);

  // Tổng hợp liên phân hệ trong tháng
  const monthProposals = useMemo(
    () => proposals.filter((p) => mon(p.date) === month),
    [proposals, month]
  );
  const approvedProposals = monthProposals.filter((p) => p.status === 'approved');
  const approvedProposalsAmt = approvedProposals.reduce((s, p) => s + p.amount, 0);

  const monthContracts = useMemo(
    () => contracts.filter((c) => c.signed && mon(c.signed) === month),
    [contracts, month]
  );
  const monthContractValue = monthContracts.reduce((s, c) => s + Math.max(0, c.fee - c.disc), 0);

  const monthGiftMv = useMemo(
    () => gifts.mv.filter((m) => mon(m.d) === month),
    [gifts.mv, month]
  );
  let monthGiftOutValue = 0;
  let monthGiftTvDed = 0;
  for (const m of monthGiftMv) {
    if (m.kind === 'out') {
      const it = gifts.items.find((i) => i.id === m.item);
      const val = (it?.price || 0) * m.qty;
      monthGiftOutValue += val;
      if (m.to === 'TV') monthGiftTvDed += val * 0.5;
    }
  }

  return (
    <div className="grid-2col" style={{ alignItems: 'start' }}>
      {/* Cột 1: Bảng phân tích dòng tiền theo loại nghiệp vụ */}
      <section className="card-box">
        <div className="card-header-flex">
          <div className="card-title-group">
            <div className="action-title-icon flow-icon">
              <Layers size={18} color="#3b82f6" />
            </div>
            <div>
              <h2 className="card-title" style={{ margin: 0 }}>
                Phân Tích Dòng Tiền Theo Loại Nghiệp Vụ
              </h2>
              <p className="card-subtitle-text">
                Bóc tách chi tiết các nguồn Thu và khoản Chi phát sinh trong kỳ
              </p>
            </div>
          </div>

          <div className="view-mode-toggle">
            <button
              type="button"
              className={`mode-btn ${flowFilter === 'all' ? 'active' : ''}`}
              onClick={() => setFlowFilter('all')}
            >
              Tất cả
            </button>
            <button
              type="button"
              className={`mode-btn ${flowFilter === 'in' ? 'active' : ''}`}
              onClick={() => setFlowFilter('in')}
            >
              Nguồn Thu
            </button>
            <button
              type="button"
              className={`mode-btn ${flowFilter === 'out' ? 'active' : ''}`}
              onClick={() => setFlowFilter('out')}
            >
              Khoản Chi
            </button>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Loại nghiệp vụ</th>
                <th className="num">Số GD</th>
                <th className="num">Thu (+)</th>
                <th className="num">Chi (−)</th>
                <th className="num">Tỷ trọng</th>
              </tr>
            </thead>
            <tbody>
              {filteredTypeRows.map((r) => {
                const rowAmt = r.inAmt + r.outAmt;
                const pct = totalVolume > 0 ? ((rowAmt / totalVolume) * 100).toFixed(1) : '0.0';

                return (
                  <tr key={r.code}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`chip ${r.defaultDir === 'in' ? 'good' : 'ochre'}`}>
                          {r.defaultDir === 'in' ? 'Thu' : 'Chi'}
                        </span>
                        <span style={{ fontWeight: 500 }}>{r.label}</span>
                      </div>
                    </td>
                    <td className="num" style={{ color: r.count > 0 ? 'var(--ink)' : 'var(--muted)' }}>
                      {r.count > 0 ? r.count : '—'}
                    </td>
                    <td className="num" style={{ color: r.inAmt > 0 ? 'var(--good)' : 'var(--muted)', fontWeight: r.inAmt > 0 ? 600 : 400 }}>
                      {r.inAmt > 0 ? `+${fmt(r.inAmt)}` : '—'}
                    </td>
                    <td className="num" style={{ color: r.outAmt > 0 ? 'var(--bad)' : 'var(--muted)', fontWeight: r.outAmt > 0 ? 600 : 400 }}>
                      {r.outAmt > 0 ? `−${fmt(r.outAmt)}` : '—'}
                    </td>
                    <td className="num" style={{ color: 'var(--muted)' }}>
                      {rowAmt > 0 ? `${pct}%` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="total">
                <td>Tổng cộng dòng tiền</td>
                <td className="num">{monthTransactions.length}</td>
                <td className="num" style={{ color: 'var(--good)' }}>
                  +{fmt(totalIn)}
                </td>
                <td className="num" style={{ color: 'var(--bad)' }}>
                  −{fmt(totalOut)}
                </td>
                <td className="num">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Cột 2: Tổng hợp nhanh hoạt động liên phân hệ trong kỳ */}
      <section className="card-box">
        <div className="card-header-flex">
          <div>
            <h2 className="card-title" style={{ margin: 0 }}>
              Điểm Nhấn Nghiệp Vụ Liên Phân Hệ Trong Kỳ
            </h2>
            <p className="card-subtitle-text">
              Tổng hợp dữ liệu từ Kế hoạch, Công nợ Hợp đồng và Kho Quà & Ấn phẩm
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 1. Kế hoạch & Đệ trình */}
          <div
            style={{
              padding: '14px 16px',
              background: 'var(--soft)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--line)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="ledger-kpi-badge teal">
                <FileCheck2 size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>
                  Kế Hoạch & Đệ Trình Đã Duyệt
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                  {approvedProposals.length} / {monthProposals.length} kế hoạch được phê duyệt trong kỳ
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--f-num)', fontWeight: 700, fontSize: '15px', color: 'var(--teal)' }}>
                {fmt(approvedProposalsAmt)} đ
              </div>
              <button
                type="button"
                className="btn xs"
                style={{ marginTop: '4px' }}
                onClick={() => onNavigate('proposals')}
              >
                <span>Xem kế hoạch</span>
                <ArrowUpRight size={12} />
              </button>
            </div>
          </div>

          {/* 2. Công nợ Hợp đồng */}
          <div
            style={{
              padding: '14px 16px',
              background: 'var(--soft)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--line)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="ledger-kpi-badge good">
                <FileText size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>
                  Hợp Đồng & Hóa Đơn Phát Sinh
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                  {monthContracts.length} hợp đồng / hóa đơn ghi nhận trong tháng
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--f-num)', fontWeight: 700, fontSize: '15px', color: 'var(--good)' }}>
                {fmt(monthContractValue)} đ
              </div>
              <button
                type="button"
                className="btn xs"
                style={{ marginTop: '4px' }}
                onClick={() => onNavigate('debt')}
              >
                <span>Đối soát công nợ</span>
                <ArrowUpRight size={12} />
              </button>
            </div>
          </div>

          {/* 3. Kho Quà & Ấn phẩm */}
          <div
            style={{
              padding: '14px 16px',
              background: 'var(--soft)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--line)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="ledger-kpi-badge ochre">
                <Gift size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>
                  Xuất Kho Quà Tặng & Khấu Trừ TV 50%
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                  Khấu trừ lương TV: <b style={{ color: 'var(--bad)', fontFamily: 'var(--f-num)' }}>−{fmt(monthGiftTvDed)} đ</b>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--f-num)', fontWeight: 700, fontSize: '15px', color: 'var(--ochre)' }}>
                {fmt(monthGiftOutValue)} đ
              </div>
              <button
                type="button"
                className="btn xs"
                style={{ marginTop: '4px' }}
                onClick={() => onNavigate('gifts')}
              >
                <span>Mở kho quà</span>
                <ArrowUpRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

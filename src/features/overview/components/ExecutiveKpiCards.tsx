import React from 'react';
import { useApp } from './../../../context/useApp';
import { TODAY } from '../../../data/constants';
import { fm, mil } from '../../../utils/formatters';
import { calculateBalance, opexBy, monthTx } from '../../../services/financeService';
import { calculateDebt } from '../../../services/debtService';
import { Wallet, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';

export const ExecutiveKpiCards: React.FC = () => {
  const { state, ui } = useApp();

  // 1. Dữ liệu thật: Số dư các tài khoản đang Kích Hoạt (ON) từ Tab Tài Sản
  const activeAccounts = (state.accounts && state.accounts.length > 0)
    ? state.accounts.filter((a) => a.status === 'active')
    : [
        { id: 'QUY', name: 'Tiền mặt', type: 'cash', status: 'active' },
        { id: 'ACB', name: 'Ngân hàng ACB', type: 'bank', status: 'active' }
      ];

  const accountBalances = activeAccounts.map((acc) => ({
    id: acc.id,
    name: acc.name,
    bal: calculateBalance(state.tx, acc.id, TODAY)
  }));

  const totalLiquid = accountBalances.reduce((sum, a) => sum + a.bal, 0);
  const anyNegativeAcc = accountBalances.find((a) => a.bal < 0);

  // 2. Dữ liệu thật: Công nợ khách hàng & tư vấn
  const khDebts = state.contracts.filter((c) => c.kind === 'KH').map((c) => calculateDebt(c, state.tx, TODAY));
  const tvDebts = state.contracts.filter((c) => c.kind === 'TV').map((c) => calculateDebt(c, state.tx, TODAY));

  const overKH = khDebts.reduce((sum, d) => sum + (d.over > 0 ? d.left : 0), 0);
  const overTV = tvDebts.reduce((sum, d) => sum + (d.over > 0 ? d.left : 0), 0);
  const totalOverdue = overKH + overTV;

  // 3. Dữ liệu thật: Thực thu trong tháng đang chọn
  const mTx = monthTx(state.tx, ui.month);
  const inTx = mTx.filter((t) => t.dir === 'in');
  const totalInflow = inTx.reduce((sum, t) => sum + t.amt, 0);

  // 4. Dữ liệu thật: Chi phí vận hành trong tháng đang chọn
  const opexCat = opexBy(state.tx, ui.month);
  const totalOpex = Object.values(opexCat).reduce((a, b) => a + b, 0);

  // Sắp xếp tìm 2 nhóm chi phí lớn nhất thực tế trong kỳ
  const sortedOpex = Object.entries(opexCat).sort((a, b) => b[1] - a[1]);
  const top1 = sortedOpex[0] || ['LUONG', 0];
  const top2 = sortedOpex[1] || ['VP', 0];

  // 5. Dữ liệu thật: Thặng dư / Thâm hụt dòng tiền kỳ này (Thu - Chi)
  const totalOutflow = mTx.filter((t) => t.dir === 'out').reduce((sum, t) => sum + t.amt, 0);
  const netCashFlow = totalInflow - totalOutflow;

  return (
    <div className="executive-kpi-grid">
      {/* KPI 1: Tổng dòng tiền khả dụng (Đọc động toàn bộ tài sản active) */}
      <div className={`kpi-card ${totalLiquid < 0 ? 'card-bad' : 'card-highlight'}`}>
        <div className="kpi-card-header">
          <span className="kpi-label">Tổng vốn khả dụng</span>
          <div className="kpi-icon-wrap liquid-icon">
            <Wallet size={16} />
          </div>
        </div>
        <div className="kpi-main-val">{fm(totalLiquid)}</div>
        <div className="kpi-sub-breakdown" style={{ flexWrap: 'wrap', gap: '6px' }}>
          {accountBalances.map((item, idx) => (
            <React.Fragment key={item.id}>
              {idx > 0 && <div className="kpi-sub-divider">·</div>}
              <div className="kpi-sub-item">
                <span className="sub-tag">{item.id}:</span>
                <span className={`sub-num ${item.bal < 0 ? 'text-bad' : 'text-good'}`}>
                  {mil(item.bal)}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="kpi-footer-note">
          {anyNegativeAcc ? (
            <span className="note-alert">⚠️ {anyNegativeAcc.id} đang âm ({fm(anyNegativeAcc.bal)})</span>
          ) : (
            <span className="note-ok">✓ {activeAccounts.length} quỹ/tài khoản active an toàn</span>
          )}
        </div>
      </div>

      {/* KPI 2: Thực thu trong kỳ */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-label">Thực thu trong kỳ</span>
          <div className="kpi-icon-wrap in-icon">
            <TrendingUp size={16} />
          </div>
        </div>
        <div className="kpi-main-val text-good">{fm(totalInflow)}</div>
        <div className="kpi-sub-breakdown">
          <span className="sub-tag">Kỳ {ui.month}</span>
          <div className="kpi-sub-divider">·</div>
          <span className="sub-tag">{inTx.length} khoản thu</span>
        </div>
        <div className="kpi-footer-note">
          <span className="note-muted">Gồm thu khách, tư vấn trả nợ & hoa hồng</span>
        </div>
      </div>

      {/* KPI 3: Chi phí vận hành Opex */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-label">Chi phí vận hành (Opex)</span>
          <div className="kpi-icon-wrap out-icon">
            <TrendingDown size={16} />
          </div>
        </div>
        <div className="kpi-main-val">{fm(totalOpex)}</div>
        <div className="kpi-sub-breakdown">
          <div className="kpi-sub-item">
            <span className="sub-tag">{top1[0]}:</span>
            <span className="sub-num">{mil(top1[1])}</span>
          </div>
          <div className="kpi-sub-divider">·</div>
          <div className="kpi-sub-item">
            <span className="sub-tag">{top2[0]}:</span>
            <span className="sub-num">{mil(top2[1])}</span>
          </div>
        </div>
        <div className="kpi-footer-note">
          <span className="note-muted">Theo 6 nhóm chi phí định kỳ thực tế</span>
        </div>
      </div>

      {/* KPI 4: Thặng dư dòng tiền ròng */}
      <div className={`kpi-card ${netCashFlow < 0 ? 'card-warn' : ''}`}>
        <div className="kpi-card-header">
          <span className="kpi-label">Thặng dư dòng tiền kỳ</span>
          <div className={`kpi-icon-wrap ${netCashFlow >= 0 ? 'good-icon' : 'warn-icon'}`}>
            <DollarSign size={16} />
          </div>
        </div>
        <div className={`kpi-main-val ${netCashFlow >= 0 ? 'text-good' : 'text-warn'}`}>
          {netCashFlow > 0 ? `+${fm(netCashFlow)}` : fm(netCashFlow)}
        </div>
        <div className="kpi-sub-breakdown">
          <span className="sub-tag">Tổng chi kỳ: {mil(totalOutflow)}</span>
        </div>
        <div className="kpi-footer-note">
          {netCashFlow >= 0 ? (
            <span className="note-ok">✓ Dòng tiền kỳ đang dương</span>
          ) : (
            <span className="note-warn">⚠️ Chi vượt thu trong tháng {ui.month}</span>
          )}
        </div>
      </div>

      {/* KPI 5: Công nợ quá hạn */}
      <div className={`kpi-card ${totalOverdue > 0 ? 'card-bad' : ''}`}>
        <div className="kpi-card-header">
          <span className="kpi-label">Nợ quá hạn cần đòi</span>
          <div className="kpi-icon-wrap bad-icon">
            <AlertTriangle size={16} />
          </div>
        </div>
        <div className="kpi-main-val text-bad">{fm(totalOverdue)}</div>
        <div className="kpi-sub-breakdown">
          <div className="kpi-sub-item">
            <span className="sub-tag">Khách:</span>
            <span className="sub-num text-bad">{mil(overKH)}</span>
          </div>
          <div className="kpi-sub-divider">·</div>
          <div className="kpi-sub-item">
            <span className="sub-tag">Tư vấn:</span>
            <span className="sub-num text-bad">{mil(overTV)}</span>
          </div>
        </div>
        <div className="kpi-footer-note">
          <span className="note-alert">Cần ưu tiên đôn đốc thu hồi</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useApp } from './../../../context/useApp';
import { TODAY } from '../../../data/constants';
import { fm, mil } from '../../../utils/formatters';
import { calculateBalance, opexBy, monthTx } from '../../../services/financeService';
import { calculateDebt } from '../../../services/debtService';
import { Wallet, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';

export const ExecutiveKpiCards: React.FC = () => {
  const { state, ui } = useApp();

  // Số dư tiền mặt & ngân hàng tại ngày TODAY
  const quy = calculateBalance(state.tx, 'QUY', TODAY);
  const acb = calculateBalance(state.tx, 'ACB', TODAY);
  const totalLiquid = quy + acb;

  // Công nợ
  const khDebts = state.contracts.filter((c) => c.kind === 'KH').map((c) => calculateDebt(c, state.tx, TODAY));
  const tvDebts = state.contracts.filter((c) => c.kind === 'TV').map((c) => calculateDebt(c, state.tx, TODAY));

  const overKH = khDebts.reduce((sum, d) => sum + (d.over > 0 ? d.left : 0), 0);
  const overTV = tvDebts.reduce((sum, d) => sum + (d.over > 0 ? d.left : 0), 0);
  const totalOverdue = overKH + overTV;

  // Thực thu trong tháng đang chọn
  const mTx = monthTx(state.tx, ui.month);
  const totalInflow = mTx.filter((t) => t.dir === 'in').reduce((sum, t) => sum + t.amt, 0);

  // Chi phí vận hành trong tháng đang chọn
  const opexCat = opexBy(state.tx, ui.month);
  const totalOpex = Object.values(opexCat).reduce((a, b) => a + b, 0);

  // Thặng dư / Thâm hụt dòng tiền kỳ này (Thu - Chi)
  const totalOutflow = mTx.filter((t) => t.dir === 'out').reduce((sum, t) => sum + t.amt, 0);
  const netCashFlow = totalInflow - totalOutflow;

  return (
    <div className="executive-kpi-grid">
      {/* KPI 1: Tổng dòng tiền khả dụng */}
      <div className={`kpi-card ${totalLiquid < 0 ? 'card-bad' : 'card-highlight'}`}>
        <div className="kpi-card-header">
          <span className="kpi-label">Tổng vốn khả dụng</span>
          <div className="kpi-icon-wrap liquid-icon">
            <Wallet size={16} />
          </div>
        </div>
        <div className="kpi-main-val">{fm(totalLiquid)}</div>
        <div className="kpi-sub-breakdown">
          <div className="kpi-sub-item">
            <span className="sub-tag">Tiền mặt:</span>
            <span className={`sub-num ${quy < 0 ? 'text-bad' : ''}`}>{mil(quy)}</span>
          </div>
          <div className="kpi-sub-divider">·</div>
          <div className="kpi-sub-item">
            <span className="sub-tag">ACB:</span>
            <span className="sub-num text-good">{mil(acb)}</span>
          </div>
        </div>
        <div className="kpi-footer-note">
          {quy < 0 ? (
            <span className="note-alert">⚠️ Quỹ mặt đang âm (chi hộ chưa hoàn ứng)</span>
          ) : (
            <span className="note-ok">✓ Dòng tiền lưu thông an toàn</span>
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
          <span className="sub-tag">{mTx.filter((t) => t.dir === 'in').length} khoản thu</span>
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
            <span className="sub-tag">Lương/Thưởng:</span>
            <span className="sub-num">{mil(opexCat.LUONG || 0)}</span>
          </div>
          <div className="kpi-sub-divider">·</div>
          <div className="kpi-sub-item">
            <span className="sub-tag">Mặt bằng:</span>
            <span className="sub-num">{mil(opexCat.VP || 0)}</span>
          </div>
        </div>
        <div className="kpi-footer-note">
          <span className="note-muted">Chiếm 6 nhóm chi phí định kỳ văn phòng</span>
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


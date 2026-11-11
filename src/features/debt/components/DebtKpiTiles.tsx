import React from 'react';
import { fm } from '../../../utils/formatters';
import { ContractKind } from '../../../types';

interface DebtKpiTilesProps {
  kind: ContractKind;
  totalContracts: number;
  totDue: number;
  totPaid: number;
  totLeft: number;
  totOver: number;
  overdueCount: number;
}

export const DebtKpiTiles: React.FC<DebtKpiTilesProps> = ({
  kind,
  totalContracts,
  totDue,
  totPaid,
  totLeft,
  totOver,
  overdueCount,
}) => {
  return (
    <div className="tiles-grid">
      <div className="metric-tile">
        <div className="metric-tile-header">
          <span className="metric-key">Tổng phải thu (sau CK)</span>
        </div>
        <span className="metric-val">{fm(totDue)}</span>
        <span className="metric-note">{totalContracts} hợp đồng {kind === 'KH' ? 'khách hàng' : 'tư vấn'}</span>
      </div>

      <div className="metric-tile good">
        <div className="metric-tile-header">
          <span className="metric-key">Đã thu về</span>
        </div>
        <span className="metric-val">{fm(totPaid)}</span>
        <span className="metric-note">Tiền đã về sổ quỹ hoặc tài khoản cá nhân</span>
      </div>

      <div className="metric-tile">
        <div className="metric-tile-header">
          <span className="metric-key">Còn phải thu</span>
        </div>
        <span className="metric-val">{fm(totLeft)}</span>
        <span className="metric-note">Chưa thu hết theo hạn cam kết</span>
      </div>

      <div className={`metric-tile ${totOver > 0 ? 'bad' : ''}`}>
        <div className="metric-tile-header">
          <span className="metric-key">Quá hạn</span>
        </div>
        <span className="metric-val">{fm(totOver)}</span>
        <span className="metric-note">{overdueCount} hợp đồng đã quá ngày hẹn</span>
      </div>
    </div>
  );
};

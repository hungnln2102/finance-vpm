import React from 'react';
import { Wallet, CreditCard, Landmark, Building2 } from 'lucide-react';
import { fmt } from '../../../../utils/formatters';
import { AccountItem } from '../../../../types';

interface BalanceLiveKpisProps {
  activeAccounts: AccountItem[];
  accountBalances: Record<string, number>;
  liveTotal: number;
}

export const BalanceLiveKpis: React.FC<BalanceLiveKpisProps> = ({
  activeAccounts,
  accountBalances,
  liveTotal
}) => {
  return (
    <div 
      style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${Math.min(4, Math.max(2, activeAccounts.length + 1))}, minmax(0, 1fr))`, 
        gap: '16px' 
      }}
    >
      {activeAccounts.map((acc, idx) => {
        const bal = accountBalances[acc.id] || 0;
        const isCash = acc.type === 'cash' || acc.id === 'QUY';
        const badgeColor = isCash ? 'badge-teal' : idx % 2 === 0 ? 'badge-purple' : 'badge-blue';

        return (
          <div key={acc.id} className="ledger-kpi-card">
            <div className="ledger-kpi-card-header">
              <span>SỐ DƯ {acc.name.toUpperCase()} ({acc.id})</span>
              <div className={`ledger-kpi-badge ${badgeColor}`}>
                {isCash ? <Wallet size={16} /> : <CreditCard size={16} />}
              </div>
            </div>
            <div className={`ledger-kpi-card-value ${bal < 0 ? 'text-bad' : ''}`}>
              {fmt(bal)} đ
            </div>
            <div className="ledger-kpi-card-footer">
              <span>{acc.bankName || (isCash ? 'Két tiền mặt VP' : 'Tài khoản ngân hàng')}</span>
              <span style={{ color: bal < 0 ? 'var(--bad)' : 'var(--teal)' }}>
                {bal < 0 ? 'Cảnh báo âm quỹ' : 'Khả dụng'}
              </span>
            </div>
          </div>
        );
      })}

      {/* Thẻ Tổng Cộng Quỹ Toàn Hệ Thống */}
      <div className="ledger-kpi-card">
        <div className="ledger-kpi-card-header">
          <span>TỔNG CỘNG QUỸ TOÀN HỆ THỐNG</span>
          <div className="ledger-kpi-badge badge-green">
            <Landmark size={16} />
          </div>
        </div>
        <div className="ledger-kpi-card-value" style={{ color: liveTotal < 0 ? 'var(--bad)' : 'var(--good)' }}>
          {fmt(liveTotal)} đ
        </div>
        <div className="ledger-kpi-card-footer">
          <span>{activeAccounts.map((a) => a.id).join(' + ')}</span>
          <span style={{ color: 'var(--teal)' }}>Realtime Database</span>
        </div>
      </div>
    </div>
  );
};

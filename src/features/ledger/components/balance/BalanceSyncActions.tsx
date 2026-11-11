import React from 'react';
import { Download, Upload, Trash2, CalendarClock } from 'lucide-react';

interface BalanceSyncActionsProps {
  isSyncingSheetToDb: boolean;
  isSyncingDbToSheet: boolean;
  isClearingLedger: boolean;
  isRollingOver: boolean;
  onSyncSheetToDb: () => void;
  onSyncDbToSheet: () => void;
  onClearLedger: () => void;
  onTriggerRollover: () => void;
}

export const BalanceSyncActions: React.FC<BalanceSyncActionsProps> = ({
  isSyncingSheetToDb,
  isSyncingDbToSheet,
  isClearingLedger,
  isRollingOver,
  onSyncSheetToDb,
  onSyncDbToSheet,
  onClearLedger,
  onTriggerRollover
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      {/* Nút 1: Kéo từ Google Sheet về DB */}
      <button
        onClick={onSyncSheetToDb}
        disabled={isSyncingSheetToDb || isSyncingDbToSheet}
        className="btn btn-secondary btn-sm"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          borderColor: 'var(--teal)',
          color: 'var(--teal)'
        }}
        title="Xuất toàn bộ dữ liệu mới nhất từ Google Sheet về PostgreSQL"
      >
        <Download size={14} className={isSyncingSheetToDb ? 'spin' : ''} />
        <span>{isSyncingSheetToDb ? 'Đang xuất Sheet...' : '📥 Đồng bộ Sheet → DB'}</span>
      </button>

      {/* Nút 2: Đẩy từ DB lên Google Sheet */}
      <button
        onClick={onSyncDbToSheet}
        disabled={isSyncingSheetToDb || isSyncingDbToSheet}
        className="btn btn-secondary btn-sm"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          borderColor: 'var(--good)',
          color: 'var(--good)'
        }}
        title="Đẩy toàn bộ 10 Bảng nghiệp vụ PostgreSQL lên làm mới Google Sheet"
      >
        <Upload size={14} className={isSyncingDbToSheet ? 'spin' : ''} />
        <span>{isSyncingDbToSheet ? 'Đang đẩy DB...' : '📤 Đồng bộ DB → Sheet'}</span>
      </button>

      {/* Nút 3: Chuyển kỳ tháng mới */}
      <button
        onClick={onTriggerRollover}
        disabled={isRollingOver}
        className="btn btn-secondary btn-sm"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          borderColor: 'var(--purple, #a855f7)',
          color: 'var(--purple, #a855f7)'
        }}
        title="Chuyển kỳ tháng mới (Số dư đầu kỳ = Số dư cuối kỳ tháng trước)"
      >
        <CalendarClock size={14} className={isRollingOver ? 'spin' : ''} />
        <span>{isRollingOver ? 'Đang chuyển kỳ...' : '📅 Chuyển kỳ tháng mới'}</span>
      </button>

      {/* Nút 4: Xóa toàn bộ sổ gốc */}
      <button
        onClick={onClearLedger}
        disabled={isClearingLedger}
        className="btn btn-secondary btn-sm"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          borderColor: 'var(--bad)',
          color: 'var(--bad)'
        }}
        title="Xóa toàn bộ giao dịch sổ gốc và đưa số dư về 0 đ"
      >
        <Trash2 size={14} className={isClearingLedger ? 'spin' : ''} />
        <span>{isClearingLedger ? 'Đang xóa...' : '🧹 Clear Sổ Gốc (0 đ)'}</span>
      </button>
    </div>
  );
};

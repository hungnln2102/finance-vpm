import React from 'react';

interface LedgerPaginationProps {
  pageSize: number;
  currentPage: number;
  totalPages: number;
  totalRows: number;
  startIndex: number;
  onPageSizeChange: (size: number) => void;
  onPageChange: (page: number) => void;
}

export const LedgerPagination: React.FC<LedgerPaginationProps> = ({
  pageSize,
  currentPage,
  totalPages,
  totalRows,
  startIndex,
  onPageSizeChange,
  onPageChange
}) => {
  const getPaginationRange = (curr: number, total: number) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (curr <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (curr >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', curr - 1, curr, curr + 1, '...', total];
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderTop: '1px solid var(--line)', flexWrap: 'wrap', gap: '12px' }}>
      {/* Bên trái: Chọn số dòng hiển thị */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: 'var(--muted)' }}>
        <span>Hiển thị</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={{ padding: '3px 8px', fontSize: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)' }}
        >
          <option value={10}>10 dòng</option>
          <option value={20}>20 dòng</option>
          <option value={50}>50 dòng</option>
          <option value={100}>100 dòng</option>
        </select>
        <span>
          {totalRows > 0
            ? `Hiển thị ${startIndex + 1} - ${Math.min(startIndex + pageSize, totalRows)} trên tổng số ${totalRows} giao dịch`
            : '0 giao dịch'}
        </span>
      </div>

      {/* Bên phải: Nút số trang 1, 2, 3 ... N */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            className="btn xs"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            style={{ padding: '4px 8px' }}
          >
            Trước
          </button>

          {getPaginationRange(currentPage, totalPages).map((p, idx) => {
            if (typeof p === 'string') {
              return (
                <span key={`dots-${idx}`} style={{ padding: '0 4px', color: 'var(--muted)', fontSize: '12px' }}>
                  ...
                </span>
              );
            }
            return (
              <button
                key={p}
                type="button"
                className={`btn xs ${p === currentPage ? 'primary' : ''}`}
                onClick={() => onPageChange(p)}
                style={{ minWidth: '28px', padding: '4px 6px', fontWeight: p === currentPage ? 700 : 500 }}
              >
                {p}
              </button>
            );
          })}

          <button
            type="button"
            className="btn xs"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            style={{ padding: '4px 8px' }}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

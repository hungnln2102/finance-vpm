import React, { useState } from 'react';
import { useApp } from './../../../context/useApp';
import { CATS } from '../../../data/constants';
import { fm, mil, monthLabel } from '../../../utils/formatters';
import { opexBy } from '../../../services/financeService';
import { PieChart, Table, Layers } from 'lucide-react';

const CAT_COLORS: Record<string, string> = {
  LUONG: '#0d9488', // teal
  VP: '#3b82f6', // blue
  SUKIEN: '#8b5cf6', // purple
  CSKH: '#ec4899', // pink
  NOIBO: '#f59e0b', // amber
  KHAC: '#64748b' // slate
};

export const OpexBreakdownCard: React.FC = () => {
  const { state, ui } = useApp();
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const monthsTrend = ['2026-08', '2026-09', '2026-10'];
  const trendData = monthsTrend.map((m) => opexBy(state.tx, m));

  const currentOpex = opexBy(state.tx, ui.month);
  const totalCurrentOpex = Object.values(currentOpex).reduce((a, b) => a + b, 0);

  // Sắp xếp các danh mục theo chi phí giảm dần
  const sortedCats = Object.entries(CATS).sort((a, b) => (currentOpex[b[0]] || 0) - (currentOpex[a[0]] || 0));

  return (
    <section className="card-box opex-breakdown-card">
      <div className="card-header-flex">
        <div className="card-title-group">
          <div className="action-title-icon opex-icon">
            <Layers size={18} color="#0d9488" />
          </div>
          <div>
            <h2 className="card-title" style={{ margin: 0 }}>Cơ Cấu Chi Phí Vận Hành (Opex)</h2>
            <p className="card-subtitle-text">
              Tổng chi: <strong>{fm(totalCurrentOpex)}</strong> trong {monthLabel(ui.month)}
            </p>
          </div>
        </div>

        {/* View Switcher: Chart vs Table */}
        <div className="view-mode-toggle">
          <button
            type="button"
            className={`mode-btn ${viewMode === 'chart' ? 'active' : ''}`}
            onClick={() => setViewMode('chart')}
            title="Xem tỷ trọng trực quan"
          >
            <PieChart size={13} />
            <span>Tỷ trọng %</span>
          </button>
          <button
            type="button"
            className={`mode-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Xem bảng biến động 3 tháng"
          >
            <Table size={13} />
            <span>Biến động 3 tháng</span>
          </button>
        </div>
      </div>

      {viewMode === 'chart' ? (
        <div className="opex-bars-container">
          {/* Top Multi-Segment Distribution Bar */}
          {totalCurrentOpex > 0 && (
            <div className="multi-segment-bar" title="Cơ cấu chi phí tổng thể">
              {sortedCats.map(([k]) => {
                const amt = currentOpex[k] || 0;
                const pct = (amt / totalCurrentOpex) * 100;
                if (pct <= 0) return null;
                return (
                  <div
                    key={k}
                    className="segment-item"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: CAT_COLORS[k] || '#94a3b8'
                    }}
                    title={`${CATS[k]}: ${mil(amt)} (${pct.toFixed(1)}%)`}
                  />
                );
              })}
            </div>
          )}

          {/* List of categories with progress meters */}
          <div className="opex-category-list">
            {sortedCats.map(([k, label]) => {
              const amt = currentOpex[k] || 0;
              const pct = totalCurrentOpex > 0 ? (amt / totalCurrentOpex) * 100 : 0;
              const color = CAT_COLORS[k] || '#94a3b8';

              return (
                <div key={k} className="opex-category-row">
                  <div className="opex-row-header">
                    <div className="cat-name-box">
                      <span className="cat-color-dot" style={{ backgroundColor: color }} />
                      <span className="cat-label">{label}</span>
                    </div>
                    <div className="cat-val-box">
                      <span className="cat-amount">{fm(amt)}</span>
                      <span className="cat-percentage">{pct.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="cat-progress-bg">
                    <div
                      className="cat-progress-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="opex-trend-table">
            <thead>
              <tr>
                <th>Nhóm chi phí</th>
                {monthsTrend.map((m) => (
                  <th key={m} className="num">{monthLabel(m).replace('Tháng ', 'T')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(CATS).map(([k, label]) => (
                <tr key={k}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="cat-color-dot" style={{ backgroundColor: CAT_COLORS[k] || '#94a3b8' }} />
                      <span>{label}</span>
                    </div>
                  </td>
                  {trendData.map((d, i) => (
                    <td key={i} className="num">
                      {((d[k] || 0) / 1e6).toLocaleString('vi-VN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="total">
                <td>Tổng chi phí vận hành (tr.đ)</td>
                {trendData.map((d, i) => (
                  <td key={i} className="num">
                    {(Object.values(d).reduce((a, b) => a + b, 0) / 1e6).toLocaleString('vi-VN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};


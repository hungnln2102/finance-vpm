import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { TODAY } from '../../../data/constants';
import { detectAllIssues } from '../../../services/financeService';
import { IssueItem } from '../../../types';
import { ShieldAlert, ArrowUpRight, CheckCircle2, AlertOctagon, AlertTriangle, Info } from 'lucide-react';

type FilterType = 'all' | 'critical' | 'warning' | 'notice';

export const ActionCenterCard: React.FC = () => {
  const { state, setView } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const issues = detectAllIssues(state, TODAY);

  // Phân loại cấp độ
  const categorize = (item: IssueItem): 'critical' | 'warning' | 'notice' => {
    if (item.lvl === 'bad') return 'critical';
    if (item.lvl === 'warn') return 'warning';
    return 'notice';
  };

  const criticalCount = issues.filter((i) => categorize(i) === 'critical').length;
  const warningCount = issues.filter((i) => categorize(i) === 'warning').length;
  const noticeCount = issues.filter((i) => categorize(i) === 'notice').length;

  const filteredIssues = issues.filter((item) => {
    if (activeFilter === 'all') return true;
    return categorize(item) === activeFilter;
  });

  return (
    <section className="card-box action-center-card">
      <div className="card-header-flex">
        <div className="card-title-group">
          <div className="action-title-icon">
            <ShieldAlert size={18} color="#f97316" />
          </div>
          <div>
            <h2 className="card-title" style={{ margin: 0 }}>Trung Tâm Cảnh Báo & Xử Lý Nghiệp Vụ</h2>
            <p className="card-subtitle-text">
              Phát hiện tự động từ sổ sách đối chiếu ACID · {issues.length} vấn đề cần lưu ý
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="filter-pill-group">
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            Tất cả ({issues.length})
          </button>
          <button
            type="button"
            className={`filter-pill pill-bad ${activeFilter === 'critical' ? 'active' : ''}`}
            onClick={() => setActiveFilter('critical')}
          >
            <AlertOctagon size={12} />
            <span>Khẩn cấp ({criticalCount})</span>
          </button>
          <button
            type="button"
            className={`filter-pill pill-warn ${activeFilter === 'warning' ? 'active' : ''}`}
            onClick={() => setActiveFilter('warning')}
          >
            <AlertTriangle size={12} />
            <span>Cần duyệt ({warningCount})</span>
          </button>
          {noticeCount > 0 && (
            <button
              type="button"
              className={`filter-pill pill-notice ${activeFilter === 'notice' ? 'active' : ''}`}
              onClick={() => setActiveFilter('notice')}
            >
              <Info size={12} />
              <span>Đối soát ({noticeCount})</span>
            </button>
          )}
        </div>
      </div>

      <div className="action-items-container">
        {filteredIssues.length > 0 ? (
          <ul className="smart-issues-list">
            {filteredIssues.map((item, idx) => {
              const cat = categorize(item);
              return (
                <li key={idx} className={`smart-issue-item smart-${cat}`}>
                  <div className="smart-issue-badge">
                    {cat === 'critical' && <span className="level-badge badge-critical">Khẩn cấp</span>}
                    {cat === 'warning' && <span className="level-badge badge-warning">Cảnh báo</span>}
                    {cat === 'notice' && <span className="level-badge badge-notice">Lưu ý</span>}
                  </div>

                  <div className="smart-issue-content">
                    <span className="smart-issue-text">{item.text}</span>
                  </div>

                  <button
                    type="button"
                    className="btn xs smart-issue-btn"
                    onClick={() => setView(item.go, item.f)}
                    title={`Chuyển tới phân hệ ${item.go}`}
                  >
                    <span>Xử lý ngay</span>
                    <ArrowUpRight size={13} />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="smart-empty-state">
            <CheckCircle2 size={32} color="#10b981" />
            <div className="empty-title">Không có vấn đề nào trong danh mục này</div>
            <div className="empty-sub">Toàn bộ dữ liệu tài chính trong phân nhóm đã được cân đối và phê duyệt hợp lệ.</div>
          </div>
        )}
      </div>
    </section>
  );
};

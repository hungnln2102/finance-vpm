import React from 'react';
import { useApp } from '../../../context/useApp';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Loader2, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useApp();

  if (!toast.visible) return null;

  const type = toast.type || 'info';

  const config = {
    success: {
      label: 'THÀNH CÔNG',
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.15)',
      icon: <CheckCircle2 size={19} color="#10b981" />
    },
    error: {
      label: 'CẢNH BÁO LỖI',
      color: '#f43f5e',
      bgGlow: 'rgba(244, 63, 94, 0.15)',
      icon: <AlertCircle size={19} color="#f43f5e" />
    },
    warn: {
      label: 'CHÚ Ý',
      color: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.15)',
      icon: <AlertTriangle size={19} color="#f59e0b" />
    },
    loading: {
      label: 'ĐANG XỬ LÝ',
      color: '#06b6d4',
      bgGlow: 'rgba(6, 182, 212, 0.15)',
      icon: <Loader2 size={19} color="#06b6d4" className="app-toast-spin" />
    },
    info: {
      label: 'THÔNG BÁO',
      color: '#38bdf8',
      bgGlow: 'rgba(56, 189, 248, 0.15)',
      icon: <Info size={19} color="#38bdf8" />
    }
  };

  const current = config[type] || config.info;

  return (
    <div
      key={toast.id}
      className={`app-toast app-toast-${type}`}
      role="status"
      aria-live="polite"
      style={{
        borderLeftColor: current.color
      }}
    >
      <div className="app-toast-icon-wrap" style={{ backgroundColor: current.bgGlow }}>
        {current.icon}
      </div>

      <div className="app-toast-body">
        <div className="app-toast-header">
          <span className="app-toast-badge" style={{ color: current.color }}>
            {current.label}
          </span>
        </div>
        <div className="app-toast-message">{toast.message}</div>
      </div>

      <button
        type="button"
        className="app-toast-close"
        onClick={hideToast}
        aria-label="Đóng thông báo"
      >
        <X size={15} />
      </button>

      {toast.duration > 0 && (
        <div
          className="app-toast-progress"
          style={{
            backgroundColor: current.color,
            animationDuration: `${toast.duration}ms`
          }}
        />
      )}
    </div>
  );
};

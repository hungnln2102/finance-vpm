import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useApp();

  if (!toast.visible) return null;

  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-400" />,
    warn: <AlertTriangle size={18} className="text-amber-400" />,
    error: <AlertCircle size={18} className="text-rose-400" />,
    info: <Info size={18} className="text-cyan-400" />
  };

  return (
    <div className="app-toast" role="status" aria-live="polite">
      {icons[toast.type || 'info']}
      <span>{toast.message}</span>
      <button 
        type="button" 
        onClick={hideToast}
        style={{ all: 'unset', cursor: 'pointer', display: 'flex', marginLeft: '6px', opacity: 0.7 }}
        aria-label="Đóng thông báo"
      >
        <X size={15} />
      </button>
    </div>
  );
};

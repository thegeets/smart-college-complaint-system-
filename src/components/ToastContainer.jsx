import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let Icon = Info;
        let toastClass = 'toast-info';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          toastClass = 'toast-success';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          toastClass = 'toast-error';
        }

        return (
          <div key={toast.id} className={`toast ${toastClass}`}>
            <Icon size={18} className="toast-icon" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div className="toast-content">
              <p>{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              style={{ color: 'var(--text-muted)', padding: '2px', marginLeft: '0.4rem' }}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`toast-notification glass-card type-${type}`}>
      {type === 'success' ? (
        <CheckCircle size={20} className="toast-icon text-success" />
      ) : (
        <AlertCircle size={20} className="toast-icon text-error" />
      )}
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>
        <X size={14} />
      </button>

      <style>{`
        .toast-notification {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-radius: 12px;
          z-index: 2000;
          min-width: 300px;
          max-width: 450px;
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .type-success {
          border-left: 4px solid var(--status-success);
        }

        .type-error {
          border-left: 4px solid var(--status-danger);
        }

        .toast-icon {
          flex-shrink: 0;
        }

        .text-success {
          color: var(--status-success);
        }

        .text-error {
          color: var(--status-danger);
        }

        .toast-message {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-primary);
          flex: 1;
        }

        .toast-close {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .toast-close:hover {
          color: #fff;
        }

        @keyframes slideIn {
          from {
            transform: translateY(100px) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

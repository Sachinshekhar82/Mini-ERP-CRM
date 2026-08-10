import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'error', onClose }) => {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.875rem 1.25rem',
        borderRadius: '10px',
        background: isSuccess ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
        color: '#FFFFFF',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
        fontSize: '0.875rem',
        fontWeight: 500,
        backdropFilter: 'blur(8px)',
      }}
    >
      {isSuccess ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#FFFFFF',
          cursor: 'pointer',
          marginLeft: '0.5rem',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

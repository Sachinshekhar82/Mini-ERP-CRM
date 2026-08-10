import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'var(--danger-light)',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FileQuestion size={40} />
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        404 - Page Not Found
      </h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
        The requested page or route does not exist or you do not have permission to view it.
      </p>

      <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>
        <Home size={18} />
        Return to Dashboard
      </Link>
    </div>
  );
};

import React from 'react';
import { LogOut, Bell, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        height: '68px',
        background: '#162032',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Page Title Vector Badge */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Shield size={18} color="var(--primary)" />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {title}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <button
          style={{
            background: '#0F172A',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '8px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Notifications"
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10B981',
            }}
          />
        </button>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9375rem',
                boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {user.name}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.375rem', marginLeft: '0.5rem', height: '36px', borderRadius: '8px' }}
          title="Logout"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </header>
  );
};

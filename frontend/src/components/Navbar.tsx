import React from 'react';
import { LogOut, User as UserIcon, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        height: '64px',
        background: '#162032',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        {title}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '6px',
          }}
          title="Notifications"
        >
          <Bell size={20} />
        </button>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserIcon size={20} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {user.name}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.375rem', marginLeft: '0.5rem' }}
          title="Logout"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import { User, Shield, Mail, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {user.name}
            </h2>
            <span
              className={`badge ${
                user.role === 'ADMIN'
                  ? 'badge-danger'
                  : user.role === 'SALES'
                  ? 'badge-primary'
                  : user.role === 'WAREHOUSE'
                  ? 'badge-warning'
                  : 'badge-success'
              }`}
            >
              {user.role} ROLE
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Mail size={18} color="var(--text-muted)" />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</span>
              <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}>{user.email}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={18} color="var(--text-muted)" />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Access Role</span>
              <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}>{user.role}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <KeyRound size={18} color="var(--text-muted)" />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Session Security</span>
              <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--success)' }}>
                JWT Token Active & Authenticated
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

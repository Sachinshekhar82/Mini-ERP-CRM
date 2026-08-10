import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'danger' | 'primary';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeType = 'primary',
}) => {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {title}
        </span>
        <div
          style={{
            background: 'var(--primary-light)',
            padding: '0.5rem',
            borderRadius: '8px',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={20} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {value}
        </h3>
        {badgeText && (
          <span className={`badge badge-${badgeType}`} style={{ fontSize: '0.6875rem' }}>
            {badgeText}
          </span>
        )}
      </div>
      {subtitle && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

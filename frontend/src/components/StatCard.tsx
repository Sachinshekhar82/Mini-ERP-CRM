import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'danger' | 'primary';
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeType = 'primary',
  iconColor = '#6366F1',
}) => {
  return (
    <div
      className="card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {title}
        </span>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: `${iconColor}1F`,
            border: `1px solid ${iconColor}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${iconColor}25`,
          }}
        >
          <Icon size={20} color={iconColor} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {value}
        </h3>
        {badgeText && (
          <span className={`badge badge-${badgeType}`} style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem' }}>
            {badgeText}
          </span>
        )}
      </div>
      {subtitle && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem', fontWeight: 500 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

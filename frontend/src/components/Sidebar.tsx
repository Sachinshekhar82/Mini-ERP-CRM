import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  History,
  Box,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/customers', label: 'Customer CRM', icon: Users },
    { to: '/products', label: 'Products & Inventory', icon: Package },
    { to: '/challans', label: 'Sales Challans', icon: FileText },
    { to: '/stock-logs', label: 'Stock Movement Logs', icon: History },
  ];

  return (
    <aside
      style={{
        width: '260px',
        background: '#162032',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0 0.5rem 1.5rem 0.5rem',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            background: 'var(--primary)',
            padding: '0.5rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box size={24} color="#FFFFFF" />
        </div>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
            Apex ERP/CRM
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Operations Portal
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                background: isActive ? 'var(--primary)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              })}
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Logged User Info */}
      {user && (
        <div
          style={{
            padding: '0.875rem 1rem',
            background: '#0F172A',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
          }}
        >
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user.name}
          </p>
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
            style={{ marginTop: '0.25rem', fontSize: '0.6875rem' }}
          >
            {user.role} ROLE
          </span>
        </div>
      )}
    </aside>
  );
};

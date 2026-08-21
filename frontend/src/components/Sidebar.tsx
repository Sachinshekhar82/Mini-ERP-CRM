import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Wrench,
  ArrowLeftRight,
  ShoppingBag,
  Users as UsersIcon,
  FileText,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NexoraLogo } from './branding/NexoraLogo';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badgeColor: '#6366F1' },
    { to: '/inventory', label: '1. Inventory Management', icon: Package, badgeColor: '#F59E0B' },
    { to: '/work-orders', label: '2. Work Orders', icon: Wrench, badgeColor: '#6366F1' },
    { to: '/transfers', label: '3. Internal Transfers', icon: ArrowLeftRight, badgeColor: '#10B981' },
    { to: '/customer-orders', label: '4. Customer Orders & Stock', icon: ShoppingBag, badgeColor: '#EC4899' },
    { to: '/customers', label: 'Customer CRM', icon: UsersIcon, badgeColor: '#3B82F6' },
    { to: '/challans', label: 'Sales Challans', icon: FileText, badgeColor: '#8B5CF6' },
    { to: '/profile', label: 'My Profile', icon: User, badgeColor: '#6B7280' },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ to: '/users', label: 'Manage Users', icon: ShieldCheck, badgeColor: '#EF4444' });
  }

  return (
    <aside
      className="sidebar"
      style={{
        width: '260px',
        background: '#162032',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
      }}
    >
      {/* NEXORA Brand Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          padding: '0 0.5rem 1.5rem 0.5rem',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
        }}
      >
        <NexoraLogo variant="full" size="md" light={true} />
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
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
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                background: isActive
                  ? 'linear-gradient(135deg, var(--primary) 0%, #4F46E5 100%)'
                  : 'transparent',
                boxShadow: isActive ? '0 4px 14px rgba(99, 102, 241, 0.35)' : 'none',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              })}
            >
              {({ isActive }) => (
                <>
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '6px',
                      background: isActive ? 'rgba(255, 255, 255, 0.2)' : '#0F172A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Icon size={15} color={isActive ? '#FFFFFF' : item.badgeColor} />
                  </div>
                  <span>{item.label}</span>
                </>
              )}
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
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginTop: '1rem',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1 0%, #10B981 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.875rem',
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
            </p>
            <span
              className={`badge ${
                user.role === 'ADMIN'
                  ? 'badge-danger'
                  : user.role === 'OPERATIONS'
                  ? 'badge-warning'
                  : 'badge-primary'
              }`}
              style={{ marginTop: '0.2rem', fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}
            >
              {user.role} ROLE
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};

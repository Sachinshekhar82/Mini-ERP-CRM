import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, ShieldCheck, UserCheck, Briefcase, Warehouse, Calculator } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ADMIN');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const roleInfo: Record<string, { title: string; color: string; desc: string; icon: any }> = {
    ADMIN: {
      title: 'Administrator',
      color: '#6366F1',
      desc: 'Full system management, security guards, and user administration',
      icon: ShieldCheck,
    },
    SALES: {
      title: 'Sales & CRM',
      color: '#10B981',
      desc: 'Customer relationships, follow-up timeline, and sales challan creation',
      icon: Briefcase,
    },
    WAREHOUSE: {
      title: 'Warehouse & Inventory',
      color: '#F59E0B',
      desc: 'Product catalog management, stock IN/OUT logging, low-stock alerts',
      icon: Warehouse,
    },
    ACCOUNTS: {
      title: 'Accounts & Billing',
      color: '#EC4899',
      desc: 'Financial audit, challan confirmation, PDF invoice export, reports',
      icon: Calculator,
    },
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top left, #1E1E38 0%, #0F172A 100%)',
        padding: '1.5rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '460px' }}>
        {/* Original Vector Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              borderRadius: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            {/* Custom SVG Original Vector Icon */}
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
            Apex ERP + CRM Operations Portal
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Enter your credentials to access the enterprise portal
          </p>
        </div>

        {/* Login Form Card */}
        <div className="card" style={{ padding: '2rem' }}>
          {/* Role Selection Selector Tabs */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <UserCheck size={16} color="var(--primary)" />
              <span>Select Access Role Target</span>
            </label>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.375rem' }}>
              {(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as const).map((role) => {
                const isSelected = selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    style={{
                      padding: '0.625rem 0.25rem',
                      borderRadius: '8px',
                      border: isSelected ? `2px solid ${roleInfo[role].color}` : '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.12)' : '#162032',
                      color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                    }}
                  >
                    {role}
                  </button>
                );
              })}
            </div>

            {/* Selected Role Info Banner */}
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: '8px',
                background: '#0F172A',
                border: `1px solid ${roleInfo[selectedRole].color}40`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
              }}
            >
              {React.createElement(roleInfo[selectedRole].icon, { size: 18, color: roleInfo[selectedRole].color })}
              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#FFFFFF' }}>
                  Target Role: {roleInfo[selectedRole].title}
                </span>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
                  {roleInfo[selectedRole].desc}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div
              className="alert-banner alert-warning"
              style={{
                marginBottom: '1.25rem',
                borderColor: 'rgba(239, 68, 68, 0.4)',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#F87171',
              }}
            >
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                marginTop: '0.75rem',
                height: '46px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              }}
              disabled={loading}
            >
              {loading ? 'Authenticating Credentials...' : `Sign In as ${selectedRole}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

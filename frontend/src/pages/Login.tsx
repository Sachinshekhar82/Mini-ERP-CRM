import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, Users, Package, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NexoraLogo } from '../components/branding/NexoraLogo';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS'>('ADMIN');
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
      setError(err.response?.data?.message || 'Invalid email address or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        background: '#0B0F19',
        color: '#F9FAFB',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* 2-Column Responsive Layout Wrapper */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          width: '100%',
          minHeight: '100vh',
        }}
      >
        {/* LEFT COLUMN: NEXORA Brand & Feature Showcase */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)',
            padding: '3.5rem 3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Background Glow Vector */}
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              left: '-10%',
              width: '350px',
              height: '350px',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(0, 0, 0, 0) 70%)',
              pointerEvents: 'none',
            }}
          />

          <div>
            <NexoraLogo variant="full" size="lg" light={true} />
            <div style={{ marginTop: '2.5rem' }}>
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#818CF8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  background: 'rgba(99, 102, 241, 0.12)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                }}
              >
                Enterprise B2B Suite
              </span>

              <h1
                style={{
                  fontSize: '2.25rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  marginTop: '1.25rem',
                  lineHeight: 1.2,
                  letterSpacing: '-0.03em',
                }}
              >
                Business Operations, <br />
                <span style={{ color: '#818CF8' }}>Simplified.</span>
              </h1>

              <p
                style={{
                  fontSize: '1rem',
                  color: '#9CA3AF',
                  marginTop: '1rem',
                  lineHeight: 1.6,
                  maxWidth: '440px',
                }}
              >
                Manage customers, inventory, stock movements and sales operations from one connected, real-time workspace.
              </p>
            </div>

            {/* 3 Subtle Feature Indicators */}
            <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Users size={20} color="#34D399" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#F3F4F6', margin: 0 }}>
                    Customer CRM & Pipeline
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', margin: '0.2rem 0 0 0' }}>
                    Multi-field directory search and chronological follow-up timeline notes.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Package size={20} color="#60A5FA" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#F3F4F6', margin: 0 }}>
                    Inventory & Stock Movements
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', margin: '0.2rem 0 0 0' }}>
                    Low-stock alerts, unique SKU validation, and transactional movement audit logs.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(236, 72, 153, 0.15)',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FileText size={20} color="#F472B6" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#F3F4F6', margin: 0 }}>
                    Sales Operations & PDF Invoices
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', margin: '0.2rem 0 0 0' }}>
                    Atomic multi-item stock deduction and historical price snapshot retention.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>
              © {new Date().getFullYear()} NEXORA Operations Portal. All rights reserved.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Sign In Form Panel */}
        <div
          style={{
            padding: '3rem 2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0B0F19',
          }}
        >
          <div style={{ width: '100%', maxWidth: '420px' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                Welcome back
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#9CA3AF', marginTop: '0.35rem' }}>
                Sign in to continue to <strong style={{ color: '#818CF8' }}>NEXORA</strong>
              </p>
            </div>

            {/* Target Role Guidance Tabs */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF', display: 'block', marginBottom: '0.5rem' }}>
                TARGET ACCESS ROLE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.375rem' }}>
                {(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as const).map((r) => {
                  const active = selectedRole === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      style={{
                        padding: '0.5rem 0.25rem',
                        borderRadius: '8px',
                        fontSize: '0.725rem',
                        fontWeight: active ? 700 : 500,
                        border: active ? '1.5px solid #6366F1' : '1px solid #1F2937',
                        background: active ? 'rgba(99, 102, 241, 0.15)' : '#111827',
                        color: active ? '#FFFFFF' : '#9CA3AF',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div
                style={{
                  padding: '0.875rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#F87171',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  marginBottom: '1.5rem',
                }}
              >
                <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E5E7EB', display: 'block', marginBottom: '0.5rem' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6B7280',
                    }}
                  />
                  <input
                    type="email"
                    required
                    style={{
                      width: '100%',
                      height: '46px',
                      paddingLeft: '2.75rem',
                      paddingRight: '1rem',
                      borderRadius: '10px',
                      background: '#111827',
                      border: '1px solid #1F2937',
                      color: '#FFFFFF',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E5E7EB', display: 'block', marginBottom: '0.5rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6B7280',
                    }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    style={{
                      width: '100%',
                      height: '46px',
                      paddingLeft: '2.75rem',
                      paddingRight: '2.75rem',
                      borderRadius: '10px',
                      background: '#111827',
                      border: '1px solid #1F2937',
                      color: '#FFFFFF',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px',
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', color: '#9CA3AF' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#4F46E5', borderRadius: '4px', cursor: 'pointer' }}
                  />
                  Remember me on this device
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
                  color: '#FFFFFF',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                  transition: 'all 0.15s ease',
                }}
              >
                {loading ? 'Signing in...' : `Sign In as ${selectedRole}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

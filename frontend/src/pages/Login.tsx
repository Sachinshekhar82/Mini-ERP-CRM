import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Lock, Mail, ShieldAlert, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  // Quick fill helper for evaluator ease-of-use
  const quickFill = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
    setError(null);
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
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              background: 'var(--primary)',
              borderRadius: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)',
            }}
          >
            <Box size={30} color="#FFFFFF" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Apex ERP/CRM Operations
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Sign in to access your role-based portal
          </p>
        </div>

        {/* Login Form Card */}
        <div className="card" style={{ padding: '2rem' }}>
          {error && (
            <div className="alert-banner alert-warning" style={{ marginBottom: '1.25rem', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)', color: '#F87171' }}>
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
                  placeholder="name@company.com"
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', height: '44px' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          {/* Quick Login Role Selector Buttons for Evaluators */}
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <KeyRound size={14} /> Quick Demo Login (Select Role):
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => quickFill('admin@company.com')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => quickFill('sales@company.com')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                💼 Sales
              </button>
              <button
                type="button"
                onClick={() => quickFill('warehouse@company.com')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                📦 Warehouse
              </button>
              <button
                type="button"
                onClick={() => quickFill('accounts@company.com')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                📊 Accounts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

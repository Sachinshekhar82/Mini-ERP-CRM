import React, { useEffect, useState } from 'react';
import {
  Users,
  Package,
  AlertTriangle,
  FileText,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import api from '../services/api';
import { DashboardStats } from '../types';
import { StatCard } from '../components/StatCard';

// Localized Skeleton Loaders for instant dashboard shell rendering
const StatCardSkeleton: React.FC = () => (
  <div
    style={{
      padding: '1.25rem',
      borderRadius: '12px',
      background: '#162032',
      border: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ height: '14px', width: '110px', background: '#1E293B', borderRadius: '4px' }} />
      <div style={{ height: '36px', width: '36px', background: '#1E293B', borderRadius: '8px' }} />
    </div>
    <div style={{ height: '28px', width: '90px', background: '#1E293B', borderRadius: '6px' }} />
    <div style={{ height: '12px', width: '130px', background: '#1E293B', borderRadius: '4px' }} />
  </div>
);

const TableRowSkeleton: React.FC = () => (
  <tr>
    <td>
      <div style={{ height: '14px', width: '140px', background: '#1E293B', borderRadius: '4px', marginBottom: '4px' }} />
      <div style={{ height: '10px', width: '80px', background: '#1E293B', borderRadius: '4px' }} />
    </td>
    <td><div style={{ height: '20px', width: '60px', background: '#1E293B', borderRadius: '4px' }} /></td>
    <td><div style={{ height: '14px', width: '40px', background: '#1E293B', borderRadius: '4px' }} /></td>
    <td><div style={{ height: '14px', width: '100px', background: '#1E293B', borderRadius: '4px' }} /></td>
  </tr>
);

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (isMounted) {
          setStats(res.data?.data || res.data);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
        if (isMounted) {
          setError('Failed to load live metrics. Please check network connection.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const lowStockAlerts = stats?.products?.lowStockAlerts || [];
  const stockLogs = stats?.recentActivity?.stockLogs || [];
  const lowStockCount = stats?.products?.lowStockCount || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Low Inventory Alert Banner */}
      {!loading && lowStockCount > 0 && (
        <div className="alert-banner alert-warning">
          <AlertTriangle size={22} color="#F59E0B" />
          <div style={{ flex: 1 }}>
            <strong style={{ fontWeight: 600 }}>Low Inventory Alert: </strong>
            There are {lowStockCount} product(s) below minimum stock threshold!
            Check the Inventory tab for immediate replenishment.
          </div>
        </div>
      )}

      {error && (
        <div className="alert-banner alert-danger" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#F87171' }}>
          <AlertTriangle size={22} color="#EF4444" />
          <div>{error}</div>
        </div>
      )}

      {/* INSTANT STAT CARDS SHELL */}
      <div className="grid grid-cols-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Active Customers"
              value={stats?.customers?.active || 0}
              subtitle={`${stats?.customers?.total || 0} Total registered customers`}
              icon={Users}
              iconColor="#10B981"
              badgeText={`${stats?.customers?.leads || 0} Leads`}
              badgeType="primary"
            />
            <StatCard
              title="Total Products"
              value={stats?.products?.total || 0}
              subtitle={`₹${(stats?.products?.totalStockValue || 0).toLocaleString('en-IN')} Total valuation`}
              icon={Package}
              iconColor="#3B82F6"
              badgeText={`${lowStockCount} Alert(s)`}
              badgeType={lowStockCount > 0 ? 'danger' : 'success'}
            />
            <StatCard
              title="Confirmed Sales Revenue"
              value={`₹${(stats?.challans?.totalRevenue || 0).toLocaleString('en-IN')}`}
              subtitle={`${stats?.challans?.confirmedCount || 0} Confirmed Challans`}
              icon={DollarSign}
              iconColor="#10B981"
              badgeText="Verified"
              badgeType="success"
            />
            <StatCard
              title="Total Challans"
              value={stats?.challans?.total || 0}
              subtitle="Sales challans & drafts issued"
              icon={FileText}
              iconColor="#EC4899"
              badgeText="Active"
              badgeType="primary"
            />
          </>
        )}
      </div>

      {/* INSTANT TABLES & RECENT ACTIVITY SHELL */}
      <div className="grid grid-cols-2">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="#F59E0B" />
              Low Stock Alert List
            </h3>
            <span className="badge badge-warning">{loading ? '...' : `${lowStockAlerts.length} Items`}</span>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product / SKU</th>
                  <th>Current Stock</th>
                  <th>Min Alert</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </>
                ) : lowStockAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      All stock levels are optimal!
                    </td>
                  </tr>
                ) : (
                  lowStockAlerts.map((prod) => (
                    <tr key={prod.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{prod.productName || (prod as any).name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prod.sku}</div>
                      </td>
                      <td>
                        <span className="badge badge-danger" style={{ fontWeight: 700 }}>
                          {prod.currentStock} Units
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{prod.minimumStock || (prod as any).minStockAlert}</td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{prod.warehouseLocation || (prod as any).location}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="var(--primary)" />
              Recent Stock Movements
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {loading ? (
              <>
                <div style={{ height: '52px', background: '#162032', borderRadius: '8px' }} />
                <div style={{ height: '52px', background: '#162032', borderRadius: '8px' }} />
                <div style={{ height: '52px', background: '#162032', borderRadius: '8px' }} />
              </>
            ) : stockLogs.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
                No recent stock movements.
              </div>
            ) : (
              stockLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: '#162032',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        background: log.movementType === 'IN' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                        color: log.movementType === 'IN' ? '#34D399' : '#F87171',
                        padding: '0.5rem',
                        borderRadius: '8px',
                      }}
                    >
                      {log.movementType === 'IN' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {log.productName}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {log.reason} • By {log.createdBy}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      className={`badge ${log.movementType === 'IN' ? 'badge-success' : 'badge-danger'}`}
                    >
                      {log.movementType === 'IN' ? `+${log.quantityChanged}` : `-${log.quantityChanged}`}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

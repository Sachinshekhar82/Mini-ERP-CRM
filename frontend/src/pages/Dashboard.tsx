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

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading Operations Dashboard...</div>;
  }

  if (!stats) {
    return <div style={{ color: 'var(--danger)' }}>Failed to load dashboard metrics.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {stats.products.lowStockCount > 0 && (
        <div className="alert-banner alert-warning">
          <AlertTriangle size={22} color="#F59E0B" />
          <div style={{ flex: 1 }}>
            <strong style={{ fontWeight: 600 }}>Low Inventory Alert: </strong>
            There are {stats.products.lowStockCount} product(s) below minimum stock threshold!
            Check the Inventory tab for immediate replenishment.
          </div>
        </div>
      )}

      <div className="grid grid-cols-4">
        <StatCard
          title="Active Customers"
          value={stats.customers.active}
          subtitle={`${stats.customers.total} Total registered customers`}
          icon={Users}
          badgeText={`${stats.customers.leads} Leads`}
          badgeType="primary"
        />
        <StatCard
          title="Total Products"
          value={stats.products.total}
          subtitle={`₹${stats.products.totalValue.toLocaleString('en-IN')} Total stock valuation`}
          icon={Package}
          badgeText={`${stats.products.lowStockCount} Alert(s)`}
          badgeType={stats.products.lowStockCount > 0 ? 'danger' : 'success'}
        />
        <StatCard
          title="Confirmed Sales Revenue"
          value={`₹${stats.challans.totalRevenue.toLocaleString('en-IN')}`}
          subtitle={`${stats.challans.confirmedCount} Confirmed Sales Challans`}
          icon={DollarSign}
          badgeText="Verified"
          badgeType="success"
        />
        <StatCard
          title="Total Challans"
          value={stats.challans.total}
          subtitle="Sales challans & drafts issued"
          icon={FileText}
          badgeText="Active"
          badgeType="primary"
        />
      </div>

      <div className="grid grid-cols-2">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="#F59E0B" />
              Low Stock Alert List
            </h3>
            <span className="badge badge-warning">{stats.products.lowStockAlerts.length} Items</span>
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
                {stats.products.lowStockAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      All stock levels are optimal!
                    </td>
                  </tr>
                ) : (
                  stats.products.lowStockAlerts.map((prod) => (
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
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="var(--primary)" />
              Recent Stock Movements
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.recentActivity.stockLogs.map((log) => (
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
                      background: log.movementType === 'IN' ? 'var(--success-light)' : 'var(--danger-light)',
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

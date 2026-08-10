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
        setStats(res.data?.data || res.data);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}>Loading Operations Dashboard...</div>;
  }

  if (!stats) {
    return <div style={{ color: 'var(--danger)', padding: '2rem' }}>Failed to load dashboard metrics.</div>;
  }

  const lowStockAlerts = stats.products?.lowStockAlerts || [];
  const stockLogs = stats.recentActivity?.stockLogs || [];
  const lowStockCount = stats.products?.lowStockCount || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {lowStockCount > 0 && (
        <div className="alert-banner alert-warning">
          <AlertTriangle size={22} color="#F59E0B" />
          <div style={{ flex: 1 }}>
            <strong style={{ fontWeight: 600 }}>Low Inventory Alert: </strong>
            There are {lowStockCount} product(s) below minimum stock threshold!
            Check the Inventory tab for immediate replenishment.
          </div>
        </div>
      )}

      <div className="grid grid-cols-4">
        <StatCard
          title="Active Customers"
          value={stats.customers?.active || 0}
          subtitle={`${stats.customers?.total || 0} Total registered customers`}
          icon={Users}
          iconColor="#10B981"
          badgeText={`${stats.customers?.leads || 0} Leads`}
          badgeType="primary"
        />
        <StatCard
          title="Total Products"
          value={stats.products?.total || 0}
          subtitle={`₹${(stats.products?.totalValue || 0).toLocaleString('en-IN')} Total valuation`}
          icon={Package}
          iconColor="#3B82F6"
          badgeText={`${lowStockCount} Alert(s)`}
          badgeType={lowStockCount > 0 ? 'danger' : 'success'}
        />
        <StatCard
          title="Confirmed Sales Revenue"
          value={`₹${(stats.challans?.totalRevenue || 0).toLocaleString('en-IN')}`}
          subtitle={`${stats.challans?.confirmedCount || 0} Confirmed Challans`}
          icon={DollarSign}
          iconColor="#10B981"
          badgeText="Verified"
          badgeType="success"
        />
        <StatCard
          title="Total Challans"
          value={stats.challans?.total || 0}
          subtitle="Sales challans & drafts issued"
          icon={FileText}
          iconColor="#EC4899"
          badgeText="Active"
          badgeType="primary"
        />
      </div>

      <div className="grid grid-cols-2">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="#F59E0B" />
              Low Stock Alert List
            </h3>
            <span className="badge badge-warning">{lowStockAlerts.length} Items</span>
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
                {lowStockAlerts.length === 0 ? (
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
            {stockLogs.length === 0 ? (
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

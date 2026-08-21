import React, { useEffect, useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface WorkOrderData {
  id: string;
  workOrderNumber: string;
  location: string;
  requiredQty: number;
  shortageQty: number;
  status: string;
  notes?: string;
  createdAt: string;
  inventoryItem: {
    itemName: string;
    sku: string;
    availableQty: number;
    location: string;
  };
  assignedUser: {
    name: string;
    email: string;
    role: string;
  };
}

export const WorkOrders: React.FC = () => {
  const { user } = useAuth();
  const [workOrders, setWorkOrders] = useState<WorkOrderData[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [location, setLocation] = useState('Location A (Warehouse Main)');
  const [inventoryItemId, setInventoryItemId] = useState('');
  const [requiredQty, setRequiredQty] = useState(10);
  const [assignedUserId, setAssignedUserId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchWorkOrders = async () => {
    try {
      const [woRes, invRes, usersRes] = await Promise.all([
        api.get('/work-orders'),
        api.get('/inventory-items'),
        api.get('/users').catch(() => ({ data: { data: [] } })),
      ]);
      setWorkOrders(woRes.data?.data || []);
      const items = invRes.data?.data || [];
      setInventoryItems(items);
      if (items.length > 0) setInventoryItemId(items[0].id);

      const users = usersRes.data?.data || [];
      setUsersList(users);
      if (users.length > 0) setAssignedUserId(users[0].id);
    } catch (err) {
      console.error('Failed to load work orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    try {
      await api.post('/work-orders', {
        location,
        inventoryItemId,
        requiredQty,
        assignedUserId: assignedUserId || user?.id,
        notes,
      });
      setShowModal(false);
      fetchWorkOrders();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to create work order');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/work-orders/${id}/status`, { status });
      fetchWorkOrders();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Work Orders & Material Stock Check
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Admin work order creation with automatic material shortage calculation and assignment logic.
          </p>
        </div>

        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              color: '#FFFFFF',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Plus size={18} />
            Create Work Order
          </button>
        )}
      </div>

      {/* Work Orders Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Work Order ID</th>
                <th>Location</th>
                <th>Item / SKU</th>
                <th>Required Qty</th>
                <th>Shortage Qty</th>
                <th>Assigned User</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading Work Orders...
                  </td>
                </tr>
              ) : workOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No work orders found.
                  </td>
                </tr>
              ) : (
                workOrders.map((wo) => (
                  <tr key={wo.id}>
                    <td>
                      <strong style={{ color: '#818CF8' }}>{wo.workOrderNumber}</strong>
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>{wo.location}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{wo.inventoryItem?.itemName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {wo.inventoryItem?.sku} (Avail: {wo.inventoryItem?.availableQty})
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{wo.requiredQty} Units</td>
                    <td>
                      {wo.shortageQty > 0 ? (
                        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <AlertTriangle size={12} /> {wo.shortageQty} Shortage
                        </span>
                      ) : (
                        <span className="badge badge-success">0 (Sufficient)</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{wo.assignedUser?.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{wo.assignedUser?.role}</div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          wo.status === 'COMPLETED'
                            ? 'badge-success'
                            : wo.status === 'IN_PROGRESS'
                            ? 'badge-warning'
                            : 'badge-primary'
                        }`}
                      >
                        {wo.status}
                      </span>
                    </td>
                    <td>
                      {wo.status !== 'COMPLETED' && (user?.role === 'ADMIN' || user?.role === 'OPERATIONS') && (
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          {wo.status === 'ASSIGNED' && (
                            <button
                              onClick={() => handleUpdateStatus(wo.id, 'IN_PROGRESS')}
                              style={{
                                padding: '0.3rem 0.6rem',
                                borderRadius: '6px',
                                fontSize: '0.725rem',
                                background: '#F59E0B',
                                color: '#FFFFFF',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              Start
                            </button>
                          )}
                          <button
                            onClick={() => handleUpdateStatus(wo.id, 'COMPLETED')}
                            style={{
                              padding: '0.3rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.725rem',
                              background: '#10B981',
                              color: '#FFFFFF',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            Complete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating Work Order */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem' }}>
              Create New Work Order
            </h3>

            {submitError && (
              <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {submitError}
              </div>
            )}

            <form onSubmit={handleCreateWorkOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E5E7EB', display: 'block', marginBottom: '0.35rem' }}>
                  Target Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{ width: '100%', height: '42px', borderRadius: '8px', background: '#111827', border: '1px solid #1F2937', color: '#FFFFFF', padding: '0 0.75rem' }}
                >
                  <option value="Location A (Warehouse Main)">Location A (Warehouse Main)</option>
                  <option value="Location B (Branch Depot)">Location B (Branch Depot)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E5E7EB', display: 'block', marginBottom: '0.35rem' }}>
                  Required Item
                </label>
                <select
                  value={inventoryItemId}
                  onChange={(e) => setInventoryItemId(e.target.value)}
                  style={{ width: '100%', height: '42px', borderRadius: '8px', background: '#111827', border: '1px solid #1F2937', color: '#FFFFFF', padding: '0 0.75rem' }}
                >
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.itemName} ({item.sku}) - Avail: {item.availableQty} at {item.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E5E7EB', display: 'block', marginBottom: '0.35rem' }}>
                  Required Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={requiredQty}
                  onChange={(e) => setRequiredQty(Number(e.target.value))}
                  style={{ width: '100%', height: '42px', borderRadius: '8px', background: '#111827', border: '1px solid #1F2937', color: '#FFFFFF', padding: '0 0.75rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E5E7EB', display: 'block', marginBottom: '0.35rem' }}>
                  Assigned Staff User
                </label>
                <select
                  value={assignedUserId}
                  onChange={(e) => setAssignedUserId(e.target.value)}
                  style={{ width: '100%', height: '42px', borderRadius: '8px', background: '#111827', border: '1px solid #1F2937', color: '#FFFFFF', padding: '0 0.75rem' }}
                >
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E5E7EB', display: 'block', marginBottom: '0.35rem' }}>
                  Work Order Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Production line Assembly run #4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', height: '42px', borderRadius: '8px', background: '#111827', border: '1px solid #1F2937', color: '#FFFFFF', padding: '0 0.75rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', background: '#374151', color: '#FFFFFF', border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', background: '#6366F1', color: '#FFFFFF', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >
                  Create Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Plus, ShieldAlert, XCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  quantity: number;
  status: 'PENDING' | 'RESERVED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  inventoryItem: {
    itemName: string;
    sku: string;
    location: string;
    availableQty: number;
    reservedQty: number;
    physicalQty: number;
  };
  createdBy: {
    name: string;
  };
}

export const CustomerOrders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [inventoryItemId, setInventoryItemId] = useState('');
  const [quantity, setQuantity] = useState(5);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const [ordRes, invRes] = await Promise.all([
        api.get('/customer-orders'),
        api.get('/inventory-items'),
      ]);
      setOrders(ordRes.data?.data || []);
      const items = invRes.data?.data || [];
      setInventoryItems(items);
      if (items.length > 0) setInventoryItemId(items[0].id);
    } catch (err) {
      console.error('Failed to load customer orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/customer-orders', {
        customerName,
        inventoryItemId,
        quantity,
      });
      setShowModal(false);
      setCustomerName('');
      fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order and reserve stock');
    }
  };

  const handleCancelOrder = async (id: string) => {
    setError(null);
    try {
      await api.post(`/customer-orders/${id}/cancel`);
      fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Customer Orders & Stock Reservation
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Atomic stock reservation guarantees two users cannot reserve more stock than available.
          </p>
        </div>

        {(user?.role === 'ADMIN' || user?.role === 'SALES') && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Plus size={18} />
            New Order & Reserve Stock
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: '0.875rem 1rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#F87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Customer Orders Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Item / SKU</th>
                <th>Location</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading Customer Orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No customer orders created yet.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id}>
                    <td><strong style={{ color: '#10B981' }}>{ord.orderNumber}</strong></td>
                    <td style={{ fontWeight: 600 }}>{ord.customerName}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{ord.inventoryItem?.itemName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.inventoryItem?.sku}</div>
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>{ord.inventoryItem?.location}</td>
                    <td style={{ fontWeight: 700 }}>{ord.quantity} Units</td>
                    <td>
                      <span
                        className={`badge ${
                          ord.status === 'RESERVED'
                            ? 'badge-success'
                            : ord.status === 'CANCELLED'
                            ? 'badge-danger'
                            : 'badge-primary'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>{ord.createdBy?.name}</td>
                    <td>
                      {ord.status === 'RESERVED' && (user?.role === 'ADMIN' || user?.role === 'SALES') && (
                        <button
                          onClick={() => handleCancelOrder(ord.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#F87171',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            cursor: 'pointer',
                          }}
                        >
                          <XCircle size={14} /> Cancel & Release Stock
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating Customer Order */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem' }}>
              Create Order & Reserve Stock
            </h3>

            <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E5E7EB', display: 'block', marginBottom: '0.35rem' }}>
                  Customer Name / Business
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Distributors Pvt Ltd"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ width: '100%', height: '42px', borderRadius: '8px', background: '#111827', border: '1px solid #1F2937', color: '#FFFFFF', padding: '0 0.75rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E5E7EB', display: 'block', marginBottom: '0.35rem' }}>
                  Inventory Item to Reserve
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
                  Reservation Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
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
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', background: '#10B981', color: '#FFFFFF', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >
                  Reserve Stock & Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Plus, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface TransferData {
  id: string;
  transferNumber: string;
  sourceLocation: string;
  destinationLocation: string;
  quantity: number;
  status: 'REQUESTED' | 'DISPATCHED' | 'RECEIVED';
  createdAt: string;
  dispatchedAt?: string;
  receivedAt?: string;
  inventoryItem: {
    itemName: string;
    sku: string;
    availableQty: number;
  };
  createdBy: {
    name: string;
  };
}

export const InternalTransfers: React.FC = () => {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<TransferData[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [sourceLocation, setSourceLocation] = useState('Location B (Branch Depot)');
  const [destinationLocation, setDestinationLocation] = useState('Location A (Warehouse Main)');
  const [inventoryItemId, setInventoryItemId] = useState('');
  const [quantity, setQuantity] = useState(5);
  const [error, setError] = useState<string | null>(null);

  const fetchTransfers = async () => {
    try {
      const [trRes, invRes] = await Promise.all([
        api.get('/transfers'),
        api.get('/inventory-items'),
      ]);
      setTransfers(trRes.data?.data || []);
      const items = invRes.data?.data || [];
      setInventoryItems(items);
      if (items.length > 0) setInventoryItemId(items[0].id);
    } catch (err) {
      console.error('Failed to load transfers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/transfers', {
        sourceLocation,
        destinationLocation,
        inventoryItemId,
        quantity,
      });
      setShowModal(false);
      fetchTransfers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request transfer');
    }
  };

  const handleDispatch = async (id: string) => {
    setError(null);
    try {
      await api.post(`/transfers/${id}/dispatch`);
      fetchTransfers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to dispatch transfer');
    }
  };

  const handleReceive = async (id: string) => {
    setError(null);
    try {
      await api.post(`/transfers/${id}/receive`);
      fetchTransfers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to receive transfer');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Internal Stock Transfers (2-Phase Dispatch & Receive)
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Source stock reduces on <strong>Dispatch</strong>. Destination stock increases ONLY on <strong>Receipt</strong>. Double-receive protected.
          </p>
        </div>

        {(user?.role === 'ADMIN' || user?.role === 'OPERATIONS') && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#FFFFFF',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
            }}
          >
            <Plus size={18} />
            Request Stock Transfer
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: '0.875rem 1rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#F87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Transfers Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Transfer ID</th>
                <th>Source Location</th>
                <th>Destination Location</th>
                <th>Item / SKU</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Requested By</th>
                <th>2-Phase Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading Stock Transfers...
                  </td>
                </tr>
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No stock transfers requested.
                  </td>
                </tr>
              ) : (
                transfers.map((tr) => (
                  <tr key={tr.id}>
                    <td><strong style={{ color: '#F59E0B' }}>{tr.transferNumber}</strong></td>
                    <td style={{ fontSize: '0.8125rem' }}>{tr.sourceLocation}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{tr.destinationLocation}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{tr.inventoryItem?.itemName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tr.inventoryItem?.sku}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{tr.quantity} Units</td>
                    <td>
                      <span
                        className={`badge ${
                          tr.status === 'RECEIVED'
                            ? 'badge-success'
                            : tr.status === 'DISPATCHED'
                            ? 'badge-warning'
                            : 'badge-primary'
                        }`}
                      >
                        {tr.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>{tr.createdBy?.name}</td>
                    <td>
                      {tr.status === 'REQUESTED' && (user?.role === 'ADMIN' || user?.role === 'OPERATIONS') && (
                        <button
                          onClick={() => handleDispatch(tr.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            background: '#F59E0B',
                            color: '#FFFFFF',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <Send size={14} /> Dispatch (Source ↓)
                        </button>
                      )}

                      {tr.status === 'DISPATCHED' && (user?.role === 'ADMIN' || user?.role === 'OPERATIONS') && (
                        <button
                          onClick={() => handleReceive(tr.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            background: '#10B981',
                            color: '#FFFFFF',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <CheckCircle2 size={14} /> Receive (Dest ↑)
                        </button>
                      )}

                      {tr.status === 'RECEIVED' && (
                        <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
                          ✓ Completed & Received
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating Transfer */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem' }}>
              Request Internal Stock Transfer
            </h3>

            <form onSubmit={handleCreateTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E5E7EB', display: 'block', marginBottom: '0.35rem' }}>
                  Source Location (Stock will reduce on Dispatch)
                </label>
                <select
                  value={sourceLocation}
                  onChange={(e) => setSourceLocation(e.target.value)}
                  style={{ width: '100%', height: '42px', borderRadius: '8px', background: '#111827', border: '1px solid #1F2937', color: '#FFFFFF', padding: '0 0.75rem' }}
                >
                  <option value="Location B (Branch Depot)">Location B (Branch Depot)</option>
                  <option value="Location A (Warehouse Main)">Location A (Warehouse Main)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E5E7EB', display: 'block', marginBottom: '0.35rem' }}>
                  Destination Location (Stock increases ONLY on Receive)
                </label>
                <select
                  value={destinationLocation}
                  onChange={(e) => setDestinationLocation(e.target.value)}
                  style={{ width: '100%', height: '42px', borderRadius: '8px', background: '#111827', border: '1px solid #1F2937', color: '#FFFFFF', padding: '0 0.75rem' }}
                >
                  <option value="Location A (Warehouse Main)">Location A (Warehouse Main)</option>
                  <option value="Location B (Branch Depot)">Location B (Branch Depot)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E5E7EB', display: 'block', marginBottom: '0.35rem' }}>
                  Source Inventory Item
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
                  Quantity to Transfer
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
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', background: '#F59E0B', color: '#FFFFFF', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >
                  Request Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

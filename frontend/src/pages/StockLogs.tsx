import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import api from '../services/api';
import { StockMovementLog, Product } from '../types';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export const StockLogs: React.FC = () => {
  const [logs, setLogs] = useState<StockMovementLog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Quick Adjust Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    productId: '',
    quantity: 1,
    movementType: 'IN' as 'IN' | 'OUT',
    reason: 'Vendor Purchase Shipment',
  });

  const { hasRole } = useAuth();

  const fetchLogsAndProducts = async () => {
    try {
      setLoading(true);
      const [logsRes, prodRes] = await Promise.all([
        api.get('/stock/logs'),
        api.get('/products'),
      ]);
      setLogs(logsRes.data.data);
      setProducts(prodRes.data.data);
      if (prodRes.data.data.length > 0 && !adjustForm.productId) {
        setAdjustForm((prev) => ({ ...prev, productId: prodRes.data.data[0].id }));
      }
    } catch (err: any) {
      setToast({ message: 'Failed to load stock movement history', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsAndProducts();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/stock/adjust', adjustForm);
      setToast({ message: 'Stock adjustment recorded successfully', type: 'success' });
      setIsAdjustModalOpen(false);
      fetchLogsAndProducts();
    } catch (err: any) {
      setToast({
        message: err.response?.data?.message || 'Failed to adjust stock',
        type: 'error',
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Toast message={toast?.message || null} type={toast?.type} onClose={() => setToast(null)} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Inventory Audit & Stock Movement Log
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Complete audit trail of all incoming stock receipts and outgoing sales challans
          </p>
        </div>

        {hasRole('ADMIN', 'WAREHOUSE') && (
          <button className="btn btn-primary" onClick={() => setIsAdjustModalOpen(true)}>
            <PlusCircle size={18} />
            Adjust Inventory (IN / OUT)
          </button>
        )}
      </div>

      {/* Stock Log Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Product Name</th>
                <th>Qty Changed</th>
                <th>Reason / Reference</th>
                <th>Logged By</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading stock logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No stock movement logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className={`badge ${log.movementType === 'IN' ? 'badge-success' : 'badge-danger'}`}>
                        {log.movementType === 'IN' ? 'IN (+)' : 'OUT (-)'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.productName}</td>
                    <td style={{ fontWeight: 700, color: log.movementType === 'IN' ? '#34D399' : '#F87171' }}>
                      {log.movementType === 'IN' ? `+${log.quantityChanged}` : `-${log.quantityChanged}`} Units
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{log.reason}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{log.createdBy}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Inventory Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Manual Stock Adjustment"
      >
        <form onSubmit={handleAdjustStock}>
          <div className="form-group">
            <label className="form-label">Select Product *</label>
            <select
              className="form-select"
              required
              value={adjustForm.productId}
              onChange={(e) => setAdjustForm({ ...adjustForm, productId: e.target.value })}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Current Stock: {p.currentStock}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Movement Type *</label>
              <select
                className="form-select"
                value={adjustForm.movementType}
                onChange={(e) => setAdjustForm({ ...adjustForm, movementType: e.target.value as any })}
              >
                <option value="IN">IN (Receive Stock)</option>
                <option value="OUT">OUT (Issue/Return Stock)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                min="1"
                className="form-input"
                required
                value={adjustForm.quantity}
                onChange={(e) => setAdjustForm({ ...adjustForm, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Adjustment *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Vendor PO #402, Stock Audit Correction, Damaged item return"
              value={adjustForm.reason}
              onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAdjustModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Log Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

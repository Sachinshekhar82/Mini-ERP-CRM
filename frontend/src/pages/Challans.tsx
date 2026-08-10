import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Download, Eye, Trash2 } from 'lucide-react';
import api from '../services/api';
import { SalesChallan, Customer, Product } from '../types';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export const Challans: React.FC = () => {
  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<SalesChallan | null>(null);

  const [customerId, setCustomerId] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'CONFIRMED'>('DRAFT');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Array<{ productId: string; quantity: number }>>([
    { productId: '', quantity: 1 },
  ]);

  const { hasRole } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;

      const [cRes, custRes, prodRes] = await Promise.all([
        api.get('/challans', { params }),
        api.get('/customers'),
        api.get('/products'),
      ]);

      setChallans(cRes.data.data);
      setCustomers(custRes.data.data);
      setProducts(prodRes.data.data);

      if (custRes.data.data.length > 0 && !customerId) {
        setCustomerId(custRes.data.data[0].id);
      }
      if (prodRes.data.data.length > 0 && items[0].productId === '') {
        setItems([{ productId: prodRes.data.data[0].id, quantity: 1 }]);
      }
    } catch (err: any) {
      setToast({ message: 'Failed to load sales challans', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleAddItemRow = () => {
    const defaultProdId = products.length > 0 ? products[0].id : '';
    setItems([...items, { productId: defaultProdId, quantity: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    let total = 0;
    items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        total += prod.unitPrice * item.quantity;
      }
    });
    return total;
  };

  const handleCreateChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setToast({ message: 'Please select a customer', type: 'error' });
      return;
    }

    try {
      await api.post('/challans', {
        customerId,
        status,
        notes,
        items,
      });

      setToast({
        message: `Sales Challan created successfully as ${status}`,
        type: 'success',
      });
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err: any) {
      setToast({
        message: err.response?.data?.message || 'Failed to create sales challan',
        type: 'error',
      });
    }
  };

  const handleConfirmChallan = async (challanId: string) => {
    try {
      await api.post(`/challans/${challanId}/confirm`);
      setToast({ message: 'Challan Confirmed! Stock levels updated.', type: 'success' });
      setIsDetailModalOpen(false);
      fetchData();
    } catch (err: any) {
      setToast({
        message: err.response?.data?.message || 'Failed to confirm challan',
        type: 'error',
      });
    }
  };

  const handleOpenDetail = async (c: SalesChallan) => {
    try {
      const res = await api.get(`/challans/${c.id}`);
      setSelectedChallan(res.data.data);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      setToast({ message: 'Could not load challan details', type: 'error' });
    }
  };

  const handleDownloadPDF = async (challanId: string, challanNumber: string) => {
    try {
      setToast({ message: `Generating PDF for ${challanNumber}...`, type: 'success' });
      const response = await api.get(`/challans/${challanId}/pdf`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Sales-Challan-${challanNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('PDF Download Error:', err);
      setToast({ message: 'Failed to download PDF invoice', type: 'error' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Toast message={toast?.message || null} type={toast?.type} onClose={() => setToast(null)} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {hasRole('ADMIN', 'SALES') && (
          <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} />
            Generate Sales Challan
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Challan No</th>
                <th>Customer / Business</th>
                <th>Status</th>
                <th>Total Qty</th>
                <th>Grand Total (₹)</th>
                <th>Created By</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading challans...
                  </td>
                </tr>
              ) : challans.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No sales challans generated yet.
                  </td>
                </tr>
              ) : (
                challans.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{c.challanNumber}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {c.customer?.businessName || c.customer?.customerName || c.customerName}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          c.status === 'CONFIRMED'
                            ? 'badge-success'
                            : c.status === 'DRAFT'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td>{c.totalQuantity} Items</td>
                    <td style={{ fontWeight: 700, color: '#34D399' }}>
                      ₹{c.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {typeof c.createdBy === 'object' ? c.createdBy?.name : c.createdBy || c.createdByName || 'Sales User'}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {new Date(c.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenDetail(c)}
                          title="View Detail / Invoice"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleDownloadPDF(c.id, c.challanNumber)}
                          title="Export PDF Invoice"
                        >
                          <Download size={15} /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Generate New Sales Challan"
        large
      >
        <form onSubmit={handleCreateChallan}>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Select Customer *</label>
              <select
                className="form-select"
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                {customers.map((cust) => (
                  <option key={cust.id} value={cust.id}>
                    {cust.businessName} ({cust.customerName || (cust as any).name})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Initial Status *</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="DRAFT">Save as DRAFT (Stock not deducted yet)</option>
                <option value="CONFIRMED">CONFIRMED (Deduct stock immediately)</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ margin: 0 }}>
                Line Items & Product Snapshots
              </label>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddItemRow}
              >
                <Plus size={14} /> Add Line Item
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items.map((item, idx) => {
                const selectedProd = products.find((p) => p.id === item.productId);
                const lineTotal = selectedProd ? selectedProd.unitPrice * item.quantity : 0;

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      background: '#162032',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ flex: 2 }}>
                      <select
                        className="form-select"
                        required
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.productName || (p as any).name} ({p.sku}) — ₹{p.unitPrice} [Stock: {p.currentStock}]
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ width: '100px' }}>
                      <input
                        type="number"
                        min="1"
                        className="form-input"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div style={{ width: '120px', textAlign: 'right', fontWeight: 600, color: '#34D399' }}>
                      ₹{lineTotal.toFixed(2)}
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                        onClick={() => handleRemoveItemRow(idx)}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              background: '#0F172A',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Calculated Total Amount:</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34D399' }}>
              ₹{calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Challan Notes / Special Instructions</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Express courier delivery. Dispatch by Friday."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Generate Sales Challan
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Sales Challan Invoice #${selectedChallan?.challanNumber || ''}`}
        large
      >
        {selectedChallan && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                padding: '1rem 1.25rem',
                background: '#162032',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Customer: {selectedChallan.customer?.businessName || selectedChallan.customer?.customerName || selectedChallan.customerName}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Issued by {typeof selectedChallan.createdBy === 'object' ? selectedChallan.createdBy?.name : selectedChallan.createdByName || 'Sales User'} on {new Date(selectedChallan.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className={`badge badge-${selectedChallan.status === 'CONFIRMED' ? 'success' : 'warning'}`}>
                  {selectedChallan.status}
                </span>
                <div style={{ marginTop: '0.5rem' }}>
                  {selectedChallan.status === 'DRAFT' && hasRole('ADMIN', 'SALES', 'ACCOUNTS') && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleConfirmChallan(selectedChallan.id)}
                    >
                      <CheckCircle size={14} /> Confirm & Deduct Stock
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Item & SKU (Snapshot)</th>
                    <th>Unit Price (Snapshot)</th>
                    <th>Qty</th>
                    <th style={{ textAlign: 'right' }}>Line Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedChallan.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.productNameSnapshot || (item as any).productName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.skuSnapshot || (item as any).sku}</div>
                      </td>
                      <td>₹{(item.unitPriceSnapshot || (item as any).unitPrice || 0).toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#34D399' }}>
                        ₹{item.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: '#0F172A',
                borderRadius: '8px',
              }}
            >
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleDownloadPDF(selectedChallan.id, selectedChallan.challanNumber)}
              >
                <Download size={16} /> Export Official PDF Invoice
              </button>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Grand Total: </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34D399' }}>
                  ₹{selectedChallan.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

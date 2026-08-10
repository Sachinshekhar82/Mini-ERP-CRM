import React, { useState, useEffect } from 'react';
import {
  Search,
  Edit2,
  Eye,
  MessageSquare,
  Building,
  Calendar,
  UserPlus,
  Plus,
} from 'lucide-react';
import api from '../services/api';
import { Customer } from '../types';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'RETAIL',
    address: '',
    status: 'LEAD',
    followUpDate: '',
    notes: '',
  });

  const [noteText, setNoteText] = useState('');

  const { hasRole } = useAuth();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.customerType = typeFilter;

      const res = await api.get('/customers', { params });
      setCustomers(res.data.data);
    } catch (err: any) {
      setToast({ message: 'Failed to load customer list', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter, typeFilter]);

  const handleOpenAdd = () => {
    setFormData({
      customerName: '',
      mobile: '',
      email: '',
      businessName: '',
      gstNumber: '',
      customerType: 'RETAIL',
      address: '',
      status: 'LEAD',
      followUpDate: '',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cust: Customer) => {
    setSelectedCustomer(cust);
    setFormData({
      customerName: cust.customerName || (cust as any).name || '',
      mobile: cust.mobile,
      email: cust.email,
      businessName: cust.businessName,
      gstNumber: cust.gstNumber || '',
      customerType: cust.customerType || (cust as any).type || 'RETAIL',
      address: cust.address,
      status: cust.status,
      followUpDate: cust.followUpDate || '',
      notes: cust.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDetail = async (cust: Customer) => {
    try {
      const res = await api.get(`/customers/${cust.id}`);
      setSelectedCustomer(res.data.data);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      setToast({ message: 'Could not load customer details', type: 'error' });
    }
  };

  const handleOpenAddNote = (cust: Customer) => {
    setSelectedCustomer(cust);
    setNoteText('');
    setIsNoteModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditModalOpen && selectedCustomer) {
        await api.put(`/customers/${selectedCustomer.id}`, formData);
        setToast({ message: 'Customer updated successfully', type: 'success' });
        setIsEditModalOpen(false);
      } else {
        await api.post('/customers', formData);
        setToast({ message: 'New customer created successfully', type: 'success' });
        setIsAddModalOpen(false);
      }
      fetchCustomers();
    } catch (err: any) {
      setToast({
        message: err.response?.data?.message || 'Failed to save customer',
        type: 'error',
      });
    }
  };

  const handleAddFollowUpNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !noteText.trim()) return;

    try {
      await api.post(`/customers/${selectedCustomer.id}/follow-ups`, { note: noteText });
      setToast({ message: 'Follow-up note recorded', type: 'success' });
      setIsNoteModalOpen(false);
      if (isDetailModalOpen) {
        handleOpenDetail(selectedCustomer);
      }
      fetchCustomers();
    } catch (err: any) {
      setToast({ message: 'Failed to add note', type: 'error' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Toast message={toast?.message || null} type={toast?.type} onClose={() => setToast(null)} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '300px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by customer name, business, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: '160px' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="RETAIL">Retail</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="DISTRIBUTOR">Distributor</option>
          </select>

          <select
            className="form-select"
            style={{ width: '160px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {hasRole('ADMIN', 'SALES') && (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <UserPlus size={18} />
            Add Customer
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Customer & Business</th>
                <th>Contact Info</th>
                <th>Type</th>
                <th>Status</th>
                <th>Follow-up Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {cust.customerName || (cust as any).name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Building size={12} /> {cust.businessName}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{cust.email}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cust.mobile}</div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{cust.customerType || (cust as any).type}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          cust.status === 'ACTIVE'
                            ? 'badge-success'
                            : cust.status === 'LEAD'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {cust.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {cust.followUpDate ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={13} color="var(--primary)" /> {cust.followUpDate}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenDetail(cust)}
                          title="View Customer Profile"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenAddNote(cust)}
                          title="Add Follow-up Note"
                        >
                          <MessageSquare size={15} />
                        </button>
                        {hasRole('ADMIN', 'SALES') && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEdit(cust)}
                            title="Edit Customer"
                          >
                            <Edit2 size={15} />
                          </button>
                        )}
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
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? 'Edit Customer Information' : 'Add New Customer'}
      >
        <form onSubmit={handleSaveCustomer}>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Business Name *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3">
            <div className="form-group">
              <label className="form-label">Customer Type</label>
              <select
                className="form-select"
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value as any })}
              >
                <option value="RETAIL">Retail</option>
                <option value="WHOLESALE">Wholesale</option>
                <option value="DISTRIBUTOR">Distributor</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">GST Number (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="27ABCDE1234F1Z5"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Follow-up Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Address *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Initial customer requirements or conversation summary..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifySelf: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditModalOpen ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Customer Profile & Follow-up History"
        large
      >
        {selectedCustomer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{
                padding: '1.25rem',
                background: '#162032',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedCustomer.customerName || (selectedCustomer as any).name}
                </h3>
                <p style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.875rem' }}>
                  {selectedCustomer.businessName}
                </p>
                {selectedCustomer.gstNumber && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    GSTIN: {selectedCustomer.gstNumber}
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge badge-${selectedCustomer.status === 'ACTIVE' ? 'success' : 'warning'}`}>
                  {selectedCustomer.status}
                </span>
                <div style={{ marginTop: '0.375rem' }}>
                  <span className="badge badge-primary">{selectedCustomer.customerType || (selectedCustomer as any).type}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2" style={{ fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{selectedCustomer.email}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
                <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{selectedCustomer.mobile}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Next Follow-up Date:</span>
                <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                  {selectedCustomer.followUpDate || 'Not scheduled'}
                </p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Address:</span>
                <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{selectedCustomer.address}</p>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  CRM Follow-up Notes Timeline
                </h4>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleOpenAddNote(selectedCustomer)}
                >
                  <Plus size={14} /> Add Note
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto' }}>
                {!selectedCustomer.followUps || selectedCustomer.followUps.length === 0 ? (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    No follow-up notes recorded yet.
                  </p>
                ) : (
                  selectedCustomer.followUps.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '0.75rem 1rem',
                        background: '#0F172A',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{n.note}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Added by {n.createdBy?.name || 'Sales User'} on {new Date(n.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title={`Add CRM Follow-up Note for ${selectedCustomer?.customerName || (selectedCustomer as any)?.name || ''}`}
      >
        <form onSubmit={handleAddFollowUpNote}>
          <div className="form-group">
            <label className="form-label">Follow-up Note / Meeting Summary *</label>
            <textarea
              className="form-textarea"
              rows={4}
              required
              placeholder="e.g. Spoke with client regarding bulk order discount. Sent quotation..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsNoteModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Note
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface InventoryItemData {
  id: string;
  itemName: string;
  sku: string;
  category: string;
  location: string;
  batch: string;
  physicalQty: number;
  reservedQty: number;
  availableQty: number;
  unitPrice: number;
  updatedAt: string;
}

export const InventoryItems: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [itemName, setItemName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Power Tools');
  const [location, setLocation] = useState('Location A (Warehouse Main)');
  const [batch, setBatch] = useState('BATCH-2026-01');
  const [physicalQty, setPhysicalQty] = useState(50);
  const [unitPrice, setUnitPrice] = useState(1000);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      const res = await api.get('/inventory-items', {
        params: { search, location: locationFilter },
      });
      setItems(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load inventory items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search, locationFilter]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/inventory-items', {
        itemName,
        sku,
        category,
        location,
        batch,
        physicalQty,
        unitPrice,
      });
      setShowModal(false);
      setItemName('');
      setSku('');
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create inventory item');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Inventory Management (Multi-Location & Batches)
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Calculates <strong>Available Quantity = Physical Quantity - Reserved Quantity</strong> and prevents negative stock.
          </p>
        </div>

        {(user?.role === 'ADMIN' || user?.role === 'OPERATIONS' || user?.role === 'WAREHOUSE') && (
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
            Add Inventory Item
          </button>
        )}
      </div>

      {/* Controls Bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
          <input
            type="text"
            placeholder="Search by Item Name, SKU, Category, or Location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', height: '42px', paddingLeft: '2.5rem', paddingRight: '1rem', borderRadius: '10px', background: '#162032', border: '1px solid var(--border-color)', color: '#FFFFFF', fontSize: '0.875rem', outline: 'none' }}
          />
        </div>

        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          style={{ height: '42px', padding: '0 1rem', borderRadius: '10px', background: '#162032', border: '1px solid var(--border-color)', color: '#FFFFFF', fontSize: '0.875rem', outline: 'none' }}
        >
          <option value="">All Locations</option>
          <option value="Location A (Warehouse Main)">Location A (Warehouse Main)</option>
          <option value="Location B (Branch Depot)">Location B (Branch Depot)</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Item / SKU</th>
                <th>Category</th>
                <th>Location</th>
                <th>Batch / Lot</th>
                <th>Physical Qty</th>
                <th>Reserved Qty</th>
                <th>Available Qty</th>
                <th>Unit Price</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading Inventory Items...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No inventory records found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.itemName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.sku}</div>
                    </td>
                    <td><span className="badge badge-primary">{item.category}</span></td>
                    <td style={{ fontSize: '0.8125rem' }}>{item.location}</td>
                    <td style={{ fontSize: '0.8125rem', fontFamily: 'monospace' }}>{item.batch}</td>
                    <td style={{ fontWeight: 600 }}>{item.physicalQty} Units</td>
                    <td>
                      <span className={`badge ${item.reservedQty > 0 ? 'badge-warning' : 'badge-primary'}`}>
                        {item.reservedQty} Reserved
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${item.availableQty > 0 ? 'badge-success' : 'badge-danger'}`} style={{ fontWeight: 800 }}>
                        {item.availableQty} Available
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{item.unitPrice.toLocaleString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem' }}>
              Add Inventory Record
            </h3>

            {error && (
              <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreateItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E5E7EB', display: 'block', marginBottom: '0.35rem' }}>Item Name</label>
                <input type="text" required placeholder="e.g. Industrial Drill Machine" value={itemName} onChange={(e) => setItemName(e.target.value)} style={{ width: '100%', height: '42px', borderRadius: '8px', background: '#111827', border: '1px solid #1F2937', color: '#FFFFFF', padding: '0 0.75rem' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E5E7EB', display: 'block', marginBottom: '0.35rem' }}>SKU Code</label>
                  <input type="text" required placeholder="SKU-DRL-850" value={sku} onChange={(e) => setSku(e.target.value)} style={{ width: '100%', height: '42px', borderRadius: '8px', background: '#111827', border: '1px solid #1F2937', color: '#FFFFFF', padding: '0 0.75rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E5E7EB', display: 'block', marginBottom: '0.35rem' }}>Category</label>
                  <input type="text" required value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', height: '42px', borderRadius: '8px', background: '#111827', border: '1px solid #1F2937', color: '#FFFFFF', padding: '0 0.75rem' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E5E7EB', display: 'block', marginBottom: '0.35rem' }}>Storage Location</label>
                <select value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', height: '42px', borderRadius: '8px', background: '#111827', border: '1px solid #1F2937', color: '#FFFFFF', padding: '0 0.75rem' }}>
                  <option value="Location A (Warehouse Main)">Location A (Warehouse Main)</option>
                  <option value="Location B (Branch Depot)">Location B (Branch Depot)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E5E7EB', display: 'block', marginBottom: '0.35rem' }}>Batch No</label>
                  <input type="text" required value={batch} onChange={(e) => setBatch(e.target.value)} style={{ width: '100%', height: '42px', borderRadius: '8px', background: '#111827', border: '1px solid #1F2937', color: '#FFFFFF', padding: '0 0.75rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E5E7EB', display: 'block', marginBottom: '0.35rem' }}>Physical Qty</label>
                  <input type="number" min="0" required value={physicalQty} onChange={(e) => setPhysicalQty(Number(e.target.value))} style={{ width: '100%', height: '42px', borderRadius: '8px', background: '#111827', border: '1px solid #1F2937', color: '#FFFFFF', padding: '0 0.75rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E5E7EB', display: 'block', marginBottom: '0.35rem' }}>Unit Price ₹</label>
                  <input type="number" min="0" required value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} style={{ width: '100%', height: '42px', borderRadius: '8px', background: '#111827', border: '1px solid #1F2937', color: '#FFFFFF', padding: '0 0.75rem' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', background: '#374151', color: '#FFFFFF', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', background: '#6366F1', color: '#FFFFFF', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Create Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

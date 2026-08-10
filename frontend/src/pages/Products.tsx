import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, AlertTriangle, MapPin } from 'lucide-react';
import api from '../services/api';
import { Product } from '../types';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minimumStock: 5,
    warehouseLocation: '',
    imageUrl: '',
  });

  const { hasRole } = useAuth();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (lowStockFilter) params.lowStock = 'true';

      const res = await api.get('/products', { params });
      setProducts(res.data.data);
    } catch (err: any) {
      setToast({ message: 'Failed to load products', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, lowStockFilter]);

  const handleOpenAdd = () => {
    setFormData({
      productName: '',
      sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Power Tools',
      unitPrice: 1000,
      currentStock: 20,
      minimumStock: 5,
      warehouseLocation: 'Rack A-01, Warehouse 1',
      imageUrl: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setSelectedProduct(prod);
    setFormData({
      productName: prod.productName || (prod as any).name || '',
      sku: prod.sku,
      category: prod.category,
      unitPrice: prod.unitPrice,
      currentStock: prod.currentStock,
      minimumStock: prod.minimumStock || (prod as any).minStockAlert || 5,
      warehouseLocation: prod.warehouseLocation || (prod as any).location || '',
      imageUrl: prod.imageUrl || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditModalOpen && selectedProduct) {
        await api.put(`/products/${selectedProduct.id}`, formData);
        setToast({ message: 'Product updated successfully', type: 'success' });
        setIsEditModalOpen(false);
      } else {
        await api.post('/products', formData);
        setToast({ message: 'Product added successfully', type: 'success' });
        setIsAddModalOpen(false);
      }
      fetchProducts();
    } catch (err: any) {
      setToast({
        message: err.response?.data?.message || 'Failed to save product',
        type: 'error',
      });
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
              placeholder="Search product name, SKU, category, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: '160px' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Power Tools">Power Tools</option>
            <option value="Furniture">Furniture</option>
            <option value="Electronics">Electronics</option>
            <option value="Fasteners">Fasteners</option>
          </select>

          <button
            type="button"
            className={`btn ${lowStockFilter ? 'btn-danger' : 'btn-secondary'}`}
            style={{ gap: '0.375rem' }}
            onClick={() => setLowStockFilter(!lowStockFilter)}
          >
            <AlertTriangle size={16} />
            Low Stock Only
          </button>
        </div>

        {hasRole('ADMIN', 'WAREHOUSE') && (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} />
            Add Product
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product & SKU</th>
                <th>Category</th>
                <th>Unit Price (₹)</th>
                <th>Current Stock</th>
                <th>Min Alert Qty</th>
                <th>Location / Warehouse</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const minStock = prod.minimumStock || (prod as any).minStockAlert || 5;
                  const isLowStock = prod.currentStock <= minStock;
                  return (
                    <tr key={prod.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {prod.productName || (prod as any).name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prod.sku}</div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{prod.category}</span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#34D399' }}>
                        ₹{prod.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span className={`badge ${isLowStock ? 'badge-danger' : 'badge-success'}`}>
                          {prod.currentStock} Units
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{minStock}</td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={13} color="var(--primary)" /> {prod.warehouseLocation || (prod as any).location}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {hasRole('ADMIN', 'WAREHOUSE') && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEdit(prod)}
                            title="Edit Product"
                          >
                            <Edit2 size={15} /> Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
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
        title={isEditModalOpen ? 'Edit Product Details' : 'Add New Product to Inventory'}
      >
        <form onSubmit={handleSaveProduct}>
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              className="form-input"
              required
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">SKU / Code *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3">
            <div className="form-group">
              <label className="form-label">Unit Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Stock *</label>
              <input
                type="number"
                min="0"
                className="form-input"
                required
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Min Stock Alert Qty</label>
              <input
                type="number"
                min="0"
                className="form-input"
                required
                value={formData.minimumStock}
                onChange={(e) => setFormData({ ...formData, minimumStock: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Warehouse Location *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Rack B-14, Warehouse 1"
              value={formData.warehouseLocation}
              onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
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
              {isEditModalOpen ? 'Save Product' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

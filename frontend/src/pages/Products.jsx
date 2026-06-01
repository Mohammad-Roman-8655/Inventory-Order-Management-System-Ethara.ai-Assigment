import React, { useEffect, useState } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';
import { Package, Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';

export default function Products({ setToast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formDesc, setFormDesc] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await client.get('/products');
      setProducts(res.data);
    } catch (err) {
      setToast({ message: 'Failed to fetch products', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku('');
    setFormPrice('');
    setFormQuantity('');
    setFormDesc('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormSku(product.sku);
    setFormPrice(product.price.toString());
    setFormQuantity(product.quantity.toString());
    setFormDesc(product.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validations
    if (!formName.trim()) return setToast({ message: 'Product Name is required', type: 'error' });
    if (!formSku.trim()) return setToast({ message: 'SKU Code is required', type: 'error' });
    
    const parsedPrice = parseFloat(formPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return setToast({ message: 'Price must be a positive number', type: 'error' });
    }

    const parsedQty = parseInt(formQuantity, 10);
    if (isNaN(parsedQty) || parsedQty < 0) {
      return setToast({ message: 'Quantity cannot be negative', type: 'error' });
    }

    const payload = {
      name: formName.trim(),
      sku: formSku.trim(),
      price: parsedPrice,
      quantity: parsedQty,
      description: formDesc.trim() || null
    };

    try {
      if (editingProduct) {
        await client.put(`/products/${editingProduct.id}`, payload);
        setToast({ message: 'Product updated successfully', type: 'success' });
      } else {
        await client.post('/products/', payload);
        setToast({ message: 'Product created successfully', type: 'success' });
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to save product';
      setToast({ message: errMsg, type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await client.delete(`/products/${id}`);
      setToast({ message: 'Product deleted successfully', type: 'success' });
      fetchProducts();
    } catch (err) {
      setToast({ message: 'Failed to delete product', type: 'error' });
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Products Management</h1>
          <p className="page-subtitle">Track and configure items in warehouse inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Control bar */}
      <div className="control-bar glass-card">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by Name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <Loader2 size={40} className="animate-spin text-accent" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="glass-card empty-state">
          <Package size={48} className="text-muted" />
          <h3>No products found</h3>
          <p>Add your first product to start tracking stock</p>
        </div>
      ) : (
        <div className="glass-card table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product Details</th>
                <th>SKU Code</th>
                <th>Price</th>
                <th>Stock Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-info-cell">
                      <span className="prod-name">{product.name}</span>
                      <span className="prod-desc">{product.description || 'No description provided'}</span>
                    </div>
                  </td>
                  <td><code>{product.sku}</code></td>
                  <td className="price-cell">${product.price.toFixed(2)}</td>
                  <td>
                    <div className="stock-cell">
                      <span className={`dot ${product.quantity > 5 ? 'dot-success' : product.quantity > 0 ? 'dot-warning' : 'dot-danger'}`} />
                      <span style={{ fontWeight: '600' }}>{product.quantity}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-secondary btn-icon" onClick={() => openEditModal(product)} title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button className="btn btn-danger btn-icon" onClick={() => handleDelete(product.id)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="form-input"
              placeholder="e.g. Premium Wireless Mouse"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">SKU / Code</label>
            <input
              type="text"
              value={formSku}
              onChange={(e) => setFormSku(e.target.value)}
              className="form-input"
              placeholder="e.g. MOUSE-WRLS-01"
              required
              disabled={!!editingProduct}
            />
          </div>
          <div className="grid-cols-2" style={{ gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                className="form-input"
                placeholder="0.00"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                min="0"
                value={formQuantity}
                onChange={(e) => setFormQuantity(e.target.value)}
                className="form-input"
                placeholder="0"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="form-textarea"
              placeholder="Provide a brief product description..."
              rows={3}
            />
          </div>
          <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .page-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .control-bar {
          padding: 16px 20px;
          margin-bottom: 24px;
        }

        .search-wrapper {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 8px 16px;
          width: 100%;
          max-width: 400px;
        }

        .search-icon {
          color: var(--text-muted);
          margin-right: 12px;
        }

        .search-input {
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          width: 100%;
          font-family: var(--font-family);
        }

        .product-info-cell {
          display: flex;
          flex-direction: column;
        }

        .prod-name {
          font-weight: 600;
          color: #fff;
        }

        .prod-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .price-cell {
          font-weight: 600;
        }

        .stock-cell {
          display: flex;
          align-items: center;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          gap: 12px;
        }

        .empty-state p {
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}

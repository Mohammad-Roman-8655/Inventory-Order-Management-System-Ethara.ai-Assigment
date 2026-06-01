import React, { useEffect, useState } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';
import { ShoppingCart, Plus, Eye, Trash2, Loader2, Calendar, User, DollarSign, X } from 'lucide-react';

export default function Orders({ setToast }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Create Order States
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        client.get('/orders'),
        client.get('/products'),
        client.get('/customers'),
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setCustomers(customersRes.data);
    } catch (err) {
      setToast({ message: 'Failed to load initial data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setSelectedCustomerId('');
    setOrderItems([{ product_id: '', quantity: 1 }]);
    setIsCreateModalOpen(true);
  };

  const handleAddProductRow = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveProductRow = (index) => {
    const list = [...orderItems];
    list.splice(index, 1);
    setOrderItems(list);
  };

  const handleItemChange = (index, field, value) => {
    const list = [...orderItems];
    if (field === 'quantity') {
      list[index][field] = parseInt(value, 10) || 1;
    } else {
      list[index][field] = value;
    }
    setOrderItems(list);
  };

  // Calculate Running Total
  const calculateRunningTotal = () => {
    return orderItems.reduce((sum, item) => {
      const product = products.find((p) => p.id === parseInt(item.product_id, 10));
      if (product) {
        return sum + product.price * item.quantity;
      }
      return sum;
    }, 0);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!selectedCustomerId) {
      return setToast({ message: 'Please select a customer', type: 'error' });
    }

    if (orderItems.length === 0 || orderItems.some((item) => !item.product_id)) {
      return setToast({ message: 'Please select valid products for all items', type: 'error' });
    }

    // Verify stock availability frontend check
    for (const item of orderItems) {
      const product = products.find((p) => p.id === parseInt(item.product_id, 10));
      if (!product) continue;
      if (product.quantity < item.quantity) {
        return setToast({
          message: `Insufficient stock for '${product.name}'. Available: ${product.quantity}, Requested: ${item.quantity}`,
          type: 'error',
        });
      }
    }

    const payload = {
      customer_id: parseInt(selectedCustomerId, 10),
      items: orderItems.map((item) => ({
        product_id: parseInt(item.product_id, 10),
        quantity: item.quantity,
      })),
    };

    try {
      await client.post('/orders/', payload);
      setToast({ message: 'Order created successfully', type: 'success' });
      setIsCreateModalOpen(false);
      fetchInitialData(); // Reloads orders & decreases stock on frontend
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to place order';
      setToast({ message: errMsg, type: 'error' });
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const res = await client.get(`/orders/${id}`);
      setSelectedOrder(res.data);
      setIsDetailsModalOpen(true);
    } catch (err) {
      setToast({ message: 'Failed to load order details', type: 'error' });
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) return;
    try {
      await client.delete(`/orders/${id}`);
      setToast({ message: 'Order cancelled and stock restored successfully', type: 'success' });
      fetchInitialData();
    } catch (err) {
      setToast({ message: 'Failed to cancel order', type: 'error' });
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Orders Management</h1>
          <p className="page-subtitle">Track orders, calculate billing invoices, and allocate stocks</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} /> New Order
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <Loader2 size={40} className="animate-spin text-accent" />
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card empty-state">
          <ShoppingCart size={48} className="text-muted" />
          <h3>No orders found</h3>
          <p>Click "New Order" to place your first customer order</p>
        </div>
      ) : (
        <div className="glass-card table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Order Date</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><strong>#ORD-{order.id}</strong></td>
                  <td>{order.customer?.full_name || `ID: ${order.customer_id}`}</td>
                  <td>{new Date(order.created_at).toLocaleString()}</td>
                  <td className="price-cell">${order.total_amount.toFixed(2)}</td>
                  <td>
                    <span className="badge badge-success">
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-secondary btn-icon" onClick={() => handleViewDetails(order.id)} title="View Details">
                        <Eye size={14} />
                      </button>
                      <button className="btn btn-danger btn-icon" onClick={() => handleDeleteOrder(order.id)} title="Cancel Order">
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

      {/* CREATE ORDER MODAL */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Order">
        <form onSubmit={handleSubmitOrder}>
          {/* Select Customer */}
          <div className="form-group">
            <label className="form-label">Customer Profile</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="form-select"
              required
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          {/* Select Products */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Items List</span>
              <button type="button" className="btn btn-secondary btn-icon" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={handleAddProductRow}>
                + Add Item
              </button>
            </label>

            <div className="order-items-builder" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              {orderItems.map((item, idx) => {
                const selectedProd = products.find((p) => p.id === parseInt(item.product_id, 10));
                return (
                  <div key={idx} className="item-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      value={item.product_id}
                      onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                      className="form-select"
                      style={{ flex: 2 }}
                      required
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                          {p.name} (${p.price.toFixed(2)} - Qty: {p.quantity})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="form-input"
                      style={{ flex: 1, minWidth: '60px' }}
                      required
                    />

                    {orderItems.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger btn-icon"
                        onClick={() => handleRemoveProductRow(idx)}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Invoice Billing Calculation */}
          <div className="invoice-calc glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.05rem' }}>
              <span>Total Bill (Auto):</span>
              <span className="text-accent">${calculateRunningTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Place Order
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW ORDER DETAILS MODAL */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title={`Order Summary: #ORD-${selectedOrder?.id}`}>
        {selectedOrder && (
          <div className="order-details-pane">
            <div className="detail-meta">
              <div className="meta-row">
                <User size={16} className="text-muted" />
                <span>Customer: <strong>{selectedOrder.customer?.full_name}</strong> ({selectedOrder.customer?.email})</span>
              </div>
              <div className="meta-row">
                <Calendar size={16} className="text-muted" />
                <span>Date Placed: {new Date(selectedOrder.created_at).toLocaleString()}</span>
              </div>
              <div className="meta-row">
                <DollarSign size={16} className="text-muted" />
                <span>Status: <span className="badge badge-success">{selectedOrder.status}</span></span>
              </div>
            </div>

            <div className="order-items-table" style={{ marginTop: '20px' }}>
              <h4 style={{ marginBottom: '10px' }}>Purchased Items</h4>
              <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Unit Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product?.name || `Product ID: ${item.product_id}`}</td>
                      <td>${item.unit_price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>${(item.unit_price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr style={{ background: 'rgba(255,255,255,0.01)', fontWeight: '700' }}>
                    <td colSpan="3" style={{ textAlign: 'right' }}>Grand Total:</td>
                    <td>${selectedOrder.total_amount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .page-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .price-cell {
          font-weight: 600;
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

        .detail-meta {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-color);
          padding: 16px;
          border-radius: 12px;
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
}

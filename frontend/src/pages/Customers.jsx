import React, { useEffect, useState } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';
import { Users, Plus, Trash2, Search, Mail, Phone, Loader2 } from 'lucide-react';

export default function Customers({ setToast }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await client.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      setToast({ message: 'Failed to fetch customers', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!formName.trim()) return setToast({ message: 'Full Name is required', type: 'error' });
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEmail.trim())) {
      return setToast({ message: 'Please enter a valid email address', type: 'error' });
    }

    const payload = {
      full_name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim() || null
    };

    try {
      await client.post('/customers/', payload);
      setToast({ message: 'Customer added successfully', type: 'success' });
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to add customer';
      setToast({ message: errMsg, type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer? This will also remove their order history.')) return;
    try {
      await client.delete(`/customers/${id}`);
      setToast({ message: 'Customer deleted successfully', type: 'success' });
      fetchCustomers();
    } catch (err) {
      setToast({ message: 'Failed to delete customer', type: 'error' });
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Customers Database</h1>
          <p className="page-subtitle">Manage system user profiles and contact directories</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Add Customer
        </button>
      </div>

      {/* Control bar */}
      <div className="control-bar glass-card">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by Name or Email..."
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
      ) : filteredCustomers.length === 0 ? (
        <div className="glass-card empty-state">
          <Users size={48} className="text-muted" />
          <h3>No customers found</h3>
          <p>Register a customer to start creating orders</p>
        </div>
      ) : (
        <div className="glass-card table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Registered Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td style={{ fontWeight: '600' }}>{customer.full_name}</td>
                  <td>
                    <div className="contact-cell">
                      <Mail size={14} className="text-muted" />
                      <span>{customer.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <Phone size={14} className="text-muted" />
                      <span>{customer.phone || 'N/A'}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <button className="btn btn-danger btn-icon" onClick={() => handleDelete(customer.id)} title="Delete">
                      <Trash2 size={14} />
                    </button>
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
        title="Add New Customer"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="form-input"
              placeholder="e.g. John Doe"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="form-input"
              placeholder="e.g. john@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number (Optional)</label>
            <input
              type="tel"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              className="form-input"
              placeholder="e.g. +1 555 123 4567"
            />
          </div>
          <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Customer
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

        .contact-cell {
          display: flex;
          align-items: center;
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

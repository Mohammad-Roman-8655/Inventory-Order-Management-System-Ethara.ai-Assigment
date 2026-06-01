import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { Package, Users, ShoppingCart, AlertTriangle, Loader2 } from 'lucide-react';

export default function Dashboard({ setToast }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await client.get('/dashboard');
      setStats(res.data);
    } catch (err) {
      setToast({ message: 'Failed to fetch dashboard stats', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 size={40} className="animate-spin text-accent" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Products', value: stats?.total_products || 0, icon: Package, color: 'var(--accent-primary)' },
    { title: 'Total Customers', value: stats?.total_customers || 0, icon: Users, color: 'var(--status-info)' },
    { title: 'Total Orders', value: stats?.total_orders || 0, icon: ShoppingCart, color: 'var(--status-success)' },
    { title: 'Low Stock Alerts', value: stats?.low_stock_products?.length || 0, icon: AlertTriangle, color: 'var(--status-danger)' },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Workspace Dashboard</h1>
      <p className="page-subtitle">Real-time statistics & system overview</p>

      {/* Grid of stats */}
      <div className="grid-cols-4 dashboard-grid">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-card stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: card.color + '15', color: card.color }}>
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-label">{card.title}</span>
                <span className="stat-value">{card.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Low stock alerts panel */}
      <div className="glass-card alert-panel" style={{ marginTop: '30px' }}>
        <div className="panel-header">
          <AlertTriangle size={20} className="text-warning" />
          <h3>Critical Low Stock Alert (Qty &le; 5)</h3>
        </div>
        <div className="panel-body">
          {stats?.low_stock_products?.length === 0 ? (
            <div className="no-alerts">
              <span>🎉 All product stock levels are healthy!</span>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU/Code</th>
                    <th>Price</th>
                    <th>Current Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.low_stock_products?.map((prod) => (
                    <tr key={prod.id}>
                      <td style={{ fontWeight: '600' }}>{prod.name}</td>
                      <td><code>{prod.sku}</code></td>
                      <td>${prod.price.toFixed(2)}</td>
                      <td>
                        <span className={prod.quantity === 0 ? 'text-danger font-bold' : 'text-warning font-bold'}>
                          {prod.quantity} left
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${prod.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                          {prod.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 50vh;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        .text-accent {
          color: var(--accent-primary);
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
        }

        .stat-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          border-radius: 12px;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 800;
          color: #fff;
          margin-top: 4px;
        }

        .alert-panel {
          padding: 24px;
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 14px;
        }

        .no-alerts {
          text-align: center;
          padding: 30px;
          color: var(--status-success);
          font-weight: 500;
        }

        .text-danger {
          color: var(--status-danger);
        }

        .text-warning {
          color: var(--status-warning);
        }

        .font-bold {
          font-weight: 700;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

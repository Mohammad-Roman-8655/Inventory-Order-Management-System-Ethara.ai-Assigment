import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Menu, 
  X 
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', name: 'Products', icon: Package },
    { id: 'customers', name: 'Customers', icon: Users },
    { id: 'orders', name: 'Orders', icon: ShoppingCart },
  ];

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="mobile-nav-header glass-card">
        <div className="brand">
          <span className="logo-icon">🚀</span>
          <h3>Inventory</h3>
        </div>
        <button className="btn btn-secondary btn-icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar glass-card ${isOpen ? 'mobile-open' : ''}`}>
        <div className="brand-desktop">
          <span className="logo-icon">🚀</span>
          <h2>Ethara.ai</h2>
          <span className="sub-logo">Inventory Hub</span>
        </div>

        <nav className="nav-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
              >
                <Icon size={20} className="nav-icon" />
                <span>{item.name}</span>
                {isActive && <span className="active-indicator" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <p>© 2026 Ethara.ai System</p>
          <span>v1.0.0</span>
        </div>
      </aside>

      {/* Styles local to Navbar */}
      <style>{`
        .mobile-nav-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          padding: 0 20px;
          align-items: center;
          justify-content: space-between;
          z-index: 100;
          border-radius: 0;
          border-left: none;
          border-right: none;
          border-top: none;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sidebar {
          position: fixed;
          top: 20px;
          left: 20px;
          bottom: 20px;
          width: 240px;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          z-index: 99;
          border-radius: 20px;
        }

        .brand-desktop {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 40px;
        }

        .logo-icon {
          font-size: 2.2rem;
          margin-bottom: 8px;
          filter: drop-shadow(0 0 10px var(--accent-primary));
        }

        .sub-logo {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 4px;
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          border-radius: 12px;
          cursor: pointer;
          font-family: var(--font-family);
          font-size: 0.95rem;
          font-weight: 500;
          text-align: left;
          position: relative;
          transition: var(--transition-smooth);
        }

        .nav-item:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.03);
          transform: translateX(4px);
        }

        .nav-item.active {
          color: #fff;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .nav-icon {
          color: var(--text-secondary);
          transition: var(--transition-smooth);
        }

        .nav-item.active .nav-icon {
          color: var(--accent-secondary);
        }

        .active-indicator {
          position: absolute;
          right: 12px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--accent-secondary);
          box-shadow: 0 0 8px var(--accent-secondary);
        }

        .sidebar-footer {
          margin-top: auto;
          text-align: center;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .mobile-nav-header {
            display: flex;
          }

          .sidebar {
            top: 64px;
            left: 0;
            bottom: 0;
            width: 100%;
            border-radius: 0;
            transform: translateX(-100%);
            border: none;
            border-top: 1px solid var(--border-color);
            background: var(--bg-primary);
          }

          .sidebar.mobile-open {
            transform: translateX(0);
          }

          .brand-desktop {
            display: none;
          }
        }
      `}</style>
    </>
  );
}

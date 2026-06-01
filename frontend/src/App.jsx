import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Toast from './components/Toast';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setToast={setToast} />;
      case 'products':
        return <Products setToast={setToast} />;
      case 'customers':
        return <Customers setToast={setToast} />;
      case 'orders':
        return <Orders setToast={setToast} />;
      default:
        return <Dashboard setToast={setToast} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace viewport */}
      <main className="main-content">
        {renderContent()}
      </main>

      {/* Global Application Banner Messages */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}
    </div>
  );
}

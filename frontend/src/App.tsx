import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Products } from './pages/Products';
import { StockLogs } from './pages/StockLogs';
import { Challans } from './pages/Challans';
import { Profile } from './pages/Profile';
import { Users } from './pages/Users';
import { NotFound } from './pages/NotFound';

const ProtectedLayout: React.FC<{ children: React.ReactNode; pageTitle: string; roles?: string[] }> = ({
  children,
  pageTitle,
  roles,
}) => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--text-secondary)',
        }}
      >
        Loading Operations Portal...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Navbar title="Access Forbidden" />
          <main className="page-body">
            <NotFound />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title={pageTitle} />
        <main className="page-body">{children}</main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedLayout pageTitle="Operations Dashboard">
                <Dashboard />
              </ProtectedLayout>
            }
          />

          {/* Customer CRM Routes */}
          <Route
            path="/customers"
            element={
              <ProtectedLayout pageTitle="Customer CRM Portal">
                <Customers />
              </ProtectedLayout>
            }
          />
          <Route
            path="/customers/new"
            element={
              <ProtectedLayout pageTitle="Customer CRM Portal - New Customer">
                <Customers />
              </ProtectedLayout>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <ProtectedLayout pageTitle="Customer CRM Portal - Details">
                <Customers />
              </ProtectedLayout>
            }
          />
          <Route
            path="/customers/:id/edit"
            element={
              <ProtectedLayout pageTitle="Customer CRM Portal - Edit Customer">
                <Customers />
              </ProtectedLayout>
            }
          />

          {/* Product Catalog Routes */}
          <Route
            path="/products"
            element={
              <ProtectedLayout pageTitle="Products & Inventory Management">
                <Products />
              </ProtectedLayout>
            }
          />
          <Route
            path="/products/new"
            element={
              <ProtectedLayout pageTitle="Add New Product">
                <Products />
              </ProtectedLayout>
            }
          />
          <Route
            path="/products/:id"
            element={
              <ProtectedLayout pageTitle="Product Details">
                <Products />
              </ProtectedLayout>
            }
          />
          <Route
            path="/products/:id/edit"
            element={
              <ProtectedLayout pageTitle="Edit Product">
                <Products />
              </ProtectedLayout>
            }
          />

          {/* Inventory & Stock Movement Logs */}
          <Route
            path="/inventory"
            element={
              <ProtectedLayout pageTitle="Inventory & Stock Movements">
                <StockLogs />
              </ProtectedLayout>
            }
          />
          <Route
            path="/stock-logs"
            element={
              <ProtectedLayout pageTitle="Stock Movement Audit Logs">
                <StockLogs />
              </ProtectedLayout>
            }
          />

          {/* Sales Challan Routes */}
          <Route
            path="/challans"
            element={
              <ProtectedLayout pageTitle="Sales Challans & Invoices">
                <Challans />
              </ProtectedLayout>
            }
          />
          <Route
            path="/challans/new"
            element={
              <ProtectedLayout pageTitle="Generate Sales Challan">
                <Challans />
              </ProtectedLayout>
            }
          />
          <Route
            path="/challans/:id"
            element={
              <ProtectedLayout pageTitle="Sales Challan Details">
                <Challans />
              </ProtectedLayout>
            }
          />

          {/* Admin User Management */}
          <Route
            path="/users"
            element={
              <ProtectedLayout pageTitle="Admin User Account Management" roles={['ADMIN']}>
                <Users />
              </ProtectedLayout>
            }
          />

          {/* Profile & Settings */}
          <Route
            path="/profile"
            element={
              <ProtectedLayout pageTitle="User Profile Settings">
                <Profile />
              </ProtectedLayout>
            }
          />

          {/* 404 Pages */}
          <Route
            path="/404"
            element={
              <ProtectedLayout pageTitle="404 Page Not Found">
                <NotFound />
              </ProtectedLayout>
            }
          />

          <Route
            path="*"
            element={
              <ProtectedLayout pageTitle="404 Page Not Found">
                <NotFound />
              </ProtectedLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

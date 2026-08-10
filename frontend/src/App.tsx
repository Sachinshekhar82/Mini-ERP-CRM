import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';

// Code splitting for secondary pages to reduce initial JavaScript bundle size
const Customers = lazy(() => import('./pages/Customers').then((m) => ({ default: m.Customers })));
const Products = lazy(() => import('./pages/Products').then((m) => ({ default: m.Products })));
const StockLogs = lazy(() => import('./pages/StockLogs').then((m) => ({ default: m.StockLogs })));
const Challans = lazy(() => import('./pages/Challans').then((m) => ({ default: m.Challans })));
const Profile = lazy(() => import('./pages/Profile').then((m) => ({ default: m.Profile })));
const Users = lazy(() => import('./pages/Users').then((m) => ({ default: m.Users })));

// Lightweight skeleton fallback for lazy-loaded secondary routes
const RouteSkeletonFallback: React.FC = () => (
  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ height: '32px', width: '240px', background: '#162032', borderRadius: '6px', animation: 'pulse 1.5s infinite' }} />
    <div style={{ height: '200px', width: '100%', background: '#162032', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
  </div>
);

const ProtectedLayout: React.FC<{ children: React.ReactNode; pageTitle: string; roles?: string[] }> = ({
  children,
  pageTitle,
  roles,
}) => {
  const { token, user, loading } = useAuth();

  // If token is missing, redirect immediately to login without blank screen delay
  if (!token && !loading) {
    return <Navigate to="/login" replace />;
  }

  // If user is verified and role unauthorized
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

  // INSTANT SHELL RENDER: Sidebar, Navbar, and Page Body render immediately!
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title={pageTitle} />
        <main className="page-body">
          <Suspense fallback={<RouteSkeletonFallback />}>{children}</Suspense>
        </main>
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

import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import Prescriptions from './pages/Prescriptions';
import Vendors from './pages/Vendors';
import PurchaseOrders from './pages/PurchaseOrders';
import GRN from './pages/GRN';
import PurchaseInvoices from './pages/PurchaseInvoices';
import Sales from './pages/Sales';
import LabOrders from './pages/LabOrders';
import Accounting from './pages/Accounting';
import Reports from './pages/Reports';
import Register from './pages/Register';

/** Guard: redirects to /login if not authenticated */
function RequireAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FC' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ color: '#6B7280', fontSize: 13 }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

/** Guard: redirects to /dashboard if already logged in */
function GuestOnly() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontSize: '13px' } }} />
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<GuestOnly />} />

        {/* Protected routes — must be logged in */}
        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/products" element={<Products />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/grn" element={<GRN />} />
            <Route path="/purchase-invoices" element={<PurchaseInvoices />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/lab-orders" element={<LabOrders />} />
            <Route path="/accounting" element={<Accounting />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

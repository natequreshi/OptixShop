import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout/Layout';
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

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontSize: '13px' } }} />
      <Routes>
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
      </Routes>
    </>
  );
}

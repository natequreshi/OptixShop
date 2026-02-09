import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse, Users, Eye, Truck,
  ClipboardList, FileCheck, FileText, Receipt, FlaskConical, Calculator,
  BarChart3, DollarSign, Settings, Bell, Search, ChevronDown, Glasses
} from 'lucide-react';

const navItems = [
  { section: 'Main' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pos', icon: ShoppingCart, label: 'Point of Sale' },
  { to: '/sales', icon: Receipt, label: 'Sales & Invoices' },
  { to: '/register', icon: DollarSign, label: 'Cash Register' },

  { section: 'Optical' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/prescriptions', icon: Eye, label: 'Prescriptions' },
  { to: '/lab-orders', icon: FlaskConical, label: 'Lab Orders' },
  { to: '/customers', icon: Users, label: 'Customers' },

  { section: 'Inventory' },
  { to: '/inventory', icon: Warehouse, label: 'Stock Management' },

  { section: 'Procurement' },
  { to: '/vendors', icon: Truck, label: 'Vendors' },
  { to: '/purchase-orders', icon: ClipboardList, label: 'Purchase Orders' },
  { to: '/grn', icon: FileCheck, label: 'Goods Receipt' },
  { to: '/purchase-invoices', icon: FileText, label: 'Purchase Invoices' },

  { section: 'Finance' },
  { to: '/accounting', icon: Calculator, label: 'Accounting' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

const pageNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/pos': 'Point of Sale',
  '/products': 'Products',
  '/inventory': 'Stock Management',
  '/customers': 'Customers',
  '/prescriptions': 'Prescriptions',
  '/vendors': 'Vendors',
  '/purchase-orders': 'Purchase Orders',
  '/grn': 'Goods Receipt Notes',
  '/purchase-invoices': 'Purchase Invoices',
  '/sales': 'Sales & Invoices',
  '/lab-orders': 'Lab Orders',
  '/accounting': 'Accounting',
  '/reports': 'Reports',
  '/register': 'Cash Register',
};

export default function Layout() {
  const location = useLocation();
  const currentPage = pageNames[location.pathname] || 'OptiVision';
  const isPOS = location.pathname === '/pos';

  return (
    <div className="app-layout">
      {!isPOS && (
        <aside className="sidebar">
          <div className="sidebar-header">
            <Glasses className="sidebar-logo" style={{ color: 'var(--primary)' }} />
            <div className="sidebar-title">OptiVision <span>POS</span></div>
          </div>
          <nav className="sidebar-nav">
            {navItems.map((item, i) => {
              if ('section' in item && !('to' in item)) {
                return (
                  <div className="nav-section" key={i}>
                    <div className="nav-section-label">{item.section}</div>
                  </div>
                );
              }
              const navItem = item as { to: string; icon: any; label: string };
              const Icon = navItem.icon;
              return (
                <div className="nav-section" key={navItem.to}>
                  <NavLink
                    to={navItem.to}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon />
                    <span>{navItem.label}</span>
                  </NavLink>
                </div>
              );
            })}
          </nav>
        </aside>
      )}

      <div className="main-wrapper">
        <header className="top-header">
          <div className="header-left">
            {isPOS && (
              <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                <Glasses style={{ color: 'var(--primary)', width: 28, height: 28 }} />
                <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)' }}>OptiVision</span>
              </NavLink>
            )}
            <h1 className="page-title">{currentPage}</h1>
          </div>
          <div className="header-right">
            <div className="search-box">
              <Search />
              <input type="text" className="form-input" placeholder="Search..." />
            </div>
            <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, background: 'var(--danger)', borderRadius: '50%' }}></span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8, cursor: 'pointer' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>
                SO
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Shop Owner</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Admin</div>
              </div>
              <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        </header>

        <main className={isPOS ? '' : 'main-content'}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

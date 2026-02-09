import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse, Users, Eye, Truck,
  ClipboardList, FileCheck, FileText, Receipt, FlaskConical, Calculator,
  BarChart3, DollarSign, Settings, Bell, Search, ChevronDown, Glasses,
  LogOut, User, Shield
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
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentPage = pageNames[location.pathname] || 'OptixShop';
  const isPOS = location.pathname === '/pos';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';

  return (
    <div className="app-layout">
      {!isPOS && (
        <aside className="sidebar">
          <div className="sidebar-header">
            <Glasses className="sidebar-logo" style={{ color: 'var(--primary)' }} />
            <div className="sidebar-title">OptixShop <span>POS</span></div>
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
                <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)' }}>OptixShop</span>
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

            {/* User Dropdown */}
            <div className="user-dropdown-wrapper" ref={dropdownRef}>
              <button
                className="user-dropdown-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="user-avatar">{initials}</div>
                <div className="user-info">
                  <div className="user-name">{user?.full_name || 'User'}</div>
                  <div className="user-role">{roleLabel}</div>
                </div>
                <ChevronDown size={14} className={`dropdown-chevron ${dropdownOpen ? 'open' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-user-header">
                    <div className="user-avatar" style={{ width: 40, height: 40, fontSize: 15 }}>{initials}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{user?.full_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item" onClick={() => { setDropdownOpen(false); }}>
                    <User size={14} />
                    <span>My Profile</span>
                  </button>
                  <button className="dropdown-item" onClick={() => { setDropdownOpen(false); }}>
                    <Settings size={14} />
                    <span>Settings</span>
                  </button>
                  <button className="dropdown-item" onClick={() => { setDropdownOpen(false); }}>
                    <Shield size={14} />
                    <span>Role: {roleLabel}</span>
                  </button>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
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

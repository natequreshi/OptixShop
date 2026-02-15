"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderTree,
  Boxes,
  Users,
  FileText,
  Truck,
  ClipboardList,
  PackageCheck,
  Receipt,
  DollarSign,
  Microscope,
  BookOpen,
  BarChart3,
  CreditCard,
  ChevronLeft,
  Glasses,
  Settings,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",          icon: LayoutDashboard, label: "Dashboard", module: null },
  { href: "/pos",                icon: ShoppingCart,    label: "POS", module: "module_pos" },
  { href: "/products",           icon: Package,         label: "Products", module: null },
  { href: "/inventory",          icon: Boxes,           label: "Inventory", module: "module_inventory" },
  { href: "/customers",          icon: Users,           label: "Customers", module: null },
  { href: "/prescriptions",      icon: FileText,        label: "Prescriptions", module: "module_prescriptions" },
  { href: "/vendors",            icon: Truck,           label: "Vendors", module: "module_vendors" },
  { href: "/purchase-orders",    icon: ClipboardList,   label: "Purchase Orders", module: "module_purchase_orders" },
  { href: "/grn",                icon: PackageCheck,    label: "GRN", module: "module_grn" },
  { href: "/purchase-invoices",  icon: Receipt,         label: "Purchase Invoices", module: "module_purchase_invoices" },
  { href: "/sales",              icon: DollarSign,      label: "Sales", module: null },
  { href: "/expenses",           icon: Wallet,          label: "Expenses", module: null },
  { href: "/lab-orders",         icon: Microscope,      label: "Lab Orders", module: "module_lab_orders" },
  { href: "/accounting",         icon: BookOpen,        label: "Accounting", module: "module_accounting" },
  { href: "/reports",            icon: BarChart3,       label: "Reports", module: "module_reports" },
  { href: "/register",           icon: CreditCard,      label: "Cash Register", module: "module_register" },
  { href: "/settings",           icon: Settings,        label: "Settings", module: null },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({});
  const [visibleNavItems, setVisibleNavItems] = useState(navItems);
  const [storeName, setStoreName] = useState("OptixShop");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then((settings: Record<string, string>) => {
        const modules: Record<string, boolean> = {};
        Object.entries(settings).forEach(([key, value]) => {
          if (key.startsWith('module_')) {
            modules[key] = value === 'true';
          }
        });
        setEnabledModules(modules);
        if (settings.store_name) setStoreName(settings.store_name);
        if (settings.logo_url) setLogoUrl(settings.logo_url);
        
        // Build visible nav items array - only include enabled modules
        const visible = navItems.filter(item => {
          if (!item.module) return true;
          const moduleValue = modules[item.module];
          return moduleValue === undefined || moduleValue === true;
        });
        setVisibleNavItems(visible);
      })
      .catch(err => {
        console.error("Failed to load settings:", err);
      });
  }, []);

  return (
    <aside
      className={cn(
        "h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-200",
        "fixed lg:sticky top-0 z-50",
        collapsed ? "w-[68px]" : "w-[250px]",
        // Mobile: slide in from left
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-gray-100 dark:border-gray-700">
        {logoUrl ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <img src={logoUrl} alt={storeName} className="w-9 h-9 rounded-lg object-contain flex-shrink-0" />
            {!collapsed && (
              <div className="min-w-0">
                <span className="text-base font-bold text-gray-900 dark:text-white block truncate leading-tight">{storeName}</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-none">Optics & Eyewear</span>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Glasses className="w-5 h-5 text-white" />
            </div>
            {!collapsed && <span className="text-lg font-bold text-gray-900 dark:text-white">{storeName}</span>}
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleNavItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              onClick={() => onClose?.()}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <item.icon size={20} className={cn("flex-shrink-0", active && "text-primary-600 dark:text-primary-400")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse button - hide on mobile */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex h-12 items-center justify-center border-t border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <ChevronLeft
          size={20}
          className={cn("transition-transform", collapsed && "rotate-180")}
        />
      </button>
    </aside>
  );
}

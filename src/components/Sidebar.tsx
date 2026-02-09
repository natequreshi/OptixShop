"use client";

import { useState } from "react";
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
  { href: "/dashboard",          icon: LayoutDashboard, label: "Dashboard" },
  { href: "/pos",                icon: ShoppingCart,    label: "POS" },
  { href: "/products",           icon: Package,         label: "Products" },
  { href: "/inventory",          icon: Boxes,           label: "Inventory" },
  { href: "/customers",          icon: Users,           label: "Customers" },
  { href: "/prescriptions",      icon: FileText,        label: "Prescriptions" },
  { href: "/vendors",            icon: Truck,           label: "Vendors" },
  { href: "/purchase-orders",    icon: ClipboardList,   label: "Purchase Orders" },
  { href: "/grn",                icon: PackageCheck,    label: "GRN" },
  { href: "/purchase-invoices",  icon: Receipt,         label: "Purchase Invoices" },
  { href: "/sales",              icon: DollarSign,      label: "Sales" },
  { href: "/expenses",           icon: Wallet,          label: "Expenses" },
  { href: "/lab-orders",         icon: Microscope,      label: "Lab Orders" },
  { href: "/accounting",         icon: BookOpen,        label: "Accounting" },
  { href: "/reports",            icon: BarChart3,       label: "Reports" },
  { href: "/register",           icon: CreditCard,      label: "Cash Register" },
  { href: "/settings",           icon: Settings,        label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-200 sticky top-0",
        collapsed ? "w-[68px]" : "w-[250px]"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-gray-100 dark:border-gray-700">
        <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Glasses className="w-5 h-5 text-white" />
        </div>
        {!collapsed && <span className="text-lg font-bold text-gray-900 dark:text-white">OptixShop</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
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

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="h-12 flex items-center justify-center border-t border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <ChevronLeft
          size={20}
          className={cn("transition-transform", collapsed && "rotate-180")}
        />
      </button>
    </aside>
  );
}

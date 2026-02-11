"use client";

import { useState, useMemo } from "react";
import * as React from "react";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  Microscope,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Wallet,
  ReceiptText,
  Undo2,
  ShoppingCart,
  FileWarning,
  CircleDollarSign,
  BarChart3,
  Lock,
  Unlock,
  RotateCcw,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Responsive, ResponsiveProps } from "react-grid-layout";
import { useContainerWidth } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface Layout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minH?: number;
  minW?: number;
}

interface Props {
  stats: {
    totalProducts: number;
    totalCustomers: number;
    todaySalesCount: number;
    todaySalesAmount: number;
    monthSalesCount: number;
    monthSalesAmount: number;
    lowStockCount: number;
    pendingLabOrders: number;
    totalSales: number;
    netSales: number;
    invoiceDue: number;
    totalSellReturn: number;
    totalPurchase: number;
    purchaseDue: number;
    totalPurchaseReturn: number;
    totalExpense: number;
  };
  recentSales: {
    id: string;
    invoiceNo: string;
    customerName: string;
    totalAmount: number;
    status: string;
    saleDate: string;
    itemCount: number;
  }[];
  topProducts: { name: string; revenue: number; qty: number }[];
  salesLast30Days: { date: string; amount: number }[];
  salesByMonth: { month: string; amount: number }[];
  settings: Record<string, string>;
}

export default function DashboardClient({ stats, recentSales, topProducts, salesLast30Days, salesByMonth, settings }: Props) {
  const [isLocked, setIsLocked] = useState(true);
  const [width, setWidth] = useState(1200);
  
  const defaultLayouts = {
    lg: [
      // Cards on top
      { i: "summary", x: 0, y: 0, w: 12, h: 2, minH: 2, minW: 12 },
      { i: "quickStats", x: 0, y: 2, w: 12, h: 2, minH: 2, minW: 12 },
      { i: "topProducts", x: 0, y: 4, w: 6, h: 4, minH: 3, minW: 4 },
      { i: "recentSales", x: 6, y: 4, w: 6, h: 4, minH: 3, minW: 4 },
      // Charts below
      { i: "sales30", x: 0, y: 8, w: 12, h: 4, minH: 3, minW: 6 },
      { i: "salesYear", x: 0, y: 12, w: 12, h: 4, minH: 3, minW: 6 },
    ],
  };
  
  const [layouts, setLayouts] = useState<any>(defaultLayouts);

  const resetLayout = () => {
    setLayouts(defaultLayouts);
    localStorage.removeItem('dashboard-layout');
  };

  // Load layout from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('dashboard-layout');
    if (saved) {
      try {
        setLayouts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load layout:', e);
      }
    }
  }, []);

  const onLayoutChange = (layout: Layout[], layouts: any) => {
    if (!isLocked) {
      setLayouts(layouts);
      localStorage.setItem('dashboard-layout', JSON.stringify(layouts));
    }
  };

  // Handle width changes
  React.useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ─── Top 8 Summary Cards (matching reference image) ─── */
  const summaryCards = [
    {
      title: "TOTAL SALES",
      value: formatCurrency(stats.totalSales),
      icon: DollarSign,
      gradient: "bg-gradient-to-br from-blue-100 to-blue-200",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "NET",
      value: formatCurrency(stats.netSales),
      icon: CircleDollarSign,
      gradient: "bg-gradient-to-br from-green-100 to-green-200",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "INVOICE DUE",
      value: formatCurrency(stats.invoiceDue),
      icon: FileWarning,
      gradient: "bg-gradient-to-br from-orange-100 to-orange-200",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      title: "TOTAL SELL RETURN",
      value: formatCurrency(stats.totalSellReturn),
      icon: Undo2,
      gradient: "bg-gradient-to-br from-red-100 to-red-200",
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      title: "TOTAL PURCHASE",
      value: formatCurrency(stats.totalPurchase),
      icon: ShoppingCart,
      gradient: "bg-gradient-to-br from-purple-100 to-purple-200",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "PURCHASE DUE",
      value: formatCurrency(stats.purchaseDue),
      icon: AlertTriangle,
      gradient: "bg-gradient-to-br from-yellow-100 to-yellow-200",
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      title: "TOTAL PURCHASE RETURN",
      value: formatCurrency(stats.totalPurchaseReturn),
      icon: ReceiptText,
      gradient: "bg-gradient-to-br from-cyan-100 to-cyan-200",
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-600",
    },
    {
      title: "TOTAL EXPENSE",
      value: formatCurrency(stats.totalExpense),
      icon: Wallet,
      gradient: "bg-gradient-to-br from-pink-100 to-pink-200",
      iconBg: "bg-pink-50",
      iconColor: "text-pink-600",
    },
  ];

  /* ─── Quick Stats Row ─── */
  const quickStats = [
    { title: "Today's Sales", value: stats.todaySalesCount, sub: formatCurrency(stats.todaySalesAmount), icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50", gradient: "bg-gradient-to-br from-emerald-100 to-emerald-200" },
    { title: "This Month", value: stats.monthSalesCount, sub: formatCurrency(stats.monthSalesAmount), icon: BarChart3, color: "text-teal-600", bg: "bg-teal-50", gradient: "bg-gradient-to-br from-teal-100 to-teal-200" },
    { title: "Products", value: stats.totalProducts, sub: `${stats.lowStockCount} Low Stock`, icon: Package, color: "text-amber-600", bg: "bg-amber-50", gradient: "bg-gradient-to-br from-amber-100 to-amber-200" },
    { title: "Total Customers", value: stats.totalCustomers, sub: "Registered", icon: Users, color: "text-rose-600", bg: "bg-rose-50", gradient: "bg-gradient-to-br from-rose-100 to-rose-200" },
  ];

  // Widget visibility based on settings
  const isWidgetVisible = (key: string) => settings[`widget_${key}`] !== 'false';
  
  const visibleSummaryCards = summaryCards.filter((_, idx) => {
    const keys = ['total_sales', 'net', 'invoice_due', 'sell_return', 'total_purchase', 'purchase_due', 'purchase_return', 'total_expense'];
    return isWidgetVisible(keys[idx]);
  });
  
  const visibleQuickStats = quickStats.filter((_, idx) => {
    const keys = ['today_sales', 'this_month', 'products', 'customers'];
    return isWidgetVisible(keys[idx]);
  });

  const formatChartDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const day = d.getDate();
    return `${month} ${day}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here's your overview</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* ── Dashboard Cards (12 cards total, 4 per row) ── */}
      {(visibleSummaryCards.length > 0 || visibleQuickStats.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleSummaryCards.map((card) => (
            <div key={card.title} className={`relative overflow-hidden rounded-lg shadow-sm border border-gray-100 ${card.gradient} p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">{card.title}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                  <card.icon size={20} className={card.iconColor} />
                </div>
              </div>
            </div>
          ))}
          {visibleQuickStats.map((card) => (
          <div key={card.title} className={`rounded-lg shadow-sm border border-gray-100 ${card.gradient} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <card.icon size={20} className={card.color} />
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* ── Sales Last 30 Days (Line Chart) ── */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Sales Last 30 Days</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={salesLast30Days}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={formatChartDate} interval={2} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Sales"]}
              labelFormatter={(label) => formatChartDate(label)}
              contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
            />
            <Area type="monotone" dataKey="amount" stroke="#4F46E5" strokeWidth={2} fill="url(#salesGradient)" dot={{ r: 2, fill: "#4F46E5" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Sales Current Financial Year (Line Chart) ── */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Sales Current Financial Year</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={salesByMonth}>
            <defs>
              <linearGradient id="yearGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Sales"]}
              contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
            />
            <Area type="monotone" dataKey="amount" stroke="#06B6D4" strokeWidth={2} fill="url(#yearGradient)" dot={{ r: 3, fill: "#06B6D4" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

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
}

export default function DashboardClient({ stats, recentSales, topProducts, salesLast30Days, salesByMonth }: Props) {
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

  const onLayoutChange = (layout: any, layouts: any) => {
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
      title: "Total Sales",
      value: formatCurrency(stats.totalSales),
      icon: DollarSign,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      borderColor: "border-l-blue-500",
    },
    {
      title: "Net",
      value: formatCurrency(stats.netSales),
      icon: CircleDollarSign,
      iconColor: "text-green-600",
      iconBg: "bg-green-50",
      borderColor: "border-l-green-500",
    },
    {
      title: "Invoice Due",
      value: formatCurrency(stats.invoiceDue),
      icon: FileWarning,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-50",
      borderColor: "border-l-orange-500",
    },
    {
      title: "Total Sell Return",
      value: formatCurrency(stats.totalSellReturn),
      icon: Undo2,
      iconColor: "text-red-600",
      iconBg: "bg-red-50",
      borderColor: "border-l-red-500",
    },
    {
      title: "Total Purchase",
      value: formatCurrency(stats.totalPurchase),
      icon: ShoppingCart,
      iconColor: "text-cyan-600",
      iconBg: "bg-cyan-50",
      borderColor: "border-l-cyan-500",
    },
    {
      title: "Purchase Due",
      value: formatCurrency(stats.purchaseDue),
      icon: ReceiptText,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      borderColor: "border-l-amber-500",
    },
    {
      title: "Total Purchase Return",
      value: formatCurrency(stats.totalPurchaseReturn),
      icon: Undo2,
      iconColor: "text-rose-600",
      iconBg: "bg-rose-50",
      borderColor: "border-l-rose-500",
    },
    {
      title: "Expense",
      value: formatCurrency(stats.totalExpense),
      icon: Wallet,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
      borderColor: "border-l-purple-500",
    },
  ];

  /* ─── Secondary stats row ─── */
  const quickStats = [
    { title: "Today's Sales", value: formatCurrency(stats.todaySalesAmount), sub: `${stats.todaySalesCount} sales`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { title: "Monthly Revenue", value: formatCurrency(stats.monthSalesAmount), sub: `${stats.monthSalesCount} this month`, icon: TrendingUp, color: "text-primary-600", bg: "bg-primary-50" },
    { title: "Products", value: stats.totalProducts.toString(), sub: `${stats.lowStockCount} low stock`, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Customers", value: stats.totalCustomers.toString(), sub: "Active", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Low Stock", value: stats.lowStockCount.toString(), sub: "Need reorder", icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Pending Lab", value: stats.pendingLabOrders.toString(), sub: "In progress", icon: Microscope, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const formatChartDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back 👋</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={resetLayout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            title="Reset widget positions"
          >
            <RotateCcw size={16} />
            Reset Layout
          </button>
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              isLocked
                ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                : "bg-primary-600 text-white hover:bg-primary-700"
            }`}
          >
            {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
            {isLocked ? "Locked" : "Unlocked"}
          </button>
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

      <Responsive
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={80}
        width={width}
        isDraggable={!isLocked}
        isResizable={!isLocked}
        onLayoutChange={onLayoutChange}
        draggableHandle=".drag-handle"
      >
        {/* ── Top Summary Cards (8 cards, 4 per row) ── */}
        <div key="summary" className="dashboard-widget">
          <div className={`drag-handle h-1 rounded-t-lg ${!isLocked ? "bg-primary-200 cursor-move" : "bg-transparent"}`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-2">
            {summaryCards.map((card) => (
              <div key={card.title} className={`card p-4 border-l-4 ${card.borderColor}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{card.title}</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{card.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                    <card.icon size={20} className={card.iconColor} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sales Last 30 Days (Line Chart) ── */}
        <div key="sales30" className="dashboard-widget">
          <div className={`drag-handle h-1 rounded-t-lg ${!isLocked ? "bg-primary-200 cursor-move" : "bg-transparent"}`} />
          <div className="card p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Sales Last 30 Days</h3>
            </div>
            <ResponsiveContainer width="100%" height="85%">
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
        </div>

        {/* ── Sales Current Financial Year (Line Chart) ── */}
        <div key="salesYear" className="dashboard-widget">
          <div className={`drag-handle h-1 rounded-t-lg ${!isLocked ? "bg-primary-200 cursor-move" : "bg-transparent"}`} />
          <div className="card p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Sales Current Financial Year</h3>
            </div>
            <ResponsiveContainer width="100%" height="85%">
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

        {/* ── Quick Stats Row ── */}
        <div key="quickStats" className="dashboard-widget">
          <div className={`drag-handle h-1 rounded-t-lg ${!isLocked ? "bg-primary-200 cursor-move" : "bg-transparent"}`} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
            {quickStats.map((card) => (
              <div key={card.title} className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${card.bg}`}>
                    <card.icon size={22} className={card.color} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products Chart */}
        <div key="topProducts" className="dashboard-widget">
          <div className={`drag-handle h-1 rounded-t-lg ${!isLocked ? "bg-primary-200 cursor-move" : "bg-transparent"}`} />
          <div className="card p-5 h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Revenue</h3>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => v.length > 15 ? v.slice(0, 15) + "…" : v}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                  />
                  <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-12">No sales data yet</p>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div key="recentSales" className="dashboard-widget">
          <div className={`drag-handle h-1 rounded-t-lg ${!isLocked ? "bg-primary-200 cursor-move" : "bg-transparent"}`} />
          <div className="card p-5 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
              <a
                href="/sales"
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View all <ArrowUpRight size={14} />
              </a>
            </div>
            <div className="space-y-3">
              {recentSales.length > 0 ? (
                recentSales.slice(0, 6).map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{sale.invoiceNo}</p>
                      <p className="text-xs text-gray-400">
                        {sale.customerName} · {sale.itemCount} item{sale.itemCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(sale.totalAmount)}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                        {sale.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No sales yet</p>
              )}
            </div>
          </div>
        </div>
      </Responsive>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import * as React from "react";
import {
  DollarSign,
  Package,
  Wallet,
  ReceiptText,
  Undo2,
  ShoppingCart,
  FileWarning,
  CircleDollarSign,
  BarChart3,
  AlertTriangle,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useRouter } from "next/navigation";

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
  salesLast30Days: { date: string; amount: number }[];
  salesByMonth: { month: string; amount: number }[];
}

export default function DashboardClient({ stats, salesLast30Days, salesByMonth }: Props) {
  const router = useRouter();

  /* ─── Top 8 Summary Cards (matching reference image) ─── */
  const summaryCards = [
    {
      title: "Total Sales",
      value: formatCurrency(stats.totalSales),
      icon: DollarSign,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      gradient: "bg-gradient-to-br from-blue-50 to-blue-100/50",
    },
    {
      title: "Net",
      value: formatCurrency(stats.netSales),
      icon: CircleDollarSign,
      iconColor: "text-green-600",
      iconBg: "bg-green-50",
      gradient: "bg-gradient-to-br from-green-50 to-green-100/50",
    },
    {
      title: "Invoice Due",
      value: formatCurrency(stats.invoiceDue),
      icon: FileWarning,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-50",
      gradient: "bg-gradient-to-br from-orange-50 to-orange-100/50",
    },
    {
      title: "Total Sell Return",
      value: formatCurrency(stats.totalSellReturn),
      icon: Undo2,
      iconColor: "text-red-600",
      iconBg: "bg-red-50",
      gradient: "bg-gradient-to-br from-red-50 to-red-100/50",
    },
    {
      title: "Total Purchase",
      value: formatCurrency(stats.totalPurchase),
      icon: ShoppingCart,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
      gradient: "bg-gradient-to-br from-purple-50 to-purple-100/50",
    },
    {
      title: "Purchase Due",
      value: formatCurrency(stats.purchaseDue),
      icon: AlertTriangle,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-50",
      gradient: "bg-gradient-to-br from-yellow-50 to-yellow-100/50",
    },
    {
      title: "Total Purchase Return",
      value: formatCurrency(stats.totalPurchaseReturn),
      icon: ReceiptText,
      iconColor: "text-cyan-600",
      iconBg: "bg-cyan-50",
      gradient: "bg-gradient-to-br from-cyan-50 to-cyan-100/50",
    },
    {
      title: "Total Expense",
      value: formatCurrency(stats.totalExpense),
      icon: Wallet,
      iconColor: "text-pink-600",
      iconBg: "bg-pink-50",
      gradient: "bg-gradient-to-br from-pink-50 to-pink-100/50",
    },
  ];

  /* ─── Quick Stats Row ─── */
  const quickStats = [
    { title: "Today's Sales", value: stats.todaySalesCount, sub: formatCurrency(stats.todaySalesAmount), icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "This Month", value: stats.monthSalesCount, sub: formatCurrency(stats.monthSalesAmount), icon: BarChart3, color: "text-green-600", bg: "bg-green-50" },
    { title: "Products", value: stats.totalProducts, sub: `${stats.lowStockCount} Low Stock`, icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
  ];

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

      {/* ── Quick Action Buttons ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* New Sale Button */}
        <button
          onClick={() => router.push("/pos")}
          className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <div className="p-2 bg-white/20 rounded-lg">
            <ShoppingCart size={20} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">New Sale</p>
            <p className="text-xs opacity-90">Create invoice</p>
          </div>
        </button>

        {/* New Customer Button */}
        <button
          onClick={() => router.push("/customers")}
          className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <div className="p-2 bg-white/20 rounded-lg">
            <UserPlus size={20} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">New Customer</p>
            <p className="text-xs opacity-90">Add customer</p>
          </div>
        </button>

        {/* Open Register Dropdown */}
        <div ref={registerRef} className="relative">
          <button
            onClick={() => setShowRegisterDropdown(!showRegisterDropdown)}
            className="w-full flex items-center gap-3 p-4 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <div className="p-2 bg-white/20 rounded-lg">
              <CreditCard size={20} />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-semibold">Open Register</p>
              <p className="text-xs opacity-90">Last 7 days</p>
            </div>
            <ChevronDown size={18} className={`transition-transform ${showRegisterDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Register Dropdown */}
          {showRegisterDropdown && (
            <div className="absolute top-full mt-2 left-0 w-full sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Register Sessions (Last 7 Days)</h3>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {loadingRegister ? (
                  <div className="p-6 text-center text-gray-400">Loading...</div>
                ) : registerSessions.length === 0 ? (
                  <div className="p-6 text-center">
                    <CreditCard size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">No register sessions found</p>
                    <button
                      onClick={() => {
                        setShowRegisterDropdown(false);
                        router.push("/register");
                      }}
                      className="mt-3 btn-primary text-xs"
                    >
                      Open Register Now
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {registerSessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                session.status === "open"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {session.status}
                            </span>
                            <span className="text-xs text-gray-500">{session.userName}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-400">Opened</p>
                            <p className="font-medium text-gray-700 dark:text-gray-300">
                              {new Date(session.openedAt).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Opening Cash</p>
                            <p className="font-medium text-gray-700 dark:text-gray-300">
                              {formatCurrency(session.openingCash)}
                            </p>
                          </div>
                          {session.closedAt && (
                            <>
                              <div>
                                <p className="text-gray-400">Closed</p>
                                <p className="font-medium text-gray-700 dark:text-gray-300">
                                  {new Date(session.closedAt).toLocaleString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400">Closing Cash</p>
                                <p className="font-medium text-gray-700 dark:text-gray-300">
                                  {session.closingCash !== null
                                    ? formatCurrency(session.closingCash)
                                    : "—"}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                <button
                  onClick={() => {
                    setShowRegisterDropdown(false);
                    router.push("/register");
                  }}
                  className="w-full text-center text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  View More →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add New Product Button */}
        <button
          onClick={() => router.push("/products")}
          className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <div className="p-2 bg-white/20 rounded-lg">
            <Plus size={20} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">Add Product</p>
            <p className="text-xs opacity-90">New product</p>
          </div>
        </button>
      </div>

      {/* ── Top Summary Cards (8 cards, 4 per row) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.title} className={`card p-4 ${card.gradient}`}>
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

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
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
      borderColor: "border-l-purple-500",
    },
    {
      title: "Purchase Due",
      value: formatCurrency(stats.purchaseDue),
      icon: AlertTriangle,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-50",
      borderColor: "border-l-yellow-500",
    },
    {
      title: "Total Purchase Return",
      value: formatCurrency(stats.totalPurchaseReturn),
      icon: ReceiptText,
      iconColor: "text-cyan-600",
      iconBg: "bg-cyan-50",
      borderColor: "border-l-cyan-500",
    },
    {
      title: "Total Expense",
      value: formatCurrency(stats.totalExpense),
      icon: Wallet,
      iconColor: "text-pink-600",
      iconBg: "bg-pink-50",
      borderColor: "border-l-pink-500",
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

      {/* ── Top Summary Cards (8 cards, 4 per row) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* ── Quick Stats Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* ── Top Products and Recent Sales (Side by Side) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Chart */}
        <div className="card p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Revenue</h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
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

        {/* Recent Sales */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
            <a
              href="/sales"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View all <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
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

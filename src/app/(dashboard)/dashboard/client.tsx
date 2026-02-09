"use client";

import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  Microscope,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
}

export default function DashboardClient({ stats, recentSales, topProducts }: Props) {
  const cards = [
    {
      title: "Today's Sales",
      value: formatCurrency(stats.todaySalesAmount),
      sub: `${stats.todaySalesCount} transactions`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats.monthSalesAmount),
      sub: `${stats.monthSalesCount} sales this month`,
      icon: TrendingUp,
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
    {
      title: "Products",
      value: stats.totalProducts.toString(),
      sub: `${stats.lowStockCount} low stock`,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Customers",
      value: stats.totalCustomers.toString(),
      sub: "Active customers",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Low Stock Alerts",
      value: stats.lowStockCount.toString(),
      sub: "Items need reorder",
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Pending Lab Orders",
      value: stats.pendingLabOrders.toString(),
      sub: "Awaiting completion",
      icon: Microscope,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Chart */}
        <div className="card p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Revenue</h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
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
    </div>
  );
}

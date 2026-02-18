"use client";

import { formatCurrency, cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

interface Props {
  stats: { totalRevenue: number; totalTax: number; totalSales: number; avgTicket: number };
  monthlySales: { month: string; revenue: number; tax: number; count: number }[];
  topCustomers: { name: string; totalPurchases: number }[];
  typeDistribution: { type: string; count: number }[];
}

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

export default function ReportsClient({ stats, monthlySales, topCustomers, typeDistribution }: Props) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalRevenue)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Total Tax Collected</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalTax)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalSales}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Avg. Ticket Size</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.avgTicket)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="card p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
          {monthlySales.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="tax" name="Tax" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-center py-12 text-gray-400">No data</p>}
        </div>

        {/* Product Type Distribution */}
        <div className="card p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Distribution</h3>
          {typeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={typeDistribution} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={100} label={({ type, count }) => `${type} (${count})`}>
                  {typeDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center py-12 text-gray-400">No data</p>}
        </div>
      </div>

      {/* Monthly Sales Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100"><h3 className="font-semibold">Monthly Sales Summary</h3></div>
        <table className="w-full">
          <thead><tr className="table-header">
            <th className="px-4 py-3">Month</th><th className="px-4 py-3 text-center">Transactions</th>
            <th className="px-4 py-3 text-right">Revenue</th><th className="px-4 py-3 text-right">Tax</th>
            <th className="px-4 py-3 text-right">Avg. Ticket</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {monthlySales.map(m => (
              <tr key={m.month} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{m.month}</td>
                <td className="px-4 py-3 text-sm text-center">{m.count}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(m.revenue)}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-600">{formatCurrency(m.tax)}</td>
                <td className="px-4 py-3 text-sm text-right">{formatCurrency(m.count > 0 ? m.revenue / m.count : 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Customers */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100"><h3 className="font-semibold">Top Customers</h3></div>
        <table className="w-full">
          <thead><tr className="table-header">
            <th className="px-4 py-3">#</th><th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3 text-right">Total Purchases</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {topCustomers.map((c, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{c.name}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(c.totalPurchases)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

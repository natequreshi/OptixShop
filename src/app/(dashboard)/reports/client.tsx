"use client";

import { useState } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area 
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package,
  FileText, Calendar, Settings, X, ChevronRight, Activity
} from "lucide-react";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899", "#F97316"];

interface Props {
  stats: { totalRevenue: number; totalTax: number; totalSales: number; avgTicket: number };
  monthlySales: { month: string; revenue: number; tax: number; count: number }[];
  topCustomers: { name: string; totalPurchases: number; loyaltyPoints: number }[];
  typeDistribution: { type: string; count: number }[];
}

type ReportType = 
  | "profit-loss" | "purchase-sale" | "tax" | "supplier-customer" 
  | "customer-groups" | "stock" | "stock-adjustment" | "trending"
  | "items" | "product-purchase" | "product-sell" | "purchase-payment"
  | "sell-payment" | "expense" | "register" | "sales-rep" | "activity-log";

const reportTypes: { key: ReportType; label: string; icon: any; color: string }[] = [
  { key: "profit-loss", label: "Profit & Loss Report", icon: TrendingUp, color: "bg-green-500" },
  { key: "purchase-sale", label: "Purchase & Sale Report", icon: ShoppingCart, color: "bg-blue-500" },
  { key: "tax", label: "Tax Report", icon: FileText, color: "bg-purple-500" },
  { key: "supplier-customer", label: "Supplier & Customer Report", icon: Users, color: "bg-indigo-500" },
  { key: "customer-groups", label: "Customer Groups Report", icon: Users, color: "bg-pink-500" },
  { key: "stock", label: "Stock Report", icon: Package, color: "bg-cyan-500" },
  { key: "stock-adjustment", label: "Stock Adjustment Report", icon: Settings, color: "bg-orange-500" },
  { key: "trending", label: "Trending Products", icon: TrendingUp, color: "bg-red-500" },
  { key: "items", label: "Items Report", icon: Package, color: "bg-teal-500" },
  { key: "product-purchase", label: "Product Purchase Report", icon: ShoppingCart, color: "bg-violet-500" },
  { key: "product-sell", label: "Product Sell Report", icon: DollarSign, color: "bg-emerald-500" },
  { key: "purchase-payment", label: "Purchase Payment Report", icon: DollarSign, color: "bg-amber-500" },
  { key: "sell-payment", label: "Sell Payment Report", icon: DollarSign, color: "bg-lime-500" },
  { key: "expense", label: "Expense Report", icon: TrendingDown, color: "bg-rose-500" },
  { key: "register", label: "Register Report", icon: Calendar, color: "bg-sky-500" },
  { key: "sales-rep", label: "Sales Representative Report", icon: Users, color: "bg-fuchsia-500" },
  { key: "activity-log", label: "Activity Log", icon: Activity, color: "bg-slate-500" },
];

export default function ReportsClient({ stats, monthlySales, topCustomers, typeDistribution }: Props) {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Sample data for different reports
  const profitLossData = [
    { month: "Jan", revenue: 125000, cogs: 75000, expenses: 20000, profit: 30000 },
    { month: "Feb", revenue: 142000, cogs: 85000, expenses: 22000, profit: 35000 },
    { month: "Mar", revenue: 158000, cogs: 95000, expenses: 25000, profit: 38000 },
    { month: "Apr", revenue: 171000, cogs: 102000, expenses: 27000, profit: 42000 },
  ];

  const purchaseSaleData = [
    { month: "Jan", purchases: 85000, sales: 125000 },
    { month: "Feb", purchases: 92000, sales: 142000 },
    { month: "Mar", purchases: 98000, sales: 158000 },
    { month: "Apr", purchases: 105000, sales: 171000 },
  ];

  const taxData = [
    { month: "Jan", taxCollected: 22500, taxPaid: 15300 },
    { month: "Feb", taxCollected: 25560, taxPaid: 16560 },
    { month: "Mar", taxCollected: 28440, taxPaid: 17640 },
    { month: "Apr", taxCollected: 30780, taxPaid: 18900 },
  ];

  const stockData = [
    { product: "Ray-Ban Aviator", stock: 45, value: 112500, reorderLevel: 20 },
    { product: "Oakley Frogskins", stock: 32, value: 96000, reorderLevel: 15 },
    { product: "Prada PR 01OS", stock: 18, value: 72000, reorderLevel: 10 },
    { product: "Gucci GG0061S", stock: 25, value: 125000, reorderLevel: 12 },
  ];

  const trendingProducts = [
    { product: "Ray-Ban Aviator", sales: 87, revenue: 217500, growth: 24 },
    { product: "Oakley Frogskins", sales: 64, revenue: 192000, growth: 18 },
    { product: "Prada PR 01OS", sales: 42, revenue: 168000, growth: 12 },
    { product: "Gucci GG0061S", sales: 55, revenue: 275000, growth: 35 },
  ];

  const expenseData = [
    { category: "Rent", amount: 35000, percent: 28 },
    { category: "Salaries", amount: 65000, percent: 52 },
    { category: "Utilities", amount: 12000, percent: 10 },
    { category: "Marketing", amount: 8000, percent: 6 },
    { category: "Others", amount: 5000, percent: 4 },
  ];

  const renderReportContent = () => {
    if (!selectedReport) return null;

    switch (selectedReport) {
      case "profit-loss":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="card p-4">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(596000)}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-500">Total COGS</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(357000)}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(94000)}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-500">Net Profit</p>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(145000)}</p>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold mb-4">Profit & Loss Trend</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={profitLossData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#10B981" />
                  <Bar dataKey="cogs" name="COGS" fill="#F59E0B" />
                  <Bar dataKey="expenses" name="Expenses" fill="#EF4444" />
                  <Bar dataKey="profit" name="Profit" fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "purchase-sale":
        return (
          <div className="space-y-6">
            <div className="card p-5">
              <h3 className="font-semibold mb-4">Purchase vs Sale Comparison</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={purchaseSaleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="purchases" name="Purchases" stroke="#F59E0B" strokeWidth={3} />
                  <Line type="monotone" dataKey="sales" name="Sales" stroke="#10B981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "tax":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="card p-4">
                <p className="text-sm text-gray-500">Tax Collected</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(107280)}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-500">Tax Paid</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(68400)}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-500">Net Tax</p>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(38880)}</p>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold mb-4">Tax Collection vs Payment</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={taxData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend />
                  <Area type="monotone" dataKey="taxCollected" name="Tax Collected" fill="#10B981" stroke="#10B981" />
                  <Area type="monotone" dataKey="taxPaid" name="Tax Paid" fill="#EF4444" stroke="#EF4444" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "stock":
        return (
          <div className="space-y-6">
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-gray-100"><h3 className="font-semibold">Current Stock Levels</h3></div>
              <table className="w-full">
                <thead><tr className="table-header">
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-center">Stock Qty</th>
                  <th className="px-4 py-3 text-right">Stock Value</th>
                  <th className="px-4 py-3 text-center">Reorder Level</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {stockData.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{item.product}</td>
                      <td className="px-4 py-3 text-sm text-center">{item.stock}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(item.value)}</td>
                      <td className="px-4 py-3 text-sm text-center">{item.reorderLevel}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium",
                          item.stock > item.reorderLevel * 2 ? "bg-green-100 text-green-700" :
                          item.stock > item.reorderLevel ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          {item.stock > item.reorderLevel * 2 ? "Good" :
                           item.stock > item.reorderLevel ? "Low" : "Critical"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "trending":
        return (
          <div className="space-y-6">
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-gray-100"><h3 className="font-semibold">Top Trending Products</h3></div>
              <table className="w-full">
                <thead><tr className="table-header">
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-center">Units Sold</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                  <th className="px-4 py-3 text-center">Growth %</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {trendingProducts.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{item.product}</td>
                      <td className="px-4 py-3 text-sm text-center">{item.sales}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(item.revenue)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium inline-flex items-center gap-1">
                          <TrendingUp size={12} /> {item.growth}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold mb-4">Sales Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={trendingProducts} 
                    dataKey="sales" 
                    nameKey="product" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={100}
                    label={({ product, sales }) => `${product}: ${sales}`}
                  >
                    {trendingProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "expense":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4">
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(125000)}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(35000)}</p>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold mb-4">Expense Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={expenseData} 
                    dataKey="amount" 
                    nameKey="category" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={100}
                    label={({ category, percent }) => `${category}: ${percent}%`}
                  >
                    {expenseData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card overflow-hidden">
              <div className="p-4 border-b border-gray-100"><h3 className="font-semibold">Expense Details</h3></div>
              <table className="w-full">
                <thead><tr className="table-header">
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Percentage</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {expenseData.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{item.category}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(item.amount)}</td>
                      <td className="px-4 py-3 text-sm text-right">{item.percent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return (
          <div className="card p-12 text-center">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">This report is under development</p>
            <p className="text-sm text-gray-400 mt-2">More detailed data will be available soon</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive business insights and reports</p>
        </div>
        <div className="flex gap-3">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input" />
        </div>
      </div>

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

      <div className="flex gap-6">
        {/* Report Type Selector */}
        <div className="w-80 flex-shrink-0">
          <div className="card p-4">
            <h3 className="font-semibold mb-3 text-gray-900">Report Types</h3>
            <div className="space-y-1">
              {reportTypes.map((report) => (
                <button
                  key={report.key}
                  onClick={() => setSelectedReport(report.key)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    selectedReport === report.key 
                      ? "bg-primary-50 text-primary-700 border-2 border-primary-500" 
                      : "text-gray-600 hover:bg-gray-50 border-2 border-transparent"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white", report.color)}>
                    <report.icon size={16} />
                  </div>
                  <span className="flex-1 text-left">{report.label}</span>
                  <ChevronRight size={16} className={cn("transition-transform", selectedReport === report.key && "rotate-90")} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1">
          {selectedReport ? (
            <div className="space-y-4">
              <div className="card p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {reportTypes.find(r => r.key === selectedReport)?.label}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : "All Time"}
                  </p>
                </div>
                <button onClick={() => setSelectedReport(null)} className="btn-secondary">
                  <X size={16} /> Close
                </button>
              </div>
              {renderReportContent()}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <FileText size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Report Type</h3>
              <p className="text-gray-500">Choose a report from the left sidebar to view detailed analytics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

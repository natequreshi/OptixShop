"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area 
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package,
  FileText, Calendar, Settings, X, ChevronRight, Activity, ChevronDown, Loader2
} from "lucide-react";
import DateFilter from "@/components/DateFilter";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899", "#F97316"];

interface Props {
  stats: { totalRevenue: number; totalTax: number; totalSales: number; avgTicket: number };
  monthlySales: { month: string; revenue: number; tax: number; count: number }[];
  topCustomers: { name: string; totalPurchases: number; loyaltyPoints: number }[];
  typeDistribution: { type: string; count: number }[];
}

type ReportType = 
  | "profit-loss" | "purchase-sale" | "tax" 
  | "stock" | "trending"
  | "sell-payment" | "purchase-payment" | "expense";

const reportTypes: { key: ReportType; label: string; icon: any; color: string }[] = [
  { key: "profit-loss", label: "Profit & Loss", icon: TrendingUp, color: "bg-green-500" },
  { key: "purchase-sale", label: "Purchase & Sale", icon: ShoppingCart, color: "bg-blue-500" },
  { key: "tax", label: "Tax Report", icon: FileText, color: "bg-purple-500" },
  { key: "stock", label: "Stock Report", icon: Package, color: "bg-cyan-500" },
  { key: "trending", label: "Trending Products", icon: TrendingUp, color: "bg-red-500" },
  { key: "sell-payment", label: "Sell Payment Report", icon: DollarSign, color: "bg-lime-500" },
  { key: "purchase-payment", label: "Purchase Payment Report", icon: DollarSign, color: "bg-amber-500" },
  { key: "expense", label: "Expense Report", icon: TrendingDown, color: "bg-rose-500" },
];

export default function ReportsClient({ stats: initialStats }: Props) {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [stats, setStats] = useState(initialStats);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedReports, setExpandedReports] = useState(true);

  const fetchStats = useCallback(async (from: string, to: string) => {
    try {
      const params = new URLSearchParams({ type: "summary" });
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`/api/reports?${params}`);
      const data = await res.json();
      setStats(data);
    } catch {}
  }, []);

  const fetchReport = useCallback(async (type: ReportType, from: string, to: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type });
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`/api/reports?${params}`);
      const data = await res.json();
      setReportData(data);
    } catch { setReportData(null); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedReport) fetchReport(selectedReport, dateFrom, dateTo);
  }, [selectedReport, dateFrom, dateTo, fetchReport]);

  const handleDateChange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
    fetchStats(from, to);
  };

  const renderReportContent = () => {
    if (!selectedReport || !reportData) return null;
    if (loading) return (
      <div className="card p-12 text-center">
        <Loader2 size={32} className="mx-auto mb-3 text-primary-600 animate-spin" />
        <p className="text-gray-500">Loading report data...</p>
      </div>
    );

    switch (selectedReport) {
      case "profit-loss":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="card p-4">
                <p className="text-xs text-gray-500">Revenue</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(reportData.totals?.revenue ?? 0)}</p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-gray-500">COGS (Purchases)</p>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(reportData.totals?.cogs ?? 0)}</p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-gray-500">Expenses</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(reportData.totals?.expenses ?? 0)}</p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-gray-500">Net Profit</p>
                <p className={cn("text-xl font-bold", (reportData.totals?.profit ?? 0) >= 0 ? "text-primary-600" : "text-red-600")}>{formatCurrency(reportData.totals?.profit ?? 0)}</p>
              </div>
            </div>
            {reportData.data?.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold mb-4">Monthly Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#10B981" />
                    <Bar dataKey="cogs" name="COGS" fill="#F59E0B" />
                    <Bar dataKey="expenses" name="Expenses" fill="#EF4444" />
                    <Bar dataKey="profit" name="Profit" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );

      case "purchase-sale":
        return (
          <div className="card p-5">
            <h3 className="font-semibold mb-4">Purchase vs Sale Comparison</h3>
            {reportData.data?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="purchases" name="Purchases" stroke="#F59E0B" strokeWidth={2} />
                  <Line type="monotone" dataKey="sales" name="Sales" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-gray-400 py-8">No data for selected period</p>}
          </div>
        );

      case "tax":
        return (
          <div className="space-y-4">
            <div className="card p-4">
              <p className="text-sm text-gray-500">Total Tax Collected</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(reportData.totalTax ?? 0)}</p>
            </div>
            {reportData.data?.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold mb-4">Monthly Tax Collection</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={reportData.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Area type="monotone" dataKey="taxCollected" name="Tax" fill="#10B981" stroke="#10B981" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );

      case "stock":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="card p-4">
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-2xl font-bold">{reportData.totalItems ?? 0}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-500">Total Stock Value</p>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(reportData.totalValue ?? 0)}</p>
              </div>
            </div>
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead><tr className="table-header">
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-right">Value</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {(reportData.data ?? []).map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-medium">{item.product}</td>
                      <td className="px-4 py-2 text-sm text-center">{item.stock}</td>
                      <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.costPrice)}</td>
                      <td className="px-4 py-2 text-sm text-right font-semibold">{formatCurrency(item.value)}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium",
                          item.stock > item.reorderLevel * 2 ? "bg-green-100 text-green-700" :
                          item.stock > item.reorderLevel ? "bg-yellow-100 text-yellow-700" :
                          item.stock <= 0 ? "bg-red-100 text-red-700" :
                          "bg-orange-100 text-orange-700"
                        )}>
                          {item.stock <= 0 ? "Out" : item.stock > item.reorderLevel * 2 ? "Good" : item.stock > item.reorderLevel ? "Low" : "Critical"}
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
          <div className="space-y-4">
            {(reportData.data ?? []).length > 0 ? (
              <>
                <div className="card overflow-hidden">
                  <div className="p-4 border-b border-gray-100"><h3 className="font-semibold">Top Products by Revenue</h3></div>
                  <table className="w-full">
                    <thead><tr className="table-header">
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-center">Units Sold</th>
                      <th className="px-4 py-3 text-right">Revenue</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {(reportData.data ?? []).map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-400">{i+1}</td>
                          <td className="px-4 py-2 text-sm font-medium">{item.name}</td>
                          <td className="px-4 py-2 text-sm text-center">{item.sales}</td>
                          <td className="px-4 py-2 text-sm text-right font-semibold">{formatCurrency(item.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card p-5">
                  <h3 className="font-semibold mb-4">Revenue Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={reportData.data.slice(0, 8)} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, revenue }: any) => `${name}: ${formatCurrency(revenue)}`}>
                        {(reportData.data ?? []).slice(0, 8).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : <div className="card p-12 text-center text-gray-400">No sales data for selected period</div>}
          </div>
        );

      case "expense":
        return (
          <div className="space-y-4">
            <div className="card p-4">
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(reportData.totalExpenses ?? 0)}</p>
            </div>
            {(reportData.data ?? []).length > 0 && (
              <>
                <div className="card p-5">
                  <h3 className="font-semibold mb-4">By Category</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={reportData.data} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category, percent }: any) => `${category}: ${percent}%`}>
                        {(reportData.data ?? []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="card overflow-hidden">
                  <table className="w-full">
                    <thead><tr className="table-header">
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-right">%</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {(reportData.data ?? []).map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm font-medium">{item.category}</td>
                          <td className="px-4 py-2 text-sm text-right font-semibold">{formatCurrency(item.amount)}</td>
                          <td className="px-4 py-2 text-sm text-right text-gray-500">{item.percent}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        );

      case "sell-payment":
        return (
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100"><h3 className="font-semibold">Sales Payment Records</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="table-header">
                  <th className="px-4 py-3 text-left">Invoice #</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {(reportData.data ?? []).map((s: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-mono text-primary-600">{s.invoiceNo}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{s.saleDate}</td>
                      <td className="px-4 py-2 text-sm capitalize">{s.paymentMethod?.replace("_", " ")}</td>
                      <td className="px-4 py-2 text-sm text-right">{formatCurrency(s.totalAmount)}</td>
                      <td className="px-4 py-2 text-sm text-right text-green-600">{formatCurrency(s.paidAmount)}</td>
                      <td className="px-4 py-2 text-sm text-right text-red-600">{formatCurrency(s.balanceAmount)}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", s.paymentStatus === "paid" ? "bg-green-100 text-green-700" : s.paymentStatus === "partial" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700")}>
                          {s.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(reportData.data ?? []).length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-400">No records found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "purchase-payment":
        return (
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100"><h3 className="font-semibold">Purchase Payment Records</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="table-header">
                  <th className="px-4 py-3 text-left">Invoice #</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {(reportData.data ?? []).map((p: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-mono text-primary-600">{p.invoiceNo}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{p.invoiceDate}</td>
                      <td className="px-4 py-2 text-sm text-right">{formatCurrency(p.totalAmount)}</td>
                      <td className="px-4 py-2 text-sm text-right text-green-600">{formatCurrency(p.paidAmount)}</td>
                      <td className="px-4 py-2 text-sm text-right text-red-600">{formatCurrency(p.balanceAmount)}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", p.status === "paid" ? "bg-green-100 text-green-700" : p.status === "partial" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700")}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(reportData.data ?? []).length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400">No records found</td></tr>}
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
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time business insights</p>
        </div>
        <DateFilter onDateChange={handleDateChange} />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase">Revenue</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalRevenue)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase">Tax Collected</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalTax)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase">Transactions</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{stats.totalSales}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase">Avg. Ticket</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(stats.avgTicket)}</p>
        </div>
      </div>

      {/* Reports Tree + Content */}
      <div className="flex gap-6">
        {/* Report Tree Sidebar */}
        <div className="w-72 flex-shrink-0">
          <div className="card p-3">
            <button
              onClick={() => setExpandedReports(!expandedReports)}
              className="w-full flex items-center justify-between px-2 py-2 font-semibold text-gray-800 hover:bg-gray-50 rounded-lg"
            >
              <span className="flex items-center gap-2"><FileText size={16} /> Reports</span>
              <ChevronDown size={16} className={cn("transition-transform", expandedReports && "rotate-180")} />
            </button>
            {expandedReports && (
              <div className="mt-1 space-y-0.5 ml-2 border-l-2 border-gray-100 pl-2">
                {reportTypes.map((report) => (
                  <button
                    key={report.key}
                    onClick={() => setSelectedReport(selectedReport === report.key ? null : report.key)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-all",
                      selectedReport === report.key 
                        ? "bg-primary-50 text-primary-700 font-medium" 
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white shrink-0", report.color)} style={{ fontSize: 10 }}>
                      <report.icon size={12} />
                    </div>
                    <span className="text-left truncate">{report.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1 min-w-0">
          {selectedReport ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  {reportTypes.find(r => r.key === selectedReport)?.label}
                </h2>
                <button onClick={() => { setSelectedReport(null); setReportData(null); }} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
              {loading ? (
                <div className="card p-12 text-center">
                  <Loader2 size={32} className="mx-auto mb-3 text-primary-600 animate-spin" />
                  <p className="text-gray-500">Loading...</p>
                </div>
              ) : renderReportContent()}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Report</h3>
              <p className="text-gray-400 text-sm">Choose from the sidebar to view real-time analytics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

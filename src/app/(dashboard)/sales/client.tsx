"use client";

import { useState } from "react";
import { Search, DollarSign, Eye } from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

interface Sale {
  id: string; invoiceNo: string; customerName: string; cashierName: string;
  saleDate: string; subtotal: number; discountAmount: number; taxAmount: number;
  totalAmount: number; paidAmount: number; balanceAmount: number;
  status: string; paymentStatus: string; itemCount: number; paymentMethods: string;
}

const statusColors: Record<string, string> = {
  completed: "bg-green-50 text-green-700", pending: "bg-yellow-50 text-yellow-700",
  cancelled: "bg-red-50 text-red-700", refunded: "bg-gray-100 text-gray-700",
  paid: "bg-green-50 text-green-700", partial: "bg-yellow-50 text-yellow-700",
  unpaid: "bg-red-50 text-red-700",
};

export default function SalesClient({ sales }: { sales: Sale[] }) {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const filtered = sales.filter((s) => {
    const matchSearch = s.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      s.customerName.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter || s.saleDate === dateFilter;
    return matchSearch && matchDate;
  });

  const totalRevenue = filtered.reduce((s, sale) => s + sale.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
        <div className="text-sm text-gray-500">
          {filtered.length} sales · Total: <span className="font-semibold text-green-600">{formatCurrency(totalRevenue)}</span>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sales..." className="input pl-10" />
        </div>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input w-auto" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="table-header">
              <th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th><th className="px-4 py-3">Cashier</th>
              <th className="px-4 py-3 text-center">Items</th><th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Paid</th>
              <th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3 text-center">Payment</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-primary-600">{s.invoiceNo}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{s.customerName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(s.saleDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.cashierName}</td>
                  <td className="px-4 py-3 text-sm text-center">{s.itemCount}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(s.totalAmount)}</td>
                  <td className="px-4 py-3 text-sm text-right text-green-600">{formatCurrency(s.paidAmount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("text-xs px-2 py-1 rounded-full font-medium", statusColors[s.status])}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("text-xs px-2 py-1 rounded-full font-medium", statusColors[s.paymentStatus])}>{s.paymentStatus}</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={9} className="text-center py-12 text-gray-400">No sales found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Search, Receipt } from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

interface PI {
  id: string; invoiceNo: string; vendorInvoiceNo: string; vendorName: string;
  invoiceDate: string; dueDate: string; totalAmount: number;
  paidAmount: number; balanceAmount: number; status: string; itemCount: number;
}

const statusColors: Record<string, string> = {
  unpaid: "bg-red-50 text-red-700", partial: "bg-yellow-50 text-yellow-700",
  paid: "bg-green-50 text-green-700",
};

export default function PIClient({ invoices }: { invoices: PI[] }) {
  const [search, setSearch] = useState("");

  const filtered = invoices.filter((i) =>
    i.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
    i.vendorName.toLowerCase().includes(search.toLowerCase())
  );

  const totalOutstanding = invoices.reduce((s, i) => s + i.balanceAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Purchase Invoices</h1>
        <div className="text-sm text-gray-500">Outstanding: <span className="font-semibold text-red-600">{formatCurrency(totalOutstanding)}</span></div>
      </div>

      <div className="card p-4">
        <div className="relative"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoices..." className="input pl-10" /></div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="table-header">
              <th className="px-4 py-3">Invoice No</th><th className="px-4 py-3">Vendor Inv.</th>
              <th className="px-4 py-3">Vendor</th><th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Due</th><th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Paid</th><th className="px-4 py-3 text-right">Balance</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((i) => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-primary-600">{i.invoiceNo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{i.vendorInvoiceNo || "—"}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{i.vendorName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(i.invoiceDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{i.dueDate ? formatDate(i.dueDate) : "—"}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(i.totalAmount)}</td>
                  <td className="px-4 py-3 text-sm text-right text-green-600">{formatCurrency(i.paidAmount)}</td>
                  <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">{formatCurrency(i.balanceAmount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("text-xs px-2 py-1 rounded-full font-medium", statusColors[i.status] ?? "bg-gray-100 text-gray-600")}>{i.status}</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={9} className="text-center py-12 text-gray-400">No invoices found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

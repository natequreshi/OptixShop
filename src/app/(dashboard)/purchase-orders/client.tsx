"use client";

import { useState } from "react";
import { Search, ClipboardList, Eye } from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

interface PO {
  id: string; poNumber: string; vendorName: string; orderDate: string;
  expectedDelivery: string; totalAmount: number; status: string;
  itemCount: number; grnCount: number;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-50 text-blue-700",
  partial: "bg-yellow-50 text-yellow-700",
  received: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function POClient({ purchaseOrders, vendors }: { purchaseOrders: PO[]; vendors: { id: string; name: string }[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = purchaseOrders.filter((po) => {
    const matchSearch = po.poNumber.toLowerCase().includes(search.toLowerCase()) || po.vendorName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || po.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search POs..." className="input pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto">
          <option value="">All Status</option>
          <option value="draft">Draft</option><option value="sent">Sent</option>
          <option value="partial">Partial</option><option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="table-header">
              <th className="px-4 py-3">PO Number</th><th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Order Date</th><th className="px-4 py-3">Expected</th>
              <th className="px-4 py-3 text-center">Items</th><th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3 text-center">GRNs</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-primary-600">{po.poNumber}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{po.vendorName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(po.orderDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{po.expectedDelivery ? formatDate(po.expectedDelivery) : "—"}</td>
                  <td className="px-4 py-3 text-sm text-center">{po.itemCount}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(po.totalAmount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("text-xs px-2 py-1 rounded-full font-medium", statusColors[po.status] ?? "bg-gray-100 text-gray-600")}>{po.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">{po.grnCount}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-gray-400">No purchase orders found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

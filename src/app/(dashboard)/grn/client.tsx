"use client";

import { useState } from "react";
import { Search, PackageCheck } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

interface GRN {
  id: string; grnNumber: string; poNumber: string; vendorName: string;
  receiptDate: string; status: string; receivedBy: string; itemCount: number; totalQty: number;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700", completed: "bg-green-50 text-green-700",
  partial: "bg-yellow-50 text-yellow-700",
};

export default function GRNClient({ grns }: { grns: GRN[] }) {
  const [search, setSearch] = useState("");

  const filtered = grns.filter((g) =>
    g.grnNumber.toLowerCase().includes(search.toLowerCase()) ||
    g.vendorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Goods Receipt Notes</h1>

      <div className="card p-4">
        <div className="relative"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search GRNs..." className="input pl-10" /></div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="table-header">
              <th className="px-4 py-3">GRN No</th><th className="px-4 py-3">PO</th>
              <th className="px-4 py-3">Vendor</th><th className="px-4 py-3">Receipt Date</th>
              <th className="px-4 py-3 text-center">Items</th><th className="px-4 py-3 text-center">Total Qty</th>
              <th className="px-4 py-3">Received By</th><th className="px-4 py-3 text-center">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-primary-600">{g.grnNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{g.poNumber}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{g.vendorName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(g.receiptDate)}</td>
                  <td className="px-4 py-3 text-sm text-center">{g.itemCount}</td>
                  <td className="px-4 py-3 text-sm text-center font-medium">{g.totalQty}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{g.receivedBy}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("text-xs px-2 py-1 rounded-full font-medium", statusColors[g.status] ?? "bg-gray-100 text-gray-600")}>{g.status}</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-gray-400">No GRNs found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

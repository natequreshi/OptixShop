"use client";

import { useState } from "react";
import { Search, Microscope } from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface LabOrder {
  id: string; orderNo: string; customerName: string; frameName: string;
  lensName: string; status: string; labType: string; orderDate: string;
  estimatedDelivery: string; actualDelivery: string; labCost: number; createdBy: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700", in_progress: "bg-blue-50 text-blue-700",
  ready: "bg-green-50 text-green-700", delivered: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function LabOrdersClient({ labOrders }: { labOrders: LabOrder[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = labOrders.filter((lo) => {
    const matchSearch = lo.orderNo.toLowerCase().includes(search.toLowerCase()) ||
      lo.customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || lo.status === statusFilter;
    return matchSearch && matchStatus;
  });

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/lab-orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) { toast.success("Status updated"); router.refresh(); }
    else toast.error("Failed");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Lab Orders</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {["pending", "in_progress", "ready", "delivered"].map(s => {
          const count = labOrders.filter(lo => lo.status === s).length;
          return (
            <div key={s} className="card p-4 cursor-pointer hover:shadow-md transition" onClick={() => setStatusFilter(statusFilter === s ? "" : s)}>
              <p className="text-sm text-gray-500 capitalize">{s.replace("_", " ")}</p>
              <p className="text-2xl font-bold mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search lab orders..." className="input pl-10" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="table-header">
              <th className="px-4 py-3">Order No</th><th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Frame</th><th className="px-4 py-3">Lens</th>
              <th className="px-4 py-3">Lab</th><th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Est. Delivery</th><th className="px-4 py-3 text-right">Cost</th>
              <th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3"></th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((lo) => (
                <tr key={lo.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-primary-600">{lo.orderNo}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{lo.customerName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{lo.frameName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{lo.lensName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{lo.labType.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(lo.orderDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{lo.estimatedDelivery ? formatDate(lo.estimatedDelivery) : "—"}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatCurrency(lo.labCost)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("text-xs px-2 py-1 rounded-full font-medium", statusColors[lo.status] ?? "bg-gray-100 text-gray-600")}>{lo.status.replace("_", " ")}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={lo.status}
                      onChange={(e) => updateStatus(lo.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={10} className="text-center py-12 text-gray-400">No lab orders found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

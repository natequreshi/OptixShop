"use client";

import { useState } from "react";
import { Search, AlertTriangle, ArrowUpDown } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface InventoryItem {
  id: string; productId: string; sku: string; name: string;
  productType: string; category: string; brand: string;
  quantity: number; avgCost: number; location: string; sellingPrice: number;
}

export default function InventoryClient({ inventory }: { inventory: InventoryItem[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [adjustModal, setAdjustModal] = useState<InventoryItem | null>(null);

  const filtered = inventory.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase());
    if (filter === "low") return matchSearch && i.quantity > 0 && i.quantity <= 5;
    if (filter === "out") return matchSearch && i.quantity <= 0;
    return matchSearch;
  });

  const totalValue = inventory.reduce((sum, i) => sum + i.quantity * i.avgCost, 0);
  const lowStock = inventory.filter((i) => i.quantity > 0 && i.quantity <= 5).length;
  const outOfStock = inventory.filter((i) => i.quantity <= 0).length;

  async function handleAdjust(productId: string, qty: number, notes: string) {
    const res = await fetch("/api/inventory/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: qty, notes }),
    });
    if (res.ok) { toast.success("Stock adjusted"); setAdjustModal(null); router.refresh(); }
    else toast.error("Failed");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4"><p className="text-sm text-gray-500">Total Items</p><p className="text-xl font-bold">{inventory.length}</p></div>
        <div className="card p-4"><p className="text-sm text-gray-500">Total Value</p><p className="text-xl font-bold">{formatCurrency(totalValue)}</p></div>
        <div className="card p-4"><p className="text-sm text-gray-500">Low Stock</p><p className="text-xl font-bold text-orange-600">{lowStock}</p></div>
        <div className="card p-4"><p className="text-sm text-gray-500">Out of Stock</p><p className="text-xl font-bold text-red-600">{outOfStock}</p></div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="input pl-10" />
        </div>
        <div className="flex gap-2">
          {(["all", "low", "out"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-3 py-2 text-sm rounded-lg font-medium transition-colors",
                filter === f ? "bg-primary-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >{f === "all" ? "All" : f === "low" ? "Low Stock" : "Out of Stock"}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Avg Cost</th>
                <th className="px-4 py-3 text-right">Value</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((i) => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{i.sku}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{i.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{i.category}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("font-semibold text-sm",
                      i.quantity <= 0 ? "text-red-600" : i.quantity <= 5 ? "text-orange-600" : "text-gray-800"
                    )}>
                      {i.quantity}
                      {i.quantity <= 5 && i.quantity > 0 && <AlertTriangle size={12} className="inline ml-1 text-orange-500" />}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">{formatCurrency(i.avgCost)}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(i.quantity * i.avgCost)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{i.location}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setAdjustModal(i)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                      <ArrowUpDown size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-gray-400">No items found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      {adjustModal && (
        <AdjustModal item={adjustModal} onClose={() => setAdjustModal(null)} onAdjust={handleAdjust} />
      )}
    </div>
  );
}

function AdjustModal({ item, onClose, onAdjust }: { item: InventoryItem; onClose: () => void; onAdjust: (id: string, qty: number, notes: string) => void }) {
  const [qty, setQty] = useState(0);
  const [notes, setNotes] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">Adjust Stock: {item.name}</h3>
        <p className="text-sm text-gray-500 mb-4">Current: {item.quantity}</p>
        <div className="space-y-3">
          <div><label className="label">Adjustment (+/-)</label><input type="number" value={qty} onChange={(e) => setQty(+e.target.value)} className="input" /></div>
          <div><label className="label">Notes</label><input value={notes} onChange={(e) => setNotes(e.target.value)} className="input" /></div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={() => onAdjust(item.productId, qty, notes)} className="btn-primary">Apply</button>
        </div>
      </div>
    </div>
  );
}

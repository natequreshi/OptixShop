"use client";

import { useState } from "react";
import { Plus, Search, Package, Edit2, Trash2 } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Product {
  id: string; sku: string; name: string; productType: string;
  category: string; brand: string; costPrice: number;
  sellingPrice: number; mrp: number; taxRate: number;
  stock: number; isActive: boolean;
}

interface Props {
  products: Product[];
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}

export default function ProductsClient({ products, categories, brands }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || p.productType === typeFilter;
    return matchSearch && matchType;
  });

  const typeColors: Record<string, string> = {
    frame: "bg-blue-50 text-blue-700",
    lens: "bg-green-50 text-green-700",
    contact_lens: "bg-purple-50 text-purple-700",
    sunglasses: "bg-amber-50 text-amber-700",
    accessory: "bg-gray-100 text-gray-700",
    solution: "bg-teal-50 text-teal-700",
  };

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted"); router.refresh(); }
    else toast.error("Failed to delete");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="input pl-10" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input w-auto">
          <option value="">All Types</option>
          <option value="frame">Frames</option>
          <option value="lens">Lenses</option>
          <option value="contact_lens">Contact Lenses</option>
          <option value="sunglasses">Sunglasses</option>
          <option value="accessory">Accessories</option>
          <option value="solution">Solutions</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3 text-right">Cost</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-center">Stock</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{p.sku}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package size={14} className="text-gray-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs px-2 py-1 rounded-full font-medium", typeColors[p.productType] ?? "bg-gray-100 text-gray-600")}>
                      {p.productType.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.brand}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">{formatCurrency(p.costPrice)}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">{formatCurrency(p.sellingPrice)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("text-sm font-medium", p.stock <= 5 ? "text-red-600" : "text-gray-800")}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("text-xs px-2 py-1 rounded-full", p.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500")}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditing(p); setShowModal(true); }} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="text-center py-12 text-gray-400">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal placeholder */}
      {showModal && (
        <ProductModal
          product={editing}
          categories={categories}
          brands={brands}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); router.refresh(); }}
        />
      )}
    </div>
  );
}

function ProductModal({ product, categories, brands, onClose, onSaved }: {
  product: Product | null;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    sku: product?.sku ?? "",
    name: product?.name ?? "",
    productType: product?.productType ?? "frame",
    categoryId: "",
    brandId: "",
    costPrice: product?.costPrice ?? 0,
    sellingPrice: product?.sellingPrice ?? 0,
    mrp: product?.mrp ?? 0,
    taxRate: product?.taxRate ?? 18,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const url = product ? `/api/products/${product.id}` : "/api/products";
    const method = product ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { toast.success(product ? "Updated" : "Created"); onSaved(); }
    else toast.error("Failed to save");
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{product ? "Edit Product" : "Add Product"}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">SKU</label>
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="label">Type</label>
              <select value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value })} className="input">
                <option value="frame">Frame</option>
                <option value="lens">Lens</option>
                <option value="contact_lens">Contact Lens</option>
                <option value="sunglasses">Sunglasses</option>
                <option value="accessory">Accessory</option>
                <option value="solution">Solution</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Product Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input">
                <option value="">Select...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Brand</label>
              <select value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })} className="input">
                <option value="">Select...</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Cost Price</label>
              <input type="number" step="0.01" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: +e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Selling Price</label>
              <input type="number" step="0.01" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: +e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">MRP</label>
              <input type="number" step="0.01" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: +e.target.value })} className="input" />
            </div>
          </div>
          <div className="w-1/3">
            <label className="label">Tax Rate %</label>
            <input type="number" step="0.01" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: +e.target.value })} className="input" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, FolderTree, GripVertical } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  sortOrder: number;
  productCount: number;
}

export default function CategoriesClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  async function handleDelete(id: string, name: string, count: number) {
    if (count > 0) { toast.error(`Cannot delete "${name}" — it has ${count} product(s)`); return; }
    if (!confirm(`Delete category "${name}"?`)) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted"); router.refresh(); }
    else toast.error("Failed to delete");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Organize your products into categories</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="px-4 py-3 w-10"></th>
              <th className="px-4 py-3">Category Name</th>
              <th className="px-4 py-3 text-center">Sort Order</th>
              <th className="px-4 py-3 text-center">Products</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-300"><GripVertical size={16} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FolderTree size={16} className="text-primary-500" />
                    <span className="text-sm font-medium text-gray-800">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-600">{c.sortOrder}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    {c.productCount}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => { setEditing(c); setShowModal(true); }} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(c.id, c.name, c.productCount)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">No categories yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <CategoryModal
          category={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); router.refresh(); }}
        />
      )}
    </div>
  );
}

function CategoryModal({ category, onClose, onSaved }: {
  category: Category | null; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [sortOrder, setSortOrder] = useState(category?.sortOrder ?? 0);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const url = category ? `/api/categories/${category.id}` : "/api/categories";
    const method = category ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, sortOrder }),
    });
    if (res.ok) { toast.success(category ? "Updated" : "Created"); onSaved(); }
    else toast.error("Failed to save");
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{category ? "Edit Category" : "Add Category"}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Category Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" required autoFocus />
          </div>
          <div>
            <label className="label">Sort Order</label>
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(+e.target.value)} className="input" />
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

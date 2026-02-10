"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Edit2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface ProductVariation {
  id: string;
  productId: string;
  name: string;
  value: string;
  attributeType: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function ProductVariationsManager({ productId, productName }: { productId: string; productName: string }) {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', value: '', attributeType: 'color', imageUrl: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchVariations();
  }, [productId]);

  async function fetchVariations() {
    try {
      const res = await fetch(`/api/product-variations?productId=${productId}`);
      const data = await res.json();
      setVariations(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSave() {
    if (!formData.name || !formData.value || !formData.attributeType) {
      return toast.error("Please fill all required fields");
    }

    setLoading(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/api/product-variations/${editingId}` : '/api/product-variations';
      
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: !editingId ? productId : undefined,
          ...formData,
        }),
      });

      if (res.ok) {
        toast.success(editingId ? "Variation updated" : "Variation added");
        await fetchVariations();
        setFormData({ name: '', value: '', attributeType: 'color', imageUrl: '' });
        setEditingId(null);
        setShowAddForm(false);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save");
      }
    } catch (err) {
      toast.error("Error saving variation");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this variation?")) return;

    try {
      const res = await fetch(`/api/product-variations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Variation deleted");
        await fetchVariations();
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      toast.error("Error deleting variation");
    }
  }

  function handleEdit(v: ProductVariation) {
    setFormData({
      name: v.name,
      value: v.value,
      attributeType: v.attributeType,
      imageUrl: v.imageUrl || '',
    });
    setEditingId(v.id);
    setShowAddForm(true);
  }

  // Group by attribute type
  const grouped = variations.reduce((acc: { [key: string]: ProductVariation[] }, v) => {
    if (!acc[v.attributeType]) acc[v.attributeType] = [];
    acc[v.attributeType].push(v);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Variations for {productName}</h3>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (editingId) {
              setEditingId(null);
              setFormData({ name: '', value: '', attributeType: 'color', imageUrl: '' });
            }
          }}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Plus size={16} /> Add Variation
        </button>
      </div>

      {showAddForm && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="label">Attribute Type</label>
              <select
                value={formData.attributeType}
                onChange={(e) => setFormData({ ...formData, attributeType: e.target.value })}
                className="input"
              >
                <option value="color">Color</option>
                <option value="size">Size</option>
                <option value="material">Material</option>
                <option value="style">Style</option>
              </select>
            </div>
            <div>
              <label className="label">Name (Display)</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="e.g., Red, Large"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="label">Value (Internal)</label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="input"
                placeholder="e.g., #FF0000"
              />
            </div>
            <div>
              <label className="label">Image URL (Optional)</label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="input"
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={loading} className="btn-primary flex-1">
              {loading ? "Saving..." : editingId ? "Update" : "Add"}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
                setFormData({ name: '', value: '', attributeType: 'color', imageUrl: '' });
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <p className="text-gray-400 text-sm py-4">No variations yet</p>
      ) : (
        Object.entries(grouped).map(([type, items]: [string, ProductVariation[]]) => (
          <div key={type} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 font-semibold capitalize text-sm">
              {type} ({items.length})
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {items.map((v) => (
                <div
                  key={v.id}
                  className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {v.imageUrl && (
                      <img
                        src={v.imageUrl}
                        alt={v.name}
                        className="w-10 h-10 rounded object-cover bg-gray-100"
                      />
                    )}
                    <div>
                      <p className="font-medium text-sm">{v.name}</p>
                      <p className="text-xs text-gray-500">{v.value}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(v)}
                      className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

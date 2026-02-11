"use client";

import { useState } from "react";
import { Plus, Search, Package, Edit2, Trash2, Copy, Check, X, Image as ImageIcon, Filter } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Product {
  id: string; sku: string; name: string; productType: string;
  categoryId: string; category: string; brandId: string; brand: string;
  costPrice: number; sellingPrice: number; mrp: number; taxRate: number;
  stock: number; sold: number; imageUrl: string; description: string;
  colors: string;
  isActive: boolean;
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
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [inlineEdit, setInlineEdit] = useState<{ id: string; field: "costPrice" | "sellingPrice"; value: string } | null>(null);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || p.productType === typeFilter;
    const matchCategory = !categoryFilter || p.category === categoryFilter;
    const matchBrand = !brandFilter || p.brand === brandFilter;
    return matchSearch && matchType && matchCategory && matchBrand;
  });

  async function handleDuplicate(product: Product) {
    const newProduct = {
      ...product,
      sku: `${product.sku}-COPY`,
      name: `${product.name} (Copy)`,
    };
    delete (newProduct as any).id;
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });
    if (res.ok) { toast.success("Product duplicated"); router.refresh(); }
    else toast.error("Failed to duplicate");
  }

  async function handleInlineSave(id: string, field: "costPrice" | "sellingPrice", value: string) {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) { toast.error("Invalid price"); return; }
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: numValue }),
    });
    if (res.ok) { toast.success("Updated"); setInlineEdit(null); router.refresh(); }
    else toast.error("Failed to update");
  }

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
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or SKU..." className="input pl-10" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input w-auto min-w-[140px]">
            <option value="">All Types</option>
            <option value="frame">Frames</option>
            <option value="lens">Lenses</option>
            <option value="contact_lens">Contact Lenses</option>
            <option value="sunglasses">Sunglasses</option>
            <option value="accessory">Accessories</option>
            <option value="solution">Solutions</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input w-auto min-w-[140px]">
            <option value="">All Categories</option>
            {[...new Set(products.map(p => p.category))].filter(c => c !== "—").map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="input w-auto min-w-[140px]">
            <option value="">All Brands</option>
            {[...new Set(products.map(p => p.brand))].filter(b => b !== "—").map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
          {(search || typeFilter || categoryFilter || brandFilter) && (
            <button onClick={() => { setSearch(""); setTypeFilter(""); setCategoryFilter(""); setBrandFilter(""); }} className="text-sm text-gray-500 hover:text-gray-700 underline">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Colors</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3 text-right">Cost</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-center">Stock</th>
                <th className="px-4 py-3 text-center">Sold</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  {/* Image */}
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={16} className="text-gray-400" />
                      )}
                    </div>
                  </td>
                  {/* SKU */}
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{p.sku}</td>
                  {/* Colors */}
                  <td className="px-4 py-3">
                    {p.colors ? (
                      <div className="flex gap-1.5 items-center">
                        {p.colors.split(',').slice(0, 5).map((color, i) => {
                          const colorName = color.trim().toLowerCase();
                          const colorMap: Record<string, string> = {
                            black: '#000000', white: '#FFFFFF', red: '#EF4444', blue: '#3B82F6',
                            green: '#10B981', yellow: '#F59E0B', orange: '#F97316', purple: '#A855F7',
                            pink: '#EC4899', gray: '#6B7280', grey: '#6B7280', brown: '#92400E',
                            gold: '#D4AF37', silver: '#C0C0C0', bronze: '#CD7F32', navy: '#1E3A8A',
                            maroon: '#7F1D1D', teal: '#14B8A6', cyan: '#06B6D4', lime: '#84CC16',
                            indigo: '#6366F1', violet: '#8B5CF6', rose: '#F43F5E', amber: '#F59E0B',
                            emerald: '#059669', sky: '#0EA5E9', slate: '#64748B', transparent: 'transparent'
                          };
                          const bgColor = colorMap[colorName] || '#9CA3AF';
                          return (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-md border-2 border-gray-200 shadow-sm"
                              style={{ backgroundColor: bgColor }}
                              title={color.trim()}
                            />
                          );
                        })}
                        {p.colors.split(',').length > 5 && (
                          <span className="text-xs text-gray-500 font-medium">
                            +{p.colors.split(',').length - 5}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  {/* Product */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package size={14} className="text-gray-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{p.name}</span>
                    </div>
                  </td>
                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className={cn("text-xs px-2 py-1 rounded-full font-medium", typeColors[p.productType] ?? "bg-gray-100 text-gray-600")}>
                      {p.productType.replace("_", " ")}
                    </span>
                  </td>
                  {/* Category */}
                  <td className="px-4 py-3 text-sm text-gray-600">{p.category}</td>
                  {/* Brand */}
                  <td className="px-4 py-3 text-sm text-gray-600">{p.brand}</td>
                  {/* Cost - Inline Edit */}
                  <td className="px-4 py-3 text-right">
                    {inlineEdit?.id === p.id && inlineEdit.field === "costPrice" ? (
                      <div className="flex items-center gap-1 justify-end">
                        <input
                          type="number"
                          step="1"
                          value={inlineEdit.value}
                          onChange={(e) => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                          className="w-24 px-2 py-1 text-sm border border-primary-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 text-right"
                          autoFocus
                        />
                        <button onClick={() => handleInlineSave(p.id, "costPrice", inlineEdit.value)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Save">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setInlineEdit(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded" title="Cancel">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setInlineEdit({ id: p.id, field: "costPrice", value: p.costPrice.toString() })}
                        className="text-sm text-gray-600 hover:text-primary-600 hover:underline cursor-pointer"
                      >
                        {formatCurrency(p.costPrice)}
                      </button>
                    )}
                  </td>
                  {/* Price - Inline Edit */}
                  <td className="px-4 py-3 text-right">
                    {inlineEdit?.id === p.id && inlineEdit.field === "sellingPrice" ? (
                      <div className="flex items-center gap-1 justify-end">
                        <input
                          type="number"
                          step="1"
                          value={inlineEdit.value}
                          onChange={(e) => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                          className="w-24 px-2 py-1 text-sm border border-primary-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 text-right"
                          autoFocus
                        />
                        <button onClick={() => handleInlineSave(p.id, "sellingPrice", inlineEdit.value)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Save">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setInlineEdit(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded" title="Cancel">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setInlineEdit({ id: p.id, field: "sellingPrice", value: p.sellingPrice.toString() })}
                        className="text-sm font-medium text-gray-800 hover:text-primary-600 hover:underline cursor-pointer"
                      >
                        {formatCurrency(p.sellingPrice)}
                      </button>
                    )}
                  </td>
                  {/* Stock */}
                  <td className="px-4 py-3 text-center">
                    <span className={cn("text-sm font-medium", p.stock <= 5 ? "text-red-600" : "text-gray-800")}>{p.stock}</span>
                  </td>
                  {/* Sold */}
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-medium text-green-600">{p.sold}</span>
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3 text-center">
                    <span className={cn("text-xs px-2 py-1 rounded-full", p.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500")}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditing(p); setShowModal(true); }} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600" title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDuplicate(p)} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600" title="Duplicate">
                        <Copy size={15} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={12} className="text-center py-12 text-gray-400">No products found</td></tr>
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({
    sku: product?.sku ?? "",
    name: product?.name ?? "",
    productType: product?.productType ?? "frame",
    categoryId: product?.categoryId ?? "",
    brandId: product?.brandId ?? "",
    costPrice: product?.costPrice ?? 0,
    sellingPrice: product?.sellingPrice ?? 0,
    mrp: product?.mrp ?? 0,
    taxRate: product?.taxRate ?? 0,
    imageUrl: product?.imageUrl ?? "",
    description: product?.description ?? "",
    colors: product?.colors ?? "",
  });

  // Fetch tax settings only when adding a new product
  useEffect(() => {
    if (!product) {
      fetch('/api/settings')
        .then(res => res.json())
        .then(settings => {
          const taxEnabled = settings.find((s: any) => s.key === 'tax_enabled')?.value === 'true';
          const taxRateValue = parseFloat(settings.find((s: any) => s.key === 'tax_rate')?.value || '0');
          if (taxEnabled) {
            setForm(prev => ({ ...prev, taxRate: taxRateValue }));
          }
        })
        .catch(err => console.error('Failed to fetch settings:', err));
    }
  }, [product]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });
      
      if (res.ok) {
        const data = await res.json();
        setForm({ ...form, imageUrl: data.url });
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (err) {
      toast.error("Error uploading image");
    }
    setUploadingImage(false);
  }

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
          
          {/* Image Upload Section */}
          <div className="space-y-3">
            <label className="label">Product Image</label>
            
            {/* Image Preview */}
            {form.imageUrl && (
              <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={form.imageUrl} 
                  alt="Product preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Image";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, imageUrl: "" })}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            {/* Upload Button */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={uploadingImage}
                />
                <label
                  htmlFor="image-upload"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition",
                    uploadingImage && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <ImageIcon size={16} />
                  {uploadingImage ? "Uploading..." : "Upload Image"}
                </label>
                <span className="text-xs text-gray-400">Max 5MB</span>
              </div>
              
              {/* Fallback URL Input */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">or</span>
              </div>
              <div>
                <input 
                  value={form.imageUrl} 
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} 
                  className="input text-sm" 
                  placeholder="Enter image URL (https://example.com/image.jpg)"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-[60px]" placeholder="Product description..." />
          </div>
          <div>
            <label className="label">Colors (comma-separated)</label>
            <input 
              type="text" 
              value={form.colors} 
              onChange={(e) => setForm({ ...form, colors: e.target.value })} 
              className="input" 
              placeholder="Black, Gold, Silver, Blue"
            />
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

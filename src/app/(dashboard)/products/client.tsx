"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Package, Edit2, Trash2, Copy, Check, X, Image as ImageIcon, Filter, FolderTree, ArrowUpDown, ArrowUp, ArrowDown, DollarSign } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Product {
  id: string; sku: string; name: string; productType: string;
  categoryId: string; category: string; brandId: string; brand: string;
  costPrice: number; sellingPrice: number; mrp: number; taxRate: number;
  stock: number; sold: number; imageUrl: string; description: string;
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
  const [sortField, setSortField] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showGlobalPrice, setShowGlobalPrice] = useState(false);
  const [globalPriceType, setGlobalPriceType] = useState<"percent" | "fixed">("percent");
  const [globalPriceValue, setGlobalPriceValue] = useState(0);
  const [globalPriceField, setGlobalPriceField] = useState<"sellingPrice" | "costPrice">("sellingPrice");
  const [globalPriceLoading, setGlobalPriceLoading] = useState(false);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || p.productType === typeFilter;
    const matchCategory = !categoryFilter || p.category === categoryFilter;
    const matchBrand = !brandFilter || p.brand === brandFilter;
    return matchSearch && matchType && matchCategory && matchBrand;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    let aVal: any, bVal: any;
    switch (sortField) {
      case "name": aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase(); break;
      case "sku": aVal = a.sku.toLowerCase(); bVal = b.sku.toLowerCase(); break;
      case "costPrice": aVal = a.costPrice; bVal = b.costPrice; break;
      case "sellingPrice": aVal = a.sellingPrice; bVal = b.sellingPrice; break;
      case "stock": aVal = a.stock; bVal = b.stock; break;
      case "sold": aVal = a.sold; bVal = b.sold; break;
      case "isActive": aVal = a.isActive ? 1 : 0; bVal = b.isActive ? 1 : 0; break;
      default: return 0;
    }
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  function toggleSort(field: string) {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function SortIcon({ field }: { field: string }) {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-gray-300 ml-1" />;
    return sortDir === "asc" ? <ArrowUp size={12} className="text-primary-600 ml-1" /> : <ArrowDown size={12} className="text-primary-600 ml-1" />;
  }

  async function handleGlobalPriceUpdate() {
    if (globalPriceValue === 0) return toast.error("Enter a value");
    setGlobalPriceLoading(true);
    try {
      const productIds = filtered.map(p => p.id);
      const res = await fetch("/api/products/global-price", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds, field: globalPriceField, type: globalPriceType, value: globalPriceValue }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Updated ${data.count} products`);
        setShowGlobalPrice(false);
        setGlobalPriceValue(0);
        router.refresh();
      } else toast.error("Failed to update prices");
    } catch { toast.error("Error"); }
    setGlobalPriceLoading(false);
  }

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
        <div className="flex items-center gap-3">
          <button onClick={() => setShowGlobalPrice(true)} className="btn-secondary flex items-center gap-2">
            <DollarSign size={18} /> Global Price Update
          </button>
          <Link href="/categories" className="btn-secondary flex items-center gap-2">
            <FolderTree size={18} /> Categories
          </Link>
          <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Product
          </button>
        </div>
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
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort("sku")}>
                  <span className="flex items-center">SKU <SortIcon field="sku" /></span>
                </th>
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort("name")}>
                  <span className="flex items-center">Product <SortIcon field="name" /></span>
                </th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3 text-right cursor-pointer select-none" onClick={() => toggleSort("costPrice")}>
                  <span className="flex items-center justify-end">Cost <SortIcon field="costPrice" /></span>
                </th>
                <th className="px-4 py-3 text-right cursor-pointer select-none" onClick={() => toggleSort("sellingPrice")}>
                  <span className="flex items-center justify-end">Price <SortIcon field="sellingPrice" /></span>
                </th>
                <th className="px-4 py-3 text-center cursor-pointer select-none" onClick={() => toggleSort("stock")}>
                  <span className="flex items-center justify-center">Stock <SortIcon field="stock" /></span>
                </th>
                <th className="px-4 py-3 text-center cursor-pointer select-none" onClick={() => toggleSort("sold")}>
                  <span className="flex items-center justify-center">Sold <SortIcon field="sold" /></span>
                </th>
                <th className="px-4 py-3 text-center cursor-pointer select-none" onClick={() => toggleSort("isActive")}>
                  <span className="flex items-center justify-center">Status <SortIcon field="isActive" /></span>
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((p) => (
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

      {/* Global Price Update Modal */}
      {showGlobalPrice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setShowGlobalPrice(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Global Price Update</h2>
            <p className="text-sm text-gray-500">Update prices for {filtered.length} filtered product{filtered.length !== 1 ? 's' : ''}</p>
            
            <div>
              <label className="label">Apply To</label>
              <select value={globalPriceField} onChange={(e) => setGlobalPriceField(e.target.value as any)} className="input">
                <option value="sellingPrice">Selling Price</option>
                <option value="costPrice">Cost Price</option>
              </select>
            </div>
            
            <div>
              <label className="label">Update Type</label>
              <div className="flex gap-2">
                <button onClick={() => setGlobalPriceType("percent")} className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition", globalPriceType === "percent" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>By Percentage (%)</button>
                <button onClick={() => setGlobalPriceType("fixed")} className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition", globalPriceType === "fixed" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>Fixed Amount (Rs.)</button>
              </div>
            </div>
            
            <div>
              <label className="label">Value (+increase / −decrease)</label>
              <input type="number" value={globalPriceValue} onChange={(e) => setGlobalPriceValue(parseFloat(e.target.value) || 0)} className="input" placeholder="e.g. 10 for +10%, -5 for -5%" />
              <p className="text-xs text-gray-400 mt-1">
                {globalPriceType === "percent" 
                  ? `Each product's ${globalPriceField === 'sellingPrice' ? 'selling price' : 'cost price'} will change by ${globalPriceValue}%` 
                  : `Rs. ${globalPriceValue} will be added to each product's ${globalPriceField === 'sellingPrice' ? 'selling price' : 'cost price'}`
                }
              </p>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowGlobalPrice(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleGlobalPriceUpdate} disabled={globalPriceLoading} className="btn-primary flex-1">
                {globalPriceLoading ? "Updating..." : "Apply Update"}
              </button>
            </div>
          </div>
        </div>
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
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl ?? null);
  const [form, setForm] = useState({
    sku: product?.sku ?? "",
    name: product?.name ?? "",
    productType: product?.productType ?? "frame",
    categoryId: product?.categoryId ?? "",
    brandId: product?.brandId ?? "",
    costPrice: product?.costPrice ?? 0,
    sellingPrice: product?.sellingPrice ?? 0,
    mrp: product?.mrp ?? 0,
    taxRate: product?.taxRate ?? 18,
    imageUrl: product?.imageUrl ?? "",
    description: product?.description ?? "",
  });

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setForm({ ...form, imageUrl: base64 });
    };
    reader.readAsDataURL(file);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{product ? "Edit Product" : "Add Product"}</h2>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
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
          <div>
            <label className="label">Product Image</label>
            <div className="space-y-3">
              {imagePreview && (
                <div className="relative w-full h-48 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                  <button type="button" onClick={() => { setImagePreview(null); setForm({ ...form, imageUrl: "" }); }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600">
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 transition">
                    <ImageIcon size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Upload Image</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <p className="text-xs text-gray-500">Recommended: Square image, max 2MB (JPG, PNG, WebP)</p>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-[60px]" placeholder="Product description..." />
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
        </form>
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-700">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" onClick={handleSubmit} disabled={loading} className="btn-primary">{loading ? "Saving..." : "Save"}</button>
        </div>
      </div>
    </div>
  );
}

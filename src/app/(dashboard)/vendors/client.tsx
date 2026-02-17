"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Truck, ShoppingCart, Package, DollarSign, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Vendor {
  id: string; vendorCode: string; companyName: string; contactPerson: string;
  phone: string; email: string; city: string; paymentTerms: string;
  creditDays: number; poCount: number; invoiceCount: number; isActive: boolean;
}

interface PurchaseOrder {
  id: string; orderNo: string; vendorId: string; vendorName: string;
  orderDate: string; expectedDate: string; status: 'pending' | 'confirmed' | 'received' | 'cancelled';
  totalAmount: number; itemCount: number; notes?: string;
}

interface Product {
  id: string; name: string; sku: string; category: string; brand: string;
  currentStock: number; minStock: number; maxStock: number; costPrice: number; sellPrice: number;
}

export default function VendorsClient({ vendors, purchaseOrders, products }: { 
  vendors: Vendor[]; 
  purchaseOrders: PurchaseOrder[];
  products: Product[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [activeTab, setActiveTab] = useState<'vendors' | 'orders' | 'inventory'>('vendors');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const filteredVendors = vendors.filter((v) => {
    const term = search.toLowerCase();
    return v.companyName.toLowerCase().includes(term) || v.vendorCode.toLowerCase().includes(term) || v.contactPerson.toLowerCase().includes(term);
  });

  const filteredOrders = purchaseOrders.filter((o) => {
    const term = search.toLowerCase();
    return o.orderNo.toLowerCase().includes(term) || o.vendorName.toLowerCase().includes(term);
  });

  const filteredProducts = products.filter((p) => {
    const term = search.toLowerCase();
    return p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
  });

  async function handleDelete(id: string) {
    if (!confirm("Delete this vendor?")) return;
    const res = await fetch(`/api/vendors/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted"); router.refresh(); } else toast.error("Failed");
  }

  async function handleDeleteOrder(id: string) {
    if (!confirm("Delete this purchase order?")) return;
    const res = await fetch(`/api/purchase-orders/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted"); router.refresh(); } else toast.error("Failed");
  }

  function openPurchaseOrder(vendor: Vendor) {
    setSelectedVendor(vendor);
    setShowPurchaseModal(true);
  }

  function openInventoryUpdate(vendor: Vendor) {
    setSelectedVendor(vendor);
    setShowInventoryModal(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Vendor</button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('vendors')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'vendors'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Truck size={16} className="inline mr-2" />Vendors
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ShoppingCart size={16} className="inline mr-2" />Purchase Orders
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inventory'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package size={16} className="inline mr-2" />Inventory Updates
          </button>
        </nav>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder={`Search ${activeTab === 'vendors' ? 'vendors' : activeTab === 'orders' ? 'purchase orders' : 'products'}...`} 
            className="input pl-10" 
          />
        </div>
      </div>

      {/* Vendors Tab */}
      {activeTab === 'vendors' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="table-header">
                <th className="px-4 py-3">Code</th><th className="px-4 py-3">Company</th><th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Phone</th><th className="px-4 py-3">City</th><th className="px-4 py-3 text-center">POs</th>
                <th className="px-4 py-3 text-center">Credit Days</th><th className="px-4 py-3">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVendors.map((v: Vendor) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{v.vendorCode}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                          <Truck size={14} className="text-orange-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-800">{v.companyName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{v.contactPerson || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{v.phone || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{v.city || "—"}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{v.poCount}</td>
                    <td className="px-4 py-3 text-sm text-center">{v.creditDays}d</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => openPurchaseOrder(v)} 
                          className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600" 
                          title="Create Purchase Order"
                        >
                          <ShoppingCart size={15} />
                        </button>
                        <button 
                          onClick={() => openInventoryUpdate(v)} 
                          className="p-1.5 hover:bg-green-50 rounded-lg text-gray-400 hover:text-green-600" 
                          title="Update Inventory"
                        >
                          <Package size={15} />
                        </button>
                        <button 
                          onClick={() => { setEditing(v); setShowModal(true); }} 
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600" 
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button 
                          onClick={() => handleDelete(v.id)} 
                          className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600" 
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredVendors.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-gray-400">No vendors found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Purchase Orders Tab */}
      {activeTab === 'orders' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Purchase Orders</h3>
            <button 
              onClick={() => { setSelectedVendor(null); setShowPurchaseModal(true); }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} /> New Purchase Order
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="table-header">
                <th className="px-4 py-3">Order No</th><th className="px-4 py-3">Vendor</th><th className="px-4 py-3">Order Date</th>
                <th className="px-4 py-3">Expected Date</th><th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total Amount</th><th className="px-4 py-3 text-center">Items</th>
                <th className="px-4 py-3"></th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order: PurchaseOrder) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-primary-600">{order.orderNo}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{order.vendorName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.orderDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.expectedDate}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'received' ? 'bg-green-100 text-green-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-center">{order.itemCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                          <Eye size={15} />
                        </button>
                        <button 
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-gray-400">No purchase orders found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Updates Tab */}
      {activeTab === 'inventory' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Product Inventory</h3>
            <button 
              onClick={() => setShowInventoryModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} /> Update Inventory
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="table-header">
                <th className="px-4 py-3">Product</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Brand</th><th className="px-4 py-3 text-center">Current Stock</th>
                <th className="px-4 py-3 text-right">Cost Price</th><th className="px-4 py-3 text-right">Sell Price</th>
                <th className="px-4 py-3"></th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product: Product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{product.name}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{product.sku}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.brand}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        product.currentStock <= product.minStock ? 'bg-red-100 text-red-800' :
                        product.currentStock >= product.maxStock ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {product.currentStock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono">${product.costPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono">${product.sellPrice.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600">
                          <Package size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-gray-400">No products found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && <VendorModal vendor={editing} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); router.refresh(); }} />}
    </div>
  );
}

function VendorModal({ vendor, onClose, onSaved }: { vendor: Vendor | null; onClose: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    companyName: vendor?.companyName ?? "", contactPerson: vendor?.contactPerson ?? "",
    phone: vendor?.phone ?? "", email: vendor?.email ?? "", city: vendor?.city ?? "",
    creditDays: vendor?.creditDays ?? 30,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const url = vendor ? `/api/vendors/${vendor.id}` : "/api/vendors";
    const method = vendor ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { toast.success(vendor ? "Updated" : "Created"); onSaved(); } else toast.error("Failed");
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-semibold">{vendor ? "Edit Vendor" : "Add Vendor"}</h2></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="label">Company Name</label><input value={form.companyName} onChange={(e) => setForm({...form, companyName: e.target.value})} className="input" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Contact Person</label><input value={form.contactPerson} onChange={(e) => setForm({...form, contactPerson: e.target.value})} className="input" /></div>
            <div><label className="label">Phone</label><input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="input" /></div>
          </div>
          <div><label className="label">Email</label><input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="input" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">City</label><input value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="input" /></div>
            <div><label className="label">Credit Days</label><input type="number" value={form.creditDays} onChange={(e) => setForm({...form, creditDays: +e.target.value})} className="input" /></div>
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

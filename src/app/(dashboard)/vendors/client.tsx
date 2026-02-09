"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Vendor {
  id: string; vendorCode: string; companyName: string; contactPerson: string;
  phone: string; email: string; city: string; paymentTerms: string;
  creditDays: number; poCount: number; invoiceCount: number; isActive: boolean;
}

export default function VendorsClient({ vendors }: { vendors: Vendor[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);

  const filtered = vendors.filter((v) => {
    const term = search.toLowerCase();
    return v.companyName.toLowerCase().includes(term) || v.vendorCode.toLowerCase().includes(term) || v.contactPerson.toLowerCase().includes(term);
  });

  async function handleDelete(id: string) {
    if (!confirm("Delete this vendor?")) return;
    const res = await fetch(`/api/vendors/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted"); router.refresh(); } else toast.error("Failed");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Vendor</button>
      </div>

      <div className="card p-4">
        <div className="relative"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendors..." className="input pl-10" /></div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="table-header">
              <th className="px-4 py-3">Code</th><th className="px-4 py-3">Company</th><th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Phone</th><th className="px-4 py-3">City</th><th className="px-4 py-3 text-center">POs</th>
              <th className="px-4 py-3 text-center">Credit Days</th><th className="px-4 py-3"></th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{v.vendorCode}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center"><Truck size={14} className="text-orange-500" /></div><span className="text-sm font-medium text-gray-800">{v.companyName}</span></div></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{v.contactPerson || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{v.phone || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{v.city || "—"}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">{v.poCount}</td>
                  <td className="px-4 py-3 text-sm text-center">{v.creditDays}d</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1">
                    <button onClick={() => { setEditing(v); setShowModal(true); }} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"><Edit2 size={15} /></button>
                    <button onClick={() => handleDelete(v.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
                  </div></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-gray-400">No vendors found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

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

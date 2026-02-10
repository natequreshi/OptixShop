"use client";

import { useState } from "react";
import { Plus, Search, Eye, Edit2, Trash2, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Rx {
  id: string; prescriptionNo: string; customerName: string; customerId: string;
  prescribedBy: string; prescriptionDate: string; expiryDate: string;
  odSphere: number | null; odCylinder: number | null; odAxis: number | null; odAdd: number | null;
  osSphere: number | null; osCylinder: number | null; osAxis: number | null; osAdd: number | null;
  photoUrl: string | null;
}

export default function PrescriptionsClient({ prescriptions, customers }: {
  prescriptions: Rx[];
  customers: { id: string; name: string; no: string }[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewing, setViewing] = useState<Rx | null>(null);

  const filtered = prescriptions.filter((p) => {
    const term = search.toLowerCase();
    return p.prescriptionNo.toLowerCase().includes(term) || p.customerName.toLowerCase().includes(term);
  });

  async function handleDelete(id: string) {
    if (!confirm("Delete this prescription?")) return;
    const res = await fetch(`/api/prescriptions/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted"); router.refresh(); }
    else toast.error("Failed");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Prescription</button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search prescriptions..." className="input pl-10" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3">Rx No</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-center">OD (SPH/CYL/AXIS)</th>
                <th className="px-4 py-3 text-center">OS (SPH/CYL/AXIS)</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-primary-600">{p.prescriptionNo}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.customerName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.prescribedBy || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(p.prescriptionDate)}</td>
                  <td className="px-4 py-3 text-sm text-center font-mono text-gray-700">
                    {p.odSphere ?? "—"} / {p.odCylinder ?? "—"} × {p.odAxis ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-center font-mono text-gray-700">
                    {p.osSphere ?? "—"} / {p.osCylinder ?? "—"} × {p.osAxis ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewing(p)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"><Eye size={15} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-gray-400">No prescriptions found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-primary-600" size={24} />
              <div>
                <h3 className="text-lg font-semibold">{viewing.prescriptionNo}</h3>
                <p className="text-sm text-gray-500">{viewing.customerName}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500">Doctor</p><p className="font-medium">{viewing.prescribedBy || "—"}</p></div>
              <div><p className="text-gray-500">Date</p><p className="font-medium">{formatDate(viewing.prescriptionDate)}</p></div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-700 mb-2">Right Eye (OD)</p>
                <div className="text-sm space-y-1">
                  <p>SPH: <b>{viewing.odSphere ?? "—"}</b></p>
                  <p>CYL: <b>{viewing.odCylinder ?? "—"}</b></p>
                  <p>AXIS: <b>{viewing.odAxis ?? "—"}</b></p>
                  <p>ADD: <b>{viewing.odAdd ?? "—"}</b></p>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-700 mb-2">Left Eye (OS)</p>
                <div className="text-sm space-y-1">
                  <p>SPH: <b>{viewing.osSphere ?? "—"}</b></p>
                  <p>CYL: <b>{viewing.osCylinder ?? "—"}</b></p>
                  <p>AXIS: <b>{viewing.osAxis ?? "—"}</b></p>
                  <p>ADD: <b>{viewing.osAdd ?? "—"}</b></p>
                </div>
              </div>
            </div>
            {viewing.photoUrl && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Prescription Image</p>
                <img src={viewing.photoUrl} alt="Prescription" className="w-full rounded-lg border border-gray-200 object-contain max-h-64" />
              </div>
            )}
            <button onClick={() => setViewing(null)} className="btn-secondary w-full mt-4">Close</button>
          </div>
        </div>
      )}

      {showModal && (
        <RxModal customers={customers} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); router.refresh(); }} />
      )}
    </div>
  );
}

function RxModal({ customers, onClose, onSaved }: { customers: { id: string; name: string }[]; onClose: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(false);
  const [customerList, setCustomerList] = useState(customers);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustFirst, setNewCustFirst] = useState("");
  const [newCustLast, setNewCustLast] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [creatingCust, setCreatingCust] = useState(false);
  const [form, setForm] = useState({
    customerId: "", prescribedBy: "", prescriptionDate: new Date().toISOString().split("T")[0],
    odSphere: "", odCylinder: "", odAxis: "", odAdd: "",
    osSphere: "", osCylinder: "", osAxis: "", osAdd: "",
    photoUrl: "",
  });

  async function handleCreateCustomer() {
    if (!newCustFirst || !newCustPhone) { toast.error("Name and phone are required"); return; }
    setCreatingCust(true);
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: newCustFirst, lastName: newCustLast, phone: newCustPhone }),
    });
    if (res.ok) {
      const cust = await res.json();
      const name = `${cust.firstName} ${cust.lastName ?? ""}`.trim();
      setCustomerList([...customerList, { id: cust.id, name }]);
      setForm({ ...form, customerId: cust.id });
      setShowNewCustomer(false);
      setNewCustFirst(""); setNewCustLast(""); setNewCustPhone("");
      toast.success("Customer created!");
    } else toast.error("Failed to create customer");
    setCreatingCust(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        odSphere: form.odSphere ? +form.odSphere : null,
        odCylinder: form.odCylinder ? +form.odCylinder : null,
        odAxis: form.odAxis ? +form.odAxis : null,
        odAdd: form.odAdd ? +form.odAdd : null,
        osSphere: form.osSphere ? +form.osSphere : null,
        osCylinder: form.osCylinder ? +form.osCylinder : null,
        osAxis: form.osAxis ? +form.osAxis : null,
        osAdd: form.osAdd ? +form.osAdd : null,
      }),
    });
    if (res.ok) { toast.success("Created"); onSaved(); }
    else toast.error("Failed");
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-semibold">New Prescription</h2></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="label">Patient</label>
            <div className="flex gap-2">
              <select value={form.customerId} onChange={(e) => setForm({...form, customerId: e.target.value})} className="input flex-1" required>
                <option value="">Select patient...</option>
                {customerList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button type="button" onClick={() => setShowNewCustomer(!showNewCustomer)} className="btn-secondary text-xs whitespace-nowrap">
                {showNewCustomer ? "Cancel" : "+ New"}
              </button>
            </div>
            {showNewCustomer && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="First name *" value={newCustFirst} onChange={(e) => setNewCustFirst(e.target.value)} className="input text-sm" />
                  <input placeholder="Last name" value={newCustLast} onChange={(e) => setNewCustLast(e.target.value)} className="input text-sm" />
                </div>
                <input placeholder="Phone *" value={newCustPhone} onChange={(e) => setNewCustPhone(e.target.value)} className="input text-sm" />
                <button type="button" onClick={handleCreateCustomer} disabled={creatingCust} className="btn-primary text-xs w-full">
                  {creatingCust ? "Creating..." : "Create Customer"}
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Doctor</label><input value={form.prescribedBy} onChange={(e) => setForm({...form, prescribedBy: e.target.value})} className="input" /></div>
            <div><label className="label">Date</label><input type="date" value={form.prescriptionDate} onChange={(e) => setForm({...form, prescriptionDate: e.target.value})} className="input" /></div>
          </div>
          <p className="text-sm font-semibold text-blue-700">Right Eye (OD)</p>
          <div className="grid grid-cols-4 gap-3">
            <div><label className="label text-xs">SPH</label><input value={form.odSphere} onChange={(e) => setForm({...form, odSphere: e.target.value})} className="input" /></div>
            <div><label className="label text-xs">CYL</label><input value={form.odCylinder} onChange={(e) => setForm({...form, odCylinder: e.target.value})} className="input" /></div>
            <div><label className="label text-xs">AXIS</label><input value={form.odAxis} onChange={(e) => setForm({...form, odAxis: e.target.value})} className="input" /></div>
            <div><label className="label text-xs">ADD</label><input value={form.odAdd} onChange={(e) => setForm({...form, odAdd: e.target.value})} className="input" /></div>
          </div>
          <p className="text-sm font-semibold text-green-700">Left Eye (OS)</p>
          <div className="grid grid-cols-4 gap-3">
            <div><label className="label text-xs">SPH</label><input value={form.osSphere} onChange={(e) => setForm({...form, osSphere: e.target.value})} className="input" /></div>
            <div><label className="label text-xs">CYL</label><input value={form.osCylinder} onChange={(e) => setForm({...form, osCylinder: e.target.value})} className="input" /></div>
            <div><label className="label text-xs">AXIS</label><input value={form.osAxis} onChange={(e) => setForm({...form, osAxis: e.target.value})} className="input" /></div>
            <div><label className="label text-xs">ADD</label><input value={form.osAdd} onChange={(e) => setForm({...form, osAdd: e.target.value})} className="input" /></div>
          </div>
          <div>
            <label className="label">Prescription Photo (Optional)</label>
            <div className="flex items-start gap-4">
              {form.photoUrl && (
                <div className="relative group">
                  <img src={form.photoUrl} alt="Prescription" className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
                  <button type="button" onClick={() => setForm({...form, photoUrl: ""})} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 1048576) { alert("File must be less than 1MB"); return; }
                    const fd = new FormData();
                    fd.append("file", file);
                    const res = await fetch("/api/upload-image", { method: "POST", body: fd });
                    if (res.ok) {
                      const data = await res.json();
                      setForm({...form, photoUrl: data.url});
                    } else {
                      alert("Failed to upload image");
                    }
                  }}
                  className="input text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                <p className="text-xs text-gray-500 mt-1">Upload prescription photo (max 1MB)</p>
              </div>
            </div>
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

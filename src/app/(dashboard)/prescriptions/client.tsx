"use client";

import { useState } from "react";
import { Plus, Search, Eye, Edit2, Trash2, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import OpticalDisplayGrid from "@/components/OpticalDisplayGrid";

interface Rx {
  id: string;
  prescriptionNo: string;
  customerName: string;
  customerId: string;
  prescribedBy: string;
  prescriptionDate: string;
  expiryDate: string;
  // Right Eye (OD)
  odDistanceSphere: number | null;
  odDistanceCylinder: number | null;
  odDistanceAxis: number | null;
  odNearSphere: number | null;
  odNearCylinder: number | null;
  odNearAxis: number | null;
  odAddSphere: number | null;
  odAddCylinder: number | null;
  odAddAxis: number | null;
  odPd: number | null;
  // Left Eye (OS)
  osDistanceSphere: number | null;
  osDistanceCylinder: number | null;
  osDistanceAxis: number | null;
  osNearSphere: number | null;
  osNearCylinder: number | null;
  osNearAxis: number | null;
  osAddSphere: number | null;
  osAddCylinder: number | null;
  osAddAxis: number | null;
  osPd: number | null;
  // Other fields
  photoUrl?: string | null;
  notes?: string | null;
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
                    {p.odDistanceSphere ?? "—"} / {p.odDistanceCylinder ?? "—"} × {p.odDistanceAxis ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-center font-mono text-gray-700">
                    {p.osDistanceSphere ?? "—"} / {p.osDistanceCylinder ?? "—"} × {p.osDistanceAxis ?? "—"}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <FileText className="text-primary-600" size={24} />
                <div>
                  <h3 className="text-lg font-semibold">{viewing.prescriptionNo}</h3>
                  <p className="text-sm text-gray-500">{viewing.customerName}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div><p className="text-gray-500">Doctor</p><p className="font-medium">{viewing.prescribedBy || "—"}</p></div>
                <div><p className="text-gray-500">Date</p><p className="font-medium">{formatDate(viewing.prescriptionDate)}</p></div>
              </div>
              <OpticalDisplayGrid 
                data={{
                  distanceOdSphere: viewing.odDistanceSphere,
                  distanceOdCylinder: viewing.odDistanceCylinder,
                  distanceOdAxis: viewing.odDistanceAxis,
                  distanceOsSphere: viewing.osDistanceSphere,
                  distanceOsCylinder: viewing.osDistanceCylinder,
                  distanceOsAxis: viewing.osDistanceAxis,
                  nearOdSphere: viewing.odNearSphere,
                  nearOdCylinder: viewing.odNearCylinder,
                  nearOdAxis: viewing.odNearAxis,
                  nearOsSphere: viewing.osNearSphere,
                  nearOsCylinder: viewing.osNearCylinder,
                  nearOsAxis: viewing.osNearAxis,
                  addOdSphere: viewing.odAddSphere,
                  addOdCylinder: viewing.odAddCylinder,
                  addOdAxis: viewing.odAddAxis,
                  addOsSphere: viewing.osAddSphere,
                  addOsCylinder: viewing.osAddCylinder,
                  addOsAxis: viewing.osAddAxis,
                }}
                showColors={true}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button onClick={() => setViewing(null)} className="btn-primary">Close</button>
            </div>
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
    // Right Eye (OD)
    odDistanceSphere: "", odDistanceCylinder: "", odDistanceAxis: "",
    odNearSphere: "", odNearCylinder: "", odNearAxis: "",
    odAddSphere: "", odAddCylinder: "", odAddAxis: "",
    odPd: "",
    // Left Eye (OS)
    osDistanceSphere: "", osDistanceCylinder: "", osDistanceAxis: "",
    osNearSphere: "", osNearCylinder: "", osNearAxis: "",
    osAddSphere: "", osAddCylinder: "", osAddAxis: "",
    osPd: "",
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
        odDistanceSphere: form.odDistanceSphere ? +form.odDistanceSphere : null,
        odDistanceCylinder: form.odDistanceCylinder ? +form.odDistanceCylinder : null,
        odDistanceAxis: form.odDistanceAxis ? +form.odDistanceAxis : null,
        odNearSphere: form.odNearSphere ? +form.odNearSphere : null,
        odNearCylinder: form.odNearCylinder ? +form.odNearCylinder : null,
        odNearAxis: form.odNearAxis ? +form.odNearAxis : null,
        odAddSphere: form.odAddSphere ? +form.odAddSphere : null,
        odAddCylinder: form.odAddCylinder ? +form.odAddCylinder : null,
        odAddAxis: form.odAddAxis ? +form.odAddAxis : null,
        odPd: form.odPd ? +form.odPd : null,
        osDistanceSphere: form.osDistanceSphere ? +form.osDistanceSphere : null,
        osDistanceCylinder: form.osDistanceCylinder ? +form.osDistanceCylinder : null,
        osDistanceAxis: form.osDistanceAxis ? +form.osDistanceAxis : null,
        osNearSphere: form.osNearSphere ? +form.osNearSphere : null,
        osNearCylinder: form.osNearCylinder ? +form.osNearCylinder : null,
        osNearAxis: form.osNearAxis ? +form.osNearAxis : null,
        osAddSphere: form.osAddSphere ? +form.osAddSphere : null,
        osAddCylinder: form.osAddCylinder ? +form.osAddCylinder : null,
        osAddAxis: form.osAddAxis ? +form.osAddAxis : null,
        osPd: form.osPd ? +form.osPd : null,
      }),
    });
    if (res.ok) { toast.success("Created"); onSaved(); }
    else toast.error("Failed");
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-semibold">New Prescription</h2></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Right Eye (OD) */}
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-3">Right Eye (OD)</p>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border-r border-b px-3 py-2 text-left font-medium">&nbsp;</th>
                      <th className="border-r border-b px-3 py-2 text-center font-medium">Sphere</th>
                      <th className="border-r border-b px-3 py-2 text-center font-medium">Cylinder</th>
                      <th className="border-b px-3 py-2 text-center font-medium">Axis</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-r border-b px-3 py-2 font-medium">Distance</td>
                      <td className="border-r border-b px-2 py-2"><input value={form.odDistanceSphere} onChange={e => setForm({...form, odDistanceSphere: e.target.value})} className="input input-sm w-full text-center" /></td>
                      <td className="border-r border-b px-2 py-2"><input value={form.odDistanceCylinder} onChange={e => setForm({...form, odDistanceCylinder: e.target.value})} className="input input-sm w-full text-center" /></td>
                      <td className="border-b px-2 py-2"><input value={form.odDistanceAxis} onChange={e => setForm({...form, odDistanceAxis: e.target.value})} className="input input-sm w-full text-center" /></td>
                    </tr>
                    <tr>
                      <td className="border-r border-b px-3 py-2 font-medium">Near</td>
                      <td className="border-r border-b px-2 py-2"><input value={form.odNearSphere} onChange={e => setForm({...form, odNearSphere: e.target.value})} className="input input-sm w-full text-center" /></td>
                      <td className="border-r border-b px-2 py-2"><input value={form.odNearCylinder} onChange={e => setForm({...form, odNearCylinder: e.target.value})} className="input input-sm w-full text-center" /></td>
                      <td className="border-b px-2 py-2"><input value={form.odNearAxis} onChange={e => setForm({...form, odNearAxis: e.target.value})} className="input input-sm w-full text-center" /></td>
                    </tr>
                    <tr>
                      <td className="border-r border-b px-3 py-2 font-medium">Add</td>
                      <td className="border-r border-b px-2 py-2"><input value={form.odAddSphere} onChange={e => setForm({...form, odAddSphere: e.target.value})} className="input input-sm w-full text-center" /></td>
                      <td className="border-r border-b px-2 py-2"><input value={form.odAddCylinder} onChange={e => setForm({...form, odAddCylinder: e.target.value})} className="input input-sm w-full text-center" /></td>
                      <td className="border-b px-2 py-2"><input value={form.odAddAxis} onChange={e => setForm({...form, odAddAxis: e.target.value})} className="input input-sm w-full text-center" /></td>
                    </tr>
                    <tr>
                      <td className="border-r px-3 py-2 font-medium">PD</td>
                      <td className="border-r px-2 py-2" colSpan={3}><input value={form.odPd} onChange={e => setForm({...form, odPd: e.target.value})} className="input input-sm w-full text-center" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/* Left Eye (OS) */}
            <div>
              <p className="text-sm font-semibold text-green-700 mb-3">Left Eye (OS)</p>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border-r border-b px-3 py-2 text-left font-medium">&nbsp;</th>
                      <th className="border-r border-b px-3 py-2 text-center font-medium">Sphere</th>
                      <th className="border-r border-b px-3 py-2 text-center font-medium">Cylinder</th>
                      <th className="border-b px-3 py-2 text-center font-medium">Axis</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-r border-b px-3 py-2 font-medium">Distance</td>
                      <td className="border-r border-b px-2 py-2"><input value={form.osDistanceSphere} onChange={e => setForm({...form, osDistanceSphere: e.target.value})} className="input input-sm w-full text-center" /></td>
                      <td className="border-r border-b px-2 py-2"><input value={form.osDistanceCylinder} onChange={e => setForm({...form, osDistanceCylinder: e.target.value})} className="input input-sm w-full text-center" /></td>
                      <td className="border-b px-2 py-2"><input value={form.osDistanceAxis} onChange={e => setForm({...form, osDistanceAxis: e.target.value})} className="input input-sm w-full text-center" /></td>
                    </tr>
                    <tr>
                      <td className="border-r border-b px-3 py-2 font-medium">Near</td>
                      <td className="border-r border-b px-2 py-2"><input value={form.osNearSphere} onChange={e => setForm({...form, osNearSphere: e.target.value})} className="input input-sm w-full text-center" /></td>
                      <td className="border-r border-b px-2 py-2"><input value={form.osNearCylinder} onChange={e => setForm({...form, osNearCylinder: e.target.value})} className="input input-sm w-full text-center" /></td>
                      <td className="border-b px-2 py-2"><input value={form.osNearAxis} onChange={e => setForm({...form, osNearAxis: e.target.value})} className="input input-sm w-full text-center" /></td>
                    </tr>
                    <tr>
                      <td className="border-r border-b px-3 py-2 font-medium">Add</td>
                      <td className="border-r border-b px-2 py-2"><input value={form.osAddSphere} onChange={e => setForm({...form, osAddSphere: e.target.value})} className="input input-sm w-full text-center" /></td>
                      <td className="border-r border-b px-2 py-2"><input value={form.osAddCylinder} onChange={e => setForm({...form, osAddCylinder: e.target.value})} className="input input-sm w-full text-center" /></td>
                      <td className="border-b px-2 py-2"><input value={form.osAddAxis} onChange={e => setForm({...form, osAddAxis: e.target.value})} className="input input-sm w-full text-center" /></td>
                    </tr>
                    <tr>
                      <td className="border-r px-3 py-2 font-medium">PD</td>
                      <td className="border-r px-2 py-2" colSpan={3}><input value={form.osPd} onChange={e => setForm({...form, osPd: e.target.value})} className="input input-sm w-full text-center" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
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

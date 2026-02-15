"use client";

import { useState, useEffect } from "react";
import {
  Plus, Search, Edit2, Trash2, ChevronDown, ChevronRight,
  Phone, Mail, MapPin, Columns, MessageCircle, Globe,
  ShoppingBag, FileText, Calendar, Package, User, Eye,
} from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

/* ── Types ─────────────────────────────────────── */
interface RxData {
  prescriptionNo: string; date: string;
  odSph: number | null; odCyl: number | null; odAxis: number | null;
  osSph: number | null; osCyl: number | null; osAxis: number | null;
}
interface SaleItem { productName: string; quantity: number; total: number; }
interface SaleRecord { id: string; invoiceNo: string; date: string; totalAmount: number; status: string; items: SaleItem[]; }

interface Customer {
  id: string; customerNo: string; firstName: string; lastName: string;
  phone: string; whatsapp: string; email: string; city: string;
  country: string; gender: string; address: string; state: string;
  loyaltyPoints: number; totalPurchases: number; salesCount: number;
  rxCount: number; isActive: boolean;
  latestRx: RxData | null; sales: SaleRecord[];
}

type ColumnKey = "whatsapp" | "email" | "city" | "country" | "odRx" | "osRx" | "purchases" | "totalSpent";

const ALL_COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
  { key: "city", label: "City" },
  { key: "country", label: "Country" },
  { key: "odRx", label: "OD (Rx)" },
  { key: "osRx", label: "OS (Rx)" },
  { key: "purchases", label: "Purchases" },
  { key: "totalSpent", label: "Total Spent" },
];

const DEFAULT_COLUMNS: ColumnKey[] = ["whatsapp", "city", "odRx", "osRx", "purchases", "totalSpent"];

function getInitialColumns(settings: Record<string, string>): ColumnKey[] {
  const raw = settings["customer_visible_columns"];
  if (raw) {
    try { return JSON.parse(raw) as ColumnKey[]; } catch { /* fallback */ }
  }
  return DEFAULT_COLUMNS;
}

/* ── Format Rx Value ──────────────────────────── */
function fmtRx(val: number | null | undefined): string {
  if (val === null || val === undefined) return "—";
  return val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2);
}

/* ── Main Component ────────────────────────────── */
export default function CustomersClient({ customers, settings }: { customers: Customer[]; settings: Record<string, string> }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [visibleCols, setVisibleCols] = useState<ColumnKey[]>(getInitialColumns(settings));
  const [showColPicker, setShowColPicker] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyCustomerId, setHistoryCustomerId] = useState<string | null>(null);
  
  const availableColumns = ALL_COLUMNS;

  const filtered = customers.filter((c) => {
    const term = search.toLowerCase();
    return c.firstName.toLowerCase().includes(term) ||
      c.lastName.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      c.whatsapp.includes(term) ||
      c.customerNo.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term);
  });

  async function handleDelete(id: string) {
    if (!confirm("Delete this customer?")) return;
    const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted"); router.refresh(); }
    else toast.error("Failed");
  }

  function toggleColumn(col: ColumnKey) {
    setVisibleCols((prev) => prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]);
  }

  async function saveColumnPrefs(cols: ColumnKey[]) {
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_visible_columns: JSON.stringify(cols) }),
    });
  }

  function openHistory(customerId: string) {
    setHistoryCustomerId(customerId);
    setShowHistoryModal(true);
  }

  const isCol = (k: ColumnKey) => visibleCols.includes(k);
  
  const colCount = 2 + visibleCols.length + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <div className="flex items-center gap-3">
          {/* Column picker */}
          <div className="relative">
            <button onClick={() => setShowColPicker(!showColPicker)} className="btn-secondary flex items-center gap-2" title="Configure columns">
              <Columns size={16} /> Columns
            </button>
            {showColPicker && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 p-3 z-50">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Visible Columns</p>
                {availableColumns.map((col) => (
                  <label key={col.key} className="flex items-center gap-2 py-1.5 cursor-pointer text-sm text-gray-700 hover:text-gray-900">
                    <input type="checkbox" checked={visibleCols.includes(col.key)} onChange={() => toggleColumn(col.key)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    {col.label}
                  </label>
                ))}
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <button onClick={() => { saveColumnPrefs(visibleCols); setShowColPicker(false); toast.success("Column preferences saved"); }}
                    className="text-xs text-primary-600 font-medium hover:text-primary-700">Save as Default</button>
                </div>
              </div>
            )}
          </div>
          <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Customer
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, phone, WhatsApp, email..." className="input pl-10" />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-3 py-3 w-8"></th>
                <th className="px-4 py-3 text-left">Customer</th>
                {isCol("whatsapp") && <th className="px-4 py-3 text-left">WhatsApp</th>}
                {isCol("email") && <th className="px-4 py-3 text-left">Email</th>}
                {isCol("city") && <th className="px-4 py-3 text-left">City</th>}
                {isCol("country") && <th className="px-4 py-3 text-left">Country</th>}
                {isCol("odRx") && <th className="px-4 py-3 text-center">OD (Rx)</th>}
                {isCol("osRx") && <th className="px-4 py-3 text-center">OS (Rx)</th>}
                {isCol("purchases") && <th className="px-4 py-3 text-center">Purchases</th>}
                {isCol("totalSpent") && <th className="px-4 py-3 text-right">Total Spent</th>}
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <CustomerRow
                  key={c.id}
                  customer={c}
                  visibleCols={visibleCols}
                  colCount={colCount}
                  onEdit={() => { setEditing(c); setShowModal(true); }}
                  onDelete={() => handleDelete(c.id)}
                  onViewHistory={() => openHistory(c.id)}
                />
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={colCount} className="text-center py-12 text-gray-400">No customers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <CustomerModal customer={editing} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); router.refresh(); }} />
      )}

      {showHistoryModal && historyCustomerId && (
        <CustomerHistoryModal customerId={historyCustomerId} onClose={() => { setShowHistoryModal(false); setHistoryCustomerId(null); }} />
      )}
    </div>
  );
}

/* ── Customer Row ──────────────────────────────── */
function CustomerRow({ customer: c, visibleCols, colCount, onEdit, onDelete, onViewHistory }: {
  customer: Customer; visibleCols: ColumnKey[]; colCount: number;
  onEdit: () => void; onDelete: () => void; onViewHistory: () => void;
}) {
  const isCol = (k: ColumnKey) => visibleCols.includes(k);
  const rx = c.latestRx;

  return (
    <>
      <tr className="hover:bg-gray-50 group">
        {/* Expand toggle - removed, now using modal */}
        <td className="px-3 py-3">
          <span className="w-6 h-6 block" />
        </td>
        {/* Customer */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-50 rounded-full flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0">
              {c.firstName.charAt(0)}{c.lastName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{c.firstName} {c.lastName}</p>
              <p className="text-xs text-gray-400">{c.customerNo}</p>
            </div>
          </div>
        </td>
        {/* WhatsApp */}
        {isCol("whatsapp") && (
          <td className="px-4 py-3 text-sm">
            {c.whatsapp ? (
              <a href={`https://wa.me/${c.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-green-600 hover:text-green-700 font-medium">
                <MessageCircle size={14} /> {c.whatsapp}
              </a>
            ) : <span className="text-gray-400">—</span>}
          </td>
        )}
        {/* Email */}
        {isCol("email") && (
          <td className="px-4 py-3 text-sm text-gray-600">
            {c.email ? (
              <span className="flex items-center gap-1.5"><Mail size={13} className="text-gray-400" />{c.email}</span>
            ) : "—"}
          </td>
        )}
        {/* City */}
        {isCol("city") && (
          <td className="px-4 py-3 text-sm text-gray-600">
            {c.city ? (
              <span className="flex items-center gap-1.5"><MapPin size={13} className="text-gray-400" />{c.city}</span>
            ) : "—"}
          </td>
        )}
        {/* Country */}
        {isCol("country") && (
          <td className="px-4 py-3 text-sm text-gray-600">
            {c.country ? (
              <span className="flex items-center gap-1.5"><Globe size={13} className="text-gray-400" />{c.country}</span>
            ) : "—"}
          </td>
        )}
        {/* OD Rx */}
        {isCol("odRx") && (
          <td className="px-4 py-3 text-center">
            {rx ? (
              <div className="text-xs font-mono">
                <span className="text-gray-600">{fmtRx(rx.odSph)}</span>
                <span className="text-gray-400 mx-0.5">/</span>
                <span className="text-gray-600">{fmtRx(rx.odCyl)}</span>
                <span className="text-gray-400 mx-0.5">×</span>
                <span className="text-gray-600">{rx.odAxis ?? "—"}°</span>
              </div>
            ) : <span className="text-xs text-gray-300">No Rx</span>}
          </td>
        )}
        {/* OS Rx */}
        {isCol("osRx") && (
          <td className="px-4 py-3 text-center">
            {rx ? (
              <div className="text-xs font-mono">
                <span className="text-gray-600">{fmtRx(rx.osSph)}</span>
                <span className="text-gray-400 mx-0.5">/</span>
                <span className="text-gray-600">{fmtRx(rx.osCyl)}</span>
                <span className="text-gray-400 mx-0.5">×</span>
                <span className="text-gray-600">{rx.osAxis ?? "—"}°</span>
              </div>
            ) : <span className="text-xs text-gray-300">No Rx</span>}
          </td>
        )}
        {/* Purchases */}
        {isCol("purchases") && (
          <td className="px-4 py-3 text-center">
            <span className={cn("inline-flex items-center gap-1 text-sm font-medium rounded-full px-2.5 py-0.5",
                c.salesCount > 0 ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-400"
              )}>
              <ShoppingBag size={13} /> {c.salesCount}
            </span>
          </td>
        )}
        {/* Total Spent */}
        {isCol("totalSpent") && (
          <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">{formatCurrency(c.totalPurchases)}</td>
        )}
        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <button onClick={onViewHistory} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600" title="View History">
              <Eye size={15} />
            </button>
            <button onClick={onEdit} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600" title="Edit"><Edit2 size={15} /></button>
            <button onClick={onDelete} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600" title="Delete"><Trash2 size={15} /></button>
          </div>
        </td>
      </tr>
    </>
  );
}

/* ── Customer Modal ────────────────────────────── */
function CustomerModal({ customer, onClose, onSaved }: { customer: Customer | null; onClose: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: customer?.firstName ?? "",
    lastName: customer?.lastName ?? "",
    whatsapp: customer?.whatsapp ?? "",
    email: customer?.email ?? "",
    gender: customer?.gender ?? "",
    address: customer?.address ?? "",
    city: customer?.city ?? "",
    state: customer?.state ?? "",
    country: customer?.country ?? "Pakistan",
    // Rx fields
    odSphere: "",
    odCylinder: "",
    odAxis: "",
    odAdd: "",
    osSphere: "",
    osCylinder: "",
    osAxis: "",
    osAdd: "",
  });
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Google Maps address autocomplete
  async function handleAddressChange(value: string) {
    set("address", value);
    if (value.length < 3) { setAddressSuggestions([]); setShowSuggestions(false); return; }
    // If Google Maps is loaded, use it
    if (typeof window !== "undefined" && (window as any).google?.maps?.places) {
      const service = new (window as any).google.maps.places.AutocompleteService();
      service.getPlacePredictions({ input: value, types: ["geocode"] }, (predictions: any[]) => {
        if (predictions) { setAddressSuggestions(predictions); setShowSuggestions(true); }
      });
    }
  }

  function selectPlace(placeId: string, description: string) {
    set("address", description);
    setShowSuggestions(false);
    if ((window as any).google?.maps?.places) {
      const service = new (window as any).google.maps.places.PlacesService(document.createElement("div"));
      service.getDetails({ placeId, fields: ["address_components"] }, (place: any) => {
        if (place?.address_components) {
          for (const comp of place.address_components) {
            if (comp.types.includes("locality")) set("city", comp.long_name);
            if (comp.types.includes("administrative_area_level_1")) set("state", comp.long_name);
            if (comp.types.includes("country")) set("country", comp.long_name);
          }
        }
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const url = customer ? `/api/customers/${customer.id}` : "/api/customers";
    const method = customer ? "PUT" : "POST";

    // Build payload with Rx data
    const payload: any = {
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.whatsapp, // use whatsapp as phone too
      whatsapp: form.whatsapp,
      email: form.email,
      gender: form.gender,
      address: form.address,
      city: form.city,
      state: form.state,
      country: form.country,
    };

    // Include Rx data if any Rx field is filled
    const hasRx = form.odSphere || form.odCylinder || form.odAxis || form.osSphere || form.osCylinder || form.osAxis;
    if (hasRx) {
      payload.rx = {
        odSphere: form.odSphere ? parseFloat(form.odSphere) : null,
        odCylinder: form.odCylinder ? parseFloat(form.odCylinder) : null,
        odAxis: form.odAxis ? parseInt(form.odAxis) : null,
        odAdd: form.odAdd ? parseFloat(form.odAdd) : null,
        osSphere: form.osSphere ? parseFloat(form.osSphere) : null,
        osCylinder: form.osCylinder ? parseFloat(form.osCylinder) : null,
        osAxis: form.osAxis ? parseInt(form.osAxis) : null,
        osAdd: form.osAdd ? parseFloat(form.osAdd) : null,
      };
    }

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) { toast.success(customer ? "Updated" : "Created"); onSaved(); }
    else toast.error("Failed to save");
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
            <User size={20} className="text-primary-600" />
          </div>
          <h2 className="text-lg font-semibold">{customer ? "Edit Customer" : "Add Customer"}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className="input" required />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className="input" />
            </div>
          </div>
          {/* Gender */}
          <div>
            <label className="label">Gender</label>
            <select value={form.gender} onChange={(e) => set("gender", e.target.value)} className="input">
              <option value="">— Select —</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {/* WhatsApp Only */}
          <div>
            <label className="label flex items-center gap-1.5"><MessageCircle size={13} className="text-green-600" /> WhatsApp *</label>
            <input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className="input" placeholder="+923001234567" required />
            <p className="text-xs text-gray-400 mt-1">This will also be used as the primary contact number</p>
          </div>
          {/* Email */}
          <div>
            <label className="label flex items-center gap-1.5"><Mail size={13} /> Email</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="input" />
          </div>
          {/* Address with Google Maps Autocomplete */}
          <div className="relative">
            <label className="label flex items-center gap-1.5"><MapPin size={13} /> Address</label>
            <input
              value={form.address}
              onChange={(e) => handleAddressChange(e.target.value)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="input"
              placeholder="Start typing address..."
            />
            {showSuggestions && addressSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto z-50">
                {addressSuggestions.map((s: any) => (
                  <button key={s.place_id} type="button" onClick={() => selectPlace(s.place_id, s.description)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2">
                    <MapPin size={12} className="text-gray-400 flex-shrink-0" /> {s.description}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* City, State, Country */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">City</label>
              <input value={form.city} onChange={(e) => set("city", e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">State</label>
              <input value={form.state} onChange={(e) => set("state", e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Country</label>
              <input value={form.country} onChange={(e) => set("country", e.target.value)} className="input" />
            </div>
          </div>

          {/* ── Rx Section ─────────────────────── */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Eye size={16} className="text-primary-600" /> Prescription (Rx)
            </h3>
            <p className="text-xs text-gray-400 mb-3">Optional — enter the customer&apos;s latest prescription. This creates a prescription record.</p>
            
            {/* OD (Right Eye) */}
            <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">OD — Right Eye</p>
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div>
                <label className="label text-xs">Sphere (SPH)</label>
                <input type="number" step="0.25" value={form.odSphere} onChange={(e) => set("odSphere", e.target.value)} className="input" placeholder="±0.00" />
              </div>
              <div>
                <label className="label text-xs">Cylinder (CYL)</label>
                <input type="number" step="0.25" value={form.odCylinder} onChange={(e) => set("odCylinder", e.target.value)} className="input" placeholder="±0.00" />
              </div>
              <div>
                <label className="label text-xs">Axis</label>
                <input type="number" step="1" min="0" max="180" value={form.odAxis} onChange={(e) => set("odAxis", e.target.value)} className="input" placeholder="0-180" />
              </div>
              <div>
                <label className="label text-xs">Add</label>
                <input type="number" step="0.25" value={form.odAdd} onChange={(e) => set("odAdd", e.target.value)} className="input" placeholder="+0.00" />
              </div>
            </div>

            {/* OS (Left Eye) */}
            <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">OS — Left Eye</p>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="label text-xs">Sphere (SPH)</label>
                <input type="number" step="0.25" value={form.osSphere} onChange={(e) => set("osSphere", e.target.value)} className="input" placeholder="±0.00" />
              </div>
              <div>
                <label className="label text-xs">Cylinder (CYL)</label>
                <input type="number" step="0.25" value={form.osCylinder} onChange={(e) => set("osCylinder", e.target.value)} className="input" placeholder="±0.00" />
              </div>
              <div>
                <label className="label text-xs">Axis</label>
                <input type="number" step="1" min="0" max="180" value={form.osAxis} onChange={(e) => set("osAxis", e.target.value)} className="input" placeholder="0-180" />
              </div>
              <div>
                <label className="label text-xs">Add</label>
                <input type="number" step="0.25" value={form.osAdd} onChange={(e) => set("osAdd", e.target.value)} className="input" placeholder="+0.00" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Customer History Modal ────────────────────────── */
interface HistoryPrescription {
  id: string; prescriptionNo: string; date: string;
  odSphere: number | null; odCylinder: number | null; odAxis: number | null;
  odAdd: number | null; odPd: number | null;
  osSphere: number | null; osCylinder: number | null; osAxis: number | null;
  osAdd: number | null; osPd: number | null;
  photoUrl: string | null; notes: string | null; prescribedBy: string | null;
}

interface HistorySale {
  id: string; invoiceNo: string; date: string; totalAmount: number; status: string;
  items: { productName: string; quantity: number; unitPrice: number; total: number; }[];
}

interface CustomerHistoryData {
  customer: { id: string; customerNo: string; firstName: string; lastName: string | null; phone: string | null; whatsapp: string | null; email: string | null; };
  prescriptions: HistoryPrescription[];
  sales: HistorySale[];
}

function CustomerHistoryModal({ customerId, onClose }: { customerId: string; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CustomerHistoryData | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`/api/customers/${customerId}/history`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          toast.error("Failed to load customer history");
        }
      } catch (error) {
        console.error("Error fetching history:", error);
        toast.error("Error loading history");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [customerId]);

  if (loading || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading customer history...</div>
          </div>
        </div>
      </div>
    );
  }

  const { customer, prescriptions, sales } = data;

  // Merge prescriptions and sales into timeline
  const timelineItems: Array<{ type: 'prescription' | 'sale'; date: string; data: HistoryPrescription | HistorySale }> = [
    ...prescriptions.map(p => ({ type: 'prescription' as const, date: p.date, data: p })),
    ...sales.map(s => ({ type: 'sale' as const, date: s.date, data: s }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-700 font-semibold text-lg">
              {customer.firstName.charAt(0)}{customer.lastName?.charAt(0) || ''}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{customer.firstName} {customer.lastName}</h2>
              <p className="text-sm text-gray-500">{customer.customerNo}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Timeline */}
        <div className="p-6">
          {timelineItems.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText size={48} className="mx-auto mb-3 opacity-20" />
              <p>No history available for this customer</p>
            </div>
          ) : (
            <div className="space-y-4">
              {timelineItems.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      item.type === 'prescription' ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                    )}>
                      {item.type === 'prescription' ? <FileText size={18} /> : <ShoppingBag size={18} />}
                    </div>
                    {idx < timelineItems.length - 1 && (
                      <div className="w-0.5 bg-gray-200 flex-1 my-2 min-h-[20px]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    {item.type === 'prescription' ? (
                      <PrescriptionCard prescription={item.data as HistoryPrescription} />
                    ) : (
                      <SaleCard sale={item.data as HistorySale} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Prescription Card in Timeline ───────────────── */
function PrescriptionCard({ prescription: rx }: { prescription: HistoryPrescription }) {
  const [showImage, setShowImage] = useState(false);

  return (
    <div className="bg-white border border-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-mono font-semibold text-blue-600">{rx.prescriptionNo}</span>
            <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">Prescription</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(rx.date)}</span>
            {rx.prescribedBy && <span className="flex items-center gap-1"><User size={12} /> Dr. {rx.prescribedBy}</span>}
          </div>
        </div>
        {rx.photoUrl && (
          <button onClick={() => setShowImage(true)} className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3">
            <Eye size={14} /> View Image
          </button>
        )}
      </div>

      {/* Rx Values */}
      <div className="grid grid-cols-2 gap-4 mt-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">OD — Right Eye</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Sphere:</span>
              <span className="font-medium font-mono">{fmtRx(rx.odSphere)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cylinder:</span>
              <span className="font-medium font-mono">{fmtRx(rx.odCylinder)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Axis:</span>
              <span className="font-medium font-mono">{rx.odAxis ?? "—"}°</span>
            </div>
            {rx.odAdd !== null && (
              <div className="flex justify-between">
                <span className="text-gray-500">Add:</span>
                <span className="font-medium font-mono">{fmtRx(rx.odAdd)}</span>
              </div>
            )}
            {rx.odPd !== null && (
              <div className="flex justify-between">
                <span className="text-gray-500">PD:</span>
                <span className="font-medium font-mono">{rx.odPd} mm</span>
              </div>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">OS — Left Eye</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Sphere:</span>
              <span className="font-medium font-mono">{fmtRx(rx.osSphere)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cylinder:</span>
              <span className="font-medium font-mono">{fmtRx(rx.osCylinder)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Axis:</span>
              <span className="font-medium font-mono">{rx.osAxis ?? "—"}°</span>
            </div>
            {rx.osAdd !== null && (
              <div className="flex justify-between">
                <span className="text-gray-500">Add:</span>
                <span className="font-medium font-mono">{fmtRx(rx.osAdd)}</span>
              </div>
            )}
            {rx.osPd !== null && (
              <div className="flex justify-between">
                <span className="text-gray-500">PD:</span>
                <span className="font-medium font-mono">{rx.osPd} mm</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {rx.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 font-semibold mb-1">Notes:</p>
          <p className="text-sm text-gray-700">{rx.notes}</p>
        </div>
      )}

      {/* Image Modal */}
      {showImage && rx.photoUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70" onClick={() => setShowImage(false)}>
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button onClick={() => setShowImage(false)} className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img src={rx.photoUrl} alt="Prescription" className="max-w-full max-h-[85vh] rounded-lg shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sale Card in Timeline ───────────────────────── */
function SaleCard({ sale }: { sale: HistorySale }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-green-100 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-mono font-semibold text-green-600">{sale.invoiceNo}</span>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              sale.status === "completed" ? "bg-green-50 text-green-700" :
              sale.status === "refunded" ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"
            )}>{sale.status}</span>
          </div>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar size={12} /> {formatDate(sale.date)}
          </span>
        </div>
        <span className="text-lg font-semibold text-gray-800">{formatCurrency(sale.totalAmount)}</span>
      </div>

      {/* Items */}
      {sale.items.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 font-medium mb-2">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {sale.items.length} item{sale.items.length > 1 ? 's' : ''}
          </button>
          {expanded && (
            <div className="space-y-2">
              {sale.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2">
                  <span className="flex items-center gap-2 text-gray-700">
                    <Package size={13} className="text-gray-400" />
                    {item.productName}
                    <span className="text-xs text-gray-400">× {item.quantity}</span>
                  </span>
                  <span className="font-medium text-gray-800">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

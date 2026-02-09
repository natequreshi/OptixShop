"use client";

import { useState } from "react";
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

type ColumnKey = "phone" | "whatsapp" | "email" | "city" | "country" | "odRx" | "osRx" | "purchases" | "totalSpent" | "loyalty";

const ALL_COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "phone", label: "Phone" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
  { key: "city", label: "City" },
  { key: "country", label: "Country" },
  { key: "odRx", label: "OD (Rx)" },
  { key: "osRx", label: "OS (Rx)" },
  { key: "purchases", label: "Purchases" },
  { key: "totalSpent", label: "Total Spent" },
  { key: "loyalty", label: "Loyalty" },
];

const DEFAULT_COLUMNS: ColumnKey[] = ["phone", "whatsapp", "city", "odRx", "osRx", "purchases", "totalSpent", "loyalty"];

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visibleCols, setVisibleCols] = useState<ColumnKey[]>(getInitialColumns(settings));
  const [showColPicker, setShowColPicker] = useState(false);

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
                {ALL_COLUMNS.map((col) => (
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
                {isCol("phone") && <th className="px-4 py-3 text-left">Phone</th>}
                {isCol("whatsapp") && <th className="px-4 py-3 text-left">WhatsApp</th>}
                {isCol("email") && <th className="px-4 py-3 text-left">Email</th>}
                {isCol("city") && <th className="px-4 py-3 text-left">City</th>}
                {isCol("country") && <th className="px-4 py-3 text-left">Country</th>}
                {isCol("odRx") && <th className="px-4 py-3 text-center">OD (Rx)</th>}
                {isCol("osRx") && <th className="px-4 py-3 text-center">OS (Rx)</th>}
                {isCol("purchases") && <th className="px-4 py-3 text-center">Purchases</th>}
                {isCol("totalSpent") && <th className="px-4 py-3 text-right">Total Spent</th>}
                {isCol("loyalty") && <th className="px-4 py-3 text-center">Loyalty</th>}
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <CustomerRow
                  key={c.id}
                  customer={c}
                  visibleCols={visibleCols}
                  colCount={colCount}
                  expanded={expandedId === c.id}
                  onToggleExpand={() => setExpandedId(expandedId === c.id ? null : c.id)}
                  onEdit={() => { setEditing(c); setShowModal(true); }}
                  onDelete={() => handleDelete(c.id)}
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
    </div>
  );
}

/* ── Customer Row ──────────────────────────────── */
function CustomerRow({ customer: c, visibleCols, colCount, expanded, onToggleExpand, onEdit, onDelete }: {
  customer: Customer; visibleCols: ColumnKey[]; colCount: number;
  expanded: boolean; onToggleExpand: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const isCol = (k: ColumnKey) => visibleCols.includes(k);
  const rx = c.latestRx;

  return (
    <>
      <tr className="hover:bg-gray-50 group">
        {/* Expand toggle */}
        <td className="px-3 py-3">
          {c.salesCount > 0 ? (
            <button onClick={onToggleExpand} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors">
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : <span className="w-6 h-6 block" />}
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
        {/* Phone */}
        {isCol("phone") && (
          <td className="px-4 py-3 text-sm text-gray-600">
            {c.phone ? (
              <span className="flex items-center gap-1.5"><Phone size={13} className="text-gray-400" />{c.phone}</span>
            ) : "—"}
          </td>
        )}
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
            <button onClick={c.salesCount > 0 ? onToggleExpand : undefined}
              className={cn("inline-flex items-center gap-1 text-sm font-medium rounded-full px-2.5 py-0.5",
                c.salesCount > 0 ? "bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer" : "bg-gray-50 text-gray-400"
              )}>
              <ShoppingBag size={13} /> {c.salesCount}
            </button>
          </td>
        )}
        {/* Total Spent */}
        {isCol("totalSpent") && (
          <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">{formatCurrency(c.totalPurchases)}</td>
        )}
        {/* Loyalty */}
        {isCol("loyalty") && (
          <td className="px-4 py-3 text-center">
            <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">{c.loyaltyPoints} pts</span>
          </td>
        )}
        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <button onClick={onToggleExpand} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600" title="View History">
              <Eye size={15} />
            </button>
            <button onClick={onEdit} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600" title="Edit"><Edit2 size={15} /></button>
            <button onClick={onDelete} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600" title="Delete"><Trash2 size={15} /></button>
          </div>
        </td>
      </tr>

      {/* Purchase History Accordion */}
      {expanded && c.sales.length > 0 && (
        <tr>
          <td colSpan={100} className="bg-gray-50/80 px-4 py-0">
            <div className="py-4 pl-12">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <FileText size={14} /> Purchase History
              </h4>
              <div className="space-y-3">
                {c.sales.map((sale) => (
                  <div key={sale.id} className="bg-white rounded-lg border border-gray-100 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-primary-600 font-semibold">{sale.invoiceNo}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar size={12} /> {formatDate(sale.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                          sale.status === "completed" ? "bg-green-50 text-green-700" :
                          sale.status === "refunded" ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"
                        )}>{sale.status}</span>
                        <span className="text-sm font-semibold text-gray-800">{formatCurrency(sale.totalAmount)}</span>
                      </div>
                    </div>
                    {sale.items.length > 0 && (
                      <div className="border-t border-gray-50 pt-2 mt-2 space-y-1">
                        {sale.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <Package size={11} className="text-gray-400" />
                              {item.productName} <span className="text-gray-400">× {item.quantity}</span>
                            </span>
                            <span className="font-medium text-gray-600">{formatCurrency(item.total)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
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

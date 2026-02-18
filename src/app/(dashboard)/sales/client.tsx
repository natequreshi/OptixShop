"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Edit2, ChevronDown, ChevronRight, Package, Calendar, X, Printer, Plus, Trash2, BarChart3 } from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface SaleItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxAmount: number;
  total: number;
}

interface Sale {
  id: string; invoiceNo: string; customerName: string; cashierName: string;
  saleDate: string; subtotal: number; discountAmount: number; taxAmount: number;
  totalAmount: number; paidAmount: number; balanceAmount: number;
  status: string; paymentStatus: string; itemCount: number; paymentMethods: string;
  items: SaleItem[];
  customerId: string | null;
  notes: string | null;
}

const statusColors: Record<string, string> = {
  completed: "bg-green-50 text-green-700", pending: "bg-yellow-50 text-yellow-700",
  cancelled: "bg-red-50 text-red-700", refunded: "bg-gray-100 text-gray-700",
  paid: "bg-green-50 text-green-700", partial: "bg-yellow-50 text-yellow-700",
  unpaid: "bg-red-50 text-red-700",
};

export default function SalesClient({ sales }: { sales: Sale[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [printingSale, setPrintingSale] = useState<Sale | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGraphModal, setShowGraphModal] = useState(false);

  const filtered = sales.filter((s) => {
    const matchSearch = s.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      s.customerName.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter || s.saleDate === dateFilter;
    return matchSearch && matchDate;
  });

  const totalRevenue = filtered.reduce((s, sale) => s + sale.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowGraphModal(true)} className="btn-secondary flex items-center gap-2">
            <BarChart3 size={18} /> Graph
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Sale
          </button>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sales..." className="input pl-10" />
        </div>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input w-auto" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="table-header">
              <th className="px-3 py-3 w-8"></th>
              <th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th><th className="px-4 py-3">Cashier</th>
              <th className="px-4 py-3 text-center">Items</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Paid</th>
              <th className="px-4 py-3 text-right">Balance</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Payment</th>
              <th className="px-4 py-3 text-center">Transaction Type</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s) => (
                <SaleRow
                  key={s.id}
                  sale={s}
                  onView={() => setViewingSale(s)}
                  onEdit={() => setEditingSale(s)}
                  onPrint={() => setPrintingSale(s)}
                  onDelete={async () => {
                    if (!confirm(`Delete sale ${s.invoiceNo}? This action cannot be undone.`)) return;
                    const res = await fetch(`/api/sales/${s.id}`, { method: "DELETE" });
                    if (res.ok) { toast.success("Sale deleted"); router.refresh(); }
                    else toast.error("Failed to delete sale");
                  }}
                />
              ))}
              {filtered.length === 0 && <tr><td colSpan={12} className="text-center py-12 text-gray-400">No sales found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {viewingSale && (
        <ViewSaleModal sale={viewingSale} onClose={() => setViewingSale(null)} onEdit={() => { setEditingSale(viewingSale); setViewingSale(null); }} onPrint={() => { setPrintingSale(viewingSale); setViewingSale(null); }} />
      )}

      {editingSale && (
        <EditSaleModal sale={editingSale} onClose={() => setEditingSale(null)} onSaved={() => { setEditingSale(null); router.refresh(); }} />
      )}

      {printingSale && (
        <PrintInvoiceModal sale={printingSale} onClose={() => setPrintingSale(null)} />
      )}

      {showCreateModal && (
        <CreateSaleModal onClose={() => setShowCreateModal(false)} onCreated={() => { setShowCreateModal(false); router.refresh(); }} />
      )}

      {showGraphModal && (
        <SalesGraphModal sales={sales} onClose={() => setShowGraphModal(false)} />
      )}
    </div>
  );
}

/* ── Sale Row ─────────────────── */
function SaleRow({ sale: s, onView, onEdit, onPrint, onDelete }: {
  sale: Sale; onView: () => void; onEdit: () => void; onPrint: () => void; onDelete: () => void;
}) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-3 py-3">
        <span className="w-4 h-4 block" />
      </td>
        <td className="px-4 py-3 text-sm font-mono text-primary-600">{s.invoiceNo}</td>
        <td className="px-4 py-3 text-sm font-medium text-gray-800">{s.customerName}</td>
        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(s.saleDate)}</td>
        <td className="px-4 py-3 text-sm text-gray-600">{s.cashierName}</td>
        <td className="px-4 py-3 text-sm text-center">{s.itemCount}</td>
        <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(s.totalAmount)}</td>
        <td className="px-4 py-3 text-sm text-right text-green-600">{formatCurrency(s.paidAmount)}</td>
        <td className="px-4 py-3 text-sm text-right">
          {s.balanceAmount > 0 ? (
            <span className="text-red-600 font-medium">{formatCurrency(s.balanceAmount)}</span>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>
        <td className="px-4 py-3 text-center">
          <span className={cn("text-xs px-2 py-1 rounded-full font-medium", statusColors[s.status])}>{s.status}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className={cn("text-xs px-2 py-1 rounded-full font-medium", statusColors[s.paymentStatus])}>{s.paymentStatus}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="text-sm text-gray-600 capitalize">{s.paymentMethods || "—"}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <button onClick={onView} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600" title="View Invoice">
              <Eye size={15} />
            </button>
            <button onClick={onEdit} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600" title="Edit Sale">
              <Edit2 size={15} />
            </button>
            <button onClick={onPrint} className="p-1.5 hover:bg-green-50 rounded-lg text-gray-400 hover:text-green-600" title="Print Invoice">
              <Printer size={15} />
            </button>
            <button onClick={onDelete} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600" title="Delete Sale">
              <Trash2 size={15} />
            </button>
          </div>
        </td>
      </tr>
  );
}

/* ── View Sale Modal ─────────────────────────── */
function ViewSaleModal({ sale: s, onClose, onEdit, onPrint }: { sale: Sale; onClose: () => void; onEdit: () => void; onPrint: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sale Invoice</h2>
            <p className="text-sm text-gray-500 font-mono mt-1">{s.invoiceNo}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="btn-secondary flex items-center gap-2 text-sm">
              <Edit2 size={14} /> Edit
            </button>
            <button onClick={onPrint} className="btn-primary flex items-center gap-2 text-sm">
              <Printer size={14} /> Print
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Customer</p>
              <p className="text-sm font-medium text-gray-900">{s.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Date</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(s.saleDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Cashier</p>
              <p className="text-sm font-medium text-gray-900">{s.cashierName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Payment Method</p>
              <p className="text-sm font-medium text-gray-900 capitalize">{s.paymentMethods || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Sale Status</p>
              <span className={cn("text-xs px-3 py-1.5 rounded-full font-medium", statusColors[s.status])}>{s.status}</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Payment Status</p>
              <span className={cn("text-xs px-3 py-1.5 rounded-full font-medium", statusColors[s.paymentStatus])}>{s.paymentStatus}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Package size={16} /> Items ({s.items.length})
            </h3>
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 text-xs text-gray-600 uppercase">
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-right">Discount</th>
                    <th className="px-4 py-3 text-right">Tax</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {s.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800 flex items-center gap-2">
                        <Package size={14} className="text-gray-400" /> {item.productName}
                      </td>
                      <td className="px-4 py-3 text-center font-medium">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-right text-red-600">{item.discount > 0 ? `-${formatCurrency(item.discount)}` : "—"}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(item.taxAmount)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(s.subtotal)}</span>
              </div>
              {s.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-red-600">-{formatCurrency(s.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{formatCurrency(s.taxAmount)}</span>
              </div>
              <div className="border-t border-gray-300 pt-3 flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-primary-600">{formatCurrency(s.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600">Paid Amount</span>
                <span className="font-medium text-green-600">{formatCurrency(s.paidAmount)}</span>
              </div>
              {s.balanceAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Balance</span>
                  <span className="font-semibold text-red-600">{formatCurrency(s.balanceAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {s.notes && (
            <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
              <p className="text-xs text-blue-600 font-semibold mb-2">Notes</p>
              <p className="text-sm text-gray-700">{s.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Edit Sale Modal ─────────────────────────── */
function EditSaleModal({ sale, onClose, onSaved }: { sale: Sale; onClose: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(false);
  const [paidAmount, setPaidAmount] = useState(sale.paidAmount.toString());
  const [status, setStatus] = useState(sale.status);
  const [notes, setNotes] = useState(sale.notes ?? "");

  const balance = Math.max(0, sale.totalAmount - parseFloat(paidAmount || "0"));

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch(`/api/sales/${sale.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paidAmount: parseFloat(paidAmount), status, notes }),
      });
      if (res.ok) { toast.success("Sale updated"); onSaved(); }
      else toast.error("Failed to update sale");
    } catch { toast.error("Error updating sale"); }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit Sale — {sale.invoiceNo}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="label">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label className="label">Paid Amount</label>
            <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} className="input" />
            <p className="text-xs text-gray-400 mt-1">
              Total: {formatCurrency(sale.totalAmount)} · Balance: <span className={cn(balance > 0 ? "text-red-600 font-medium" : "")}>{formatCurrency(balance)}</span>
            </p>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input min-h-[80px]" placeholder="Add notes..." />
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="btn-primary">{loading ? "Saving..." : "Save Changes"}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Print Invoice Modal ─────────────────── */
function PrintInvoiceModal({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  const [template, setTemplate] = useState<"80mm" | "modern" | "classic" | "minimal">("80mm");
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [storeSettings, setStoreSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then((settings: Record<string, string>) => {
      setStoreSettings(settings);
      setTemplate((settings.print_template as any) || '80mm');
      setTaxEnabled(settings.tax_enabled === 'true');
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between print:hidden">
          <h2 className="text-lg font-semibold dark:text-white">Print Invoice — {sale.invoiceNo}</h2>
          <div className="flex items-center gap-3">
            <select value={template} onChange={(e) => setTemplate(e.target.value as any)} className="input">
              <option value="80mm">80mm Thermal</option>
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="minimal">Minimal</option>
            </select>
            <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
              <Printer size={16} /> Print
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
        </div>
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-80px)]">
          <InvoiceTemplate sale={sale} template={template} taxEnabled={taxEnabled} settings={storeSettings} />
        </div>
      </div>
    </div>
  );
}

/* ── Invoice Templates ─────────────────── */
function InvoiceTemplate({ sale, template, taxEnabled, settings }: { sale: Sale; template: "80mm" | "modern" | "classic" | "minimal"; taxEnabled: boolean; settings: Record<string, string> }) {
  const storeName = settings.store_name || "OptixShop";
  const storePhone = settings.store_phone || "";
  const storeEmail = settings.store_email || "";
  const storeAddress = settings.store_address || "";
  const storeCity = settings.store_city || "";
  const logoUrl = settings.logo_url || "";
  const currency = settings.currency || "Rs.";

  if (template === "80mm") {
    return (
      <div style={{ width: '80mm', margin: '0 auto', fontFamily: 'monospace', fontSize: '11px', lineHeight: '1.4' }}>
        <style>{`
          @media print {
            @page { margin: 0; size: 80mm auto; }
            body { width: 80mm; }
          }
        `}</style>
        
        {logoUrl && <div style={{ textAlign: 'center', marginBottom: '4px' }}><img src={logoUrl} alt="" style={{ maxHeight: '40px', margin: '0 auto' }} /></div>}
        <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>{storeName}</div>
        {storeAddress && <div style={{ textAlign: 'center', fontSize: '10px' }}>{storeAddress}{storeCity ? `, ${storeCity}` : ''}</div>}
        {storePhone && <div style={{ textAlign: 'center', fontSize: '10px' }}>{storePhone}</div>}
        <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '3px 0' }}>
          <span>Receipt #:</span>
          <span style={{ fontWeight: 'bold' }}>{sale.invoiceNo}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '3px 0' }}>
          <span>Date:</span>
          <span>{formatDate(sale.saleDate)}</span>
        </div>
        {sale.customerName && sale.customerName !== 'Walk-in Customer' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '3px 0' }}>
            <span>Customer:</span>
            <span>{sale.customerName}</span>
          </div>
        )}
        
        <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>
        
        <div style={{ margin: '10px 0' }}>
          {sale.items.map((item, i) => (
            <div key={i} style={{ marginBottom: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.productName} x{item.quantity}</span>
                <span>{formatCurrency(item.total)}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '3px 0' }}>
          <span>Subtotal:</span>
          <span>{formatCurrency(sale.subtotal)}</span>
        </div>
        {sale.discountAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '3px 0' }}>
            <span>Discount:</span>
            <span>-{formatCurrency(sale.discountAmount)}</span>
          </div>
        )}
        {taxEnabled && sale.taxAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '3px 0' }}>
            <span>Tax:</span>
            <span>{formatCurrency(sale.taxAmount)}</span>
          </div>
        )}
        
        <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '13px', fontWeight: 'bold' }}>
          <span>TOTAL:</span>
          <span>{formatCurrency(sale.totalAmount)}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '3px 0' }}>
          <span>Payment Method:</span>
          <span style={{ fontWeight: 'bold' }}>{sale.paymentMethods.toUpperCase()}</span>
        </div>
        
        <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>
        
        <div style={{ textAlign: 'center', margin: '8px 0' }}>Thank you for shopping!</div>
        <div style={{ textAlign: 'center' }}>Please visit again</div>
      </div>
    );
  }
  
  if (template === "modern") {
    return (
      <div className="bg-white text-gray-900 p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-primary-600">
          <div>
            <h1 className="text-3xl font-bold text-primary-600">INVOICE</h1>
            <p className="text-sm text-gray-500 mt-2">Invoice #: {sale.invoiceNo}</p>
            <p className="text-sm text-gray-500">Date: {formatDate(sale.saleDate)}</p>
          </div>
          <div className="text-right">
            {logoUrl && <img src={logoUrl} alt="" className="ml-auto mb-2" style={{ maxHeight: '50px' }} />}
            <h2 className="text-xl font-bold">{storeName}</h2>
            {storeAddress && <p className="text-sm text-gray-600">{storeAddress}{storeCity ? `, ${storeCity}` : ''}</p>}
            {storePhone && <p className="text-sm text-gray-600">{storePhone}</p>}
            {storeEmail && <p className="text-sm text-gray-600">{storeEmail}</p>}
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">BILL TO</h3>
          <p className="font-medium text-lg">{sale.customerName}</p>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 text-sm font-semibold">Product</th>
              <th className="text-center py-3 px-4 text-sm font-semibold">Qty</th>
              <th className="text-right py-3 px-4 text-sm font-semibold">Price</th>
              {taxEnabled && <th className="text-right py-3 px-4 text-sm font-semibold">Tax</th>}
              <th className="text-right py-3 px-4 text-sm font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-3 px-4 text-sm">{item.productName}</td>
                <td className="py-3 px-4 text-sm text-center">{item.quantity}</td>
                <td className="py-3 px-4 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                {taxEnabled && <td className="py-3 px-4 text-sm text-right">{formatCurrency(item.taxAmount)}</td>}
                <td className="py-3 px-4 text-sm text-right font-medium">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm"><span>Subtotal:</span><span>{formatCurrency(sale.subtotal)}</span></div>
            {sale.discountAmount > 0 && <div className="flex justify-between text-sm text-red-600"><span>Discount:</span><span>-{formatCurrency(sale.discountAmount)}</span></div>}
            {taxEnabled && <div className="flex justify-between text-sm"><span>Tax:</span><span>{formatCurrency(sale.taxAmount)}</span></div>}
            <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2"><span>Total:</span><span>{formatCurrency(sale.totalAmount)}</span></div>
            <div className="flex justify-between text-sm text-green-600"><span>Paid:</span><span>{formatCurrency(sale.paidAmount)}</span></div>
            {sale.balanceAmount > 0 && <div className="flex justify-between text-sm text-red-600 font-medium"><span>Balance Due:</span><span>{formatCurrency(sale.balanceAmount)}</span></div>}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Thank you for your business!</p>
          {(storePhone || storeEmail) && <p className="mt-1">For inquiries, contact us at {storeEmail || storePhone}</p>}
        </div>
      </div>
    );
  }

  if (template === "classic") {
    return (
      <div className="bg-white text-gray-900 p-8 max-w-4xl mx-auto border-4 border-double border-gray-800">
        <div className="text-center mb-8">
          {logoUrl && <img src={logoUrl} alt="" className="mx-auto mb-2" style={{ maxHeight: '60px' }} />}
          <h1 className="text-4xl font-serif font-bold">{storeName}</h1>
          {storeAddress && <p className="text-sm mt-2">{storeAddress}{storeCity ? `, ${storeCity}` : ''}</p>}
          {storePhone && <p className="text-sm">{storePhone}</p>}
          <div className="mt-4 inline-block border-t-2 border-b-2 border-gray-800 py-2 px-6">
            <p className="text-lg font-semibold">INVOICE</p>
          </div>
        </div>

        <div className="flex justify-between mb-6">
          <div>
            <p className="text-sm"><strong>Invoice #:</strong> {sale.invoiceNo}</p>
            <p className="text-sm"><strong>Date:</strong> {formatDate(sale.saleDate)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm"><strong>Billed To:</strong></p>
            <p className="text-sm font-medium">{sale.customerName}</p>
          </div>
        </div>

        <table className="w-full mb-6 border border-gray-800">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="text-left py-2 px-4 text-sm">Item</th>
              <th className="text-center py-2 px-4 text-sm">Qty</th>
              <th className="text-right py-2 px-4 text-sm">Price</th>
              <th className="text-right py-2 px-4 text-sm">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-300">
                <td className="py-2 px-4 text-sm">{item.productName}</td>
                <td className="py-2 px-4 text-sm text-center">{item.quantity}</td>
                <td className="py-2 px-4 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="py-2 px-4 text-sm text-right">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(sale.subtotal)}</span></div>
            {sale.discountAmount > 0 && <div className="flex justify-between"><span>Discount:</span><span>-{formatCurrency(sale.discountAmount)}</span></div>}
            {taxEnabled && <div className="flex justify-between"><span>Tax:</span><span>{formatCurrency(sale.taxAmount)}</span></div>}
            <div className="flex justify-between text-lg font-bold border-t-2 border-gray-800 pt-2 mt-2"><span>Grand Total:</span><span>{formatCurrency(sale.totalAmount)}</span></div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs border-t border-gray-300 pt-4">
          <p>Thank you for choosing {storeName}</p>
        </div>
      </div>
    );
  }

  // Minimal template
  return (
    <div className="bg-white text-gray-900 p-8 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light">Invoice {sale.invoiceNo}</h1>
          <p className="text-sm text-gray-600 mt-1">{formatDate(sale.saleDate)}</p>
        </div>
        <div className="text-right">
          {logoUrl && <img src={logoUrl} alt="" className="ml-auto mb-1" style={{ maxHeight: '40px' }} />}
          <p className="font-medium">{storeName}</p>
          {storePhone && <p className="text-xs text-gray-500">{storePhone}</p>}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-500">Customer</p>
        <p className="font-medium">{sale.customerName}</p>
      </div>

      <table className="w-full mb-6">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="text-left py-2 text-sm font-medium text-gray-700">Item</th>
            <th className="text-center py-2 text-sm font-medium text-gray-700">Qty</th>
            <th className="text-right py-2 text-sm font-medium text-gray-700">Amount</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-3 text-sm">{item.productName}</td>
              <td className="py-3 text-sm text-center">{item.quantity}</td>
              <td className="py-3 text-sm text-right">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-48 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{formatCurrency(sale.subtotal)}</span></div>
          {sale.discountAmount > 0 && <div className="flex justify-between text-gray-600"><span>Discount</span><span>-{formatCurrency(sale.discountAmount)}</span></div>}
          {taxEnabled && <div className="flex justify-between"><span className="text-gray-600">Tax</span><span>{formatCurrency(sale.taxAmount)}</span></div>}
          <div className="flex justify-between text-lg font-medium border-t border-gray-300 pt-2 mt-2"><span>Total</span><span>{formatCurrency(sale.totalAmount)}</span></div>
        </div>
      </div>

      <div className="mt-12 text-sm text-gray-500">
        <p>Thank you for choosing {storeName}</p>
      </div>
    </div>
  );
}

/* ── Create Sale Modal ─────────────────── */
function CreateSaleModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<any[]>([]);
  const [showCustDropdown, setShowCustDropdown] = useState(false);
  const [selectedCustomerName, setSelectedCustomerName] = useState("Walk-in Customer");

  const [productQuery, setProductQuery] = useState("");
  const [productResults, setProductResults] = useState<any[]>([]);
  const [showProdDropdown, setShowProdDropdown] = useState(false);
  const [searchTimer, setSearchTimer] = useState<any>(null);

  const [cart, setCart] = useState<{ id: string; name: string; sku: string; qty: number; price: number; taxRate: number }[]>([]);
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState(0);

  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ firstName: "", lastName: "", phone: "", whatsapp: "", city: "" });

  // Customer search
  useEffect(() => {
    if (!customerQuery || customerQuery.length < 2) { setCustomerResults([]); return; }
    fetch("/api/customers").then(r => r.json()).then((custs: any[]) => {
      const q = customerQuery.toLowerCase();
      setCustomerResults(
        custs.filter((c: any) =>
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
          (c.phone && c.phone.includes(q))
        ).slice(0, 8)
      );
    });
  }, [customerQuery]);

  // Product search (debounced API call)
  function searchProducts(q: string) {
    if (searchTimer) clearTimeout(searchTimer);
    if (!q || q.length < 2) { setProductResults([]); setShowProdDropdown(false); return; }
    const timer = setTimeout(() => {
      fetch(`/api/products?q=${encodeURIComponent(q)}`)
        .then(r => r.json())
        .then(data => { setProductResults(data); setShowProdDropdown(true); });
    }, 250);
    setSearchTimer(timer);
  }

  function addToCart(product: any) {
    const existing = cart.find(c => c.id === product.id);
    if (existing) {
      setCart(cart.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, {
        id: product.id, name: product.name, sku: product.sku,
        qty: 1, price: product.sellingPrice, taxRate: product.taxRate ?? 0,
      }]);
    }
    setProductQuery("");
    setProductResults([]);
    setShowProdDropdown(false);
  }

  function removeFromCart(id: string) {
    setCart(cart.filter(c => c.id !== id));
  }

  function updateCartQty(id: string, qty: number) {
    if (qty < 1) return;
    setCart(cart.map(c => c.id === id ? { ...c, qty } : c));
  }

  const rawTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const discountAmount = discountType === "percent" ? (rawTotal * discountValue) / 100 : discountValue;
  const total = Math.max(0, rawTotal - discountAmount);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) return toast.error("Add at least one product");

    setLoading(true);
    try {
      let finalCustomerId = customerId;

      if (showNewCustomer && newCustomer.firstName && newCustomer.phone) {
        const custRes = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCustomer),
        });
        if (custRes.ok) {
          finalCustomerId = (await custRes.json()).id;
        } else {
          toast.error("Failed to create customer");
          setLoading(false);
          return;
        }
      }

      const discountPct = discountType === "percent" ? discountValue : (rawTotal > 0 ? (discountValue / rawTotal) * 100 : 0);

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: finalCustomerId || null,
          paymentMethod: "cash",
          paymentStatus: "paid",
          amountTendered: total,
          discountPercent: discountPct,
          items: cart.map(c => ({
            productId: c.id,
            quantity: c.qty,
            unitPrice: c.price,
            discount: 0,
            taxRate: c.taxRate,
          })),
        }),
      });

      if (res.ok) {
        toast.success("Sale created!");
        onCreated();
      } else {
        toast.error("Failed to create sale");
      }
    } catch {
      toast.error("Error creating sale");
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-white">New Sale</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-130px)]">
          <div className="p-5 space-y-4">
            {/* Customer */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Customer</label>
                <button type="button" onClick={() => { setShowNewCustomer(!showNewCustomer); if (!showNewCustomer) { setCustomerId(""); setSelectedCustomerName("Walk-in Customer"); } }}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  {showNewCustomer ? "Select Existing" : "+ New Customer"}
                </button>
              </div>
              {!showNewCustomer ? (
                <div className="relative">
                  <input
                    type="text"
                    value={customerId ? selectedCustomerName : customerQuery}
                    onChange={(e) => {
                      setCustomerQuery(e.target.value);
                      setCustomerId("");
                      setSelectedCustomerName("Walk-in Customer");
                      setShowCustDropdown(true);
                    }}
                    onFocus={() => { if (!customerId) setShowCustDropdown(true); }}
                    onBlur={() => setTimeout(() => setShowCustDropdown(false), 200)}
                    placeholder="Walk-in Customer"
                    className="input"
                  />
                  {customerId && (
                    <button type="button" onClick={() => { setCustomerId(""); setSelectedCustomerName("Walk-in Customer"); setCustomerQuery(""); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X size={14} />
                    </button>
                  )}
                  {showCustDropdown && customerResults.length > 0 && !customerId && (
                    <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {customerResults.map((c: any) => (
                        <button key={c.id} type="button"
                          onMouseDown={() => {
                            setCustomerId(c.id);
                            setSelectedCustomerName(`${c.firstName} ${c.lastName || ""}`.trim());
                            setCustomerQuery("");
                            setShowCustDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-primary-50 dark:hover:bg-gray-700 text-sm border-b border-gray-50 dark:border-gray-700 last:border-0">
                          <span className="font-medium text-gray-800 dark:text-gray-200">{c.firstName} {c.lastName || ""}</span>
                          {c.phone && <span className="text-xs text-gray-400 ml-2">{c.phone}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <input type="text" value={newCustomer.firstName} onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })} className="input text-sm" placeholder="First Name *" required />
                  <input type="text" value={newCustomer.lastName} onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })} className="input text-sm" placeholder="Last Name" />
                  <input type="tel" value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} className="input text-sm" placeholder="Phone *" required />
                  <input type="tel" value={newCustomer.whatsapp} onChange={(e) => setNewCustomer({ ...newCustomer, whatsapp: e.target.value })} className="input text-sm" placeholder="WhatsApp" />
                  <input type="text" value={newCustomer.city} onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })} className="input text-sm col-span-2" placeholder="City" />
                </div>
              )}
            </div>

            {/* Product Search */}
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Add Products</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={productQuery}
                  onChange={(e) => { setProductQuery(e.target.value); searchProducts(e.target.value); }}
                  onFocus={() => { if (productResults.length > 0) setShowProdDropdown(true); }}
                  onBlur={() => setTimeout(() => setShowProdDropdown(false), 200)}
                  placeholder="Search by name, SKU or barcode..."
                  className="input pl-9"
                />
                {showProdDropdown && productResults.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                    {productResults.map((p: any) => (
                      <button key={p.id} type="button"
                        onMouseDown={() => addToCart(p)}
                        className="w-full text-left px-3 py-2.5 hover:bg-primary-50 dark:hover:bg-gray-700 flex items-center gap-3 text-sm border-b border-gray-50 dark:border-gray-700 last:border-0">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt="" className="w-9 h-9 rounded object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <Package size={14} className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.sku} &middot; Stock: {p.inventory?.quantity ?? 0}</p>
                        </div>
                        <span className="text-sm font-semibold text-primary-600 flex-shrink-0">{formatCurrency(p.sellingPrice)}</span>
                      </button>
                    ))}
                  </div>
                )}
                {showProdDropdown && productQuery.length >= 2 && productResults.length === 0 && (
                  <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg px-3 py-4 text-center text-sm text-gray-400">
                    No products found
                  </div>
                )}
              </div>
            </div>

            {/* Cart */}
            {cart.length > 0 && (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{item.sku}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button type="button" onClick={() => updateCartQty(item.id, item.qty - 1)}
                        className="w-7 h-7 rounded bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center text-sm font-bold hover:bg-gray-300">−</button>
                      <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                      <button type="button" onClick={() => updateCartQty(item.id, item.qty + 1)}
                        className="w-7 h-7 rounded bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center text-sm font-bold hover:bg-gray-300">+</button>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 w-24 text-right">{formatCurrency(item.price * item.qty)}</span>
                    <button type="button" onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {cart.length === 0 && (
              <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                Search and add products above
              </div>
            )}
          </div>

          {/* Footer with discount + total */}
          <div className="border-t border-gray-100 dark:border-gray-700 p-5 space-y-3 bg-gray-50/50 dark:bg-gray-800/50">
            {/* Discount */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 w-16">Discount</span>
              <div className="flex bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                <button type="button" onClick={() => { setDiscountType("percent"); setDiscountValue(0); }}
                  className={cn("px-2.5 py-1.5 text-xs font-medium transition", discountType === "percent" ? "bg-primary-600 text-white" : "text-gray-500")}>%</button>
                <button type="button" onClick={() => { setDiscountType("fixed"); setDiscountValue(0); }}
                  className={cn("px-2.5 py-1.5 text-xs font-medium transition", discountType === "fixed" ? "bg-primary-600 text-white" : "text-gray-500")}>Rs.</button>
              </div>
              <input type="number" value={discountValue || ""} onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                className="input w-24 text-sm" placeholder="0" min="0" step="0.1" />
              {discountAmount > 0 && <span className="text-sm text-red-500 ml-auto">−{formatCurrency(discountAmount)}</span>}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
              <span className="text-base font-semibold text-gray-800 dark:text-white">Total</span>
              <span className="text-2xl font-bold text-primary-600">{formatCurrency(total)}</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading || cart.length === 0} className="btn-primary flex-1 disabled:opacity-50">
                {loading ? "Creating..." : "Create Sale"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Sales Graph Modal ─────────────────────────── */
function SalesGraphModal({ sales, onClose }: { sales: Sale[]; onClose: () => void }) {
  const [viewMode, setViewMode] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filter by date range if provided
  const filteredSales = sales.filter(s => {
    if (!startDate && !endDate) return true;
    const saleDate = new Date(s.saleDate);
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    return saleDate >= start && saleDate <= end;
  });

  // Aggregate data based on view mode
  const aggregateData = () => {
    const dataMap: Record<string, { amount: number; count: number }> = {};

    filteredSales.forEach(sale => {
      const date = new Date(sale.saleDate);
      let key: string;

      if (viewMode === "monthly") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (viewMode === "quarterly") {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
      } else {
        key = `${date.getFullYear()}`;
      }

      if (!dataMap[key]) {
        dataMap[key] = { amount: 0, count: 0 };
      }
      dataMap[key].amount += sale.totalAmount;
      dataMap[key].count += 1;
    });

    return Object.entries(dataMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, data]) => ({
        period,
        amount: data.amount,
        count: data.count,
      }));
  };

  const chartData = aggregateData();
  const totalAmount = chartData.reduce((sum, d) => sum + d.amount, 0);
  const totalCount = chartData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <BarChart3 size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Sales Analytics</h2>
              <p className="text-sm text-gray-500">View sales trends and performance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-100 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex gap-2">
              {(["monthly", "quarterly", "yearly"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    viewMode === mode
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input w-auto"
              placeholder="Start Date"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input w-auto"
              placeholder="End Date"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(""); setEndDate(""); }}
                className="text-sm text-primary-600 hover:text-primary-700 underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="p-6 grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Total Sales</p>
            <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Average Sale</p>
            <p className="text-2xl font-bold text-gray-900">
              {totalCount > 0 ? formatCurrency(totalAmount / totalCount) : formatCurrency(0)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="p-6">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === "amount") return [formatCurrency(value), "Revenue"];
                    return [value, "Count"];
                  }}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                />
                <Legend />
                <Bar dataKey="amount" fill="#4F46E5" name="Revenue" radius={[8, 8, 0, 0]} />
                <Bar dataKey="count" fill="#10B981" name="Sales Count" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <BarChart3 size={48} className="mx-auto mb-3 opacity-30" />
                <p>No sales data available for the selected period</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

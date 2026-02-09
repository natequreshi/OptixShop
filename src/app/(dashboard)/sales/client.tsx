"use client";

import { useState } from "react";
import { Search, Eye, Edit2, ChevronDown, ChevronRight, Package, Calendar, X, Printer, Plus, Trash2 } from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [printingSale, setPrintingSale] = useState<Sale | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Sale
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} sales · Total: <span className="font-semibold text-green-600">{formatCurrency(totalRevenue)}</span>
          </div>
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
              <th className="px-4 py-3 text-center">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s) => (
                <SaleRow
                  key={s.id}
                  sale={s}
                  expanded={expandedId === s.id}
                  onToggleExpand={() => setExpandedId(expandedId === s.id ? null : s.id)}
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

      {editingSale && (
        <EditSaleModal sale={editingSale} onClose={() => setEditingSale(null)} onSaved={() => { setEditingSale(null); router.refresh(); }} />
      )}

      {printingSale && (
        <PrintInvoiceModal sale={printingSale} onClose={() => setPrintingSale(null)} />
      )}

      {showCreateModal && (
        <CreateSaleModal onClose={() => setShowCreateModal(false)} onCreated={() => { setShowCreateModal(false); router.refresh(); }} />
      )}
    </div>
  );
}

/* ── Sale Row with Accordion ─────────────────── */
function SaleRow({ sale: s, expanded, onToggleExpand, onEdit, onPrint, onDelete }: {
  sale: Sale; expanded: boolean; onToggleExpand: () => void; onEdit: () => void; onPrint: () => void; onDelete: () => void;
}) {
  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-3 py-3">
          <button onClick={onToggleExpand} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
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
          <div className="flex items-center justify-center gap-1">
            <button onClick={onToggleExpand} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600" title="View Invoice">
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

      {/* Accordion Invoice Detail */}
      {expanded && (
        <tr>
          <td colSpan={12} className="bg-gray-50/80 px-4 py-0">
            <div className="py-4 pl-10 space-y-4">
              {/* Sale Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg border border-gray-100 p-3">
                  <p className="text-xs text-gray-500 mb-1">Subtotal</p>
                  <p className="text-sm font-semibold">{formatCurrency(s.subtotal)}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 p-3">
                  <p className="text-xs text-gray-500 mb-1">Discount</p>
                  <p className="text-sm font-semibold text-red-600">{s.discountAmount > 0 ? `-${formatCurrency(s.discountAmount)}` : "—"}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 p-3">
                  <p className="text-xs text-gray-500 mb-1">Tax</p>
                  <p className="text-sm font-semibold">{formatCurrency(s.taxAmount)}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 p-3">
                  <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                  <p className="text-sm font-semibold capitalize">{s.paymentMethods || "—"}</p>
                </div>
              </div>

              {/* Items Table */}
              {s.items.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <Package size={14} /> Items ({s.items.length})
                  </h4>
                  <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                          <th className="px-3 py-2 text-left">Product</th>
                          <th className="px-3 py-2 text-center">Qty</th>
                          <th className="px-3 py-2 text-right">Unit Price</th>
                          <th className="px-3 py-2 text-right">Discount</th>
                          <th className="px-3 py-2 text-right">Tax</th>
                          <th className="px-3 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {s.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="px-3 py-2 text-gray-800 flex items-center gap-1.5">
                              <Package size={12} className="text-gray-400" /> {item.productName}
                            </td>
                            <td className="px-3 py-2 text-center">{item.quantity}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-3 py-2 text-right text-red-600">{item.discount > 0 ? formatCurrency(item.discount) : "—"}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(item.taxAmount)}</td>
                            <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {s.notes && (
                <div className="bg-white rounded-lg border border-gray-100 p-3">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{s.notes}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
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
  const [template, setTemplate] = useState<"modern" | "classic" | "minimal">("modern");

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
          <InvoiceTemplate sale={sale} template={template} />
        </div>
      </div>
    </div>
  );
}

/* ── Invoice Templates ─────────────────── */
function InvoiceTemplate({ sale, template }: { sale: Sale; template: "modern" | "classic" | "minimal" }) {
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
            <h2 className="text-xl font-bold">OptixShop</h2>
            <p className="text-sm text-gray-600 mt-1">Optics & Eyewear</p>
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
              <th className="text-right py-3 px-4 text-sm font-semibold">Tax</th>
              <th className="text-right py-3 px-4 text-sm font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-3 px-4 text-sm">{item.productName}</td>
                <td className="py-3 px-4 text-sm text-center">{item.quantity}</td>
                <td className="py-3 px-4 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="py-3 px-4 text-sm text-right">{formatCurrency(item.taxAmount)}</td>
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
            <div className="flex justify-between text-sm"><span>Tax:</span><span>{formatCurrency(sale.taxAmount)}</span></div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2"><span>Total:</span><span>{formatCurrency(sale.totalAmount)}</span></div>
            <div className="flex justify-between text-sm text-green-600"><span>Paid:</span><span>{formatCurrency(sale.paidAmount)}</span></div>
            {sale.balanceAmount > 0 && <div className="flex justify-between text-sm text-red-600 font-medium"><span>Balance Due:</span><span>{formatCurrency(sale.balanceAmount)}</span></div>}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Thank you for your business!</p>
          <p className="mt-1">For inquiries, contact us at info@optixshop.com</p>
        </div>
      </div>
    );
  }

  if (template === "classic") {
    return (
      <div className="bg-white text-gray-900 p-8 max-w-4xl mx-auto border-4 border-double border-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold">OptixShop</h1>
          <p className="text-sm mt-2">Optics & Eyewear Specialists</p>
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
            <div className="flex justify-between"><span>Tax:</span><span>{formatCurrency(sale.taxAmount)}</span></div>
            <div className="flex justify-between text-lg font-bold border-t-2 border-gray-800 pt-2 mt-2"><span>Grand Total:</span><span>{formatCurrency(sale.totalAmount)}</span></div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs border-t border-gray-300 pt-4">
          <p>Thank you for choosing OptixShop</p>
        </div>
      </div>
    );
  }

  // Minimal template
  return (
    <div className="bg-white text-gray-900 p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-light">Invoice {sale.invoiceNo}</h1>
        <p className="text-sm text-gray-600 mt-1">{formatDate(sale.saleDate)}</p>
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
          <div className="flex justify-between"><span className="text-gray-600">Tax</span><span>{formatCurrency(sale.taxAmount)}</span></div>
          <div className="flex justify-between text-lg font-medium border-t border-gray-300 pt-2 mt-2"><span>Total</span><span>{formatCurrency(sale.totalAmount)}</span></div>
        </div>
      </div>

      <div className="mt-12 text-sm text-gray-500">
        <p>Thank you</p>
      </div>
    </div>
  );
}

/* ── Create Sale Modal ─────────────────── */
function CreateSaleModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-white">Create New Sale</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">To create a new sale, please use the POS (Point of Sale) interface for a better experience.</p>
          <div className="flex flex-col gap-2">
            <button onClick={() => router.push("/pos")} className="btn-primary w-full">
              Go to POS
            </button>
            <button onClick={onClose} className="btn-secondary w-full">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

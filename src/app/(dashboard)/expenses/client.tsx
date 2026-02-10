"use client";

import { useState } from "react";
import {
  Plus, Search, Edit2, Trash2, Wallet, CalendarDays,
  CalendarRange, TrendingUp, CreditCard, Banknote,
  Receipt, Tag, FileText, Clock,
} from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Expense {
  id: string; expenseNo: string; category: string; description: string;
  amount: number; expenseDate: string; paymentMethod: string;
  reference: string; notes: string; isRecurring: boolean;
  recurringType: string; createdBy: string;
}

interface Summary {
  dailyAmount: number; dailyCount: number;
  monthlyAmount: number; monthlyCount: number;
  yearlyAmount: number; yearlyCount: number;
}

const CATEGORIES = [
  "Rent", "Utilities", "Salaries", "Electricity", "Internet",
  "Maintenance", "Supplies", "Transport", "Marketing",
  "Insurance", "Taxes", "Miscellaneous", "General",
];

export default function ExpensesClient({ expenses, summary }: { expenses: Expense[]; summary: Summary }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [filterCat, setFilterCat] = useState("");

  const filtered = expenses.filter((e) => {
    const term = search.toLowerCase();
    const matchesSearch = e.description.toLowerCase().includes(term) ||
      e.expenseNo.toLowerCase().includes(term) ||
      e.category.toLowerCase().includes(term);
    const matchesCat = !filterCat || e.category.toLowerCase() === filterCat.toLowerCase();
    return matchesSearch && matchesCat;
  });

  async function handleDelete(id: string) {
    if (!confirm("Delete this expense?")) return;
    const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted"); router.refresh(); }
    else toast.error("Failed");
  }

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      rent: "bg-blue-50 text-blue-700", utilities: "bg-cyan-50 text-cyan-700",
      salaries: "bg-purple-50 text-purple-700", electricity: "bg-yellow-50 text-yellow-700",
      internet: "bg-indigo-50 text-indigo-700", maintenance: "bg-orange-50 text-orange-700",
      supplies: "bg-teal-50 text-teal-700", transport: "bg-green-50 text-green-700",
      marketing: "bg-pink-50 text-pink-700", insurance: "bg-emerald-50 text-emerald-700",
      taxes: "bg-red-50 text-red-700", miscellaneous: "bg-gray-50 text-gray-700",
    };
    return colors[cat.toLowerCase()] ?? "bg-gray-50 text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Expense
        </button>
      </div>

      {/* Summary Cards - Daily & Monthly side by side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-1.5"><CalendarDays size={14} /> Today&apos;s Expenses</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(summary.dailyAmount)}</p>
              <p className="text-xs text-gray-400 mt-1">{summary.dailyCount} transaction{summary.dailyCount !== 1 ? "s" : ""}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-red-50">
              <Wallet size={22} className="text-red-600" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-1.5"><CalendarRange size={14} /> This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(summary.monthlyAmount)}</p>
              <p className="text-xs text-gray-400 mt-1">{summary.monthlyCount} transaction{summary.monthlyCount !== 1 ? "s" : ""}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-orange-50">
              <Receipt size={22} className="text-orange-600" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-1.5"><TrendingUp size={14} /> This Year</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(summary.yearlyAmount)}</p>
              <p className="text-xs text-gray-400 mt-1">{summary.yearlyCount} total</p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50">
              <TrendingUp size={22} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="card p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search expenses..." className="input pl-10" />
          </div>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="input w-48">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left">Expense #</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Recurring</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-primary-600 font-medium">{e.expenseNo}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 flex items-center gap-1.5">
                    <CalendarDays size={13} className="text-gray-400" /> {formatDate(e.expenseDate)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs px-2 py-1 rounded-full font-medium", getCategoryColor(e.category))}>
                      {e.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-[250px] truncate">{e.description}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      {e.paymentMethod === "cash" ? <Banknote size={13} /> : <CreditCard size={13} />}
                      {e.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">{formatCurrency(e.amount)}</td>
                  <td className="px-4 py-3 text-center">
                    {e.isRecurring ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium flex items-center gap-1 justify-center">
                        <Clock size={11} /> {e.recurringType || "Yes"}
                      </span>
                    ) : <span className="text-xs text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditing(e); setShowModal(true); }} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600" title="Edit"><Edit2 size={15} /></button>
                      <button onClick={() => handleDelete(e.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No expenses found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ExpenseModal expense={editing} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); router.refresh(); }} />
      )}
    </div>
  );
}

/* ── Expense Modal ─────────────────────────────── */
function ExpenseModal({ expense, onClose, onSaved }: { expense: Expense | null; onClose: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: expense?.category ?? "General",
    description: expense?.description ?? "",
    amount: expense?.amount?.toString() ?? "",
    expenseDate: expense?.expenseDate ?? new Date().toISOString().split("T")[0],
    paymentMethod: expense?.paymentMethod ?? "cash",
    reference: expense?.reference ?? "",
    notes: expense?.notes ?? "",
    isRecurring: expense?.isRecurring ?? false,
    recurringType: expense?.recurringType ?? "",
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description || !form.amount) { toast.error("Description and amount required"); return; }
    setLoading(true);
    const url = expense ? `/api/expenses/${expense.id}` : "/api/expenses";
    const method = expense ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { toast.success(expense ? "Updated" : "Created"); onSaved(); }
    else toast.error("Failed to save");
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
            <Wallet size={20} className="text-red-600" />
          </div>
          <h2 className="text-lg font-semibold">{expense ? "Edit Expense" : "Add Expense"}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Date + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-1.5"><CalendarDays size={13} /> Date</label>
              <input type="date" value={form.expenseDate} onChange={(e) => set("expenseDate", e.target.value)} className="input" required />
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><Tag size={13} /> Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="input">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {/* Description */}
          <div>
            <label className="label flex items-center gap-1.5"><FileText size={13} /> Description *</label>
            <input value={form.description} onChange={(e) => set("description", e.target.value)} className="input" placeholder="What was this expense for?" required />
          </div>
          {/* Amount + Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-1.5"><Banknote size={13} /> Amount (Rs.) *</label>
              <input type="number" step="1" min="0" value={form.amount} onChange={(e) => set("amount", e.target.value)} className="input" placeholder="0" required />
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><CreditCard size={13} /> Payment Method</label>
              <select value={form.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value)} className="input">
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option>
                <option value="cheque">Cheque</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>
          {/* Reference */}
          <div>
            <label className="label">Reference / Receipt #</label>
            <input value={form.reference} onChange={(e) => set("reference", e.target.value)} className="input" placeholder="Optional reference number" />
          </div>
          {/* Recurring */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isRecurring} onChange={(e) => set("isRecurring", e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <span className="text-sm text-gray-700">Recurring Expense</span>
            </label>
            {form.isRecurring && (
              <select value={form.recurringType} onChange={(e) => set("recurringType", e.target.value)} className="input w-40">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            )}
          </div>
          {/* Notes */}
          <div>
            <label className="label">Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} className="input min-h-[60px]" placeholder="Optional notes..." />
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

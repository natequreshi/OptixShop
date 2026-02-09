"use client";

import { useState, useEffect } from "react";
import { CreditCard, DollarSign, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Session {
  id: string; openedAt: string; closedAt: string | null;
  openingCash: number; closingCash: number | null;
  expectedCash: number | null; difference: number | null;
  status: string; userName: string;
  transactions: { id: string; type: string; amount: number; method: string; notes: string; createdAt: string }[];
}

export default function RegisterPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [openingCash, setOpeningCash] = useState("0");
  const [closingCash, setClosingCash] = useState("0");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/register").then(r => r.json()).then(data => {
      setSessions(data);
      setActiveSession(data.find((s: Session) => s.status === "open") || null);
      setLoading(false);
    });
  }, []);

  async function openRegister() {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "open", openingCash: +openingCash }),
    });
    if (res.ok) { toast.success("Register opened"); router.refresh(); location.reload(); }
    else toast.error("Failed to open");
  }

  async function closeRegister() {
    if (!activeSession) return;
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "close", sessionId: activeSession.id, closingCash: +closingCash }),
    });
    if (res.ok) { toast.success("Register closed"); location.reload(); }
    else toast.error("Failed to close");
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Cash Register</h1>

      {activeSession ? (
        <div className="space-y-6">
          <div className="card p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Active Session</p>
                <p className="text-lg font-semibold text-green-700">Register is OPEN</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <CreditCard size={24} className="text-green-600" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Opening Cash</p><p className="text-xl font-bold">{formatCurrency(activeSession.openingCash)}</p></div>
              <div><p className="text-sm text-gray-500">Transactions</p><p className="text-xl font-bold">{activeSession.transactions?.length ?? 0}</p></div>
            </div>
          </div>

          {/* Close Register */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Close Register</h3>
            <div className="max-w-xs space-y-3">
              <div><label className="label">Counted Cash in Drawer</label><input type="number" step="0.01" value={closingCash} onChange={(e) => setClosingCash(e.target.value)} className="input" /></div>
              <button onClick={closeRegister} className="btn-danger w-full">Close Register</button>
            </div>
          </div>

          {/* Transactions */}
          {activeSession.transactions && activeSession.transactions.length > 0 && (
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-gray-100"><h3 className="font-semibold">Session Transactions</h3></div>
              <table className="w-full">
                <thead><tr className="table-header">
                  <th className="px-4 py-3">Type</th><th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3">Notes</th><th className="px-4 py-3">Time</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {activeSession.transactions.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <span className="flex items-center gap-1">
                          {t.type === "cash_in" ? <ArrowUpCircle size={14} className="text-green-500" /> : <ArrowDownCircle size={14} className="text-red-500" />}
                          {t.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{t.method}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(t.amount)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{t.notes || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{new Date(t.createdAt).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-8 max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CreditCard size={28} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Open Register</h2>
            <p className="text-sm text-gray-500 mt-1">Start a new cash register session</p>
          </div>
          <div className="space-y-4">
            <div><label className="label">Opening Cash Amount</label><input type="number" step="0.01" value={openingCash} onChange={(e) => setOpeningCash(e.target.value)} className="input" /></div>
            <button onClick={openRegister} className="btn-primary w-full py-3">Open Register</button>
          </div>
        </div>
      )}

      {/* Previous sessions */}
      {sessions.filter(s => s.status === "closed").length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-100"><h3 className="font-semibold">Previous Sessions</h3></div>
          <table className="w-full">
            <thead><tr className="table-header">
              <th className="px-4 py-3">Opened</th><th className="px-4 py-3">Closed</th>
              <th className="px-4 py-3 text-right">Opening</th><th className="px-4 py-3 text-right">Closing</th>
              <th className="px-4 py-3 text-right">Difference</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.filter(s => s.status === "closed").map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(s.openedAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.closedAt ? new Date(s.closedAt).toLocaleString() : "—"}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatCurrency(s.openingCash)}</td>
                  <td className="px-4 py-3 text-sm text-right">{s.closingCash != null ? formatCurrency(s.closingCash) : "—"}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{s.difference != null ? formatCurrency(s.difference) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

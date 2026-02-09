"use client";

import { useState } from "react";
import { BookOpen, FileText, List } from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

interface Account {
  id: string; accountCode: string; accountName: string; accountType: string;
  isGroup: boolean; isSystem: boolean;
}

interface JournalEntry {
  id: string; entryNo: string; entryDate: string; description: string;
  totalAmount: number; status: string; createdBy: string;
  lines: { accountCode: string; accountName: string; debit: number; credit: number; narration: string }[];
}

interface TBRow {
  accountCode: string; accountName: string; accountType: string;
  debit: number; credit: number; balance: number;
}

type Tab = "coa" | "journal" | "trial";

export default function AccountingClient({ accounts, journalEntries, trialBalance }: {
  accounts: Account[]; journalEntries: JournalEntry[]; trialBalance: TBRow[];
}) {
  const [tab, setTab] = useState<Tab>("coa");
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const tabs = [
    { key: "coa" as Tab, label: "Chart of Accounts", icon: List },
    { key: "journal" as Tab, label: "Journal Entries", icon: FileText },
    { key: "trial" as Tab, label: "Trial Balance", icon: BookOpen },
  ];

  const typeColors: Record<string, string> = {
    asset: "bg-blue-50 text-blue-700", liability: "bg-red-50 text-red-700",
    equity: "bg-purple-50 text-purple-700", income: "bg-green-50 text-green-700",
    expense: "bg-orange-50 text-orange-700",
  };

  const totalDebit = trialBalance.reduce((s, r) => s + r.debit, 0);
  const totalCredit = trialBalance.reduce((s, r) => s + r.credit, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Accounting</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              tab === t.key ? "bg-primary-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            )}><t.icon size={16} /> {t.label}</button>
        ))}
      </div>

      {/* Chart of Accounts */}
      {tab === "coa" && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead><tr className="table-header">
              <th className="px-4 py-3">Code</th><th className="px-4 py-3">Account Name</th>
              <th className="px-4 py-3">Type</th><th className="px-4 py-3 text-center">Group</th>
              <th className="px-4 py-3 text-center">System</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {accounts.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-700">{a.accountCode}</td>
                  <td className={cn("px-4 py-3 text-sm", a.isGroup ? "font-semibold text-gray-900" : "text-gray-700 pl-8")}>{a.accountName}</td>
                  <td className="px-4 py-3"><span className={cn("text-xs px-2 py-1 rounded-full font-medium capitalize", typeColors[a.accountType])}>{a.accountType}</span></td>
                  <td className="px-4 py-3 text-center text-sm">{a.isGroup ? "✓" : ""}</td>
                  <td className="px-4 py-3 text-center text-sm">{a.isSystem ? "✓" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Journal Entries */}
      {tab === "journal" && (
        <div className="space-y-3">
          {journalEntries.length === 0 && <div className="card p-12 text-center text-gray-400">No journal entries yet</div>}
          {journalEntries.map(je => (
            <div key={je.id} className="card overflow-hidden">
              <button onClick={() => setExpandedEntry(expandedEntry === je.id ? null : je.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono text-primary-600">{je.entryNo}</span>
                  <span className="text-sm text-gray-600">{formatDate(je.entryDate)}</span>
                  <span className="text-sm text-gray-800">{je.description}</span>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(je.totalAmount)}</span>
              </button>
              {expandedEntry === je.id && (
                <div className="border-t border-gray-100">
                  <table className="w-full">
                    <thead><tr className="bg-gray-50 text-xs text-gray-500">
                      <th className="px-4 py-2 text-left">Account</th><th className="px-4 py-2 text-right">Debit</th>
                      <th className="px-4 py-2 text-right">Credit</th><th className="px-4 py-2 text-left">Narration</th>
                    </tr></thead>
                    <tbody>
                      {je.lines.map((l, idx) => (
                        <tr key={idx} className="border-t border-gray-50">
                          <td className="px-4 py-2 text-sm"><span className="text-gray-400 font-mono">{l.accountCode}</span> {l.accountName}</td>
                          <td className="px-4 py-2 text-sm text-right">{l.debit > 0 ? formatCurrency(l.debit) : ""}</td>
                          <td className="px-4 py-2 text-sm text-right">{l.credit > 0 ? formatCurrency(l.credit) : ""}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{l.narration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Trial Balance */}
      {tab === "trial" && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead><tr className="table-header">
              <th className="px-4 py-3">Code</th><th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Type</th><th className="px-4 py-3 text-right">Debit</th>
              <th className="px-4 py-3 text-right">Credit</th><th className="px-4 py-3 text-right">Balance</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {trialBalance.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">{r.accountCode}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{r.accountName}</td>
                  <td className="px-4 py-3"><span className={cn("text-xs px-2 py-1 rounded-full capitalize", typeColors[r.accountType])}>{r.accountType}</span></td>
                  <td className="px-4 py-3 text-sm text-right">{r.debit > 0 ? formatCurrency(r.debit) : ""}</td>
                  <td className="px-4 py-3 text-sm text-right">{r.credit > 0 ? formatCurrency(r.credit) : ""}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(r.balance)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={3} className="px-4 py-3 text-sm">Total</td>
                <td className="px-4 py-3 text-sm text-right">{formatCurrency(totalDebit)}</td>
                <td className="px-4 py-3 text-sm text-right">{formatCurrency(totalCredit)}</td>
                <td className="px-4 py-3 text-sm text-right">{formatCurrency(totalDebit - totalCredit)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

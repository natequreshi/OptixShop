"use client";

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateFilterProps {
  onDateChange: (from: string, to: string) => void;
  className?: string;
}

const presets = [
  { label: "Today", getRange: () => { const t = new Date().toISOString().split("T")[0]; return [t, t]; } },
  { label: "Yesterday", getRange: () => { const d = new Date(); d.setDate(d.getDate() - 1); const t = d.toISOString().split("T")[0]; return [t, t]; } },
  { label: "Last 7 Days", getRange: () => { const d = new Date(); const t = d.toISOString().split("T")[0]; d.setDate(d.getDate() - 7); return [d.toISOString().split("T")[0], t]; } },
  { label: "Last 30 Days", getRange: () => { const d = new Date(); const t = d.toISOString().split("T")[0]; d.setDate(d.getDate() - 30); return [d.toISOString().split("T")[0], t]; } },
  { label: "This Month", getRange: () => { const d = new Date(); return [`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`, d.toISOString().split("T")[0]]; } },
  { label: "Last Month", getRange: () => { const d = new Date(); d.setMonth(d.getMonth() - 1); const start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`; const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0]; return [start, end]; } },
  { label: "This Year", getRange: () => { const d = new Date(); return [`${d.getFullYear()}-01-01`, d.toISOString().split("T")[0]]; } },
  { label: "All Time", getRange: () => ["", ""] },
];

export default function DateFilter({ onDateChange, className }: DateFilterProps) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState("All Time");

  function apply(f: string, t: string, label: string) {
    setFrom(f); setTo(t); setActivePreset(label);
    onDateChange(f, t);
    setOpen(false);
  }

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
      >
        <Calendar size={15} className="text-gray-400" />
        <span>{activePreset}</span>
        {from && to && <span className="text-xs text-gray-400 ml-1">({from} — {to})</span>}
        <ChevronDown size={14} className={cn("text-gray-400 transition", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 w-80">
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => { const [f, t] = p.getRange(); apply(f, t, p.label); }}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg transition",
                    activePreset === p.label ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
              <p className="text-xs font-medium text-gray-500 mb-2">Custom Range</p>
              <div className="flex gap-2">
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input text-xs py-1.5" />
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input text-xs py-1.5" />
              </div>
              <button onClick={() => apply(from, to, "Custom")} className="btn-primary w-full mt-2 text-xs py-1.5">Apply</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

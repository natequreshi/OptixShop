"use client";

import { useState } from "react";
import {
  Settings, Store, Receipt, Shield, ToggleLeft, ToggleRight,
  CreditCard, Tag, Save, Palette, Globe, FileText, Award,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

type Tab = "general" | "tax" | "loyalty" | "modules" | "receipt" | "appearance";

const tabs: { key: Tab; label: string; icon: any }[] = [
  { key: "general", label: "General", icon: Store },
  { key: "tax", label: "Tax & GST", icon: Receipt },
  { key: "loyalty", label: "Loyalty Program", icon: Award },
  { key: "modules", label: "Modules", icon: Shield },
  { key: "receipt", label: "Receipt / Invoice", icon: FileText },
  { key: "appearance", label: "Appearance", icon: Palette },
];

export default function SettingsClient({ settings }: { settings: Record<string, string> }) {
  const [tab, setTab] = useState<Tab>("general");
  const [form, setForm] = useState<Record<string, string>>({ ...settings });
  const [saving, setSaving] = useState(false);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const toggle = (key: string) => set(key, form[key] === "true" ? "false" : "true");
  const val = (key: string, fallback = "") => form[key] ?? fallback;

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) toast.success("Settings saved!");
    else toast.error("Failed to save settings");
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your store preferences</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-56 flex-shrink-0 space-y-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                tab === t.key ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <t.icon size={18} /> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 card p-6 space-y-6">
          {tab === "general" && (
            <>
              <SectionTitle icon={Store} title="Store Information" />
              <Field label="Store Name" value={val("store_name")} onChange={(v) => set("store_name", v)} />
              <Field label="Phone" value={val("store_phone")} onChange={(v) => set("store_phone", v)} />
              <Field label="Email" value={val("store_email")} onChange={(v) => set("store_email", v)} />
              <Field label="Address" value={val("store_address")} onChange={(v) => set("store_address", v)} multiline />
              <Field label="City" value={val("store_city")} onChange={(v) => set("store_city", v)} />
              <Field label="State / Province" value={val("store_state")} onChange={(v) => set("store_state", v)} />
              <Field label="Country" value={val("store_country", "Pakistan")} onChange={(v) => set("store_country", v)} />

              <SectionTitle icon={Globe} title="Regional" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Currency Symbol" value={val("currency", "Rs.")} onChange={(v) => set("currency", v)} />
                <Field label="Date Format" value={val("date_format", "DD/MM/YYYY")} onChange={(v) => set("date_format", v)} />
              </div>

              <SectionTitle icon={Palette} title="Branding" />
              <Field label="Logo URL" value={val("logo_url")} onChange={(v) => set("logo_url", v)} placeholder="https://example.com/logo.png" />
              <p className="text-xs text-gray-400">Enter a URL for your shop logo. It will appear on login and receipts.</p>
            </>
          )}

          {tab === "tax" && (
            <>
              <SectionTitle icon={Receipt} title="Tax Configuration" />
              <Toggle label="Enable GST / Tax" checked={val("tax_enabled", "true") === "true"} onToggle={() => toggle("tax_enabled")} desc="Apply tax on all sales" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Default Tax Rate (%)" value={val("tax_rate", "18")} onChange={(v) => set("tax_rate", v)} type="number" />
                <Field label="GST Number / NTN" value={val("gst_number")} onChange={(v) => set("gst_number", v)} />
              </div>
              <Toggle label="Show Tax Breakdown on Receipt" checked={val("receipt_show_tax_breakdown", "true") === "true"} onToggle={() => toggle("receipt_show_tax_breakdown")} desc="Show CGST/SGST split on invoices" />
              <Toggle label="Tax Inclusive Pricing" checked={val("tax_inclusive", "false") === "true"} onToggle={() => toggle("tax_inclusive")} desc="Product prices already include tax" />
            </>
          )}

          {tab === "loyalty" && (
            <>
              <SectionTitle icon={Award} title="Loyalty Program" />
              <Toggle label="Enable Loyalty Points" checked={val("loyalty_enabled", "false") === "true"} onToggle={() => toggle("loyalty_enabled")} desc="Customers earn points on purchases" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Points per 100 spent" value={val("loyalty_points_per_100", "1")} onChange={(v) => set("loyalty_points_per_100", v)} type="number" />
                <Field label="Point Value (Rs.)" value={val("loyalty_point_value", "1")} onChange={(v) => set("loyalty_point_value", v)} type="number" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Min Points to Redeem" value={val("loyalty_min_redeem", "100")} onChange={(v) => set("loyalty_min_redeem", v)} type="number" />
                <Field label="Max Discount (%)" value={val("loyalty_max_discount_pct", "10")} onChange={(v) => set("loyalty_max_discount_pct", v)} type="number" />
              </div>
            </>
          )}

          {tab === "modules" && (
            <>
              <SectionTitle icon={Shield} title="Enable / Disable Modules" />
              <p className="text-sm text-gray-500 mb-4">Turn off modules you don&apos;t need. Disabled modules will be hidden from the sidebar.</p>
              <Toggle label="POS (Point of Sale)" checked={val("module_pos", "true") === "true"} onToggle={() => toggle("module_pos")} />
              <Toggle label="Inventory Management" checked={val("module_inventory", "true") === "true"} onToggle={() => toggle("module_inventory")} />
              <Toggle label="Prescriptions" checked={val("module_prescriptions", "true") === "true"} onToggle={() => toggle("module_prescriptions")} />
              <Toggle label="Vendors" checked={val("module_vendors", "true") === "true"} onToggle={() => toggle("module_vendors")} />
              <Toggle label="Purchase Orders" checked={val("module_purchase_orders", "true") === "true"} onToggle={() => toggle("module_purchase_orders")} />
              <Toggle label="Goods Receipt Notes (GRN)" checked={val("module_grn", "true") === "true"} onToggle={() => toggle("module_grn")} />
              <Toggle label="Purchase Invoices" checked={val("module_purchase_invoices", "true") === "true"} onToggle={() => toggle("module_purchase_invoices")} />
              <Toggle label="Lab Orders" checked={val("module_lab_orders", "true") === "true"} onToggle={() => toggle("module_lab_orders")} />
              <Toggle label="Accounting" checked={val("module_accounting", "true") === "true"} onToggle={() => toggle("module_accounting")} />
              <Toggle label="Reports" checked={val("module_reports", "true") === "true"} onToggle={() => toggle("module_reports")} />
              <Toggle label="Cash Register" checked={val("module_register", "true") === "true"} onToggle={() => toggle("module_register")} />
            </>
          )}

          {tab === "receipt" && (
            <>
              <SectionTitle icon={FileText} title="Receipt / Invoice Settings" />
              <Field label="Invoice Prefix" value={val("invoice_prefix", "INV")} onChange={(v) => set("invoice_prefix", v)} />
              <Field label="Receipt Header Text" value={val("receipt_header")} onChange={(v) => set("receipt_header", v)} multiline placeholder="Custom text shown at top of receipts" />
              <Field label="Receipt Footer Text" value={val("receipt_footer", "Thank you for shopping with us!")} onChange={(v) => set("receipt_footer", v)} multiline placeholder="Custom text shown at bottom of receipts" />
              <Toggle label="Show Store Logo on Receipt" checked={val("receipt_show_logo", "true") === "true"} onToggle={() => toggle("receipt_show_logo")} />
              <Toggle label="Show Prescription on Receipt" checked={val("receipt_show_prescription", "true") === "true"} onToggle={() => toggle("receipt_show_prescription")} />
              <Toggle label="Auto-Print Receipt after Sale" checked={val("receipt_auto_print", "false") === "true"} onToggle={() => toggle("receipt_auto_print")} />
            </>
          )}

          {tab === "appearance" && (
            <>
              <SectionTitle icon={Palette} title="Appearance" />
              <Field label="Primary Color" value={val("primary_color", "#4F46E5")} onChange={(v) => set("primary_color", v)} placeholder="#4F46E5" />
              <Toggle label="Compact Sidebar" checked={val("sidebar_compact", "false") === "true"} onToggle={() => toggle("sidebar_compact")} desc="Start with collapsed sidebar by default" />
              <Toggle label="Dark Mode (coming soon)" checked={false} onToggle={() => toast("Coming soon!")} desc="Toggle dark mode theme" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
      <Icon size={18} className="text-primary-600" />
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", multiline = false, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; multiline?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className="input min-h-[80px]" placeholder={placeholder} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="input" placeholder={placeholder} />
      )}
    </div>
  );
}

function Toggle({ label, checked, onToggle, desc }: {
  label: string; checked: boolean; onToggle: () => void; desc?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button onClick={onToggle} className="flex-shrink-0">
        {checked ? (
          <ToggleRight size={28} className="text-primary-600" />
        ) : (
          <ToggleLeft size={28} className="text-gray-300" />
        )}
      </button>
    </div>
  );
}

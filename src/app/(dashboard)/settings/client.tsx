"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings, Store, Receipt, Shield, ToggleLeft, ToggleRight,
  CreditCard, Tag, Save, Palette, Globe, FileText, Award,
  MessageCircle, Users, Phone, Send, Key, Link, PenTool,
  Layout, Type, Grid, AlignLeft, AlignCenter, AlignRight,
  MapPin, Eye, EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

type Tab = "general" | "tax" | "loyalty" | "modules" | "receipt" | "invoice_designer" | "appearance" | "whatsapp" | "customers";

const tabs: { key: Tab; label: string; icon: any }[] = [
  { key: "general", label: "General", icon: Store },
  { key: "tax", label: "Tax & GST", icon: Receipt },
  { key: "loyalty", label: "Loyalty Program", icon: Award },
  { key: "modules", label: "Modules", icon: Shield },
  { key: "receipt", label: "Receipt / Invoice", icon: FileText },
  { key: "invoice_designer", label: "Invoice Designer", icon: PenTool },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { key: "customers", label: "Customer Columns", icon: Users },
  { key: "appearance", label: "Appearance", icon: Palette },
];

const CUSTOMER_COLUMN_OPTIONS = [
  { key: "phone", label: "Phone" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
  { key: "city", label: "City" },
  { key: "country", label: "Country" },
  { key: "odRx", label: "OD (Rx)" },
  { key: "osRx", label: "OS (Rx)" },
  { key: "purchases", label: "Purchases" },
  { key: "totalSpent", label: "Total Spent" },
  { key: "loyalty", label: "Loyalty Points" },
];

export default function SettingsClient({ settings }: { settings: Record<string, string> }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("general");
  const [form, setForm] = useState<Record<string, string>>({ ...settings });
  const [saving, setSaving] = useState(false);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const toggle = (key: string) => set(key, form[key] === "true" ? "false" : "true");
  const val = (key: string, fallback = "") => form[key] ?? fallback;

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Settings saved!");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to save settings");
      }
    } catch (err) {
      toast.error("Network error saving settings");
    }
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

              <SectionTitle icon={MapPin} title="Location" />
              <Field label="Location Name" value={val("location_name", "Main Store")} onChange={(v) => set("location_name", v)} />
              <Field label="Location Address" value={val("location_address")} onChange={(v) => set("location_address", v)} multiline />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Location Phone" value={val("location_phone")} onChange={(v) => set("location_phone", v)} />
                <Field label="Tax ID / NTN" value={val("location_tax_id")} onChange={(v) => set("location_tax_id", v)} />
              </div>

              <SectionTitle icon={Globe} title="Regional" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Currency Symbol" value={val("currency", "Rs.")} onChange={(v) => set("currency", v)} />
                <Field label="Date Format" value={val("date_format", "DD/MM/YYYY")} onChange={(v) => set("date_format", v)} />
              </div>

              <SectionTitle icon={Palette} title="Branding" />
              <Field label="Logo URL" value={val("logo_url")} onChange={(v) => set("logo_url", v)} placeholder="https://example.com/logo.png" />
              <p className="text-xs text-gray-400">Enter a URL for your shop logo. It will appear on login and receipts.</p>

              <SectionTitle icon={MapPin} title="Google Maps Integration" />
              <Field label="Google Maps API Key" value={val("google_maps_api_key")} onChange={(v) => set("google_maps_api_key", v)} placeholder="AIzaSy..." />
              <p className="text-xs text-gray-400">Required for address autocomplete in Customer forms. Get a key from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">Google Cloud Console</a>. Enable Places API and Maps JavaScript API.</p>
              <Toggle label="Enable Address Autocomplete" checked={val("google_maps_enabled", "false") === "true"} onToggle={() => toggle("google_maps_enabled")} desc="Use Google Maps to autocomplete customer addresses" />
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
              
              <div className="space-y-2">
                <label className="label">Print Template</label>
                <select value={val("print_template", "80mm")} onChange={(e) => set("print_template", e.target.value)} className="input">
                  <option value="80mm">80mm Thermal Receipt</option>
                  <option value="modern">Modern Invoice</option>
                  <option value="classic">Classic Invoice</option>
                  <option value="minimal">Minimal Invoice</option>
                </select>
                <p className="text-xs text-gray-400">Default template for POS and sales printing</p>
              </div>

              <Field label="Receipt Header Text" value={val("receipt_header")} onChange={(v) => set("receipt_header", v)} multiline placeholder="Custom text shown at top of receipts" />
              <Field label="Receipt Footer Text" value={val("receipt_footer", "Thank you for shopping with us!")} onChange={(v) => set("receipt_footer", v)} multiline placeholder="Custom text shown at bottom of receipts" />
              <Toggle label="Show Store Logo on Receipt" checked={val("receipt_show_logo", "true") === "true"} onToggle={() => toggle("receipt_show_logo")} />
              <Toggle label="Show Prescription on Receipt" checked={val("receipt_show_prescription", "true") === "true"} onToggle={() => toggle("receipt_show_prescription")} />
              <Toggle label="Auto-Print Receipt after Sale" checked={val("receipt_auto_print", "false") === "true"} onToggle={() => toggle("receipt_auto_print")} />
            </>
          )}

          {tab === "invoice_designer" && (
            <>
              {/* Template Selection */}
              <SectionTitle icon={Layout} title="Template Style" />
              <div className="grid grid-cols-3 gap-3">
                {(["modern", "classic", "minimal"] as const).map((t) => (
                  <button key={t} onClick={() => set("invoice_template", t)}
                    className={cn("border-2 rounded-xl p-4 text-center transition-all",
                      val("invoice_template", "modern") === t ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-gray-300"
                    )}>
                    <div className={cn("mx-auto mb-2 w-full h-20 rounded-lg border",
                      t === "modern" ? "bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200" :
                      t === "classic" ? "bg-gray-50 border-gray-300" : "bg-white border-gray-200"
                    )} />
                    <p className="text-sm font-medium capitalize">{t}</p>
                  </button>
                ))}
              </div>

              {/* Logo Position */}
              <SectionTitle icon={AlignCenter} title="Logo Position" />
              <div className="flex gap-3">
                {(["left", "center", "right"] as const).map((pos) => {
                  const Icon = pos === "left" ? AlignLeft : pos === "center" ? AlignCenter : AlignRight;
                  return (
                    <button key={pos} onClick={() => set("invoice_logo_position", pos)}
                      className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-medium transition",
                        val("invoice_logo_position", "left") === pos ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                      )}>
                      <Icon size={16} /> {pos.charAt(0).toUpperCase() + pos.slice(1)}
                    </button>
                  );
                })}
              </div>

              {/* Paper & Font */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Paper Size</label>
                  <select value={val("invoice_paper_size", "a4")} onChange={(e) => set("invoice_paper_size", e.target.value)} className="input">
                    <option value="a4">A4</option>
                    <option value="letter">Letter</option>
                    <option value="thermal">Thermal (80mm)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Font Size</label>
                  <select value={val("invoice_font_size", "medium")} onChange={(e) => set("invoice_font_size", e.target.value)} className="input">
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={val("invoice_accent_color", "#4F46E5")} onChange={(e) => set("invoice_accent_color", e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
                    <input value={val("invoice_accent_color", "#4F46E5")} onChange={(e) => set("invoice_accent_color", e.target.value)} className="input" />
                  </div>
                </div>
                <div>
                  <label className="label">Border Style</label>
                  <select value={val("invoice_border_style", "lines")} onChange={(e) => set("invoice_border_style", e.target.value)} className="input">
                    <option value="none">None</option>
                    <option value="lines">Lines</option>
                    <option value="grid">Full Grid</option>
                  </select>
                </div>
              </div>

              {/* Header Section Toggles */}
              <SectionTitle icon={Type} title="Header Section" />
              <Toggle label="Show Store Logo" checked={val("invoice_show_logo", "true") === "true"} onToggle={() => toggle("invoice_show_logo")} desc="Display your store logo on the invoice" />
              <Toggle label="Show Store Name & Address" checked={val("invoice_show_store_info", "true") === "true"} onToggle={() => toggle("invoice_show_store_info")} desc="Store name, address, city, country" />
              <Toggle label="Show Store Phone & Email" checked={val("invoice_show_store_contact", "true") === "true"} onToggle={() => toggle("invoice_show_store_contact")} desc="Contact details in header" />
              <Toggle label="Show GST / NTN Number" checked={val("invoice_show_gst", "true") === "true"} onToggle={() => toggle("invoice_show_gst")} desc="Tax registration number" />
              <Field label="Custom Header Text" value={val("invoice_header_text")} onChange={(v) => set("invoice_header_text", v)} multiline placeholder="Optional text above invoice items" />

              {/* Body Section Toggles */}
              <SectionTitle icon={Grid} title="Body Section" />
              <Toggle label="Show Customer Details" checked={val("invoice_show_customer", "true") === "true"} onToggle={() => toggle("invoice_show_customer")} desc="Customer name, phone, address" />
              <Toggle label="Show Prescription Details" checked={val("invoice_show_prescription", "true") === "true"} onToggle={() => toggle("invoice_show_prescription")} desc="OD/OS Rx on invoice if available" />

              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-4">Item Table Columns</p>
              <Toggle label="Show SKU Column" checked={val("invoice_show_sku", "false") === "true"} onToggle={() => toggle("invoice_show_sku")} />
              <Toggle label="Show Discount Column" checked={val("invoice_show_discount_col", "true") === "true"} onToggle={() => toggle("invoice_show_discount_col")} />
              <Toggle label="Show Tax Column" checked={val("invoice_show_tax_col", "true") === "true"} onToggle={() => toggle("invoice_show_tax_col")} />
              <Toggle label="Show HSN/SAC Code" checked={val("invoice_show_hsn", "false") === "true"} onToggle={() => toggle("invoice_show_hsn")} />

              {/* Footer Section */}
              <SectionTitle icon={FileText} title="Footer Section" />
              <Toggle label="Show Payment Summary" checked={val("invoice_show_payment_summary", "true") === "true"} onToggle={() => toggle("invoice_show_payment_summary")} desc="Subtotal, discount, tax, total breakdown" />
              <Toggle label="Show Notes" checked={val("invoice_show_notes", "true") === "true"} onToggle={() => toggle("invoice_show_notes")} desc="Sale notes on invoice" />
              <Toggle label="Show Thank You Message" checked={val("invoice_show_thankyou", "true") === "true"} onToggle={() => toggle("invoice_show_thankyou")} />
              <Field label="Custom Footer Text" value={val("invoice_footer_text", "Thank you for your business!")} onChange={(v) => set("invoice_footer_text", v)} multiline placeholder="Text shown at bottom of invoice" />
              <Toggle label="Show QR Code / Barcode" checked={val("invoice_show_qr", "false") === "true"} onToggle={() => toggle("invoice_show_qr")} desc="Show a QR code with invoice reference" />

              {/* Live Preview */}
              <SectionTitle icon={Eye} title="Preview" />
              <InvoicePreview settings={form} />
            </>
          )}

          {tab === "whatsapp" && (
            <>
              <SectionTitle icon={MessageCircle} title="WhatsApp Integration" />
              <Toggle label="Enable WhatsApp Notifications" checked={val("whatsapp_enabled", "false") === "true"} onToggle={() => toggle("whatsapp_enabled")} desc="Send order notifications to customers via WhatsApp" />

              <SectionTitle icon={Key} title="WhatsApp Business API" />
              <p className="text-xs text-gray-500 -mt-2 mb-3">Connect your WhatsApp Business account to send automated delivery notifications.</p>
              <Field label="API Provider" value={val("whatsapp_provider", "direct")} onChange={(v) => set("whatsapp_provider", v)} placeholder="direct / twilio / wati" />
              <Field label="API Endpoint / URL" value={val("whatsapp_api_url")} onChange={(v) => set("whatsapp_api_url", v)} placeholder="https://graph.facebook.com/v17.0/..." />
              <Field label="API Token / Auth Key" value={val("whatsapp_api_token")} onChange={(v) => set("whatsapp_api_token", v)} placeholder="Your API token" />
              <Field label="Phone Number ID" value={val("whatsapp_phone_id")} onChange={(v) => set("whatsapp_phone_id", v)} placeholder="WhatsApp Business phone number ID" />

              <SectionTitle icon={Send} title="Notification Templates" />
              <Field label="Order Confirmation Message" value={val("whatsapp_order_template", "Dear {customer_name}, your order #{invoice_no} has been confirmed. Total: {total_amount}. Thank you for choosing {store_name}!")} onChange={(v) => set("whatsapp_order_template", v)} multiline />
              <Field label="Delivery Ready Message" value={val("whatsapp_delivery_template", "Dear {customer_name}, your order #{invoice_no} is ready for delivery/pickup. Please visit {store_name} to collect. Thank you!")} onChange={(v) => set("whatsapp_delivery_template", v)} multiline />
              <Field label="Lab Order Ready Message" value={val("whatsapp_lab_ready_template", "Dear {customer_name}, your prescription glasses (Order #{order_no}) are ready! Please visit {store_name} to collect. Thank you!")} onChange={(v) => set("whatsapp_lab_ready_template", v)} multiline />
              <p className="text-xs text-gray-400">Available placeholders: {'{customer_name}'}, {'{invoice_no}'}, {'{order_no}'}, {'{total_amount}'}, {'{store_name}'}, {'{items}'}</p>
            </>
          )}

          {tab === "customers" && (
            <>
              <SectionTitle icon={Users} title="Customer Table Columns" />
              <p className="text-sm text-gray-500 mb-4">Choose which columns are visible by default in the Customers table.</p>
              {CUSTOMER_COLUMN_OPTIONS.map((col) => {
                const colsRaw = val("customer_visible_columns", '["phone","whatsapp","city","odRx","osRx","purchases","totalSpent","loyalty"]');
                let cols: string[] = [];
                try { cols = JSON.parse(colsRaw); } catch { cols = []; }
                const checked = cols.includes(col.key);
                return (
                  <Toggle
                    key={col.key}
                    label={col.label}
                    checked={checked}
                    onToggle={() => {
                      const updated = checked ? cols.filter((c) => c !== col.key) : [...cols, col.key];
                      set("customer_visible_columns", JSON.stringify(updated));
                    }}
                  />
                );
              })}
            </>
          )}

          {tab === "appearance" && (
            <>
              <SectionTitle icon={Palette} title="Appearance" />
              <Field label="Primary Color" value={val("primary_color", "#4F46E5")} onChange={(v) => set("primary_color", v)} placeholder="#4F46E5" />
              <Toggle label="Compact Sidebar" checked={val("sidebar_compact", "false") === "true"} onToggle={() => toggle("sidebar_compact")} desc="Start with collapsed sidebar by default" />
              <Toggle label="Dark Mode" checked={val("dark_mode", "false") === "true"} onToggle={() => toggle("dark_mode")} desc="Toggle dark mode theme" />
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

/* ── Invoice Preview ────────────────────────────── */
function InvoicePreview({ settings }: { settings: Record<string, string> }) {
  const v = (k: string, fb = "") => settings[k] ?? fb;
  const on = (k: string, fb = "true") => v(k, fb) === "true";
  const template = v("invoice_template", "modern");
  const accent = v("invoice_accent_color", "#4F46E5");
  const logoPos = v("invoice_logo_position", "left");
  const fontSize = v("invoice_font_size", "medium");
  const borderStyle = v("invoice_border_style", "lines");
  const storeName = v("store_name", "Your Store Name");

  const textSize = fontSize === "small" ? "text-[10px]" : fontSize === "large" ? "text-sm" : "text-xs";
  const headSize = fontSize === "small" ? "text-sm" : fontSize === "large" ? "text-xl" : "text-base";

  const borderClass = borderStyle === "grid" ? "border border-gray-300" :
    borderStyle === "lines" ? "border-b border-gray-200" : "";
  const cellBorder = borderStyle === "grid" ? "border border-gray-200 px-2 py-1" : "px-2 py-1";

  return (
    <div className="border border-gray-200 rounded-xl bg-white p-6 max-w-xl mx-auto shadow-sm">
      <div className="space-y-4" style={{ fontFamily: "inherit" }}>
        {/* Header */}
        <div className={cn("flex gap-4", logoPos === "center" ? "flex-col items-center text-center" : logoPos === "right" ? "flex-row-reverse" : "flex-row")}>
          {on("invoice_show_logo") && (
            <div className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accent + "15" }}>
              <span className="text-lg font-bold" style={{ color: accent }}>{storeName.charAt(0)}</span>
            </div>
          )}
          <div className={cn(logoPos === "center" ? "text-center" : "")}>
            {on("invoice_show_store_info") && (
              <>
                <p className={cn(headSize, "font-bold")} style={{ color: accent }}>{storeName}</p>
                <p className={cn(textSize, "text-gray-500")}>{v("store_address", "123 Main Street")}, {v("store_city", "City")}</p>
              </>
            )}
            {on("invoice_show_store_contact") && (
              <p className={cn(textSize, "text-gray-500")}>{v("store_phone", "0300-1234567")} · {v("store_email", "store@example.com")}</p>
            )}
            {on("invoice_show_gst") && v("gst_number") && (
              <p className={cn(textSize, "text-gray-500")}>NTN: {v("gst_number")}</p>
            )}
          </div>
        </div>

        {v("invoice_header_text") && (
          <p className={cn(textSize, "text-center text-gray-600 italic")}>{v("invoice_header_text")}</p>
        )}

        {/* Invoice Meta */}
        <div className="flex justify-between pt-2" style={{ borderTop: `2px solid ${accent}` }}>
          <div>
            <p className={cn(textSize, "text-gray-500")}>Invoice No</p>
            <p className={cn(textSize, "font-semibold")}>INV00001</p>
          </div>
          <div className="text-right">
            <p className={cn(textSize, "text-gray-500")}>Date</p>
            <p className={cn(textSize, "font-semibold")}>09 Feb, 2026</p>
          </div>
        </div>

        {/* Customer */}
        {on("invoice_show_customer") && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className={cn(textSize, "text-gray-500 mb-1")}>Bill To:</p>
            <p className={cn(textSize, "font-semibold")}>John Doe</p>
            <p className={cn(textSize, "text-gray-600")}>+92 300 1234567</p>
          </div>
        )}

        {/* Prescription */}
        {on("invoice_show_prescription") && (
          <div className="bg-blue-50 rounded-lg p-3">
            <p className={cn(textSize, "text-blue-700 font-semibold mb-1")}>Prescription</p>
            <div className="grid grid-cols-2 gap-2">
              <p className={cn(textSize, "text-blue-600")}>OD: +1.00 / -0.50 × 90°</p>
              <p className={cn(textSize, "text-blue-600")}>OS: +0.75 / -0.25 × 180°</p>
            </div>
          </div>
        )}

        {/* Items Table */}
        <div className={cn("overflow-hidden", borderStyle === "grid" ? "border border-gray-300 rounded" : "")}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: accent + "10" }}>
                <th className={cn(cellBorder, textSize, "text-left font-semibold")} style={{ color: accent }}>Item</th>
                {on("invoice_show_sku", "false") && <th className={cn(cellBorder, textSize, "text-left font-semibold")} style={{ color: accent }}>SKU</th>}
                <th className={cn(cellBorder, textSize, "text-center font-semibold")} style={{ color: accent }}>Qty</th>
                <th className={cn(cellBorder, textSize, "text-right font-semibold")} style={{ color: accent }}>Price</th>
                {on("invoice_show_discount_col") && <th className={cn(cellBorder, textSize, "text-right font-semibold")} style={{ color: accent }}>Disc</th>}
                {on("invoice_show_tax_col") && <th className={cn(cellBorder, textSize, "text-right font-semibold")} style={{ color: accent }}>Tax</th>}
                <th className={cn(cellBorder, textSize, "text-right font-semibold")} style={{ color: accent }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Ray-Ban Aviator Frame", sku: "FRM001", qty: 1, price: 8500, disc: 500, tax: 1440, total: 9440 },
                { name: "CR-39 Single Vision Lens", sku: "LNS042", qty: 2, price: 2000, disc: 0, tax: 720, total: 4720 },
              ].map((item, i) => (
                <tr key={i} className={cn(borderClass)}>
                  <td className={cn(cellBorder, textSize)}>{item.name}</td>
                  {on("invoice_show_sku", "false") && <td className={cn(cellBorder, textSize, "font-mono")}>{item.sku}</td>}
                  <td className={cn(cellBorder, textSize, "text-center")}>{item.qty}</td>
                  <td className={cn(cellBorder, textSize, "text-right")}>{item.price.toLocaleString()}</td>
                  {on("invoice_show_discount_col") && <td className={cn(cellBorder, textSize, "text-right text-red-600")}>{item.disc > 0 ? item.disc.toLocaleString() : "—"}</td>}
                  {on("invoice_show_tax_col") && <td className={cn(cellBorder, textSize, "text-right")}>{item.tax.toLocaleString()}</td>}
                  <td className={cn(cellBorder, textSize, "text-right font-medium")}>{item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment Summary */}
        {on("invoice_show_payment_summary") && (
          <div className="flex justify-end">
            <div className="w-48 space-y-1">
              <div className={cn("flex justify-between", textSize)}><span className="text-gray-500">Subtotal</span><span>12,500</span></div>
              <div className={cn("flex justify-between", textSize)}><span className="text-gray-500">Discount</span><span className="text-red-600">-500</span></div>
              <div className={cn("flex justify-between", textSize)}><span className="text-gray-500">Tax</span><span>2,160</span></div>
              <div className={cn("flex justify-between font-bold pt-1", textSize)} style={{ borderTop: `2px solid ${accent}`, color: accent }}>
                <span>Total</span><span>14,160</span>
              </div>
              <div className={cn("flex justify-between", textSize)}><span className="text-gray-500">Paid</span><span className="text-green-600">10,000</span></div>
              <div className={cn("flex justify-between font-medium", textSize)}><span className="text-gray-500">Balance</span><span className="text-red-600">4,160</span></div>
            </div>
          </div>
        )}

        {/* Notes */}
        {on("invoice_show_notes") && (
          <div className={cn(textSize, "text-gray-500 italic")}>Note: Balance due within 30 days.</div>
        )}

        {/* Footer */}
        {on("invoice_show_thankyou") && (
          <p className={cn(textSize, "text-center font-medium mt-4")} style={{ color: accent }}>
            {v("invoice_footer_text", "Thank you for your business!")}
          </p>
        )}
      </div>
    </div>
  );
}

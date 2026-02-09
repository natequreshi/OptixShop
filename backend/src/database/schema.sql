-- =====================================================
-- OptiVision POS — Complete Database Schema
-- Double-entry accounting + Optical Retail POS + Procurement
-- =====================================================

-- ─── USERS & AUTH ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'cashier' CHECK(role IN ('owner','admin','manager','cashier','optometrist','lab_tech')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── SETTINGS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── PRODUCT CATEGORIES ───────────────────────────────
CREATE TABLE IF NOT EXISTS product_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES product_categories(id),
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── BRANDS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── PRODUCTS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  barcode TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category_id TEXT REFERENCES product_categories(id),
  brand_id TEXT REFERENCES brands(id),
  product_type TEXT NOT NULL CHECK(product_type IN ('frame','lens','contact_lens','sunglasses','accessory','solution','service')),

  -- Pricing
  cost_price REAL NOT NULL DEFAULT 0,
  selling_price REAL NOT NULL DEFAULT 0,
  mrp REAL,
  wholesale_price REAL,

  -- Tax
  tax_rate REAL NOT NULL DEFAULT 0,
  tax_inclusive INTEGER NOT NULL DEFAULT 0,
  hsn_sac_code TEXT,

  -- Inventory
  track_inventory INTEGER NOT NULL DEFAULT 1,
  reorder_level INTEGER DEFAULT 5,
  reorder_qty INTEGER DEFAULT 10,

  -- Costing method (FIFO / Average)
  costing_method TEXT NOT NULL DEFAULT 'average' CHECK(costing_method IN ('fifo','average')),

  -- Status
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── FRAME ATTRIBUTES ─────────────────────────────────
CREATE TABLE IF NOT EXISTS frame_attributes (
  product_id TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  model TEXT,
  color TEXT,
  size_bridge TEXT,
  size_temple TEXT,
  size_lens_width TEXT,
  material TEXT CHECK(material IN ('metal','plastic','titanium','acetate','tr90','wood','carbon_fiber','mixed',NULL)),
  shape TEXT CHECK(shape IN ('rectangular','round','oval','cat_eye','aviator','square','wayfarer','rimless','semi_rimless','geometric',NULL)),
  gender TEXT CHECK(gender IN ('male','female','unisex','kids',NULL)),
  frame_type TEXT CHECK(frame_type IN ('full_rim','half_rim','rimless',NULL)),
  weight_grams REAL
);

-- ─── LENS ATTRIBUTES ──────────────────────────────────
CREATE TABLE IF NOT EXISTS lens_attributes (
  product_id TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  lens_type TEXT CHECK(lens_type IN ('single_vision','bifocal','progressive','office','reading',NULL)),
  lens_index TEXT,
  lens_material TEXT CHECK(lens_material IN ('cr39','polycarbonate','trivex','hi_index','glass',NULL)),
  coating_ar INTEGER DEFAULT 0,
  coating_blue_cut INTEGER DEFAULT 0,
  coating_photochromic INTEGER DEFAULT 0,
  coating_polarized INTEGER DEFAULT 0,
  coating_scratch_resistant INTEGER DEFAULT 0,
  coating_uv INTEGER DEFAULT 0,
  tint TEXT,
  addition_range TEXT,
  diameter TEXT
);

-- ─── CONTACT LENS ATTRIBUTES ──────────────────────────
CREATE TABLE IF NOT EXISTS contact_lens_attributes (
  product_id TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  contact_type TEXT CHECK(contact_type IN ('daily','weekly','biweekly','monthly','yearly','rigid',NULL)),
  sphere_range TEXT,
  cylinder_range TEXT,
  axis_range TEXT,
  base_curve TEXT,
  diameter TEXT,
  pack_size INTEGER DEFAULT 1,
  water_content TEXT,
  material TEXT
);

-- ─── SUNGLASSES ATTRIBUTES ────────────────────────────
CREATE TABLE IF NOT EXISTS sunglasses_attributes (
  product_id TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  is_rx_ready INTEGER DEFAULT 0,
  uv_category TEXT,
  is_polarized INTEGER DEFAULT 0,
  lens_color TEXT,
  mirror_coating INTEGER DEFAULT 0
);

-- ─── INVENTORY / STOCK ────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  batch_no TEXT,
  serial_no TEXT,
  lot_no TEXT,
  quantity REAL NOT NULL DEFAULT 0,
  avg_cost REAL NOT NULL DEFAULT 0,
  location TEXT DEFAULT 'main',
  expiry_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  transaction_type TEXT NOT NULL CHECK(transaction_type IN ('purchase','sale','return_in','return_out','adjustment','transfer','opening')),
  quantity REAL NOT NULL,
  unit_cost REAL NOT NULL DEFAULT 0,
  reference_type TEXT,
  reference_id TEXT,
  notes TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Stock adjustments
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id TEXT PRIMARY KEY,
  adjustment_no TEXT UNIQUE NOT NULL,
  adjustment_date TEXT NOT NULL,
  reason TEXT NOT NULL CHECK(reason IN ('damage','expiry','theft','count_correction','other')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','approved','cancelled')),
  approved_by TEXT REFERENCES users(id),
  created_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS stock_adjustment_items (
  id TEXT PRIMARY KEY,
  adjustment_id TEXT NOT NULL REFERENCES stock_adjustments(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  current_qty REAL NOT NULL,
  new_qty REAL NOT NULL,
  difference REAL NOT NULL,
  reason TEXT,
  cost_per_unit REAL NOT NULL DEFAULT 0
);

-- ─── CUSTOMERS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  customer_no TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  alt_phone TEXT,
  whatsapp TEXT,
  date_of_birth TEXT,
  gender TEXT CHECK(gender IN ('male','female','other',NULL)),
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  gst_no TEXT,
  pan_no TEXT,
  -- Loyalty
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  loyalty_tier TEXT DEFAULT 'standard' CHECK(loyalty_tier IN ('standard','silver','gold','platinum')),
  -- Credit
  credit_limit REAL DEFAULT 0,
  credit_balance REAL DEFAULT 0,
  -- Insurance
  insurance_provider TEXT,
  insurance_policy_no TEXT,
  insurance_expiry TEXT,
  notes TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── PRESCRIPTIONS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS prescriptions (
  id TEXT PRIMARY KEY,
  prescription_no TEXT UNIQUE NOT NULL,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  prescribed_by TEXT,
  prescription_date TEXT NOT NULL,
  expiry_date TEXT,
  -- Right Eye (OD)
  od_sphere REAL,
  od_cylinder REAL,
  od_axis REAL,
  od_add REAL,
  od_pd REAL,
  od_prism TEXT,
  od_va TEXT,
  -- Left Eye (OS)
  os_sphere REAL,
  os_cylinder REAL,
  os_axis REAL,
  os_add REAL,
  os_pd REAL,
  os_prism TEXT,
  os_va TEXT,
  -- Near PD
  near_pd REAL,
  ipd REAL,
  -- Notes
  notes TEXT,
  image_path TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── VENDORS / SUPPLIERS ──────────────────────────────
CREATE TABLE IF NOT EXISTS vendors (
  id TEXT PRIMARY KEY,
  vendor_code TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  alt_phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  country TEXT DEFAULT 'India',
  gst_no TEXT,
  pan_no TEXT,
  tin_no TEXT,
  vat_no TEXT,
  -- Payment terms
  payment_terms TEXT DEFAULT 'net30',
  credit_limit REAL DEFAULT 0,
  credit_days INTEGER DEFAULT 30,
  -- Bank details
  bank_name TEXT,
  bank_account TEXT,
  bank_ifsc TEXT,
  -- Categories supplied
  categories_supplied TEXT,
  notes TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── PURCHASE REQUISITIONS ────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_requisitions (
  id TEXT PRIMARY KEY,
  requisition_no TEXT UNIQUE NOT NULL,
  requisition_date TEXT NOT NULL,
  requested_by TEXT REFERENCES users(id),
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','converted','cancelled')),
  approved_by TEXT REFERENCES users(id),
  approved_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS purchase_requisition_items (
  id TEXT PRIMARY KEY,
  requisition_id TEXT NOT NULL REFERENCES purchase_requisitions(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity REAL NOT NULL,
  required_date TEXT,
  notes TEXT
);

-- ─── PURCHASE ORDERS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_orders (
  id TEXT PRIMARY KEY,
  po_number TEXT UNIQUE NOT NULL,
  vendor_id TEXT NOT NULL REFERENCES vendors(id),
  requisition_id TEXT REFERENCES purchase_requisitions(id),
  order_date TEXT NOT NULL,
  expected_delivery TEXT,
  -- Amounts
  subtotal REAL NOT NULL DEFAULT 0,
  discount_amount REAL NOT NULL DEFAULT 0,
  tax_amount REAL NOT NULL DEFAULT 0,
  freight_amount REAL NOT NULL DEFAULT 0,
  total_amount REAL NOT NULL DEFAULT 0,
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','sent','partial','received','cancelled','closed')),
  payment_terms TEXT,
  notes TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id TEXT PRIMARY KEY,
  po_id TEXT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity REAL NOT NULL,
  received_qty REAL NOT NULL DEFAULT 0,
  unit_price REAL NOT NULL,
  discount_pct REAL DEFAULT 0,
  tax_rate REAL DEFAULT 0,
  tax_amount REAL DEFAULT 0,
  total REAL NOT NULL
);

-- ─── GOODS RECEIPT NOTES ──────────────────────────────
CREATE TABLE IF NOT EXISTS goods_receipt_notes (
  id TEXT PRIMARY KEY,
  grn_number TEXT UNIQUE NOT NULL,
  po_id TEXT REFERENCES purchase_orders(id),
  vendor_id TEXT NOT NULL REFERENCES vendors(id),
  receipt_date TEXT NOT NULL,
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','inspected','accepted','partial_reject','rejected')),
  notes TEXT,
  received_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS grn_items (
  id TEXT PRIMARY KEY,
  grn_id TEXT NOT NULL REFERENCES goods_receipt_notes(id) ON DELETE CASCADE,
  po_item_id TEXT REFERENCES purchase_order_items(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  ordered_qty REAL,
  received_qty REAL NOT NULL,
  accepted_qty REAL NOT NULL,
  rejected_qty REAL NOT NULL DEFAULT 0,
  batch_no TEXT,
  serial_no TEXT,
  expiry_date TEXT,
  damage_notes TEXT
);

-- ─── PURCHASE INVOICES (from vendor) ──────────────────
CREATE TABLE IF NOT EXISTS purchase_invoices (
  id TEXT PRIMARY KEY,
  invoice_no TEXT NOT NULL,
  vendor_invoice_no TEXT,
  vendor_id TEXT NOT NULL REFERENCES vendors(id),
  po_id TEXT REFERENCES purchase_orders(id),
  grn_id TEXT REFERENCES goods_receipt_notes(id),
  invoice_date TEXT NOT NULL,
  due_date TEXT,
  -- Amounts
  subtotal REAL NOT NULL DEFAULT 0,
  discount_amount REAL NOT NULL DEFAULT 0,
  tax_amount REAL NOT NULL DEFAULT 0,
  freight_amount REAL NOT NULL DEFAULT 0,
  total_amount REAL NOT NULL DEFAULT 0,
  paid_amount REAL NOT NULL DEFAULT 0,
  balance_amount REAL NOT NULL DEFAULT 0,
  -- Status
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK(status IN ('unpaid','partial','paid','cancelled')),
  -- Tax
  cgst_amount REAL DEFAULT 0,
  sgst_amount REAL DEFAULT 0,
  igst_amount REAL DEFAULT 0,
  notes TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS purchase_invoice_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES purchase_invoices(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity REAL NOT NULL,
  unit_price REAL NOT NULL,
  discount_pct REAL DEFAULT 0,
  tax_rate REAL DEFAULT 0,
  tax_amount REAL DEFAULT 0,
  cgst REAL DEFAULT 0,
  sgst REAL DEFAULT 0,
  igst REAL DEFAULT 0,
  total REAL NOT NULL
);

-- ─── SALES / INVOICES ─────────────────────────────────
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  invoice_no TEXT UNIQUE NOT NULL,
  customer_id TEXT REFERENCES customers(id),
  prescription_id TEXT REFERENCES prescriptions(id),
  sale_date TEXT NOT NULL,
  -- Amounts
  subtotal REAL NOT NULL DEFAULT 0,
  discount_amount REAL NOT NULL DEFAULT 0,
  discount_type TEXT DEFAULT 'amount' CHECK(discount_type IN ('amount','percentage')),
  tax_amount REAL NOT NULL DEFAULT 0,
  cgst_amount REAL DEFAULT 0,
  sgst_amount REAL DEFAULT 0,
  igst_amount REAL DEFAULT 0,
  total_amount REAL NOT NULL DEFAULT 0,
  paid_amount REAL NOT NULL DEFAULT 0,
  balance_amount REAL NOT NULL DEFAULT 0,
  -- Status
  status TEXT NOT NULL DEFAULT 'completed' CHECK(status IN ('draft','completed','returned','void','credit')),
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK(payment_status IN ('paid','partial','unpaid','credit')),
  -- Coupon
  coupon_code TEXT,
  coupon_discount REAL DEFAULT 0,
  -- Loyalty
  loyalty_points_earned INTEGER DEFAULT 0,
  loyalty_points_redeemed INTEGER DEFAULT 0,
  -- Meta
  notes TEXT,
  cashier_id TEXT REFERENCES users(id),
  register_session_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sale_items (
  id TEXT PRIMARY KEY,
  sale_id TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity REAL NOT NULL,
  unit_price REAL NOT NULL,
  cost_price REAL NOT NULL DEFAULT 0,
  discount_pct REAL DEFAULT 0,
  discount_amount REAL DEFAULT 0,
  tax_rate REAL DEFAULT 0,
  tax_amount REAL DEFAULT 0,
  cgst REAL DEFAULT 0,
  sgst REAL DEFAULT 0,
  igst REAL DEFAULT 0,
  total REAL NOT NULL,
  -- Prescription linkage (for lens/frame combos)
  prescription_id TEXT REFERENCES prescriptions(id),
  notes TEXT
);

-- ─── PAYMENTS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  payment_no TEXT UNIQUE NOT NULL,
  payment_type TEXT NOT NULL CHECK(payment_type IN ('sale','purchase','refund','advance','credit_payment','vendor_payment')),
  reference_type TEXT,
  reference_id TEXT,
  customer_id TEXT REFERENCES customers(id),
  vendor_id TEXT REFERENCES vendors(id),
  payment_date TEXT NOT NULL,
  amount REAL NOT NULL,
  payment_method TEXT NOT NULL CHECK(payment_method IN ('cash','card','upi','bank_transfer','cheque','credit','wallet','split')),
  -- For card/UPI
  transaction_ref TEXT,
  -- For split payments
  split_details TEXT,
  notes TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── RETURNS / EXCHANGES ──────────────────────────────
CREATE TABLE IF NOT EXISTS returns (
  id TEXT PRIMARY KEY,
  return_no TEXT UNIQUE NOT NULL,
  sale_id TEXT NOT NULL REFERENCES sales(id),
  customer_id TEXT REFERENCES customers(id),
  return_date TEXT NOT NULL,
  return_type TEXT NOT NULL CHECK(return_type IN ('return','exchange','void')),
  reason TEXT,
  subtotal REAL NOT NULL DEFAULT 0,
  tax_amount REAL NOT NULL DEFAULT 0,
  total_amount REAL NOT NULL DEFAULT 0,
  refund_method TEXT CHECK(refund_method IN ('cash','card','credit','original')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK(status IN ('pending','approved','completed','rejected')),
  processed_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS return_items (
  id TEXT PRIMARY KEY,
  return_id TEXT NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
  sale_item_id TEXT REFERENCES sale_items(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity REAL NOT NULL,
  unit_price REAL NOT NULL,
  total REAL NOT NULL,
  reason TEXT,
  condition TEXT DEFAULT 'good' CHECK(condition IN ('good','damaged','defective'))
);

-- ─── LAB / JOB ORDERS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS lab_orders (
  id TEXT PRIMARY KEY,
  order_no TEXT UNIQUE NOT NULL,
  sale_id TEXT REFERENCES sales(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  prescription_id TEXT REFERENCES prescriptions(id),
  order_date TEXT NOT NULL,
  -- Frame & Lens details
  frame_product_id TEXT REFERENCES products(id),
  lens_product_id TEXT REFERENCES products(id),
  -- Specs
  fitting_height TEXT,
  seg_height TEXT,
  wrap_angle TEXT,
  pantoscopic_tilt TEXT,
  -- Lab
  lab_type TEXT NOT NULL CHECK(lab_type IN ('in_house','outsourced')),
  lab_name TEXT,
  lab_notes TEXT,
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','edging','polishing','fitting','quality_check','ready','delivered','cancelled')),
  estimated_delivery TEXT,
  actual_delivery TEXT,
  -- Costs
  lab_cost REAL DEFAULT 0,
  notes TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── CASH REGISTER SESSIONS ──────────────────────────
CREATE TABLE IF NOT EXISTS register_sessions (
  id TEXT PRIMARY KEY,
  session_no TEXT UNIQUE NOT NULL,
  opened_by TEXT NOT NULL REFERENCES users(id),
  closed_by TEXT REFERENCES users(id),
  opened_at TEXT NOT NULL DEFAULT (datetime('now')),
  closed_at TEXT,
  -- Opening
  opening_cash REAL NOT NULL DEFAULT 0,
  opening_notes TEXT,
  -- Closing
  closing_cash REAL,
  expected_cash REAL,
  cash_difference REAL,
  closing_notes TEXT,
  -- Totals
  total_sales REAL DEFAULT 0,
  total_returns REAL DEFAULT 0,
  total_cash_payments REAL DEFAULT 0,
  total_card_payments REAL DEFAULT 0,
  total_upi_payments REAL DEFAULT 0,
  total_credit_given REAL DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','closed','reconciled'))
);

-- ═══════════════════════════════════════════════════════
-- ACCOUNTING — DOUBLE ENTRY BOOKKEEPING
-- ═══════════════════════════════════════════════════════

-- ─── CHART OF ACCOUNTS ────────────────────────────────
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id TEXT PRIMARY KEY,
  account_code TEXT UNIQUE NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK(account_type IN ('asset','liability','equity','revenue','expense','contra')),
  parent_id TEXT REFERENCES chart_of_accounts(id),
  is_group INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  opening_balance REAL NOT NULL DEFAULT 0,
  opening_balance_type TEXT DEFAULT 'debit' CHECK(opening_balance_type IN ('debit','credit')),
  is_system INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── FISCAL PERIODS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS fiscal_periods (
  id TEXT PRIMARY KEY,
  period_name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  is_closed INTEGER NOT NULL DEFAULT 0,
  closed_by TEXT REFERENCES users(id),
  closed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── JOURNAL ENTRIES ──────────────────────────────────
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  entry_no TEXT UNIQUE NOT NULL,
  entry_date TEXT NOT NULL,
  entry_type TEXT NOT NULL CHECK(entry_type IN ('sale','purchase','payment','receipt','journal','contra','opening','closing','adjustment')),
  reference_type TEXT,
  reference_id TEXT,
  narration TEXT NOT NULL,
  fiscal_period_id TEXT REFERENCES fiscal_periods(id),
  is_posted INTEGER NOT NULL DEFAULT 0,
  is_reversed INTEGER NOT NULL DEFAULT 0,
  reversed_entry_id TEXT REFERENCES journal_entries(id),
  created_by TEXT REFERENCES users(id),
  approved_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  posted_at TEXT
);

CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id TEXT PRIMARY KEY,
  journal_entry_id TEXT NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL REFERENCES chart_of_accounts(id),
  debit REAL NOT NULL DEFAULT 0,
  credit REAL NOT NULL DEFAULT 0,
  narration TEXT,
  cost_center TEXT
);

-- ─── BANK ACCOUNTS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS bank_accounts (
  id TEXT PRIMARY KEY,
  account_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  ifsc_code TEXT,
  branch TEXT,
  account_id TEXT REFERENCES chart_of_accounts(id),
  opening_balance REAL NOT NULL DEFAULT 0,
  current_balance REAL NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bank_transactions (
  id TEXT PRIMARY KEY,
  bank_account_id TEXT NOT NULL REFERENCES bank_accounts(id),
  transaction_date TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK(transaction_type IN ('deposit','withdrawal','transfer','cheque','interest','charge')),
  amount REAL NOT NULL,
  balance_after REAL,
  reference TEXT,
  description TEXT,
  is_reconciled INTEGER NOT NULL DEFAULT 0,
  reconciled_date TEXT,
  journal_entry_id TEXT REFERENCES journal_entries(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── COUPONS & SCHEMES ────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK(discount_type IN ('percentage','amount')),
  discount_value REAL NOT NULL,
  min_purchase REAL DEFAULT 0,
  max_discount REAL,
  valid_from TEXT NOT NULL,
  valid_until TEXT NOT NULL,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── LOYALTY TRANSACTIONS ─────────────────────────────
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  sale_id TEXT REFERENCES sales(id),
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK(transaction_type IN ('earned','redeemed','expired','adjustment')),
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── AUDIT LOG ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_values TEXT,
  new_values TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── NOTIFICATIONS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('rx_expiry','low_stock','payment_due','pickup_ready','promotion','system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  recipient_type TEXT CHECK(recipient_type IN ('customer','user','vendor')),
  recipient_id TEXT,
  channel TEXT CHECK(channel IN ('sms','whatsapp','email','push','in_app')),
  is_sent INTEGER NOT NULL DEFAULT 0,
  is_read INTEGER NOT NULL DEFAULT 0,
  sent_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_invoice ON sales(invoice_no);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_prescriptions_customer ON prescriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_invoices_vendor ON purchase_invoices(vendor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_vendors_code ON vendors(vendor_code);

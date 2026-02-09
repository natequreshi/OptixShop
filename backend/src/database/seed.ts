import db, { initializeDatabase } from './connection';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

export function seedDatabase() {
console.log('🌱 Seeding database...');

// ─── Settings ─────────────────────────────────────────
const settings = [
  ['shop_name', 'OptiVision Optics', 'general'],
  ['shop_address', '123 Main Street, City', 'general'],
  ['shop_phone', '+91 98765 43210', 'general'],
  ['shop_email', 'info@optivision.com', 'general'],
  ['shop_gst', '29ABCDE1234F1Z5', 'general'],
  ['currency', 'INR', 'general'],
  ['currency_symbol', '₹', 'general'],
  ['tax_type', 'GST', 'tax'],
  ['default_tax_rate', '18', 'tax'],
  ['tax_inclusive', '0', 'tax'],
  ['invoice_prefix', 'INV', 'billing'],
  ['po_prefix', 'PO', 'procurement'],
  ['grn_prefix', 'GRN', 'procurement'],
  ['loyalty_points_per_100', '5', 'loyalty'],
  ['loyalty_redemption_value', '1', 'loyalty'],
  ['low_stock_threshold', '5', 'inventory'],
  ['costing_method', 'average', 'inventory'],
  ['fiscal_year_start', '04', 'accounting'],
];

const insertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value, category) VALUES (?, ?, ?)');
for (const [key, value, category] of settings) {
  insertSetting.run(key, value, category);
}

// ─── Users ────────────────────────────────────────────
const passwordHash = bcrypt.hashSync('admin123', 10);
const users = [
  { id: uuid(), username: 'admin', password_hash: passwordHash, full_name: 'Shop Owner', email: 'admin@optivision.com', phone: '9876543210', role: 'owner' },
  { id: uuid(), username: 'manager', password_hash: passwordHash, full_name: 'Store Manager', email: 'manager@optivision.com', phone: '9876543211', role: 'manager' },
  { id: uuid(), username: 'cashier1', password_hash: passwordHash, full_name: 'Priya Sharma', email: 'priya@optivision.com', phone: '9876543212', role: 'cashier' },
  { id: uuid(), username: 'optom', password_hash: passwordHash, full_name: 'Dr. Anil Kumar', email: 'anil@optivision.com', phone: '9876543213', role: 'optometrist' },
];

const insertUser = db.prepare('INSERT OR IGNORE INTO users (id, username, password_hash, full_name, email, phone, role) VALUES (@id, @username, @password_hash, @full_name, @email, @phone, @role)');
for (const u of users) insertUser.run(u);

// ─── Chart of Accounts (Standard) ────────────────────
const accounts = [
  // Assets
  { id: uuid(), code: '1000', name: 'Assets', type: 'asset', parent: null, is_group: 1, system: 1 },
  { id: uuid(), code: '1100', name: 'Cash in Hand', type: 'asset', parent: '1000', is_group: 0, system: 1 },
  { id: uuid(), code: '1200', name: 'Bank Accounts', type: 'asset', parent: '1000', is_group: 1, system: 1 },
  { id: uuid(), code: '1210', name: 'Primary Bank Account', type: 'asset', parent: '1200', is_group: 0, system: 1 },
  { id: uuid(), code: '1300', name: 'Accounts Receivable', type: 'asset', parent: '1000', is_group: 0, system: 1 },
  { id: uuid(), code: '1400', name: 'Inventory', type: 'asset', parent: '1000', is_group: 0, system: 1 },
  { id: uuid(), code: '1500', name: 'Advance to Vendors', type: 'asset', parent: '1000', is_group: 0, system: 0 },
  { id: uuid(), code: '1600', name: 'Input GST (CGST)', type: 'asset', parent: '1000', is_group: 0, system: 1 },
  { id: uuid(), code: '1610', name: 'Input GST (SGST)', type: 'asset', parent: '1000', is_group: 0, system: 1 },
  { id: uuid(), code: '1620', name: 'Input GST (IGST)', type: 'asset', parent: '1000', is_group: 0, system: 1 },
  // Liabilities
  { id: uuid(), code: '2000', name: 'Liabilities', type: 'liability', parent: null, is_group: 1, system: 1 },
  { id: uuid(), code: '2100', name: 'Accounts Payable', type: 'liability', parent: '2000', is_group: 0, system: 1 },
  { id: uuid(), code: '2200', name: 'Customer Advances', type: 'liability', parent: '2000', is_group: 0, system: 0 },
  { id: uuid(), code: '2300', name: 'Output GST (CGST)', type: 'liability', parent: '2000', is_group: 0, system: 1 },
  { id: uuid(), code: '2310', name: 'Output GST (SGST)', type: 'liability', parent: '2000', is_group: 0, system: 1 },
  { id: uuid(), code: '2320', name: 'Output GST (IGST)', type: 'liability', parent: '2000', is_group: 0, system: 1 },
  // Equity
  { id: uuid(), code: '3000', name: 'Equity', type: 'equity', parent: null, is_group: 1, system: 1 },
  { id: uuid(), code: '3100', name: "Owner's Capital", type: 'equity', parent: '3000', is_group: 0, system: 1 },
  { id: uuid(), code: '3200', name: 'Retained Earnings', type: 'equity', parent: '3000', is_group: 0, system: 1 },
  // Revenue
  { id: uuid(), code: '4000', name: 'Revenue', type: 'revenue', parent: null, is_group: 1, system: 1 },
  { id: uuid(), code: '4100', name: 'Sales Revenue', type: 'revenue', parent: '4000', is_group: 0, system: 1 },
  { id: uuid(), code: '4200', name: 'Service Revenue', type: 'revenue', parent: '4000', is_group: 0, system: 0 },
  { id: uuid(), code: '4300', name: 'Discount Allowed', type: 'revenue', parent: '4000', is_group: 0, system: 0 },
  { id: uuid(), code: '4400', name: 'Sales Returns', type: 'revenue', parent: '4000', is_group: 0, system: 1 },
  // Expenses
  { id: uuid(), code: '5000', name: 'Expenses', type: 'expense', parent: null, is_group: 1, system: 1 },
  { id: uuid(), code: '5100', name: 'Cost of Goods Sold', type: 'expense', parent: '5000', is_group: 0, system: 1 },
  { id: uuid(), code: '5200', name: 'Purchase Returns', type: 'expense', parent: '5000', is_group: 0, system: 1 },
  { id: uuid(), code: '5300', name: 'Rent Expense', type: 'expense', parent: '5000', is_group: 0, system: 0 },
  { id: uuid(), code: '5400', name: 'Salary Expense', type: 'expense', parent: '5000', is_group: 0, system: 0 },
  { id: uuid(), code: '5500', name: 'Utilities Expense', type: 'expense', parent: '5000', is_group: 0, system: 0 },
  { id: uuid(), code: '5600', name: 'Marketing Expense', type: 'expense', parent: '5000', is_group: 0, system: 0 },
  { id: uuid(), code: '5700', name: 'Freight & Shipping', type: 'expense', parent: '5000', is_group: 0, system: 0 },
  { id: uuid(), code: '5800', name: 'Depreciation', type: 'expense', parent: '5000', is_group: 0, system: 0 },
  { id: uuid(), code: '5900', name: 'Miscellaneous Expense', type: 'expense', parent: '5000', is_group: 0, system: 0 },
];

// Build parent mapping
const accountIdMap: Record<string, string> = {};
for (const a of accounts) {
  accountIdMap[a.code] = a.id;
}

const insertAccount = db.prepare(
  'INSERT OR IGNORE INTO chart_of_accounts (id, account_code, account_name, account_type, parent_id, is_group, is_system) VALUES (?, ?, ?, ?, ?, ?, ?)'
);
for (const a of accounts) {
  const parentId = a.parent ? accountIdMap[a.parent] || null : null;
  insertAccount.run(a.id, a.code, a.name, a.type, parentId, a.is_group, a.system);
}

// ─── Product Categories ───────────────────────────────
const categories = [
  { id: uuid(), name: 'Frames', parent: null, sort: 1 },
  { id: uuid(), name: 'Lenses', parent: null, sort: 2 },
  { id: uuid(), name: 'Contact Lenses', parent: null, sort: 3 },
  { id: uuid(), name: 'Sunglasses', parent: null, sort: 4 },
  { id: uuid(), name: 'Accessories', parent: null, sort: 5 },
  { id: uuid(), name: 'Solutions & Care', parent: null, sort: 6 },
  { id: uuid(), name: 'Services', parent: null, sort: 7 },
];

const insertCategory = db.prepare(
  'INSERT OR IGNORE INTO product_categories (id, name, parent_id, sort_order) VALUES (?, ?, ?, ?)'
);
for (const c of categories) insertCategory.run(c.id, c.name, c.parent, c.sort);

// Category map
const catMap: Record<string, string> = {};
for (const c of categories) catMap[c.name] = c.id;

// ─── Brands ──────────────────────────────────────────
const brandNames = [
  'Ray-Ban', 'Oakley', 'Titan', 'Fastrack', 'Vogue', 'Essilor', 'Zeiss', 'Hoya',
  'Crizal', 'Johnson & Johnson', 'Bausch + Lomb', 'Acuvue', 'CooperVision',
  'Lenskart', 'Vincent Chase', 'John Jacobs', 'Prada', 'Gucci', 'Tom Ford'
];

const insertBrand = db.prepare('INSERT OR IGNORE INTO brands (id, name) VALUES (?, ?)');
const brandMap: Record<string, string> = {};
for (const b of brandNames) {
  const id = uuid();
  insertBrand.run(id, b);
  brandMap[b] = id;
}

// ─── Sample Products ─────────────────────────────────
const products = [
  // Frames
  { sku: 'FR-RB-001', barcode: '8901234560001', name: 'Ray-Ban Aviator Classic RB3025', type: 'frame', cat: 'Frames', brand: 'Ray-Ban', cost: 3200, sell: 5990, mrp: 6500, tax: 18 },
  { sku: 'FR-RB-002', barcode: '8901234560002', name: 'Ray-Ban Wayfarer RB2140', type: 'frame', cat: 'Frames', brand: 'Ray-Ban', cost: 2800, sell: 5490, mrp: 5990, tax: 18 },
  { sku: 'FR-TT-001', barcode: '8901234560003', name: 'Titan Full Rim Rectangle', type: 'frame', cat: 'Frames', brand: 'Titan', cost: 1200, sell: 2490, mrp: 2990, tax: 18 },
  { sku: 'FR-VC-001', barcode: '8901234560004', name: 'Vincent Chase Round Acetate', type: 'frame', cat: 'Frames', brand: 'Vincent Chase', cost: 600, sell: 1499, mrp: 1999, tax: 18 },
  { sku: 'FR-JJ-001', barcode: '8901234560005', name: 'John Jacobs Premium Titanium', type: 'frame', cat: 'Frames', brand: 'John Jacobs', cost: 1800, sell: 3490, mrp: 3990, tax: 18 },
  { sku: 'FR-OK-001', barcode: '8901234560006', name: 'Oakley Half Jacket Sport', type: 'frame', cat: 'Frames', brand: 'Oakley', cost: 4500, sell: 8990, mrp: 9500, tax: 18 },
  // Lenses
  { sku: 'LN-ES-001', barcode: '8901234560010', name: 'Essilor Crizal Single Vision 1.56', type: 'lens', cat: 'Lenses', brand: 'Essilor', cost: 1200, sell: 2800, mrp: 3200, tax: 12 },
  { sku: 'LN-ES-002', barcode: '8901234560011', name: 'Essilor Varilux Progressive 1.67', type: 'lens', cat: 'Lenses', brand: 'Essilor', cost: 4500, sell: 8500, mrp: 9500, tax: 12 },
  { sku: 'LN-ZS-001', barcode: '8901234560012', name: 'Zeiss BlueGuard Single Vision', type: 'lens', cat: 'Lenses', brand: 'Zeiss', cost: 2200, sell: 4500, mrp: 5000, tax: 12 },
  { sku: 'LN-HY-001', barcode: '8901234560013', name: 'Hoya Blue Control 1.60', type: 'lens', cat: 'Lenses', brand: 'Hoya', cost: 1800, sell: 3500, mrp: 3900, tax: 12 },
  // Contact Lenses
  { sku: 'CL-AC-001', barcode: '8901234560020', name: 'Acuvue Oasys Daily 30pk', type: 'contact_lens', cat: 'Contact Lenses', brand: 'Acuvue', cost: 900, sell: 1600, mrp: 1800, tax: 12 },
  { sku: 'CL-BL-001', barcode: '8901234560021', name: 'Bausch + Lomb SofLens Monthly 6pk', type: 'contact_lens', cat: 'Contact Lenses', brand: 'Bausch + Lomb', cost: 500, sell: 950, mrp: 1100, tax: 12 },
  // Sunglasses
  { sku: 'SG-RB-001', barcode: '8901234560030', name: 'Ray-Ban Clubmaster Polarized', type: 'sunglasses', cat: 'Sunglasses', brand: 'Ray-Ban', cost: 4000, sell: 7990, mrp: 8500, tax: 18 },
  { sku: 'SG-FK-001', barcode: '8901234560031', name: 'Fastrack Wayfarer UV400', type: 'sunglasses', cat: 'Sunglasses', brand: 'Fastrack', cost: 400, sell: 999, mrp: 1299, tax: 18 },
  // Accessories
  { sku: 'AC-CSE-001', barcode: '8901234560040', name: 'Premium Hard Case — Black', type: 'accessory', cat: 'Accessories', brand: '', cost: 80, sell: 250, mrp: 350, tax: 18 },
  { sku: 'AC-CLN-001', barcode: '8901234560041', name: 'Microfiber Cleaning Cloth', type: 'accessory', cat: 'Accessories', brand: '', cost: 15, sell: 60, mrp: 99, tax: 18 },
  { sku: 'AC-SPR-001', barcode: '8901234560042', name: 'Lens Cleaning Spray 100ml', type: 'accessory', cat: 'Accessories', brand: '', cost: 40, sell: 150, mrp: 199, tax: 18 },
  // Solutions
  { sku: 'SL-BL-001', barcode: '8901234560050', name: 'B+L ReNu Multi-Purpose 360ml', type: 'accessory', cat: 'Solutions & Care', brand: 'Bausch + Lomb', cost: 180, sell: 350, mrp: 420, tax: 12 },
];

const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products (id, sku, barcode, name, category_id, brand_id, product_type, cost_price, selling_price, mrp, tax_rate, hsn_sac_code)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertInventory = db.prepare(`
  INSERT OR IGNORE INTO inventory (id, product_id, quantity, avg_cost, location)
  VALUES (?, ?, ?, ?, 'main')
`);

const productIds: Record<string, string> = {};
for (const p of products) {
  const id = uuid();
  productIds[p.sku] = id;
  const brandId = p.brand ? brandMap[p.brand] || null : null;
  insertProduct.run(id, p.sku, p.barcode, p.name, catMap[p.cat], brandId, p.type, p.cost, p.sell, p.mrp, p.tax, '');
  // Add inventory — random stock
  const qty = Math.floor(Math.random() * 50) + 5;
  insertInventory.run(uuid(), id, qty, p.cost, );
}

// Frame attributes
const insertFrame = db.prepare(`
  INSERT OR IGNORE INTO frame_attributes (product_id, model, color, size_bridge, size_temple, material, shape, gender, frame_type)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
insertFrame.run(productIds['FR-RB-001'], 'RB3025', 'Gold', '14', '135', 'metal', 'aviator', 'unisex', 'full_rim');
insertFrame.run(productIds['FR-RB-002'], 'RB2140', 'Black', '22', '150', 'acetate', 'wayfarer', 'unisex', 'full_rim');
insertFrame.run(productIds['FR-TT-001'], 'T-2045', 'Gunmetal', '18', '140', 'metal', 'rectangular', 'male', 'full_rim');
insertFrame.run(productIds['FR-VC-001'], 'VC-R100', 'Tortoise', '20', '145', 'acetate', 'round', 'unisex', 'full_rim');
insertFrame.run(productIds['FR-JJ-001'], 'JJ-T500', 'Silver', '17', '140', 'titanium', 'rectangular', 'male', 'half_rim');
insertFrame.run(productIds['FR-OK-001'], 'OO9154', 'Matte Black', '16', '133', 'plastic', 'rectangular', 'male', 'semi_rimless');

// Lens attributes
const insertLens = db.prepare(`
  INSERT OR IGNORE INTO lens_attributes (product_id, lens_type, lens_index, lens_material, coating_ar, coating_blue_cut, coating_photochromic)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
insertLens.run(productIds['LN-ES-001'], 'single_vision', '1.56', 'cr39', 1, 0, 0);
insertLens.run(productIds['LN-ES-002'], 'progressive', '1.67', 'hi_index', 1, 1, 0);
insertLens.run(productIds['LN-ZS-001'], 'single_vision', '1.60', 'polycarbonate', 1, 1, 0);
insertLens.run(productIds['LN-HY-001'], 'single_vision', '1.60', 'hi_index', 1, 1, 0);

// Contact lens attributes
const insertContact = db.prepare(`
  INSERT OR IGNORE INTO contact_lens_attributes (product_id, contact_type, sphere_range, base_curve, diameter, pack_size)
  VALUES (?, ?, ?, ?, ?, ?)
`);
insertContact.run(productIds['CL-AC-001'], 'daily', '-12.00 to +8.00', '8.5', '14.3', 30);
insertContact.run(productIds['CL-BL-001'], 'monthly', '-9.00 to +6.00', '8.6', '14.2', 6);

// Sunglasses attributes
const insertSunglass = db.prepare(`
  INSERT OR IGNORE INTO sunglasses_attributes (product_id, is_rx_ready, uv_category, is_polarized, lens_color)
  VALUES (?, ?, ?, ?, ?)
`);
insertSunglass.run(productIds['SG-RB-001'], 0, '3', 1, 'Green');
insertSunglass.run(productIds['SG-FK-001'], 0, '3', 0, 'Black');

// ─── Sample Vendors ──────────────────────────────────
const vendors = [
  { id: uuid(), code: 'V001', company: 'Essilor India Pvt Ltd', contact: 'Rajesh Menon', phone: '9812345001', city: 'Mumbai', gst: '27AADCE1234F1Z5', terms: 'net30', days: 30 },
  { id: uuid(), code: 'V002', company: 'Zeiss Vision Care', contact: 'Amit Shah', phone: '9812345002', city: 'Bangalore', gst: '29AABCZ5678G1Z3', terms: 'net45', days: 45 },
  { id: uuid(), code: 'V003', company: 'Titan Eyeplus Wholesale', contact: 'Suresh Kumar', phone: '9812345003', city: 'Hosur', gst: '33AADCT9876H1Z2', terms: 'net30', days: 30 },
  { id: uuid(), code: 'V004', company: 'Luxottica India (Ray-Ban)', contact: 'Neha Verma', phone: '9812345004', city: 'Delhi', gst: '07AAACL4567I1Z1', terms: 'net60', days: 60 },
  { id: uuid(), code: 'V005', company: 'Johnson & Johnson Vision', contact: 'Dr. Sita Ram', phone: '9812345005', city: 'Chennai', gst: '33AAACJ7890K1Z4', terms: 'net30', days: 30 },
];

const insertVendor = db.prepare(`
  INSERT OR IGNORE INTO vendors (id, vendor_code, company_name, contact_person, phone, city, gst_no, payment_terms, credit_days)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
for (const v of vendors) {
  insertVendor.run(v.id, v.code, v.company, v.contact, v.phone, v.city, v.gst, v.terms, v.days);
}

// ─── Sample Customers ─────────────────────────────────
const customers = [
  { id: uuid(), no: 'C0001', first: 'Rahul', last: 'Verma', phone: '9988776601', email: 'rahul.verma@email.com', dob: '1990-05-15', gender: 'male', city: 'Delhi' },
  { id: uuid(), no: 'C0002', first: 'Anita', last: 'Sharma', phone: '9988776602', email: 'anita.s@email.com', dob: '1985-11-22', gender: 'female', city: 'Mumbai' },
  { id: uuid(), no: 'C0003', first: 'Vikram', last: 'Patel', phone: '9988776603', email: 'vikram.p@email.com', dob: '1978-03-08', gender: 'male', city: 'Ahmedabad' },
  { id: uuid(), no: 'C0004', first: 'Sneha', last: 'Reddy', phone: '9988776604', email: 'sneha.r@email.com', dob: '1995-07-30', gender: 'female', city: 'Hyderabad' },
  { id: uuid(), no: 'C0005', first: 'Arjun', last: 'Nair', phone: '9988776605', email: 'arjun.n@email.com', dob: '2000-01-12', gender: 'male', city: 'Kochi' },
];

const insertCustomer = db.prepare(`
  INSERT OR IGNORE INTO customers (id, customer_no, first_name, last_name, phone, email, date_of_birth, gender, city)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
for (const c of customers) {
  insertCustomer.run(c.id, c.no, c.first, c.last, c.phone, c.email, c.dob, c.gender, c.city);
}

// ─── Sample Prescriptions ─────────────────────────────
const insertRx = db.prepare(`
  INSERT OR IGNORE INTO prescriptions (id, prescription_no, customer_id, prescribed_by, prescription_date, expiry_date,
    od_sphere, od_cylinder, od_axis, od_add, od_pd,
    os_sphere, os_cylinder, os_axis, os_add, os_pd)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
insertRx.run(uuid(), 'RX-0001', customers[0].id, 'Dr. Anil Kumar', '2025-12-01', '2026-12-01', -2.50, -0.75, 180, null, 31, -3.00, -0.50, 175, null, 31);
insertRx.run(uuid(), 'RX-0002', customers[1].id, 'Dr. Anil Kumar', '2026-01-15', '2027-01-15', -1.00, -0.25, 90, 2.00, 30, -1.25, -0.50, 85, 2.00, 30);
insertRx.run(uuid(), 'RX-0003', customers[2].id, 'Dr. External', '2025-10-20', '2026-10-20', +1.50, null, null, null, 32, +1.75, -0.25, 10, null, 32);

// ─── Fiscal Period ────────────────────────────────────
db.prepare(`
  INSERT OR IGNORE INTO fiscal_periods (id, period_name, start_date, end_date)
  VALUES (?, ?, ?, ?)
`).run(uuid(), 'FY 2025-26', '2025-04-01', '2026-03-31');

// ─── Additional Customers ─────────────────────────────
const extraCustomers = [
  { id: uuid(), no: 'C0006', first: 'Meera', last: 'Joshi', phone: '9988776606', email: 'meera.j@email.com', dob: '1992-08-17', gender: 'female', city: 'Pune' },
  { id: uuid(), no: 'C0007', first: 'Karthik', last: 'Subramanian', phone: '9988776607', email: 'karthik.s@email.com', dob: '1988-12-03', gender: 'male', city: 'Chennai' },
  { id: uuid(), no: 'C0008', first: 'Pooja', last: 'Gupta', phone: '9988776608', email: 'pooja.g@email.com', dob: '1997-02-25', gender: 'female', city: 'Jaipur' },
  { id: uuid(), no: 'C0009', first: 'Deepak', last: 'Mishra', phone: '9988776609', email: 'deepak.m@email.com', dob: '1983-06-14', gender: 'male', city: 'Lucknow' },
  { id: uuid(), no: 'C0010', first: 'Fatima', last: 'Khan', phone: '9988776610', email: 'fatima.k@email.com', dob: '1991-10-09', gender: 'female', city: 'Hyderabad' },
  { id: uuid(), no: 'C0011', first: 'Ravi', last: 'Prasad', phone: '9988776611', email: 'ravi.p@email.com', dob: '1975-04-20', gender: 'male', city: 'Bangalore' },
  { id: uuid(), no: 'C0012', first: 'Nisha', last: 'Agarwal', phone: '9988776612', email: 'nisha.a@email.com', dob: '2001-01-30', gender: 'female', city: 'Kolkata' },
  { id: uuid(), no: 'C0013', first: 'Amir', last: 'Hussain', phone: '9988776613', email: 'amir.h@email.com', dob: '1986-09-11', gender: 'male', city: 'Delhi' },
  { id: uuid(), no: 'C0014', first: 'Lakshmi', last: 'Iyer', phone: '9988776614', email: 'lakshmi.i@email.com', dob: '1993-03-05', gender: 'female', city: 'Mumbai' },
  { id: uuid(), no: 'C0015', first: 'Sunil', last: 'Tiwari', phone: '9988776615', email: 'sunil.t@email.com', dob: '1980-11-28', gender: 'male', city: 'Bhopal' },
];

for (const c of extraCustomers) {
  insertCustomer.run(c.id, c.no, c.first, c.last, c.phone, c.email, c.dob, c.gender, c.city);
}

const allCustomers = [...customers, ...extraCustomers];

// ─── Demo Purchase Orders ─────────────────────────────
const poStatuses = ['received', 'received', 'received', 'sent', 'draft'];
const demoProductList = Object.entries(productIds);

for (let i = 0; i < 5; i++) {
  const poId = uuid();
  const vendor = vendors[i % vendors.length];
  const poDate = `2025-${String(10 + Math.floor(i / 2)).padStart(2, '0')}-${String(5 + i * 4).padStart(2, '0')}`;
  const itemCount = 2 + (i % 3);
  let subtotal = 0;
  const poItems: { id: string; productKey: string; qty: number; price: number; total: number }[] = [];

  for (let j = 0; j < itemCount && j < demoProductList.length; j++) {
    const [sku, prodId] = demoProductList[(i * 3 + j) % demoProductList.length];
    const prod = products.find(p => p.sku === sku);
    if (!prod) continue;
    const qty = 10 + i * 5 + j * 3;
    const price = prod.cost;
    const total = qty * price;
    subtotal += total;
    poItems.push({ id: uuid(), productKey: sku, qty, price, total });
  }

  const taxAmt = Math.round(subtotal * 0.18 * 100) / 100;
  const totalAmt = subtotal + taxAmt;

  db.prepare(`
    INSERT OR IGNORE INTO purchase_orders (id, po_number, vendor_id, order_date, expected_delivery, subtotal, tax_amount, total_amount, status, payment_terms, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(poId, `PO-2025-${String(i + 1).padStart(4, '0')}`, vendor.id, poDate, `2025-${String(11 + Math.floor(i / 2)).padStart(2, '0')}-${String(1 + i * 3).padStart(2, '0')}`, subtotal, taxAmt, totalAmt, poStatuses[i], vendor.terms, users[0].id);

  const insertPOItem = db.prepare('INSERT OR IGNORE INTO purchase_order_items (id, po_id, product_id, quantity, received_qty, unit_price, tax_rate, tax_amount, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const item of poItems) {
    const receivedQty = poStatuses[i] === 'received' ? item.qty : 0;
    insertPOItem.run(item.id, poId, productIds[item.productKey], item.qty, receivedQty, item.price, 18, Math.round(item.total * 0.18 * 100) / 100, item.total);
  }

  // Create GRN for received POs
  if (poStatuses[i] === 'received') {
    const grnId = uuid();
    db.prepare(`
      INSERT OR IGNORE INTO goods_receipt_notes (id, grn_number, po_id, vendor_id, receipt_date, status, received_by)
      VALUES (?, ?, ?, ?, ?, 'accepted', ?)
    `).run(grnId, `GRN-2025-${String(i + 1).padStart(4, '0')}`, poId, vendor.id, poDate, users[1].id);

    const insertGRNItem = db.prepare('INSERT OR IGNORE INTO grn_items (id, grn_id, po_item_id, product_id, ordered_qty, received_qty, accepted_qty) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const item of poItems) {
      insertGRNItem.run(uuid(), grnId, item.id, productIds[item.productKey], item.qty, item.qty, item.qty);
    }
  }
}

// ─── Demo Sales / Invoices ────────────────────────────
const saleDates = [
  '2026-01-05', '2026-01-08', '2026-01-12', '2026-01-15', '2026-01-18',
  '2026-01-20', '2026-01-22', '2026-01-25', '2026-01-28', '2026-02-01',
  '2026-02-03', '2026-02-05', '2026-02-07', '2026-02-08', '2026-02-09',
];

const paymentMethods = ['cash', 'card', 'upi', 'cash', 'card', 'upi', 'cash', 'card', 'cash', 'upi', 'card', 'cash', 'upi', 'card', 'cash'];

for (let i = 0; i < 15; i++) {
  const saleId = uuid();
  const cust = allCustomers[i % allCustomers.length];
  const invoiceNo = `INV-2026-${String(i + 1).padStart(4, '0')}`;

  // Pick 1-3 products per sale
  const numItems = 1 + (i % 3);
  let subtotal = 0;
  const saleItems: { prodSku: string; qty: number; unitPrice: number; costPrice: number; taxRate: number }[] = [];

  for (let j = 0; j < numItems; j++) {
    const idx = (i * 2 + j) % products.length;
    const prod = products[idx];
    const qty = 1 + (j % 2);
    subtotal += prod.sell * qty;
    saleItems.push({ prodSku: prod.sku, qty, unitPrice: prod.sell, costPrice: prod.cost, taxRate: prod.tax });
  }

  const discountAmt = i % 4 === 0 ? Math.round(subtotal * 0.1) : 0;
  const taxableAmt = subtotal - discountAmt;
  const avgTaxRate = saleItems.reduce((s, it) => s + it.taxRate, 0) / saleItems.length;
  const taxAmt = Math.round(taxableAmt * (avgTaxRate / 100) * 100) / 100;
  const cgst = Math.round(taxAmt / 2 * 100) / 100;
  const sgst = taxAmt - cgst;
  const totalAmt = taxableAmt + taxAmt;

  const isPaid = i % 5 !== 4;
  const paidAmt = isPaid ? totalAmt : Math.round(totalAmt * 0.5);
  const balanceAmt = totalAmt - paidAmt;
  const paymentStatus = isPaid ? 'paid' : 'partial';

  db.prepare(`
    INSERT OR IGNORE INTO sales (id, invoice_no, customer_id, sale_date, subtotal, discount_amount, tax_amount, cgst_amount, sgst_amount, total_amount, paid_amount, balance_amount, status, payment_status, loyalty_points_earned, cashier_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?)
  `).run(saleId, invoiceNo, cust.id, saleDates[i], subtotal, discountAmt, taxAmt, cgst, sgst, totalAmt, paidAmt, balanceAmt, paymentStatus, Math.floor(totalAmt / 100) * 5, users[2].id, saleDates[i] + ' ' + `${10 + (i % 8)}:${String(15 + i * 3).padStart(2, '0')}:00`);

  const insertSaleItem = db.prepare('INSERT OR IGNORE INTO sale_items (id, sale_id, product_id, quantity, unit_price, cost_price, discount_pct, tax_rate, tax_amount, cgst, sgst, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const item of saleItems) {
    const itemTotal = item.unitPrice * item.qty;
    const itemTax = Math.round(itemTotal * (item.taxRate / 100) * 100) / 100;
    const itemCgst = Math.round(itemTax / 2 * 100) / 100;
    insertSaleItem.run(uuid(), saleId, productIds[item.prodSku], item.qty, item.unitPrice, item.costPrice, 0, item.taxRate, itemTax, itemCgst, itemTax - itemCgst, itemTotal + itemTax);
  }

  // Create payment record
  const payId = uuid();
  db.prepare(`
    INSERT OR IGNORE INTO payments (id, payment_no, payment_type, reference_type, reference_id, customer_id, payment_date, amount, payment_method, created_by)
    VALUES (?, ?, 'sale', 'sale', ?, ?, ?, ?, ?, ?)
  `).run(payId, `PAY-2026-${String(i + 1).padStart(4, '0')}`, saleId, cust.id, saleDates[i], paidAmt, paymentMethods[i], users[2].id);
}

// ─── Demo Lab Orders ──────────────────────────────────
const labStatuses = ['delivered', 'ready', 'quality_check', 'fitting', 'in_progress', 'pending'];
for (let i = 0; i < 6; i++) {
  const labId = uuid();
  const cust = allCustomers[i % allCustomers.length];
  const orderDate = `2026-01-${String(10 + i * 3).padStart(2, '0')}`;
  const frameIdx = i % 6; // first 6 products are frames
  const lensIdx = 6 + (i % 4); // next 4 are lenses
  const frameProd = products[frameIdx];
  const lensProd = products[lensIdx];

  db.prepare(`
    INSERT OR IGNORE INTO lab_orders (id, order_no, customer_id, order_date, frame_product_id, lens_product_id, fitting_height, lab_type, lab_name, status, estimated_delivery, lab_cost, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    labId,
    `LAB-2026-${String(i + 1).padStart(4, '0')}`,
    cust.id,
    orderDate,
    productIds[frameProd.sku],
    productIds[lensProd.sku],
    `${28 + i}mm`,
    i % 2 === 0 ? 'in_house' : 'outsourced',
    i % 2 === 0 ? null : 'Vision Lab Bangalore',
    labStatuses[i],
    `2026-01-${String(15 + i * 3).padStart(2, '0')}`,
    lensProd.cost + 200,
    users[0].id
  );
}

db.saveSync();
console.log('✅ Database seeded successfully!');
console.log('   Default login: admin / admin123');
console.log('   Demo data: 15 customers, 18 products, 15 sales, 5 POs, 3 GRNs, 6 lab orders');
}

// CLI entry point (run via: tsx src/database/seed.ts)
if (process.argv[1]?.replace(/\\/g, '/').includes('seed')) {
  initializeDatabase()
    .then(() => { seedDatabase(); })
    .catch(err => { console.error('Seed failed:', err); process.exit(1); });
}

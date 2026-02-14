import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── USERS ────────────────────────────────────────
  const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@optixshop.com" },
    update: {},
    create: { name: "Admin User", email: "admin@optixshop.com", password: hash("admin123"), role: "ADMIN", isActive: true, updatedAt: new Date(), businessId: "default" },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@optixshop.com" },
    update: {},
    create: { name: "Store Manager", email: "manager@optixshop.com", password: hash("manager123"), role: "MANAGER", isActive: true, updatedAt: new Date(), businessId: "default" },
  });

  const cashier1 = await prisma.user.upsert({
    where: { email: "cashier1@optixshop.com" },
    update: {},
    create: { name: "Priya Sharma", email: "cashier1@optixshop.com", password: hash("cashier123"), role: "CASHIER", isActive: true, updatedAt: new Date(), businessId: "default" },
  });

  const optician = await prisma.user.upsert({
    where: { email: "optician@optixshop.com" },
    update: {},
    create: { name: "Dr. Rahul Verma", email: "optician@optixshop.com", password: hash("optician123"), role: "OPTICIAN", isActive: true, updatedAt: new Date(), businessId: "default" },
  });

  console.log("  ✅ Users created");

  // ─── SETTINGS ─────────────────────────────────────
  const settings = [
    { key: "store_name", value: "OptixShop Optical Store", category: "general" },
    { key: "store_phone", value: "+91 98765 43210", category: "general" },
    { key: "store_email", value: "info@optixshop.com", category: "general" },
    { key: "store_address", value: "123 MG Road, Bangalore, Karnataka 560001", category: "general" },
    { key: "gst_number", value: "29ABCDE1234F1Z5", category: "tax" },
    { key: "tax_rate", value: "18", category: "tax" },
    { key: "currency", value: "INR", category: "general" },
    { key: "loyalty_points_per_100", value: "1", category: "loyalty" },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
  }
  console.log("  ✅ Settings created");

  // ─── CATEGORIES ───────────────────────────────────
  const catFrames = await prisma.productCategory.create({ data: { name: "Eyeglasses Frames", sortOrder: 1 } });
  const catLenses = await prisma.productCategory.create({ data: { name: "Prescription Lenses", sortOrder: 2 } });
  const catContacts = await prisma.productCategory.create({ data: { name: "Contact Lenses", sortOrder: 3 } });
  const catSunglasses = await prisma.productCategory.create({ data: { name: "Sunglasses", sortOrder: 4 } });
  const catAccessories = await prisma.productCategory.create({ data: { name: "Accessories", sortOrder: 5 } });
  const catSolutions = await prisma.productCategory.create({ data: { name: "Lens Solutions", sortOrder: 6 } });
  console.log("  ✅ Categories created");

  // ─── BRANDS ───────────────────────────────────────
  const brands: Record<string, any> = {};
  for (const name of ["Ray-Ban", "Oakley", "Titan", "Lenskart", "Vincent Chase", "John Jacobs", "Bausch & Lomb", "Acuvue", "Crizal", "Zeiss"]) {
    brands[name] = await prisma.brand.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log("  ✅ Brands created");

  // ─── PRODUCTS ─────────────────────────────────────
  const productsData = [
    { sku: "FRM-001", name: "Ray-Ban Aviator Classic", type: "frame", catId: catFrames.id, brandId: brands["Ray-Ban"].id, cost: 4500, sell: 8500, mrp: 9500 },
    { sku: "FRM-002", name: "Oakley Half Jacket 2.0", type: "frame", catId: catFrames.id, brandId: brands["Oakley"].id, cost: 5200, sell: 9800, mrp: 11000 },
    { sku: "FRM-003", name: "Titan Full Rim Rectangle", type: "frame", catId: catFrames.id, brandId: brands["Titan"].id, cost: 1200, sell: 2400, mrp: 2800 },
    { sku: "FRM-004", name: "Lenskart Air Flex Round", type: "frame", catId: catFrames.id, brandId: brands["Lenskart"].id, cost: 800, sell: 1499, mrp: 1999 },
    { sku: "FRM-005", name: "John Jacobs Cat Eye", type: "frame", catId: catFrames.id, brandId: brands["John Jacobs"].id, cost: 1500, sell: 2999, mrp: 3499 },
    { sku: "FRM-006", name: "Vincent Chase Wayfarer", type: "frame", catId: catFrames.id, brandId: brands["Vincent Chase"].id, cost: 600, sell: 1299, mrp: 1499 },
    { sku: "LNS-001", name: "Crizal Sapphire UV 1.67", type: "lens", catId: catLenses.id, brandId: brands["Crizal"].id, cost: 3500, sell: 6500, mrp: 7500 },
    { sku: "LNS-002", name: "Zeiss SmartLife Progressive", type: "lens", catId: catLenses.id, brandId: brands["Zeiss"].id, cost: 8000, sell: 14500, mrp: 16000 },
    { sku: "LNS-003", name: "Crizal Blue Cut 1.56", type: "lens", catId: catLenses.id, brandId: brands["Crizal"].id, cost: 1800, sell: 3500, mrp: 4000 },
    { sku: "LNS-004", name: "Zeiss Single Vision 1.6", type: "lens", catId: catLenses.id, brandId: brands["Zeiss"].id, cost: 2200, sell: 4500, mrp: 5200 },
    { sku: "CL-001", name: "Acuvue Oasys Daily 30pk", type: "contact_lens", catId: catContacts.id, brandId: brands["Acuvue"].id, cost: 1200, sell: 1899, mrp: 2200 },
    { sku: "CL-002", name: "Bausch & Lomb SofLens Monthly", type: "contact_lens", catId: catContacts.id, brandId: brands["Bausch & Lomb"].id, cost: 400, sell: 799, mrp: 999 },
    { sku: "SUN-001", name: "Ray-Ban Wayfarer Polarized", type: "sunglasses", catId: catSunglasses.id, brandId: brands["Ray-Ban"].id, cost: 5500, sell: 9999, mrp: 12000 },
    { sku: "SUN-002", name: "Oakley Holbrook Sport", type: "sunglasses", catId: catSunglasses.id, brandId: brands["Oakley"].id, cost: 4800, sell: 8999, mrp: 10500 },
    { sku: "ACC-001", name: "Premium Microfiber Cloth Set", type: "accessory", catId: catAccessories.id, brandId: null, cost: 50, sell: 149, mrp: 199 },
    { sku: "ACC-002", name: "Hard Shell Glasses Case", type: "accessory", catId: catAccessories.id, brandId: null, cost: 120, sell: 349, mrp: 499 },
    { sku: "SOL-001", name: "Bausch & Lomb ReNu Multi 360ml", type: "solution", catId: catSolutions.id, brandId: brands["Bausch & Lomb"].id, cost: 220, sell: 399, mrp: 450 },
    { sku: "SOL-002", name: "Acuvue RevitaLens 300ml", type: "solution", catId: catSolutions.id, brandId: brands["Acuvue"].id, cost: 280, sell: 499, mrp: 550 },
  ];

  const createdProducts: Record<string, any> = {};
  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        sku: p.sku, name: p.name, productType: p.type,
        categoryId: p.catId, brandId: p.brandId,
        costPrice: p.cost, sellingPrice: p.sell, mrp: p.mrp,
        taxRate: 18, hsnSacCode: p.type === "frame" ? "9004" : p.type === "lens" ? "9001" : "9004",
      },
    });
    createdProducts[p.sku] = product;
    // Create inventory
    const qty = p.type === "accessory" || p.type === "solution" ? Math.floor(Math.random() * 50) + 20 : Math.floor(Math.random() * 30) + 5;
    await prisma.inventory.create({
      data: { productId: product.id, quantity: qty, avgCost: p.cost, location: "main" },
    });
  }
  console.log("  ✅ Products + Inventory created");

  // Frame attributes
  const frameData = [
    { sku: "FRM-001", model: "RB3025", color: "Gold", bridge: "14", temple: "135", material: "Metal", shape: "Aviator", gender: "Unisex", frameType: "Full Rim" },
    { sku: "FRM-002", model: "OO9154", color: "Black", bridge: "15", temple: "133", material: "O-Matter", shape: "Rectangle", gender: "Men", frameType: "Half Rim" },
    { sku: "FRM-003", model: "TN-4521", color: "Brown", bridge: "16", temple: "140", material: "TR90", shape: "Rectangle", gender: "Unisex", frameType: "Full Rim" },
    { sku: "FRM-004", model: "LA-7892", color: "Blue", bridge: "17", temple: "140", material: "TR90", shape: "Round", gender: "Unisex", frameType: "Full Rim" },
    { sku: "FRM-005", model: "JJ-CE01", color: "Tortoise", bridge: "15", temple: "135", material: "Acetate", shape: "Cat Eye", gender: "Women", frameType: "Full Rim" },
    { sku: "FRM-006", model: "VC-WF02", color: "Black Matte", bridge: "14", temple: "140", material: "Acetate", shape: "Wayfarer", gender: "Unisex", frameType: "Full Rim" },
  ];
  for (const f of frameData) {
    await prisma.frameAttribute.create({
      data: { productId: createdProducts[f.sku].id, model: f.model, color: f.color, sizeBridge: f.bridge, sizeTemple: f.temple, material: f.material, shape: f.shape, gender: f.gender, frameType: f.frameType },
    });
  }

  // Lens attributes
  for (const sku of ["LNS-001", "LNS-002", "LNS-003", "LNS-004"]) {
    await prisma.lensAttribute.create({
      data: {
        productId: createdProducts[sku].id,
        lensType: sku.includes("002") ? "progressive" : "single_vision",
        lensIndex: sku.includes("001") ? "1.67" : sku.includes("003") ? "1.56" : "1.60",
        lensMaterial: "polycarbonate",
        coatingAr: true,
        coatingBlueCut: sku.includes("003"),
      },
    });
  }
  console.log("  ✅ Product attributes created");

  // ─── CUSTOMERS ────────────────────────────────────
  const customersData = [
    { no: "CUST00001", first: "Rahul", last: "Kumar", phone: "9876543210", email: "rahul@email.com", city: "Bangalore", gender: "Male" },
    { no: "CUST00002", first: "Priya", last: "Singh", phone: "9876543211", email: "priya@email.com", city: "Bangalore", gender: "Female" },
    { no: "CUST00003", first: "Amit", last: "Patel", phone: "9876543212", email: "amit@email.com", city: "Mumbai", gender: "Male" },
    { no: "CUST00004", first: "Sneha", last: "Reddy", phone: "9876543213", email: "sneha@email.com", city: "Hyderabad", gender: "Female" },
    { no: "CUST00005", first: "Vikram", last: "Joshi", phone: "9876543214", email: "vikram@email.com", city: "Pune", gender: "Male" },
    { no: "CUST00006", first: "Anjali", last: "Gupta", phone: "9876543215", email: "anjali@email.com", city: "Delhi", gender: "Female" },
    { no: "CUST00007", first: "Karan", last: "Mehta", phone: "9876543216", email: "karan@email.com", city: "Bangalore", gender: "Male" },
    { no: "CUST00008", first: "Deepa", last: "Nair", phone: "9876543217", email: "deepa@email.com", city: "Kochi", gender: "Female" },
    { no: "CUST00009", first: "Suresh", last: "Rao", phone: "9876543218", city: "Chennai", gender: "Male" },
    { no: "CUST00010", first: "Meena", last: "Iyer", phone: "9876543219", email: "meena@email.com", city: "Bangalore", gender: "Female" },
    { no: "CUST00011", first: "Arjun", last: "Shah", phone: "9876543220", city: "Ahmedabad", gender: "Male" },
    { no: "CUST00012", first: "Ritu", last: "Kapoor", phone: "9876543221", email: "ritu@email.com", city: "Jaipur", gender: "Female" },
    { no: "CUST00013", first: "Naveen", last: "Prasad", phone: "9876543222", city: "Bangalore", gender: "Male" },
    { no: "CUST00014", first: "Kavitha", last: "Menon", phone: "9876543223", email: "kavitha@email.com", city: "Trivandrum", gender: "Female" },
    { no: "CUST00015", first: "Sanjay", last: "Deshmukh", phone: "9876543224", city: "Nagpur", gender: "Male" },
  ];

  const createdCustomers: Record<string, any> = {};
  for (const c of customersData) {
    const customer = await prisma.customer.create({
      data: { customerNo: c.no, firstName: c.first, lastName: c.last, phone: c.phone, email: c.email, city: c.city, gender: c.gender },
    });
    createdCustomers[c.no] = customer;
  }
  console.log("  ✅ Customers created");

  // ─── PRESCRIPTIONS ────────────────────────────────
  const rxData = [
    { no: "RX00001", custId: createdCustomers["CUST00001"].id, doctor: "Dr. Sharma", date: "2024-10-15", odSph: -2.5, odCyl: -0.75, odAxis: 180, osSph: -3.0, osCyl: -0.5, osAxis: 170 },
    { no: "RX00002", custId: createdCustomers["CUST00002"].id, doctor: "Dr. Sharma", date: "2024-10-20", odSph: -1.25, odCyl: -0.5, odAxis: 90, osSph: -1.5, osCyl: -0.25, osAxis: 85 },
    { no: "RX00003", custId: createdCustomers["CUST00003"].id, doctor: "Dr. Patel", date: "2024-11-01", odSph: 1.0, odCyl: null, odAxis: null, osSph: 0.75, osCyl: null, osAxis: null, odAdd: 2.0, osAdd: 2.0 },
    { no: "RX00004", custId: createdCustomers["CUST00004"].id, doctor: "Dr. Reddy", date: "2024-11-10", odSph: -4.0, odCyl: -1.25, odAxis: 5, osSph: -3.75, osCyl: -1.0, osAxis: 175 },
    { no: "RX00005", custId: createdCustomers["CUST00005"].id, doctor: "Dr. Sharma", date: "2024-11-15", odSph: -0.5, odCyl: -0.25, odAxis: 180, osSph: -0.75, osCyl: null, osAxis: null },
    { no: "RX00006", custId: createdCustomers["CUST00006"].id, doctor: "Dr. Kapoor", date: "2024-12-01", odSph: -1.75, odCyl: -0.5, odAxis: 160, osSph: -2.0, osCyl: -0.75, osAxis: 15 },
    { no: "RX00007", custId: createdCustomers["CUST00007"].id, doctor: "Dr. Sharma", date: "2024-12-05", odSph: 2.25, odCyl: null, odAxis: null, osSph: 2.5, osCyl: null, osAxis: null, odAdd: 2.5, osAdd: 2.5 },
    { no: "RX00008", custId: createdCustomers["CUST00008"].id, doctor: "Dr. Nair", date: "2024-12-10", odSph: -3.5, odCyl: -1.0, odAxis: 90, osSph: -3.25, osCyl: -0.75, osAxis: 85 },
  ];

  const createdRx: Record<string, any> = {};
  for (const rx of rxData) {
    const prescription = await prisma.prescription.create({
      data: {
        prescriptionNo: rx.no, customerId: rx.custId, prescribedBy: rx.doctor,
        prescriptionDate: rx.date,
        odSphere: rx.odSph, odCylinder: rx.odCyl, odAxis: rx.odAxis,
        odAdd: (rx as any).odAdd ?? null,
        osSphere: rx.osSph, osCylinder: rx.osCyl, osAxis: rx.osAxis,
        osAdd: (rx as any).osAdd ?? null,
      },
    });
    createdRx[rx.no] = prescription;
  }
  console.log("  ✅ Prescriptions created");

  // ─── VENDORS ──────────────────────────────────────
  const vendorsData = [
    { code: "VND0001", company: "Essilor India Pvt Ltd", contact: "Rajeev Malik", phone: "9800100100", email: "orders@essilor.in", city: "Delhi", creditDays: 45 },
    { code: "VND0002", company: "Titan Eyeplus Wholesale", contact: "Sunil Verma", phone: "9800200200", email: "wholesale@titan.com", city: "Bangalore", creditDays: 30 },
    { code: "VND0003", company: "Luxottica India", contact: "Marco Rossi", phone: "9800300300", email: "india@luxottica.com", city: "Mumbai", creditDays: 60 },
    { code: "VND0004", company: "Johnson & Johnson Vision", contact: "Anil Kumar", phone: "9800400400", email: "vision@jnj.com", city: "Mumbai", creditDays: 30 },
    { code: "VND0005", company: "Bausch & Lomb India", contact: "Priya Das", phone: "9800500500", email: "india@bausch.com", city: "Gurgaon", creditDays: 45 },
  ];

  const createdVendors: Record<string, any> = {};
  for (const v of vendorsData) {
    const vendor = await prisma.vendor.create({
      data: { vendorCode: v.code, companyName: v.company, contactPerson: v.contact, phone: v.phone, email: v.email, city: v.city, creditDays: v.creditDays },
    });
    createdVendors[v.code] = vendor;
  }
  console.log("  ✅ Vendors created");

  // ─── CHART OF ACCOUNTS ────────────────────────────
  const coaData = [
    { code: "1000", name: "Assets", type: "asset", isGroup: true, isSystem: true },
    { code: "1100", name: "Cash and Bank", type: "asset", isGroup: true, isSystem: true },
    { code: "1110", name: "Cash in Hand", type: "asset", isGroup: false, isSystem: true },
    { code: "1120", name: "Bank Account", type: "asset", isGroup: false, isSystem: true },
    { code: "1200", name: "Accounts Receivable", type: "asset", isGroup: false, isSystem: true },
    { code: "1300", name: "Inventory", type: "asset", isGroup: false, isSystem: true },
    { code: "1400", name: "Fixed Assets", type: "asset", isGroup: true, isSystem: false },
    { code: "1410", name: "Equipment", type: "asset", isGroup: false, isSystem: false },
    { code: "2000", name: "Liabilities", type: "liability", isGroup: true, isSystem: true },
    { code: "2100", name: "Accounts Payable", type: "liability", isGroup: false, isSystem: true },
    { code: "2200", name: "GST Payable", type: "liability", isGroup: true, isSystem: true },
    { code: "2210", name: "CGST Payable", type: "liability", isGroup: false, isSystem: true },
    { code: "2220", name: "SGST Payable", type: "liability", isGroup: false, isSystem: true },
    { code: "2230", name: "IGST Payable", type: "liability", isGroup: false, isSystem: true },
    { code: "2300", name: "GST Input Credit", type: "asset", isGroup: true, isSystem: true },
    { code: "2310", name: "CGST Input Credit", type: "asset", isGroup: false, isSystem: true },
    { code: "2320", name: "SGST Input Credit", type: "asset", isGroup: false, isSystem: true },
    { code: "2330", name: "IGST Input Credit", type: "asset", isGroup: false, isSystem: true },
    { code: "3000", name: "Equity", type: "equity", isGroup: true, isSystem: true },
    { code: "3100", name: "Owner Capital", type: "equity", isGroup: false, isSystem: true },
    { code: "3200", name: "Retained Earnings", type: "equity", isGroup: false, isSystem: true },
    { code: "4000", name: "Income", type: "income", isGroup: true, isSystem: true },
    { code: "4100", name: "Sales Revenue", type: "income", isGroup: false, isSystem: true },
    { code: "4200", name: "Service Income (Lab)", type: "income", isGroup: false, isSystem: false },
    { code: "4300", name: "Discount Given", type: "income", isGroup: false, isSystem: false },
    { code: "5000", name: "Expenses", type: "expense", isGroup: true, isSystem: true },
    { code: "5100", name: "Cost of Goods Sold", type: "expense", isGroup: false, isSystem: true },
    { code: "5200", name: "Salaries & Wages", type: "expense", isGroup: false, isSystem: false },
    { code: "5300", name: "Rent", type: "expense", isGroup: false, isSystem: false },
    { code: "5400", name: "Utilities", type: "expense", isGroup: false, isSystem: false },
    { code: "5500", name: "Marketing", type: "expense", isGroup: false, isSystem: false },
    { code: "5600", name: "Office Supplies", type: "expense", isGroup: false, isSystem: false },
    { code: "5700", name: "Purchase Returns", type: "expense", isGroup: false, isSystem: false },
    { code: "5800", name: "Sales Returns", type: "expense", isGroup: false, isSystem: false },
  ];

  for (const acc of coaData) {
    await prisma.chartOfAccount.create({
      data: { accountCode: acc.code, accountName: acc.name, accountType: acc.type, isGroup: acc.isGroup, isSystem: acc.isSystem },
    });
  }
  console.log("  ✅ Chart of Accounts created");

  // ─── FISCAL PERIOD ────────────────────────────────
  await prisma.fiscalPeriod.create({
    data: { periodName: "FY 2024-25", startDate: "2024-04-01", endDate: "2025-03-31" },
  });

  // ─── PURCHASE ORDERS ──────────────────────────────
  const po1 = await prisma.purchaseOrder.create({
    data: {
      poNumber: "PO00001",
      vendorId: createdVendors["VND0003"].id,
      orderDate: "2024-11-01",
      expectedDelivery: "2024-11-15",
      subtotal: 30000, taxAmount: 5400, totalAmount: 35400,
      status: "received",
      createdById: admin.id,
      items: {
        create: [
          { productId: createdProducts["FRM-001"].id, quantity: 5, unitPrice: 4500, taxRate: 18, taxAmount: 4050, total: 26550, receivedQty: 5 },
          { productId: createdProducts["FRM-006"].id, quantity: 10, unitPrice: 600, taxRate: 18, taxAmount: 1080, total: 7080, receivedQty: 10 },
        ],
      },
    },
  });

  const po2 = await prisma.purchaseOrder.create({
    data: {
      poNumber: "PO00002",
      vendorId: createdVendors["VND0001"].id,
      orderDate: "2024-11-10",
      expectedDelivery: "2024-11-25",
      subtotal: 26000, taxAmount: 4680, totalAmount: 30680,
      status: "received",
      createdById: admin.id,
      items: {
        create: [
          { productId: createdProducts["LNS-001"].id, quantity: 10, unitPrice: 3500, taxRate: 18, taxAmount: 6300, total: 41300, receivedQty: 10 },
        ],
      },
    },
  });

  const po3 = await prisma.purchaseOrder.create({
    data: {
      poNumber: "PO00003",
      vendorId: createdVendors["VND0004"].id,
      orderDate: "2024-12-01",
      status: "sent",
      subtotal: 12000, taxAmount: 2160, totalAmount: 14160,
      createdById: manager.id,
      items: {
        create: [
          { productId: createdProducts["CL-001"].id, quantity: 10, unitPrice: 1200, taxRate: 18, taxAmount: 2160, total: 14160, receivedQty: 0 },
        ],
      },
    },
  });
  console.log("  ✅ Purchase Orders created");

  // ─── GRNs ─────────────────────────────────────────
  const po1Items = await prisma.purchaseOrderItem.findMany({ where: { poId: po1.id } });
  await prisma.goodsReceiptNote.create({
    data: {
      grnNumber: "GRN00001",
      poId: po1.id,
      vendorId: createdVendors["VND0003"].id,
      receiptDate: "2024-11-14",
      status: "completed",
      receivedById: manager.id,
      items: {
        create: po1Items.map(item => ({
          poItemId: item.id,
          productId: item.productId,
          orderedQty: item.quantity,
          receivedQty: item.quantity,
          acceptedQty: item.quantity,
          rejectedQty: 0,
        })),
      },
    },
  });

  const po2Items = await prisma.purchaseOrderItem.findMany({ where: { poId: po2.id } });
  await prisma.goodsReceiptNote.create({
    data: {
      grnNumber: "GRN00002",
      poId: po2.id,
      vendorId: createdVendors["VND0001"].id,
      receiptDate: "2024-11-24",
      status: "completed",
      receivedById: manager.id,
      items: {
        create: po2Items.map(item => ({
          poItemId: item.id,
          productId: item.productId,
          orderedQty: item.quantity,
          receivedQty: item.quantity,
          acceptedQty: item.quantity,
          rejectedQty: 0,
        })),
      },
    },
  });
  console.log("  ✅ GRNs created");

  // ─── SALES ────────────────────────────────────────
  const salesData = [
    { inv: "INV00001", custNo: "CUST00001", rxNo: "RX00001", date: "2024-11-16", items: [{ sku: "FRM-001", qty: 1 }, { sku: "LNS-001", qty: 2 }] },
    { inv: "INV00002", custNo: "CUST00002", rxNo: "RX00002", date: "2024-11-18", items: [{ sku: "FRM-004", qty: 1 }, { sku: "LNS-003", qty: 2 }] },
    { inv: "INV00003", custNo: "CUST00003", rxNo: "RX00003", date: "2024-11-20", items: [{ sku: "FRM-003", qty: 1 }, { sku: "LNS-002", qty: 2 }] },
    { inv: "INV00004", custNo: "CUST00004", rxNo: "RX00004", date: "2024-11-25", items: [{ sku: "FRM-005", qty: 1 }, { sku: "LNS-001", qty: 2 }, { sku: "ACC-001", qty: 1 }] },
    { inv: "INV00005", custNo: "CUST00005", rxNo: "RX00005", date: "2024-12-01", items: [{ sku: "FRM-006", qty: 1 }, { sku: "LNS-003", qty: 2 }] },
    { inv: "INV00006", custNo: "CUST00006", rxNo: "RX00006", date: "2024-12-03", items: [{ sku: "FRM-001", qty: 1 }, { sku: "LNS-004", qty: 2 }, { sku: "ACC-002", qty: 1 }] },
    { inv: "INV00007", custNo: "CUST00007", rxNo: "RX00007", date: "2024-12-06", items: [{ sku: "FRM-002", qty: 1 }, { sku: "LNS-002", qty: 2 }] },
    { inv: "INV00008", custNo: "CUST00008", rxNo: "RX00008", date: "2024-12-11", items: [{ sku: "SUN-001", qty: 1 }, { sku: "CL-001", qty: 2 }] },
    { inv: "INV00009", custNo: "CUST00009", date: "2024-12-12", items: [{ sku: "SUN-002", qty: 1 }] },
    { inv: "INV00010", custNo: "CUST00010", date: "2024-12-13", items: [{ sku: "CL-002", qty: 3 }, { sku: "SOL-001", qty: 1 }] },
    { inv: "INV00011", custNo: "CUST00011", date: "2024-12-14", items: [{ sku: "FRM-004", qty: 1 }, { sku: "LNS-003", qty: 2 }, { sku: "ACC-001", qty: 2 }] },
    { inv: "INV00012", custNo: "CUST00012", date: "2024-12-15", items: [{ sku: "FRM-005", qty: 1 }, { sku: "LNS-004", qty: 2 }] },
    { inv: "INV00013", custNo: "CUST00001", date: "2024-12-16", items: [{ sku: "CL-001", qty: 1 }, { sku: "SOL-002", qty: 1 }] },
    { inv: "INV00014", custNo: "CUST00013", date: "2024-12-17", items: [{ sku: "FRM-003", qty: 1 }, { sku: "LNS-001", qty: 2 }] },
    { inv: "INV00015", custNo: "CUST00014", date: "2024-12-18", items: [{ sku: "SUN-001", qty: 1 }, { sku: "ACC-002", qty: 1 }] },
  ];

  for (const sale of salesData) {
    let subtotal = 0;
    let totalTax = 0;
    const itemsCreate = sale.items.map((item) => {
      const p = createdProducts[item.sku];
      const lineTotal = p.sellingPrice * item.qty;
      const tax = lineTotal * 0.18;
      subtotal += lineTotal;
      totalTax += tax;
      return {
        productId: p.id, quantity: item.qty, unitPrice: p.sellingPrice,
        costPrice: p.costPrice, taxRate: 18, taxAmount: tax,
        cgst: tax / 2, sgst: tax / 2, total: lineTotal + tax,
      };
    });

    const totalAmount = subtotal + totalTax;

    await prisma.sale.create({
      data: {
        invoiceNo: sale.inv,
        customerId: createdCustomers[sale.custNo].id,
        prescriptionId: sale.rxNo ? createdRx[sale.rxNo]?.id : null,
        saleDate: sale.date,
        subtotal, taxAmount: totalTax, cgstAmount: totalTax / 2, sgstAmount: totalTax / 2,
        totalAmount, paidAmount: totalAmount, balanceAmount: 0,
        status: "completed", paymentStatus: "paid",
        cashierId: cashier1.id,
        items: { create: itemsCreate },
      },
    });

    // Update customer total
    await prisma.customer.update({
      where: { id: createdCustomers[sale.custNo].id },
      data: { totalPurchases: { increment: totalAmount } },
    });
  }
  console.log("  ✅ Sales created");

  // ─── PAYMENTS ─────────────────────────────────────
  const allSales = await prisma.sale.findMany();
  let payIdx = 1;
  for (const s of allSales) {
    await prisma.payment.create({
      data: {
        paymentNo: `PAY${String(payIdx++).padStart(5, "0")}`,
        paymentType: "receipt",
        saleId: s.id,
        customerId: s.customerId,
        paymentDate: s.saleDate,
        amount: s.totalAmount,
        paymentMethod: payIdx % 3 === 0 ? "card" : payIdx % 3 === 1 ? "upi" : "cash",
      },
    });
  }
  console.log("  ✅ Payments created");

  // ─── LAB ORDERS ───────────────────────────────────
  const labData = [
    { no: "LAB00001", custNo: "CUST00001", rxNo: "RX00001", frame: "FRM-001", lens: "LNS-001", status: "delivered", date: "2024-11-16", est: "2024-11-23", actual: "2024-11-22", cost: 500 },
    { no: "LAB00002", custNo: "CUST00002", rxNo: "RX00002", frame: "FRM-004", lens: "LNS-003", status: "delivered", date: "2024-11-18", est: "2024-11-25", actual: "2024-11-24", cost: 400 },
    { no: "LAB00003", custNo: "CUST00003", rxNo: "RX00003", frame: "FRM-003", lens: "LNS-002", status: "ready", date: "2024-11-20", est: "2024-11-27", cost: 800 },
    { no: "LAB00004", custNo: "CUST00004", rxNo: "RX00004", frame: "FRM-005", lens: "LNS-001", status: "in_progress", date: "2024-11-25", est: "2024-12-02", cost: 500 },
    { no: "LAB00005", custNo: "CUST00005", rxNo: "RX00005", frame: "FRM-006", lens: "LNS-003", status: "in_progress", date: "2024-12-01", est: "2024-12-08", cost: 400 },
    { no: "LAB00006", custNo: "CUST00006", rxNo: "RX00006", frame: "FRM-001", lens: "LNS-004", status: "pending", date: "2024-12-03", est: "2024-12-10", cost: 450 },
  ];

  for (const lo of labData) {
    const saleForLab = await prisma.sale.findFirst({ where: { customerId: createdCustomers[lo.custNo].id } });
    await prisma.labOrder.create({
      data: {
        orderNo: lo.no,
        saleId: saleForLab?.id,
        customerId: createdCustomers[lo.custNo].id,
        prescriptionId: createdRx[lo.rxNo].id,
        orderDate: lo.date,
        frameProductId: createdProducts[lo.frame].id,
        lensProductId: createdProducts[lo.lens].id,
        status: lo.status,
        estimatedDelivery: lo.est,
        actualDelivery: lo.actual || null,
        labType: "in_house",
        labCost: lo.cost,
        createdById: optician.id,
      },
    });
  }
  console.log("  ✅ Lab Orders created");

  // ─── COUPONS ──────────────────────────────────────
  await prisma.coupon.createMany({
    data: [
      { code: "WELCOME10", discountType: "percentage", discountValue: 10, minPurchase: 1000, maxDiscount: 500, validFrom: "2024-01-01", validTo: "2025-12-31" },
      { code: "FLAT500", discountType: "amount", discountValue: 500, minPurchase: 3000, validFrom: "2024-01-01", validTo: "2025-06-30" },
      { code: "SUMMER25", discountType: "percentage", discountValue: 25, minPurchase: 2000, maxDiscount: 1000, validFrom: "2024-04-01", validTo: "2024-06-30", isActive: false },
    ],
  });
  console.log("  ✅ Coupons created");

  console.log("\n🎉 Database seeded successfully!");
  console.log("   Login with: admin / admin123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

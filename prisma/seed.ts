import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);

  // ─── USERS ────────────────────────────────────────
  const nate = await prisma.user.upsert({
    where: { username: "nate" },
    update: {},
    create: {
      username: "nate",
      fullName: "Nasir Qureshi",
      email: "nasir.pk@gmail.com",
      passwordHash: "$2a$12$2ATneOeqOP.WS.ucJj/dj.FISAasJeECb0ggrQFYoEbBz6ELBv.Ju",
      role: "ADMIN",
      isActive: true
    },
  });

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      fullName: "Admin User",
      email: "admin@optixshop.com",
      passwordHash: hash("admin123"),
      role: "ADMIN",
      isActive: true
    },
  });

  const manager = await prisma.user.upsert({
    where: { username: "manager" },
    update: {},
    create: {
      username: "manager",
      fullName: "Bilal Ahmed",
      email: "manager@optixshop.com",
      passwordHash: hash("manager123"),
      role: "MANAGER",
      isActive: true
    },
  });

  const cashier1 = await prisma.user.upsert({
    where: { username: "cashier1" },
    update: {},
    create: {
      username: "cashier1",
      fullName: "Ayesha Khan",
      email: "cashier1@optixshop.com",
      passwordHash: hash("cashier123"),
      role: "CASHIER",
      isActive: true
    },
  });

  const optician = await prisma.user.upsert({
    where: { username: "optician" },
    update: {},
    create: {
      username: "optician",
      fullName: "Dr. Muddasar Ali",
      email: "optician@optixshop.com",
      passwordHash: hash("optician123"),
      role: "SALES_PERSON",
      isActive: true
    },
  });

  console.log("  ✅ Users created");

  // ─── SETTINGS ─────────────────────────────────────
  const settings = [
    { key: "store_name", value: "OptixShop Pakistan", category: "general" },
    { key: "store_phone", value: "+92 300 1234567", category: "general" },
    { key: "store_email", value: "info@optixshop.pk", category: "general" },
    { key: "store_address", value: "Shop 15, Dolmen Mall, Clifton, Karachi", category: "general" },
    { key: "gst_number", value: "1234567-8", category: "tax" },
    { key: "tax_rate", value: "17", category: "tax" },
    { key: "currency", value: "PKR", category: "general" },
    { key: "loyalty_points_per_100", value: "1", category: "loyalty" },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s });
  }
  console.log("  ✅ Settings created");

  // ─── CATEGORIES ───────────────────────────────────
  const catFrames = await prisma.productCategory.upsert({
    where: { id: "cat-frames" },
    update: {},
    create: { id: "cat-frames", name: "Eyeglasses Frames", sortOrder: 1, isActive: true }
  });
  const catLenses = await prisma.productCategory.upsert({
    where: { id: "cat-lenses" },
    update: {},
    create: { id: "cat-lenses", name: "Prescription Lenses", sortOrder: 2, isActive: true }
  });
  const catContacts = await prisma.productCategory.upsert({
    where: { id: "cat-contacts" },
    update: {},
    create: { id: "cat-contacts", name: "Contact Lenses", sortOrder: 3, isActive: true }
  });
  const catSunglasses = await prisma.productCategory.upsert({
    where: { id: "cat-sunglasses" },
    update: {},
    create: { id: "cat-sunglasses", name: "Sunglasses", sortOrder: 4, isActive: true }
  });
  const catAccessories = await prisma.productCategory.upsert({
    where: { id: "cat-accessories" },
    update: {},
    create: { id: "cat-accessories", name: "Accessories", sortOrder: 5, isActive: true }
  });
  console.log("  ✅ Categories created");

  // ─── BRANDS ───────────────────────────────────────
  const brandNames = ["Ray-Ban", "Oakley", "Gucci", "Prada", "Dolce & Gabbana", "Versace", "Tom Ford", "Carrera", "Crizal", "Zeiss"];
  const brands: Record<string, { id: string; name: string }> = {};
  for (const name of brandNames) {
    const existing = await prisma.brand.findFirst({ where: { name } });
    if (existing) {
      brands[name] = existing;
    } else {
      brands[name] = await prisma.brand.create({ data: { name, isActive: true } });
    }
  }
  console.log("  ✅ Brands created");

  // ─── PRODUCTS WITH IMAGES ─────────────────────────
  const productsData = [
    { 
      sku: "RB-AVI-001", 
      name: "Ray-Ban Aviator Classic Gold", 
      type: "frame", 
      catId: catFrames.id, 
      brandId: brands["Ray-Ban"].id, 
      cost: 12000, 
      sell: 22000, 
      mrp: 25000,
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
      colors: "Gold, Silver, Black",
      colorVariants: JSON.stringify([
        { color: "Gold", sku: "RB-AVI-001-GLD", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400" },
        { color: "Silver", sku: "RB-AVI-001-SLV", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400" }
      ])
    },
    { 
      sku: "GUC-SQ-002", 
      name: "Gucci Square Acetate Frame", 
      type: "frame", 
      catId: catFrames.id, 
      brandId: brands["Gucci"].id, 
      cost: 25000, 
      sell: 45000, 
      mrp: 52000,
      image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400",
      colors: "Tortoise, Black",
      colorVariants: JSON.stringify([
        { color: "Tortoise", sku: "GUC-SQ-002-TRT", image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400" }
      ])
    },
    { 
      sku: "OAK-SPT-003", 
      name: "Oakley Sports Performance", 
      type: "frame", 
      catId: catFrames.id, 
      brandId: brands["Oakley"].id, 
      cost: 15000, 
      sell: 28000, 
      mrp: 32000,
      image: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400",
      colors: "Black, Red, Blue",
      colorVariants: JSON.stringify([])
    },
    { 
      sku: "TOM-RND-004", 
      name: "Tom Ford Round Titanium", 
      type: "frame", 
      catId: catFrames.id, 
      brandId: brands["Tom Ford"].id, 
      cost: 35000, 
      sell: 65000, 
      mrp: 75000,
      image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=400",
      colors: "Gunmetal, Rose Gold",
      colorVariants: JSON.stringify([])
    },
    { 
      sku: "CRZ-BLU-005", 
      name: "Crizal BlueUV Capture Lens", 
      type: "lens", 
      catId: catLenses.id, 
      brandId: brands["Crizal"].id, 
      cost: 4500, 
      sell: 8500, 
      mrp: 10000,
      image: "https://images.unsplash.com/photo-1577803645773-f96470509666?w=400",
      colors: "",
      colorVariants: JSON.stringify([])
    },
    { 
      sku: "ZEI-PRO-006", 
      name: "Zeiss Progressive SmartLife", 
      type: "lens", 
      catId: catLenses.id, 
      brandId: brands["Zeiss"].id, 
      cost: 18000, 
      sell: 35000, 
      mrp: 42000,
      image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400",
      colors: "",
      colorVariants: JSON.stringify([])
    },
    { 
      sku: "RB-WAY-007", 
      name: "Ray-Ban Wayfarer Polarized", 
      type: "sunglasses", 
      catId: catSunglasses.id, 
      brandId: brands["Ray-Ban"].id, 
      cost: 14000, 
      sell: 26000, 
      mrp: 30000,
      image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400",
      colors: "Black, Tortoise",
      colorVariants: JSON.stringify([
        { color: "Black", sku: "RB-WAY-007-BLK", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400" },
        { color: "Tortoise", sku: "RB-WAY-007-TRT", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400" }
      ])
    },
    { 
      sku: "VER-CAT-008", 
      name: "Versace Cat Eye Luxury", 
      type: "sunglasses", 
      catId: catSunglasses.id, 
      brandId: brands["Versace"].id, 
      cost: 28000, 
      sell: 52000, 
      mrp: 60000,
      image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400",
      colors: "Gold, Black",
      colorVariants: JSON.stringify([])
    },
    { 
      sku: "CAR-SPT-009", 
      name: "Carrera Sports Aviator", 
      type: "sunglasses", 
      catId: catSunglasses.id, 
      brandId: brands["Carrera"].id, 
      cost: 10000, 
      sell: 18500, 
      mrp: 22000,
      image: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400",
      colors: "Silver, Black",
      colorVariants: JSON.stringify([])
    },
    { 
      sku: "ACC-CAS-010", 
      name: "Premium Leather Glasses Case", 
      type: "accessory", 
      catId: catAccessories.id, 
      brandId: null, 
      cost: 800, 
      sell: 1800, 
      mrp: 2200,
      image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=400",
      colors: "Brown, Black",
      colorVariants: JSON.stringify([])
    },
  ];

  const createdProducts: Record<string, { id: string; sku: string; name: string; sellingPrice: number }> = {};
  for (const p of productsData) {
    const existing = await prisma.product.findUnique({ where: { sku: p.sku } });
    if (existing) {
      createdProducts[p.sku] = { ...existing, sellingPrice: p.sell };
      continue;
    }
    const product = await prisma.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        productType: p.type,
        categoryId: p.catId,
        brandId: p.brandId,
        costPrice: p.cost,
        sellingPrice: p.sell,
        mrp: p.mrp,
        taxRate: 17,
        imageUrl: p.image,
        colors: p.colors,
        colorVariants: p.colorVariants,
        isActive: true,
      },
    });
    createdProducts[p.sku] = { ...product, sellingPrice: p.sell };
    // Create inventory
    const qty = p.type === "accessory" ? 50 : Math.floor(Math.random() * 20) + 10;
    await prisma.inventory.create({
      data: { productId: product.id, location: "main", quantity: qty },
    });
  }
  console.log("  ✅ Products + Inventory created");

  // ─── PAKISTANI CUSTOMERS ──────────────────────────
  const customersData = [
    { 
      no: "CUST00001", 
      first: "Nasir", 
      last: "Qureshi", 
      phone: "03001234567", 
      whatsapp: "03001234567",
      email: "nasir.qureshi@gmail.com", 
      city: "Karachi", 
      state: "Sindh",
      gender: "Male",
      address: "House 45, Block 7, Gulshan-e-Iqbal"
    },
    { 
      no: "CUST00002", 
      first: "Fatima", 
      last: "Hassan", 
      phone: "03211234567", 
      whatsapp: "03211234567",
      email: "fatima.hassan@yahoo.com", 
      city: "Lahore", 
      state: "Punjab",
      gender: "Female",
      address: "204-B, DHA Phase 5"
    },
    { 
      no: "CUST00003", 
      first: "Ahmed", 
      last: "Malik", 
      phone: "03331234567", 
      whatsapp: "03331234567",
      email: "ahmed.malik@outlook.com", 
      city: "Islamabad", 
      state: "ICT",
      gender: "Male",
      address: "Street 12, F-7/2"
    },
    { 
      no: "CUST00004", 
      first: "Sana", 
      last: "Tariq", 
      phone: "03451234567", 
      whatsapp: "03451234567",
      email: "sana.tariq@gmail.com", 
      city: "Faisalabad", 
      state: "Punjab",
      gender: "Female",
      address: "P-45, Peoples Colony No. 1"
    },
  ];

  const createdCustomers: { id: string; firstName: string; customerNo: string }[] = [];
  for (const c of customersData) {
    const existing = await prisma.customer.findUnique({ where: { customerNo: c.no } });
    if (existing) {
      createdCustomers.push({ id: existing.id, firstName: c.first, customerNo: c.no });
      continue;
    }
    const customer = await prisma.customer.create({
      data: {
        customerNo: c.no,
        firstName: c.first,
        lastName: c.last,
        phone: c.phone,
        whatsapp: c.whatsapp,
        email: c.email,
        city: c.city,
        state: c.state,
        address: c.address,
        gender: c.gender,
        country: "Pakistan",
        isActive: true,
      },
    });
    createdCustomers.push({ id: customer.id, firstName: c.first, customerNo: c.no });
  }
  console.log("  ✅ Customers created");

  // ─── PRESCRIPTIONS (Multiple years for each customer) ───────
  const prescriptionData = [
    // Nasir Qureshi - 3 prescriptions over years
    { custIdx: 0, rxNo: "RX-2022-0001", date: "2022-03-15", doctor: "Dr. Muddasar Ali", 
      rightSph: -2.50, rightCyl: -0.75, rightAxis: 90, rightAdd: 0,
      leftSph: -2.25, leftCyl: -0.50, leftAxis: 85, leftAdd: 0,
      pd: 64 },
    { custIdx: 0, rxNo: "RX-2024-0002", date: "2024-06-20", doctor: "Dr. Muddasar Ali",
      rightSph: -2.75, rightCyl: -0.75, rightAxis: 90, rightAdd: 0,
      leftSph: -2.50, leftCyl: -0.75, leftAxis: 85, leftAdd: 0,
      pd: 64 },
    { custIdx: 0, rxNo: "RX-2025-0003", date: "2025-11-10", doctor: "Dr. Muddasar Ali",
      rightSph: -3.00, rightCyl: -1.00, rightAxis: 88, rightAdd: 1.00,
      leftSph: -2.75, leftCyl: -0.75, leftAxis: 85, leftAdd: 1.00,
      pd: 64 },
    // Fatima Hassan - 2 prescriptions
    { custIdx: 1, rxNo: "RX-2023-0004", date: "2023-01-25", doctor: "Dr. Ayesha Siddiqui",
      rightSph: -1.00, rightCyl: -0.25, rightAxis: 180, rightAdd: 0,
      leftSph: -0.75, leftCyl: 0, leftAxis: 0, leftAdd: 0,
      pd: 60 },
    { custIdx: 1, rxNo: "RX-2025-0005", date: "2025-08-14", doctor: "Dr. Ayesha Siddiqui",
      rightSph: -1.25, rightCyl: -0.50, rightAxis: 175, rightAdd: 0,
      leftSph: -1.00, leftCyl: -0.25, leftAxis: 180, leftAdd: 0,
      pd: 60 },
    // Ahmed Malik - 2 prescriptions  
    { custIdx: 2, rxNo: "RX-2021-0006", date: "2021-09-05", doctor: "Dr. Imran Khan",
      rightSph: +1.50, rightCyl: 0, rightAxis: 0, rightAdd: 2.00,
      leftSph: +1.75, leftCyl: -0.25, leftAxis: 90, leftAdd: 2.00,
      pd: 66 },
    { custIdx: 2, rxNo: "RX-2024-0007", date: "2024-02-28", doctor: "Dr. Imran Khan",
      rightSph: +1.75, rightCyl: -0.25, rightAxis: 90, rightAdd: 2.25,
      leftSph: +2.00, leftCyl: -0.50, leftAxis: 85, leftAdd: 2.25,
      pd: 66 },
    // Sana Tariq - 2 prescriptions
    { custIdx: 3, rxNo: "RX-2023-0008", date: "2023-07-10", doctor: "Dr. Zainab Shah",
      rightSph: -4.00, rightCyl: -1.25, rightAxis: 95, rightAdd: 0,
      leftSph: -3.75, leftCyl: -1.00, leftAxis: 88, leftAdd: 0,
      pd: 58 },
    { custIdx: 3, rxNo: "RX-2026-0009", date: "2026-01-05", doctor: "Dr. Zainab Shah",
      rightSph: -4.25, rightCyl: -1.25, rightAxis: 95, rightAdd: 0,
      leftSph: -4.00, leftCyl: -1.25, leftAxis: 90, leftAdd: 0,
      pd: 58 },
  ];

  const createdPrescriptions: { id: string; prescriptionNo: string; custIdx: number }[] = [];
  for (const rx of prescriptionData) {
    const existing = await prisma.prescription.findUnique({ where: { prescriptionNo: rx.rxNo } });
    if (existing) {
      createdPrescriptions.push({ id: existing.id, prescriptionNo: rx.rxNo, custIdx: rx.custIdx });
      continue;
    }
    const prescription = await prisma.prescription.create({
      data: {
        prescriptionNo: rx.rxNo,
        customerId: createdCustomers[rx.custIdx].id,
        prescriptionDate: rx.date,
        expiryDate: new Date(new Date(rx.date).setFullYear(new Date(rx.date).getFullYear() + 2)).toISOString().split('T')[0],
        prescribedBy: rx.doctor,
        odDistanceSphere: rx.rightSph,
        odDistanceCylinder: rx.rightCyl,
        odDistanceAxis: rx.rightAxis,
        odAddSphere: rx.rightAdd,
        odPd: rx.pd / 2,
        osDistanceSphere: rx.leftSph,
        osDistanceCylinder: rx.leftCyl,
        osDistanceAxis: rx.leftAxis,
        osAddSphere: rx.leftAdd,
        osPd: rx.pd / 2,
        notes: `Regular checkup for ${createdCustomers[rx.custIdx].firstName}`,
      }
    });
    createdPrescriptions.push({ id: prescription.id, prescriptionNo: rx.rxNo, custIdx: rx.custIdx });
  }
  console.log("  ✅ Prescriptions created");

  // ─── SALES (Multiple years for each customer) ─────
  const salesData = [
    // Nasir Qureshi - 4 sales
    { custIdx: 0, invoiceNo: "INV-2022-0001", date: "2022-03-18", products: ["RB-AVI-001", "CRZ-BLU-005"], method: "CARD", status: "paid" },
    { custIdx: 0, invoiceNo: "INV-2024-0002", date: "2024-06-25", products: ["GUC-SQ-002", "ZEI-PRO-006"], method: "CASH", status: "paid" },
    { custIdx: 0, invoiceNo: "INV-2025-0003", date: "2025-11-15", products: ["TOM-RND-004", "ACC-CAS-010"], method: "CARD", status: "paid" },
    { custIdx: 0, invoiceNo: "INV-2026-0004", date: "2026-02-10", products: ["RB-WAY-007"], method: "CASH", status: "partial" },
    // Fatima Hassan - 3 sales
    { custIdx: 1, invoiceNo: "INV-2023-0005", date: "2023-02-01", products: ["VER-CAT-008", "CRZ-BLU-005"], method: "CARD", status: "paid" },
    { custIdx: 1, invoiceNo: "INV-2024-0006", date: "2024-12-20", products: ["RB-AVI-001", "ACC-CAS-010"], method: "CASH", status: "paid" },
    { custIdx: 1, invoiceNo: "INV-2025-0007", date: "2025-08-20", products: ["GUC-SQ-002"], method: "CARD", status: "paid" },
    // Ahmed Malik - 3 sales
    { custIdx: 2, invoiceNo: "INV-2021-0008", date: "2021-09-10", products: ["OAK-SPT-003", "CRZ-BLU-005"], method: "CASH", status: "paid" },
    { custIdx: 2, invoiceNo: "INV-2024-0009", date: "2024-03-05", products: ["TOM-RND-004", "ZEI-PRO-006"], method: "CARD", status: "paid" },
    { custIdx: 2, invoiceNo: "INV-2026-0010", date: "2026-01-20", products: ["CAR-SPT-009", "ACC-CAS-010"], method: "CASH", status: "paid" },
    // Sana Tariq - 3 sales
    { custIdx: 3, invoiceNo: "INV-2023-0011", date: "2023-07-15", products: ["RB-AVI-001", "CRZ-BLU-005"], method: "CARD", status: "paid" },
    { custIdx: 3, invoiceNo: "INV-2025-0012", date: "2025-04-10", products: ["VER-CAT-008"], method: "CASH", status: "paid" },
    { custIdx: 3, invoiceNo: "INV-2026-0013", date: "2026-01-08", products: ["GUC-SQ-002", "ZEI-PRO-006", "ACC-CAS-010"], method: "CARD", status: "unpaid" },
  ];

  for (const sale of salesData) {
    const existing = await prisma.sale.findUnique({ where: { invoiceNo: sale.invoiceNo } });
    if (existing) continue;

    let subtotal = 0;
    const items: { productId: string; quantity: number; unitPrice: number; discount: number; tax: number; total: number }[] = [];
    
    for (const sku of sale.products) {
      const prod = createdProducts[sku];
      if (!prod) continue;
      const qty = 1;
      const price = prod.sellingPrice;
      const discount = 0;
      const tax = Math.round(price * 0.17);
      const total = price + tax - discount;
      subtotal += total;
      items.push({ productId: prod.id, quantity: qty, unitPrice: price, discount, tax, total });
    }

    const totalAmount = subtotal;
    const paidAmount = sale.status === "paid" ? totalAmount : sale.status === "partial" ? Math.round(totalAmount * 0.5) : 0;
    const balanceAmount = totalAmount - paidAmount;

    const createdSale = await prisma.sale.create({
      data: {
        invoiceNo: sale.invoiceNo,
        saleDate: sale.date,
        customerId: createdCustomers[sale.custIdx].id,
        cashierId: cashier1.id,
        subtotal: subtotal,
        taxAmount: items.reduce((sum, i) => sum + i.tax, 0),
        discountAmount: 0,
        totalAmount,
        paidAmount,
        balanceAmount,
        paymentStatus: sale.status,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountPct: 0,
            discountAmount: item.discount,
            taxRate: 17,
            taxAmount: item.tax,
            total: item.total,
          }))
        }
      }
    });

    // Create payment record if paid
    if (paidAmount > 0) {
      await prisma.payment.create({
        data: {
          paymentNo: `PAY-${sale.invoiceNo.replace('INV-', '')}`,
          paymentType: "received",
          paymentDate: sale.date,
          amount: paidAmount,
          paymentMethod: sale.method,
          transactionRef: sale.method === "CARD" ? `TXN${Math.random().toString().slice(2, 10)}` : null,
          saleId: createdSale.id,
          customerId: createdCustomers[sale.custIdx].id,
          createdById: cashier1.id,
        }
      });
    }
  }
  console.log("  ✅ Sales + Payments created");

  // ─── CHART OF ACCOUNTS ────────────────────────────
  const accounts = [
    { code: "1000", name: "Cash", type: "asset", isSystem: true },
    { code: "1010", name: "Bank - HBL", type: "asset", isSystem: false },
    { code: "1020", name: "Accounts Receivable", type: "asset", isSystem: true },
    { code: "1100", name: "Inventory", type: "asset", isSystem: true },
    { code: "2000", name: "Accounts Payable", type: "liability", isSystem: true },
    { code: "3000", name: "Owner Equity", type: "equity", isSystem: true },
    { code: "4000", name: "Sales Revenue", type: "revenue", isSystem: true },
    { code: "5000", name: "Cost of Goods Sold", type: "expense", isSystem: true },
    { code: "5100", name: "Rent Expense", type: "expense", isSystem: false },
    { code: "5200", name: "Utilities Expense", type: "expense", isSystem: false },
    { code: "5300", name: "Salary Expense", type: "expense", isSystem: false },
  ];

  for (const acc of accounts) {
    const existing = await prisma.chartOfAccount.findUnique({ where: { accountCode: acc.code } });
    if (!existing) {
      await prisma.chartOfAccount.create({
        data: {
          accountCode: acc.code,
          accountName: acc.name,
          accountType: acc.type,
          isSystem: acc.isSystem,
        }
      });
    }
  }
  console.log("  ✅ Chart of Accounts created");

  console.log("\n🎉 Database seeded successfully!");
  console.log("   Login with: admin / admin123");
  console.log("   4 Pakistani customers with prescriptions & sales from 2021-2026");
  console.log("   10 products with images");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

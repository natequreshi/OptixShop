import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Clean up in dependency order
    await prisma.saleItem.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.returnItem.deleteMany({});
    await prisma.return.deleteMany({});
    await prisma.sale.deleteMany({});
    await prisma.prescription.deleteMany({});
    await prisma.purchaseInvoiceItem.deleteMany({});
    await prisma.purchaseInvoice.deleteMany({});
    await prisma.purchaseOrderItem.deleteMany({});
    await prisma.purchaseOrder.deleteMany({});
    await prisma.inventoryMovement.deleteMany({});
    await prisma.inventory.deleteMany({});
    await prisma.frameAttribute.deleteMany({});
    await prisma.lensAttribute.deleteMany({});
    await prisma.contactLensAttribute.deleteMany({});
    await prisma.sunglassesAttribute.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.productCategory.deleteMany({});
    await prisma.brand.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.vendor.deleteMany({});
    await prisma.expense.deleteMany({});

    // ── Categories ──
    const catFrames = await prisma.productCategory.create({ data: { name: "Frames", isActive: true } });
    const catLenses = await prisma.productCategory.create({ data: { name: "Lenses", isActive: true } });
    const catSunglasses = await prisma.productCategory.create({ data: { name: "Sunglasses", isActive: true } });
    const catContacts = await prisma.productCategory.create({ data: { name: "Contact Lenses", isActive: true } });
    const catAccessories = await prisma.productCategory.create({ data: { name: "Accessories", isActive: true } });
    const catSolutions = await prisma.productCategory.create({ data: { name: "Solutions & Care", isActive: true } });

    // ── Brands ──
    const brRayBan = await prisma.brand.create({ data: { name: "Ray-Ban" } });
    const brOakley = await prisma.brand.create({ data: { name: "Oakley" } });
    const brEssilor = await prisma.brand.create({ data: { name: "Essilor" } });
    const brAcuvue = await prisma.brand.create({ data: { name: "Acuvue" } });
    const brTomFord = await prisma.brand.create({ data: { name: "Tom Ford" } });
    const brGucci = await prisma.brand.create({ data: { name: "Gucci" } });
    const brPrada = await prisma.brand.create({ data: { name: "Prada" } });
    const brCarrera = await prisma.brand.create({ data: { name: "Carrera" } });
    const brHoya = await prisma.brand.create({ data: { name: "Hoya" } });
    const brBausch = await prisma.brand.create({ data: { name: "Bausch & Lomb" } });

    // ── Products (20) ──
    const products = await Promise.all([
      prisma.product.create({ data: {
        sku: "FRM-001", barcode: "8901234001", name: "Ray-Ban Aviator Classic",
        categoryId: catFrames.id, brandId: brRayBan.id, productType: "frame",
        costPrice: 4500, sellingPrice: 8999, mrp: 9500, taxRate: 17, openingBalance: 20,
        isActive: true, inventory: { create: { quantity: 20, location: "main" } },
      }}),
      prisma.product.create({ data: {
        sku: "FRM-002", barcode: "8901234002", name: "Oakley Holbrook Square",
        categoryId: catFrames.id, brandId: brOakley.id, productType: "frame",
        costPrice: 3800, sellingPrice: 7500, mrp: 8000, taxRate: 17, openingBalance: 15,
        isActive: true, inventory: { create: { quantity: 15, location: "main" } },
      }}),
      prisma.product.create({ data: {
        sku: "FRM-003", barcode: "8901234003", name: "Tom Ford FT5401 Rectangle",
        categoryId: catFrames.id, brandId: brTomFord.id, productType: "frame",
        costPrice: 8000, sellingPrice: 15500, mrp: 16000, taxRate: 17, openingBalance: 8,
        isActive: true, inventory: { create: { quantity: 8, location: "main" } },
      }}),
      prisma.product.create({ data: {
        sku: "FRM-004", barcode: "8901234004", name: "Gucci GG0061S Round",
        categoryId: catFrames.id, brandId: brGucci.id, productType: "frame",
        costPrice: 9500, sellingPrice: 18000, mrp: 19000, taxRate: 17, openingBalance: 6,
        isActive: true, inventory: { create: { quantity: 6, location: "main" } },
      }}),
      prisma.product.create({ data: {
        sku: "FRM-005", barcode: "8901234005", name: "Prada PR 17WV Cat Eye",
        categoryId: catFrames.id, brandId: brPrada.id, productType: "frame",
        costPrice: 7200, sellingPrice: 14000, mrp: 14500, taxRate: 17, openingBalance: 10,
        isActive: true, inventory: { create: { quantity: 10, location: "main" } },
      }}),
      prisma.product.create({ data: {
        sku: "FRM-006", barcode: "8901234006", name: "Carrera 8862 Pilot",
        categoryId: catFrames.id, brandId: brCarrera.id, productType: "frame",
        costPrice: 3200, sellingPrice: 6500, mrp: 7000, taxRate: 17, openingBalance: 18,
        isActive: true, inventory: { create: { quantity: 18, location: "main" } },
      }}),
      prisma.product.create({ data: {
        sku: "LNS-001", barcode: "8901234010", name: "Essilor Crizal Blue Light",
        categoryId: catLenses.id, brandId: brEssilor.id, productType: "lens",
        costPrice: 2800, sellingPrice: 5500, mrp: 6000, taxRate: 17, openingBalance: 40,
        isActive: true, inventory: { create: { quantity: 40, location: "main" } },
      }}),
      prisma.product.create({ data: {
        sku: "LNS-002", barcode: "8901234011", name: "Essilor Varilux Progressive",
        categoryId: catLenses.id, brandId: brEssilor.id, productType: "lens",
        costPrice: 5500, sellingPrice: 11000, mrp: 12000, taxRate: 17, openingBalance: 20,
        isActive: true, inventory: { create: { quantity: 20, location: "main" } },
      }}),
      prisma.product.create({ data: {
        sku: "LNS-003", barcode: "8901234012", name: "Hoya Blue Control Single Vision",
        categoryId: catLenses.id, brandId: brHoya.id, productType: "lens",
        costPrice: 2200, sellingPrice: 4500, mrp: 5000, taxRate: 17, openingBalance: 35,
        isActive: true, inventory: { create: { quantity: 35, location: "main" } },
      }}),
      prisma.product.create({ data: {
        sku: "SUN-001", barcode: "8901234020", name: "Ray-Ban Wayfarer Sunglasses",
        categoryId: catSunglasses.id, brandId: brRayBan.id, productType: "frame",
        costPrice: 5000, sellingPrice: 9999, mrp: 10500, taxRate: 17, openingBalance: 12,
        isActive: true, inventory: { create: { quantity: 12, location: "main" } },
      }}),
      prisma.product.create({ data: {
        sku: "SUN-002", barcode: "8901234021", name: "Oakley Frogskins Polarized",
        categoryId: catSunglasses.id, brandId: brOakley.id, productType: "frame",
        costPrice: 4200, sellingPrice: 8500, mrp: 9000, taxRate: 17, openingBalance: 10,
        isActive: true, inventory: { create: { quantity: 10, location: "main" } },
      }}),
      prisma.product.create({ data: {
        sku: "SUN-003", barcode: "8901234022", name: "Tom Ford FT0821 Aviator Sun",
        categoryId: catSunglasses.id, brandId: brTomFord.id, productType: "frame",
        costPrice: 10000, sellingPrice: 19500, mrp: 20000, taxRate: 17, openingBalance: 5,
        isActive: true, inventory: { create: { quantity: 5, location: "main" } },
      }}),
      prisma.product.create({ data: {
        sku: "CL-001", barcode: "8901234030", name: "Acuvue Oasys Daily 30 Pack",
        categoryId: catContacts.id, brandId: brAcuvue.id, productType: "contact_lens",
        costPrice: 1200, sellingPrice: 2500, mrp: 2800, taxRate: 17, openingBalance: 50,
        isActive: true, inventory: { create: { quantity: 50, location: "main" } },
      }}),
      prisma.product.create({ data: {
        sku: "CL-002", barcode: "8901234031", name: "Acuvue Moist Monthly 6 Pack",
        categoryId: catContacts.id, brandId: brAcuvue.id, productType: "contact_lens",
        costPrice: 1800, sellingPrice: 3500, mrp: 3800, taxRate: 17, openingBalance: 30,
        isActive: true, inventory: { create: { quantity: 30, location: "main" } },
      }}),
      prisma.product.create({ data: {
        sku: "CL-003", barcode: "8901234032", name: "Bausch SofLens Toric 6 Pack",
        categoryId: catContacts.id, brandId: brBausch.id, productType: "contact_lens",
        costPrice: 2000, sellingPrice: 4000, mrp: 4200, taxRate: 17, openingBalance: 25,
        isActive: true, inventory: { create: { quantity: 25, location: "main" } },
      }}),
      prisma.product.create({ data: {
        sku: "ACC-001", barcode: "8901234040", name: "Premium Microfiber Cleaning Kit",
        categoryId: catAccessories.id, productType: "accessory",
        costPrice: 150, sellingPrice: 350, mrp: 400, taxRate: 17, openingBalance: 100,
        isActive: true, inventory: { create: { quantity: 100, location: "main" } },
      }}),
      prisma.product.create({ data: {
        sku: "ACC-002", barcode: "8901234041", name: "Hard Shell Glasses Case",
        categoryId: catAccessories.id, productType: "accessory",
        costPrice: 250, sellingPrice: 500, mrp: 600, taxRate: 17, openingBalance: 80,
        isActive: true, inventory: { create: { quantity: 80, location: "main" } },
      }}),
      prisma.product.create({ data: {
        sku: "ACC-003", barcode: "8901234042", name: "Anti-Fog Spray 60ml",
        categoryId: catAccessories.id, productType: "accessory",
        costPrice: 200, sellingPrice: 450, mrp: 500, taxRate: 17, openingBalance: 60,
        isActive: true, inventory: { create: { quantity: 60, location: "main" } },
      }}),
      prisma.product.create({ data: {
        sku: "SOL-001", barcode: "8901234050", name: "Bausch ReNu Multi-Purpose 360ml",
        categoryId: catSolutions.id, brandId: brBausch.id, productType: "accessory",
        costPrice: 350, sellingPrice: 750, mrp: 800, taxRate: 17, openingBalance: 45,
        isActive: true, inventory: { create: { quantity: 45, location: "main" } },
      }}),
      prisma.product.create({ data: {
        sku: "SOL-002", barcode: "8901234051", name: "Eye Drops Refresh Tears 15ml",
        categoryId: catSolutions.id, productType: "accessory",
        costPrice: 180, sellingPrice: 400, mrp: 450, taxRate: 17, openingBalance: 70,
        isActive: true, inventory: { create: { quantity: 70, location: "main" } },
      }}),
    ]);

    const [p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12,p13,p14,p15,p16,p17,p18,p19,p20] = products;

    // ── Customers (15 Pakistani) ──
    const customers = await Promise.all([
      prisma.customer.create({ data: { customerNo: "CUST00001", firstName: "Nasir", lastName: "Qureshi", phone: "+92-300-1234567", whatsapp: "+92-300-1234567", email: "nasir.qureshi@example.com", address: "Block 15, Gulistan-e-Johar", city: "Karachi", state: "Sindh", country: "Pakistan", gender: "male", dateOfBirth: "1985-05-15", isActive: true, totalPurchases: 0 }}),
      prisma.customer.create({ data: { customerNo: "CUST00002", firstName: "Ayesha", lastName: "Khan", phone: "+92-321-9876543", whatsapp: "+92-321-9876543", email: "ayesha.khan@example.com", address: "House 42, F-8/3", city: "Islamabad", state: "ICT", country: "Pakistan", gender: "female", dateOfBirth: "1992-08-22", isActive: true, totalPurchases: 0 }}),
      prisma.customer.create({ data: { customerNo: "CUST00003", firstName: "Bilal", lastName: "Ahmed", phone: "+92-333-5551234", whatsapp: "+92-333-5551234", email: "bilal.ahmed@example.com", address: "44-A, Model Town", city: "Lahore", state: "Punjab", country: "Pakistan", gender: "male", dateOfBirth: "1978-11-03", isActive: true, totalPurchases: 0 }}),
      prisma.customer.create({ data: { customerNo: "CUST00004", firstName: "Fatima", lastName: "Rizvi", phone: "+92-345-7778899", whatsapp: "+92-345-7778899", email: "fatima.rizvi@example.com", address: "Plot 12, Cantt Area", city: "Peshawar", state: "KPK", country: "Pakistan", gender: "female", dateOfBirth: "1995-03-10", isActive: true, totalPurchases: 0 }}),
      prisma.customer.create({ data: { customerNo: "CUST00005", firstName: "Usman", lastName: "Malik", phone: "+92-312-4443210", whatsapp: "+92-312-4443210", address: "House 7, Satellite Town", city: "Quetta", state: "Balochistan", country: "Pakistan", gender: "male", dateOfBirth: "1988-07-19", isActive: true, totalPurchases: 0 }}),
      prisma.customer.create({ data: { customerNo: "CUST00006", firstName: "Sana", lastName: "Mahmood", phone: "+92-302-5556677", whatsapp: "+92-302-5556677", email: "sana.mahmood@example.com", address: "Street 4, DHA Phase 5", city: "Lahore", state: "Punjab", country: "Pakistan", gender: "female", dateOfBirth: "1990-12-01", isActive: true, totalPurchases: 0 }}),
      prisma.customer.create({ data: { customerNo: "CUST00007", firstName: "Hassan", lastName: "Raza", phone: "+92-311-2223344", whatsapp: "+92-311-2223344", address: "Flat 302, Askari Tower", city: "Rawalpindi", state: "Punjab", country: "Pakistan", gender: "male", dateOfBirth: "1982-04-18", isActive: true, totalPurchases: 0 }}),
      prisma.customer.create({ data: { customerNo: "CUST00008", firstName: "Zainab", lastName: "Noor", phone: "+92-334-9998877", whatsapp: "+92-334-9998877", email: "zainab.noor@example.com", address: "Block C, North Nazimabad", city: "Karachi", state: "Sindh", country: "Pakistan", gender: "female", dateOfBirth: "1998-06-25", isActive: true, totalPurchases: 0 }}),
      prisma.customer.create({ data: { customerNo: "CUST00009", firstName: "Tariq", lastName: "Hussain", phone: "+92-300-7771234", whatsapp: "+92-300-7771234", address: "22-B, Gulberg III", city: "Lahore", state: "Punjab", country: "Pakistan", gender: "male", dateOfBirth: "1975-01-30", isActive: true, totalPurchases: 0 }}),
      prisma.customer.create({ data: { customerNo: "CUST00010", firstName: "Rabia", lastName: "Akhtar", phone: "+92-322-3334455", whatsapp: "+92-322-3334455", address: "House 88, G-11/2", city: "Islamabad", state: "ICT", country: "Pakistan", gender: "female", dateOfBirth: "1993-09-14", isActive: true, totalPurchases: 0 }}),
      prisma.customer.create({ data: { customerNo: "CUST00011", firstName: "Faisal", lastName: "Sharif", phone: "+92-301-8889900", whatsapp: "+92-301-8889900", email: "faisal.sharif@example.com", address: "Plot 5, Hayatabad Phase 3", city: "Peshawar", state: "KPK", country: "Pakistan", gender: "male", dateOfBirth: "1987-03-22", isActive: true, totalPurchases: 0 }}),
      prisma.customer.create({ data: { customerNo: "CUST00012", firstName: "Mehwish", lastName: "Ali", phone: "+92-343-1112233", whatsapp: "+92-343-1112233", address: "Street 9, Clifton Block 8", city: "Karachi", state: "Sindh", country: "Pakistan", gender: "female", dateOfBirth: "1991-11-08", isActive: true, totalPurchases: 0 }}),
      prisma.customer.create({ data: { customerNo: "CUST00013", firstName: "Waqar", lastName: "Siddiqui", phone: "+92-315-6667788", whatsapp: "+92-315-6667788", address: "House 15, Wapda Town", city: "Faisalabad", state: "Punjab", country: "Pakistan", gender: "male", dateOfBirth: "1980-08-12", isActive: true, totalPurchases: 0 }}),
      prisma.customer.create({ data: { customerNo: "CUST00014", firstName: "Amina", lastName: "Bibi", phone: "+92-336-4445566", whatsapp: "+92-336-4445566", address: "Mohalla Jinnah, GT Road", city: "Multan", state: "Punjab", country: "Pakistan", gender: "female", dateOfBirth: "1970-02-28", isActive: true, totalPurchases: 0 }}),
      prisma.customer.create({ data: { customerNo: "CUST00015", firstName: "Kamran", lastName: "Yousuf", phone: "+92-313-7778899", whatsapp: "+92-313-7778899", email: "kamran.yousuf@example.com", address: "Block D, Johar Town", city: "Lahore", state: "Punjab", country: "Pakistan", gender: "male", dateOfBirth: "1996-10-05", isActive: true, totalPurchases: 0 }}),
    ]);

    const [c1,c2,c3,c4,c5,c6,c7,c8,c9,c10,c11,c12,c13,c14,c15] = customers;

    // ── Vendors (3 Pakistani) ──
    const v1 = await prisma.vendor.create({ data: { vendorCode: "V001", companyName: "Karachi Optics Traders", contactPerson: "Shahid Mahmood", phone: "+92-21-34567890", email: "info@karachioptics.pk", address: "Office 12, Saddar Market", city: "Karachi", state: "Sindh", paymentTerms: "Net 30", creditDays: 30, isActive: true }});
    const v2 = await prisma.vendor.create({ data: { vendorCode: "V002", companyName: "Lahore Lens House", contactPerson: "Zahid Butt", phone: "+92-42-35678901", email: "sales@lahorelens.pk", address: "Shop 5, Hall Road", city: "Lahore", state: "Punjab", paymentTerms: "Net 15", creditDays: 15, isActive: true }});
    const v3 = await prisma.vendor.create({ data: { vendorCode: "V003", companyName: "Islamabad Eye Care Supplies", contactPerson: "Naeem Ullah", phone: "+92-51-2345678", email: "orders@isbeyecare.pk", address: "Blue Area, Jinnah Avenue", city: "Islamabad", state: "ICT", paymentTerms: "Net 45", creditDays: 45, isActive: true }});

    // ── Prescriptions (10 by Dr. Muddasar) ──
    const rxData = [
      { no: "RX00001", cid: c1.id, date: "2025-09-10", exp: "2026-09-10", od: [-2.50,-0.75,180,0,32], os: [-2.75,-0.50,175,0,32] },
      { no: "RX00002", cid: c1.id, date: "2026-01-20", exp: "2027-01-20", od: [-3.00,-1.00,180,1.0,31], os: [-3.25,-0.75,170,1.0,31] },
      { no: "RX00003", cid: c2.id, date: "2025-10-15", exp: "2026-10-15", od: [-1.50,-0.50,90,0,30], os: [-1.75,-0.25,85,0,30] },
      { no: "RX00004", cid: c3.id, date: "2025-11-01", exp: "2026-11-01", od: [-4.00,-1.25,175,1.5,33], os: [-3.75,-1.00,10,1.5,33] },
      { no: "RX00005", cid: c4.id, date: "2025-12-10", exp: "2026-12-10", od: [1.00,-0.50,90,2.0,29], os: [0.75,-0.25,95,2.0,29] },
      { no: "RX00006", cid: c6.id, date: "2025-10-20", exp: "2026-10-20", od: [-1.25,-0.25,180,0,31], os: [-1.50,-0.50,175,0,31] },
      { no: "RX00007", cid: c7.id, date: "2025-11-15", exp: "2026-11-15", od: [-5.00,-1.50,10,1.0,32], os: [-4.75,-1.25,170,1.0,32] },
      { no: "RX00008", cid: c9.id, date: "2026-01-05", exp: "2027-01-05", od: [-2.00,-0.50,90,2.5,31], os: [-2.25,-0.75,85,2.5,31] },
      { no: "RX00009", cid: c10.id, date: "2026-01-25", exp: "2027-01-25", od: [-0.75,0,0,0,30], os: [-1.00,-0.25,180,0,30] },
      { no: "RX00010", cid: c14.id, date: "2025-12-20", exp: "2026-12-20", od: [2.00,-0.75,90,2.5,30], os: [1.75,-0.50,85,2.5,30] },
    ];

    const rxIds: Record<string, string> = {};
    for (const r of rxData) {
      const rx = await prisma.prescription.create({
        data: {
          prescriptionNo: r.no, customerId: r.cid,
          prescriptionDate: r.date, expiryDate: r.exp,
          prescribedBy: "Dr. Muddasar",
          odDistanceSphere: r.od[0], odDistanceCylinder: r.od[1], odDistanceAxis: r.od[2], odAddSphere: r.od[3], odPd: r.od[4],
          osDistanceSphere: r.os[0], osDistanceCylinder: r.os[1], osDistanceAxis: r.os[2], osAddSphere: r.os[3], osPd: r.os[4],
        },
      });
      rxIds[r.no] = rx.id;
    }

    // Helper to create a sale with items and payment
    let saleNo = 0;
    let payNo = 0;
    const custTotals: Record<string, number> = {};

    async function makeSale(cid: string, rxId: string | null, date: string, items: { pid: string; qty: number; price: number; cost: number; disc: number }[], discountTotal: number, status = "completed", payFull = true) {
      saleNo++;
      const inv = `INV${String(saleNo).padStart(5, "0")}`;
      let subtotal = 0;
      const saleItems = items.map(i => {
        const lineTotal = i.qty * i.price;
        subtotal += lineTotal;
        const taxable = lineTotal - i.disc;
        const tax = Math.round(taxable * 0.17 * 100) / 100;
        return {
          productId: i.pid, quantity: i.qty, unitPrice: i.price, costPrice: i.cost,
          discountPct: 0, discountAmount: i.disc, taxRate: 17,
          taxAmount: tax, cgst: Math.round(tax / 2 * 100) / 100, sgst: Math.round(tax / 2 * 100) / 100,
          total: Math.round((taxable + tax) * 100) / 100,
        };
      });
      const totalTax = saleItems.reduce((s, i) => s + i.taxAmount, 0);
      const totalAmt = Math.round((subtotal - discountTotal + totalTax) * 100) / 100;
      const paidAmt = payFull ? totalAmt : Math.round(totalAmt * 0.6 * 100) / 100;

      const sale = await prisma.sale.create({
        data: {
          invoiceNo: inv, customerId: cid, prescriptionId: rxId,
          saleDate: date, subtotal, discountAmount: discountTotal,
          taxAmount: totalTax, cgstAmount: Math.round(totalTax / 2 * 100) / 100, sgstAmount: Math.round(totalTax / 2 * 100) / 100,
          totalAmount: totalAmt, paidAmount: paidAmt, balanceAmount: Math.round((totalAmt - paidAmt) * 100) / 100,
          status, paymentStatus: payFull ? "paid" : "partial",
          items: { create: saleItems },
        },
      });

      payNo++;
      await prisma.payment.create({
        data: {
          paymentNo: `PAY${String(payNo).padStart(5, "0")}`,
          paymentType: "receipt", saleId: sale.id, customerId: cid,
          paymentDate: date, amount: paidAmt,
          paymentMethod: payNo % 3 === 0 ? "card" : "cash",
        },
      });

      custTotals[cid] = (custTotals[cid] || 0) + paidAmt;
      return sale;
    }

    // ── Sales (25 across Sep 2025 - Feb 2026) ──

    // September 2025
    await makeSale(c1.id, rxIds["RX00001"], "2025-09-15", [
      { pid: p1.id, qty: 1, price: 8999, cost: 4500, disc: 0 },
      { pid: p7.id, qty: 1, price: 5500, cost: 2800, disc: 0 },
    ], 500);
    await makeSale(c6.id, rxIds["RX00006"], "2025-09-22", [
      { pid: p6.id, qty: 1, price: 6500, cost: 3200, disc: 0 },
      { pid: p9.id, qty: 1, price: 4500, cost: 2200, disc: 0 },
    ], 0);
    await makeSale(c5.id, null, "2025-09-28", [
      { pid: p10.id, qty: 1, price: 9999, cost: 5000, disc: 0 },
    ], 0);

    // October 2025
    await makeSale(c2.id, rxIds["RX00003"], "2025-10-05", [
      { pid: p2.id, qty: 1, price: 7500, cost: 3800, disc: 0 },
      { pid: p7.id, qty: 1, price: 5500, cost: 2800, disc: 500 },
    ], 500);
    await makeSale(c3.id, rxIds["RX00004"], "2025-10-12", [
      { pid: p3.id, qty: 1, price: 15500, cost: 8000, disc: 0 },
      { pid: p8.id, qty: 1, price: 11000, cost: 5500, disc: 0 },
    ], 1000);
    await makeSale(c7.id, rxIds["RX00007"], "2025-10-18", [
      { pid: p5.id, qty: 1, price: 14000, cost: 7200, disc: 0 },
      { pid: p7.id, qty: 1, price: 5500, cost: 2800, disc: 0 },
      { pid: p16.id, qty: 1, price: 350, cost: 150, disc: 0 },
    ], 0);
    await makeSale(c8.id, null, "2025-10-25", [
      { pid: p13.id, qty: 2, price: 2500, cost: 1200, disc: 0 },
      { pid: p19.id, qty: 1, price: 750, cost: 350, disc: 0 },
    ], 0);

    // November 2025
    await makeSale(c9.id, rxIds["RX00008"], "2025-11-03", [
      { pid: p1.id, qty: 1, price: 8999, cost: 4500, disc: 0 },
      { pid: p8.id, qty: 1, price: 11000, cost: 5500, disc: 0 },
    ], 0);
    await makeSale(c4.id, rxIds["RX00005"], "2025-11-10", [
      { pid: p4.id, qty: 1, price: 18000, cost: 9500, disc: 0 },
      { pid: p7.id, qty: 1, price: 5500, cost: 2800, disc: 0 },
    ], 1500);
    await makeSale(c11.id, null, "2025-11-15", [
      { pid: p11.id, qty: 1, price: 8500, cost: 4200, disc: 0 },
      { pid: p17.id, qty: 1, price: 500, cost: 250, disc: 0 },
    ], 0);
    await makeSale(c12.id, null, "2025-11-22", [
      { pid: p13.id, qty: 3, price: 2500, cost: 1200, disc: 0 },
      { pid: p14.id, qty: 1, price: 3500, cost: 1800, disc: 0 },
      { pid: p20.id, qty: 2, price: 400, cost: 180, disc: 0 },
    ], 0);

    // December 2025
    await makeSale(c1.id, rxIds["RX00002"], "2025-12-01", [
      { pid: p2.id, qty: 1, price: 7500, cost: 3800, disc: 0 },
      { pid: p8.id, qty: 1, price: 11000, cost: 5500, disc: 0 },
      { pid: p13.id, qty: 1, price: 2500, cost: 1200, disc: 0 },
    ], 0);
    await makeSale(c14.id, rxIds["RX00010"], "2025-12-08", [
      { pid: p5.id, qty: 1, price: 14000, cost: 7200, disc: 0 },
      { pid: p9.id, qty: 1, price: 4500, cost: 2200, disc: 0 },
    ], 500);
    await makeSale(c10.id, rxIds["RX00009"], "2025-12-15", [
      { pid: p6.id, qty: 1, price: 6500, cost: 3200, disc: 0 },
      { pid: p7.id, qty: 1, price: 5500, cost: 2800, disc: 0 },
    ], 0);
    await makeSale(c13.id, null, "2025-12-20", [
      { pid: p12.id, qty: 1, price: 19500, cost: 10000, disc: 0 },
    ], 2000);
    await makeSale(c15.id, null, "2025-12-28", [
      { pid: p10.id, qty: 1, price: 9999, cost: 5000, disc: 0 },
      { pid: p16.id, qty: 2, price: 350, cost: 150, disc: 0 },
      { pid: p18.id, qty: 1, price: 450, cost: 200, disc: 0 },
    ], 0);

    // January 2026
    await makeSale(c2.id, null, "2026-01-05", [
      { pid: p4.id, qty: 1, price: 18000, cost: 9500, disc: 0 },
    ], 0);
    await makeSale(c3.id, null, "2026-01-12", [
      { pid: p10.id, qty: 1, price: 9999, cost: 5000, disc: 0 },
      { pid: p17.id, qty: 1, price: 500, cost: 250, disc: 0 },
    ], 0);
    await makeSale(c8.id, null, "2026-01-18", [
      { pid: p1.id, qty: 1, price: 8999, cost: 4500, disc: 0 },
      { pid: p7.id, qty: 1, price: 5500, cost: 2800, disc: 0 },
      { pid: p16.id, qty: 1, price: 350, cost: 150, disc: 0 },
    ], 500);
    await makeSale(c6.id, null, "2026-01-25", [
      { pid: p15.id, qty: 2, price: 4000, cost: 2000, disc: 0 },
      { pid: p19.id, qty: 1, price: 750, cost: 350, disc: 0 },
    ], 0);

    // February 2026
    await makeSale(c9.id, null, "2026-02-02", [
      { pid: p3.id, qty: 1, price: 15500, cost: 8000, disc: 0 },
      { pid: p8.id, qty: 1, price: 11000, cost: 5500, disc: 0 },
    ], 1000);
    await makeSale(c4.id, null, "2026-02-08", [
      { pid: p11.id, qty: 1, price: 8500, cost: 4200, disc: 0 },
      { pid: p18.id, qty: 2, price: 450, cost: 200, disc: 0 },
    ], 0);
    await makeSale(c11.id, null, "2026-02-10", [
      { pid: p2.id, qty: 1, price: 7500, cost: 3800, disc: 0 },
      { pid: p9.id, qty: 1, price: 4500, cost: 2200, disc: 0 },
    ], 0);
    await makeSale(c5.id, null, "2026-02-14", [
      { pid: p12.id, qty: 1, price: 19500, cost: 10000, disc: 0 },
      { pid: p17.id, qty: 1, price: 500, cost: 250, disc: 0 },
    ], 0, "completed", false);
    await makeSale(c13.id, null, "2026-02-17", [
      { pid: p6.id, qty: 1, price: 6500, cost: 3200, disc: 0 },
      { pid: p7.id, qty: 1, price: 5500, cost: 2800, disc: 0 },
      { pid: p16.id, qty: 1, price: 350, cost: 150, disc: 0 },
      { pid: p20.id, qty: 1, price: 400, cost: 180, disc: 0 },
    ], 0);

    // ── Update customer totals ──
    for (const [cid, total] of Object.entries(custTotals)) {
      await prisma.customer.update({ where: { id: cid }, data: { totalPurchases: Math.round(total * 100) / 100 } });
    }

    // ── Expenses (12 across 6 months) ──
    const expenses = [
      { no: "EXP00001", cat: "rent", desc: "Shop Rent - September", amt: 45000, date: "2025-09-01" },
      { no: "EXP00002", cat: "utilities", desc: "Electricity Bill - September", amt: 8500, date: "2025-09-15" },
      { no: "EXP00003", cat: "rent", desc: "Shop Rent - October", amt: 45000, date: "2025-10-01" },
      { no: "EXP00004", cat: "salary", desc: "Staff Salary - October", amt: 60000, date: "2025-10-30" },
      { no: "EXP00005", cat: "rent", desc: "Shop Rent - November", amt: 45000, date: "2025-11-01" },
      { no: "EXP00006", cat: "utilities", desc: "Electricity + Internet - November", amt: 12000, date: "2025-11-15" },
      { no: "EXP00007", cat: "rent", desc: "Shop Rent - December", amt: 45000, date: "2025-12-01" },
      { no: "EXP00008", cat: "salary", desc: "Staff Salary - December + Bonus", amt: 80000, date: "2025-12-30" },
      { no: "EXP00009", cat: "rent", desc: "Shop Rent - January", amt: 45000, date: "2026-01-01" },
      { no: "EXP00010", cat: "utilities", desc: "Electricity + Gas - January", amt: 15000, date: "2026-01-15" },
      { no: "EXP00011", cat: "rent", desc: "Shop Rent - February", amt: 45000, date: "2026-02-01" },
      { no: "EXP00012", cat: "maintenance", desc: "Shop Display Renovation", amt: 35000, date: "2026-02-10" },
    ];

    for (const e of expenses) {
      await prisma.expense.create({
        data: { expenseNo: e.no, category: e.cat, description: e.desc, amount: e.amt, expenseDate: e.date, paymentMethod: "cash" },
      });
    }

    // ── Purchase Orders (3) ──
    const po1 = await prisma.purchaseOrder.create({
      data: {
        poNumber: "PO-001", vendorId: v1.id, orderDate: "2025-10-01", expectedDelivery: "2025-10-15",
        subtotal: 45000, taxAmount: 7650, totalAmount: 52650, status: "received",
        items: { create: [
          { productId: p1.id, quantity: 10, receivedQty: 10, unitPrice: 4500, taxRate: 17, taxAmount: 7650, total: 52650 },
        ]},
      },
    });
    const po2 = await prisma.purchaseOrder.create({
      data: {
        poNumber: "PO-002", vendorId: v2.id, orderDate: "2025-11-10", expectedDelivery: "2025-11-25",
        subtotal: 19600, taxAmount: 3332, totalAmount: 22932, status: "received",
        items: { create: [
          { productId: p7.id, quantity: 5, receivedQty: 5, unitPrice: 2800, taxRate: 17, taxAmount: 2380, total: 16380 },
          { productId: p9.id, quantity: 2, receivedQty: 2, unitPrice: 2200, taxRate: 17, taxAmount: 748, total: 5148 },
        ]},
      },
    });
    const po3 = await prisma.purchaseOrder.create({
      data: {
        poNumber: "PO-003", vendorId: v3.id, orderDate: "2026-01-15", expectedDelivery: "2026-02-01",
        subtotal: 24000, taxAmount: 4080, totalAmount: 28080, status: "pending",
        items: { create: [
          { productId: p13.id, quantity: 20, receivedQty: 0, unitPrice: 1200, taxRate: 17, taxAmount: 4080, total: 28080 },
        ]},
      },
    });

    return NextResponse.json({
      success: true,
      message: "Database reset and seeded successfully",
      data: {
        categories: 6, brands: 10, products: 20, customers: 15,
        vendors: 3, prescriptions: 10, sales: 25, expenses: 12, purchaseOrders: 3,
        summary: "15 Pakistani customers | 10 prescriptions by Dr. Muddasar | 25 sales (Sep '25 – Feb '26) | 20 products | 3 vendors | 12 expenses | 3 POs",
      },
    });
  } catch (error: any) {
    console.error("Error resetting data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

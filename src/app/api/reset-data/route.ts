import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await prisma.saleItem.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.returnItem.deleteMany({});
    await prisma.return.deleteMany({});
    await prisma.sale.deleteMany({});
    await prisma.prescription.deleteMany({});
    await prisma.labOrder.deleteMany({});
    await prisma.grnItem.deleteMany({});
    await prisma.goodsReceiptNote.deleteMany({});
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
    await prisma.loyaltyTransaction.deleteMany({});

    // ── Categories ──
    const catFrames = await prisma.productCategory.create({ data: { name: "Frames", isActive: true } });
    const catLenses = await prisma.productCategory.create({ data: { name: "Lenses", isActive: true } });
    const catSunglasses = await prisma.productCategory.create({ data: { name: "Sunglasses", isActive: true } });
    const catContacts = await prisma.productCategory.create({ data: { name: "Contact Lenses", isActive: true } });
    const catAccessories = await prisma.productCategory.create({ data: { name: "Accessories", isActive: true } });

    // ── Brands ──
    const brandRayBan = await prisma.brand.create({ data: { name: "Ray-Ban" } });
    const brandOakley = await prisma.brand.create({ data: { name: "Oakley" } });
    const brandEssilor = await prisma.brand.create({ data: { name: "Essilor" } });
    const brandAcuvue = await prisma.brand.create({ data: { name: "Acuvue" } });
    const brandTomFord = await prisma.brand.create({ data: { name: "Tom Ford" } });
    const brandGucci = await prisma.brand.create({ data: { name: "Gucci" } });

    // ── 5 Products ──
    const p1 = await prisma.product.create({
      data: {
        sku: "FRM-001", barcode: "8901234001", name: "Ray-Ban Aviator Classic",
        categoryId: catFrames.id, brandId: brandRayBan.id, productType: "frame",
        costPrice: 4500, sellingPrice: 8999, mrp: 9500, taxRate: 18, openingBalance: 20,
        imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
        isActive: true,
        inventory: { create: { quantity: 20, location: "main" } },
      },
    });
    const p2 = await prisma.product.create({
      data: {
        sku: "FRM-002", barcode: "8901234002", name: "Oakley Holbrook Square Frame",
        categoryId: catFrames.id, brandId: brandOakley.id, productType: "frame",
        costPrice: 3800, sellingPrice: 7500, mrp: 8000, taxRate: 18, openingBalance: 15,
        imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400",
        isActive: true,
        inventory: { create: { quantity: 15, location: "main" } },
      },
    });
    const p3 = await prisma.product.create({
      data: {
        sku: "LNS-001", barcode: "8901234003", name: "Essilor Crizal Blue Light Lenses",
        categoryId: catLenses.id, brandId: brandEssilor.id, productType: "lens",
        costPrice: 2800, sellingPrice: 5500, mrp: 6000, taxRate: 18, openingBalance: 30,
        imageUrl: "https://images.unsplash.com/photo-1616444536069-a13e1423e839?w=400",
        isActive: true,
        inventory: { create: { quantity: 30, location: "main" } },
      },
    });
    const p4 = await prisma.product.create({
      data: {
        sku: "SUN-001", barcode: "8901234004", name: "Ray-Ban Wayfarer Sunglasses",
        categoryId: catSunglasses.id, brandId: brandRayBan.id, productType: "frame",
        costPrice: 5000, sellingPrice: 9999, mrp: 10500, taxRate: 18, openingBalance: 12,
        imageUrl: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400",
        isActive: true,
        inventory: { create: { quantity: 12, location: "main" } },
      },
    });
    const p5 = await prisma.product.create({
      data: {
        sku: "CL-001", barcode: "8901234005", name: "Acuvue Oasys Daily 30 Pack",
        categoryId: catContacts.id, brandId: brandAcuvue.id, productType: "contact_lens",
        costPrice: 1200, sellingPrice: 2500, mrp: 2800, taxRate: 18, openingBalance: 25,
        imageUrl: "https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?w=400",
        isActive: true,
        inventory: { create: { quantity: 25, location: "main" } },
      },
    });

    // ── 5 Pakistani Customers ──
    const cust1 = await prisma.customer.create({
      data: {
        customerNo: "CUST00001", firstName: "Nasir", lastName: "Qureshi",
        phone: "+92-300-1234567", whatsapp: "+92-300-1234567",
        email: "nasir.qureshi@example.com", address: "Block 15, Gulistan-e-Johar",
        city: "Karachi", state: "Sindh", country: "Pakistan",
        gender: "male", dateOfBirth: "1985-05-15",
        isActive: true, loyaltyPoints: 250, totalPurchases: 0,
      },
    });
    const cust2 = await prisma.customer.create({
      data: {
        customerNo: "CUST00002", firstName: "Ayesha", lastName: "Khan",
        phone: "+92-321-9876543", whatsapp: "+92-321-9876543",
        email: "ayesha.khan@example.com", address: "House 42, F-8/3",
        city: "Islamabad", state: "ICT", country: "Pakistan",
        gender: "female", dateOfBirth: "1992-08-22",
        isActive: true, loyaltyPoints: 120, totalPurchases: 0,
      },
    });
    const cust3 = await prisma.customer.create({
      data: {
        customerNo: "CUST00003", firstName: "Bilal", lastName: "Ahmed",
        phone: "+92-333-5551234", whatsapp: "+92-333-5551234",
        email: "bilal.ahmed@example.com", address: "44-A, Model Town",
        city: "Lahore", state: "Punjab", country: "Pakistan",
        gender: "male", dateOfBirth: "1978-11-03",
        isActive: true, loyaltyPoints: 80, totalPurchases: 0,
      },
    });
    const cust4 = await prisma.customer.create({
      data: {
        customerNo: "CUST00004", firstName: "Fatima", lastName: "Rizvi",
        phone: "+92-345-7778899", whatsapp: "+92-345-7778899",
        email: "fatima.rizvi@example.com", address: "Plot 12, Cantt Area",
        city: "Peshawar", state: "KPK", country: "Pakistan",
        gender: "female", dateOfBirth: "1995-03-10",
        isActive: true, loyaltyPoints: 50, totalPurchases: 0,
      },
    });
    const cust5 = await prisma.customer.create({
      data: {
        customerNo: "CUST00005", firstName: "Usman", lastName: "Malik",
        phone: "+92-312-4443210", whatsapp: "+92-312-4443210",
        address: "House 7, Satellite Town",
        city: "Quetta", state: "Balochistan", country: "Pakistan",
        gender: "male", dateOfBirth: "1988-07-19",
        isActive: true, loyaltyPoints: 0, totalPurchases: 0,
      },
    });

    // ── Prescriptions (by Dr. Muddasar) ──
    const rx1 = await prisma.prescription.create({
      data: {
        prescriptionNo: "RX00001", customerId: cust1.id,
        prescriptionDate: "2026-01-10", expiryDate: "2027-01-10",
        prescribedBy: "Dr. Muddasar",
        odDistanceSphere: -2.50, odDistanceCylinder: -0.75, odDistanceAxis: 180, odAddSphere: 0, odPd: 32,
        osDistanceSphere: -2.75, osDistanceCylinder: -0.50, osDistanceAxis: 175, osAddSphere: 0, osPd: 32,
      },
    });
    const rx2 = await prisma.prescription.create({
      data: {
        prescriptionNo: "RX00002", customerId: cust1.id,
        prescriptionDate: "2026-01-20", expiryDate: "2027-01-20",
        prescribedBy: "Dr. Muddasar",
        odDistanceSphere: -3.00, odDistanceCylinder: -1.00, odDistanceAxis: 180, odAddSphere: 1.0, odPd: 31,
        osDistanceSphere: -3.25, osDistanceCylinder: -0.75, osDistanceAxis: 170, osAddSphere: 1.0, osPd: 31,
      },
    });
    const rx3 = await prisma.prescription.create({
      data: {
        prescriptionNo: "RX00003", customerId: cust2.id,
        prescriptionDate: "2026-01-15", expiryDate: "2027-01-15",
        prescribedBy: "Dr. Muddasar",
        odDistanceSphere: -1.50, odDistanceCylinder: -0.50, odDistanceAxis: 90, odAddSphere: 0, odPd: 30,
        osDistanceSphere: -1.75, osDistanceCylinder: -0.25, osDistanceAxis: 85, osAddSphere: 0, osPd: 30,
      },
    });
    const rx4 = await prisma.prescription.create({
      data: {
        prescriptionNo: "RX00004", customerId: cust3.id,
        prescriptionDate: "2026-02-01", expiryDate: "2027-02-01",
        prescribedBy: "Dr. Muddasar",
        odDistanceSphere: -4.00, odDistanceCylinder: -1.25, odDistanceAxis: 175, odAddSphere: 1.5, odPd: 33,
        osDistanceSphere: -3.75, osDistanceCylinder: -1.00, osDistanceAxis: 10, osAddSphere: 1.5, osPd: 33,
      },
    });
    const rx5 = await prisma.prescription.create({
      data: {
        prescriptionNo: "RX00005", customerId: cust4.id,
        prescriptionDate: "2026-02-10", expiryDate: "2027-02-10",
        prescribedBy: "Dr. Muddasar",
        odDistanceSphere: +1.00, odDistanceCylinder: -0.50, odDistanceAxis: 90, odAddSphere: 2.0, odPd: 29,
        osDistanceSphere: +0.75, osDistanceCylinder: -0.25, osDistanceAxis: 95, osAddSphere: 2.0, osPd: 29,
      },
    });

    // ── Sales ──
    // Sale 1: Nasir — Aviator + Lenses
    const sale1 = await prisma.sale.create({
      data: {
        invoiceNo: "INV00001", customerId: cust1.id, prescriptionId: rx1.id,
        saleDate: "2026-01-12", subtotal: 14499, discountAmount: 500,
        taxAmount: 2519.82, cgstAmount: 1259.91, sgstAmount: 1259.91,
        totalAmount: 16518.82, paidAmount: 16518.82, balanceAmount: 0,
        status: "completed", paymentStatus: "paid",
        items: {
          create: [
            { productId: p1.id, quantity: 1, unitPrice: 8999, costPrice: 4500, discountPct: 0, discountAmount: 0, taxRate: 18, taxAmount: 1619.82, cgst: 809.91, sgst: 809.91, total: 10618.82 },
            { productId: p3.id, quantity: 1, unitPrice: 5500, costPrice: 2800, discountPct: 0, discountAmount: 500, taxRate: 18, taxAmount: 900, cgst: 450, sgst: 450, total: 5900 },
          ],
        },
      },
    });
    await prisma.payment.create({
      data: { paymentNo: "PAY00001", paymentType: "receipt", saleId: sale1.id, customerId: cust1.id, paymentDate: "2026-01-12", amount: 16518.82, paymentMethod: "cash" },
    });

    // Sale 2: Nasir — Oakley + Lenses + Contacts
    const sale2 = await prisma.sale.create({
      data: {
        invoiceNo: "INV00002", customerId: cust1.id, prescriptionId: rx2.id,
        saleDate: "2026-01-25", subtotal: 15499, discountAmount: 0,
        taxAmount: 2789.82, cgstAmount: 1394.91, sgstAmount: 1394.91,
        totalAmount: 18288.82, paidAmount: 18288.82, balanceAmount: 0,
        status: "completed", paymentStatus: "paid",
        items: {
          create: [
            { productId: p2.id, quantity: 1, unitPrice: 7500, costPrice: 3800, discountPct: 0, discountAmount: 0, taxRate: 18, taxAmount: 1350, cgst: 675, sgst: 675, total: 8850 },
            { productId: p3.id, quantity: 1, unitPrice: 5500, costPrice: 2800, discountPct: 0, discountAmount: 0, taxRate: 18, taxAmount: 990, cgst: 495, sgst: 495, total: 6490 },
            { productId: p5.id, quantity: 1, unitPrice: 2500, costPrice: 1200, discountPct: 0, discountAmount: 0, taxRate: 18, taxAmount: 450, cgst: 225, sgst: 225, total: 2950 },
          ],
        },
      },
    });
    await prisma.payment.create({
      data: { paymentNo: "PAY00002", paymentType: "receipt", saleId: sale2.id, customerId: cust1.id, paymentDate: "2026-01-25", amount: 18288.82, paymentMethod: "card" },
    });

    // Sale 3: Ayesha — Aviator + Lenses
    const sale3 = await prisma.sale.create({
      data: {
        invoiceNo: "INV00003", customerId: cust2.id, prescriptionId: rx3.id,
        saleDate: "2026-01-18", subtotal: 14499, discountAmount: 1000,
        taxAmount: 2429.82, cgstAmount: 1214.91, sgstAmount: 1214.91,
        totalAmount: 15928.82, paidAmount: 15928.82, balanceAmount: 0,
        status: "completed", paymentStatus: "paid",
        items: {
          create: [
            { productId: p1.id, quantity: 1, unitPrice: 8999, costPrice: 4500, discountPct: 0, discountAmount: 500, taxRate: 18, taxAmount: 1529.82, cgst: 764.91, sgst: 764.91, total: 10028.82 },
            { productId: p3.id, quantity: 1, unitPrice: 5500, costPrice: 2800, discountPct: 0, discountAmount: 500, taxRate: 18, taxAmount: 900, cgst: 450, sgst: 450, total: 5900 },
          ],
        },
      },
    });
    await prisma.payment.create({
      data: { paymentNo: "PAY00003", paymentType: "receipt", saleId: sale3.id, customerId: cust2.id, paymentDate: "2026-01-18", amount: 15928.82, paymentMethod: "cash" },
    });

    // Sale 4: Bilal — Wayfarer Sunglasses
    const sale4 = await prisma.sale.create({
      data: {
        invoiceNo: "INV00004", customerId: cust3.id, prescriptionId: rx4.id,
        saleDate: "2026-02-05", subtotal: 9999, discountAmount: 0,
        taxAmount: 1799.82, cgstAmount: 899.91, sgstAmount: 899.91,
        totalAmount: 11798.82, paidAmount: 11798.82, balanceAmount: 0,
        status: "completed", paymentStatus: "paid",
        items: {
          create: [
            { productId: p4.id, quantity: 1, unitPrice: 9999, costPrice: 5000, discountPct: 0, discountAmount: 0, taxRate: 18, taxAmount: 1799.82, cgst: 899.91, sgst: 899.91, total: 11798.82 },
          ],
        },
      },
    });
    await prisma.payment.create({
      data: { paymentNo: "PAY00004", paymentType: "receipt", saleId: sale4.id, customerId: cust3.id, paymentDate: "2026-02-05", amount: 11798.82, paymentMethod: "cash" },
    });

    // Sale 5: Fatima — Oakley + Lenses (partial payment)
    const sale5 = await prisma.sale.create({
      data: {
        invoiceNo: "INV00005", customerId: cust4.id, prescriptionId: rx5.id,
        saleDate: "2026-02-12", subtotal: 13000, discountAmount: 0,
        taxAmount: 2340, cgstAmount: 1170, sgstAmount: 1170,
        totalAmount: 15340, paidAmount: 10000, balanceAmount: 5340,
        status: "pending", paymentStatus: "partial",
        items: {
          create: [
            { productId: p2.id, quantity: 1, unitPrice: 7500, costPrice: 3800, discountPct: 0, discountAmount: 0, taxRate: 18, taxAmount: 1350, cgst: 675, sgst: 675, total: 8850 },
            { productId: p3.id, quantity: 1, unitPrice: 5500, costPrice: 2800, discountPct: 0, discountAmount: 0, taxRate: 18, taxAmount: 990, cgst: 495, sgst: 495, total: 6490 },
          ],
        },
      },
    });
    await prisma.payment.create({
      data: { paymentNo: "PAY00005", paymentType: "receipt", saleId: sale5.id, customerId: cust4.id, paymentDate: "2026-02-12", amount: 10000, paymentMethod: "cash" },
    });

    // Sale 6: Bilal — Oakley frame
    const sale6 = await prisma.sale.create({
      data: {
        invoiceNo: "INV00006", customerId: cust3.id,
        saleDate: "2026-02-10", subtotal: 7500, discountAmount: 500,
        taxAmount: 1260, cgstAmount: 630, sgstAmount: 630,
        totalAmount: 8260, paidAmount: 8260, balanceAmount: 0,
        status: "completed", paymentStatus: "paid",
        items: {
          create: [
            { productId: p2.id, quantity: 1, unitPrice: 7500, costPrice: 3800, discountPct: 0, discountAmount: 500, taxRate: 18, taxAmount: 1260, cgst: 630, sgst: 630, total: 8260 },
          ],
        },
      },
    });
    await prisma.payment.create({
      data: { paymentNo: "PAY00006", paymentType: "receipt", saleId: sale6.id, customerId: cust3.id, paymentDate: "2026-02-10", amount: 8260, paymentMethod: "card" },
    });

    // Sale 7: Ayesha — Contact lenses
    const sale7 = await prisma.sale.create({
      data: {
        invoiceNo: "INV00007", customerId: cust2.id,
        saleDate: "2026-02-15", subtotal: 5000, discountAmount: 0,
        taxAmount: 900, cgstAmount: 450, sgstAmount: 450,
        totalAmount: 5900, paidAmount: 5900, balanceAmount: 0,
        status: "completed", paymentStatus: "paid",
        items: {
          create: [
            { productId: p5.id, quantity: 2, unitPrice: 2500, costPrice: 1200, discountPct: 0, discountAmount: 0, taxRate: 18, taxAmount: 900, cgst: 450, sgst: 450, total: 5900 },
          ],
        },
      },
    });
    await prisma.payment.create({
      data: { paymentNo: "PAY00007", paymentType: "receipt", saleId: sale7.id, customerId: cust2.id, paymentDate: "2026-02-15", amount: 5900, paymentMethod: "cash" },
    });

    // Update customer total purchases
    await prisma.customer.update({ where: { id: cust1.id }, data: { totalPurchases: 16518.82 + 18288.82 } });
    await prisma.customer.update({ where: { id: cust2.id }, data: { totalPurchases: 15928.82 + 5900 } });
    await prisma.customer.update({ where: { id: cust3.id }, data: { totalPurchases: 11798.82 + 8260 } });
    await prisma.customer.update({ where: { id: cust4.id }, data: { totalPurchases: 10000 } });

    return NextResponse.json({
      success: true,
      message: "Database reset and seeded successfully",
      data: {
        categories: 5,
        brands: 6,
        products: 5,
        customers: 5,
        prescriptions: 5,
        sales: 7,
        summary: "5 Pakistani customers | 5 prescriptions by Dr. Muddasar | 7 sales | 5 products with images",
      },
    });
  } catch (error: any) {
    console.error("Error resetting data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Delete in correct order to respect foreign key constraints
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

    // ── 5 Products with images ──
    const p1 = await prisma.product.create({
      data: {
        sku: "FRM-001", barcode: "8901234001", name: "Ray-Ban Aviator Classic",
        categoryId: catFrames.id, brandId: brandRayBan.id, productType: "frame",
        costPrice: 4500, sellingPrice: 8999, mrp: 9500, taxRate: 18,
        imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
        isActive: true,
        inventory: { create: { quantity: 20, location: "main" } },
      },
    });
    const p2 = await prisma.product.create({
      data: {
        sku: "FRM-002", barcode: "8901234002", name: "Oakley Holbrook Square Frame",
        categoryId: catFrames.id, brandId: brandOakley.id, productType: "frame",
        costPrice: 3800, sellingPrice: 7500, mrp: 8000, taxRate: 18,
        imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400",
        isActive: true,
        inventory: { create: { quantity: 15, location: "main" } },
      },
    });
    const p3 = await prisma.product.create({
      data: {
        sku: "LNS-001", barcode: "8901234003", name: "Essilor Crizal Blue Light Lenses",
        categoryId: catLenses.id, brandId: brandEssilor.id, productType: "lens",
        costPrice: 2800, sellingPrice: 5500, mrp: 6000, taxRate: 18,
        imageUrl: "https://images.unsplash.com/photo-1616444536069-a13e1423e839?w=400",
        isActive: true,
        inventory: { create: { quantity: 30, location: "main" } },
      },
    });
    const p4 = await prisma.product.create({
      data: {
        sku: "SUN-001", barcode: "8901234004", name: "Ray-Ban Wayfarer Sunglasses",
        categoryId: catSunglasses.id, brandId: brandRayBan.id, productType: "frame",
        costPrice: 5000, sellingPrice: 9999, mrp: 10500, taxRate: 18,
        imageUrl: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400",
        isActive: true,
        inventory: { create: { quantity: 12, location: "main" } },
      },
    });
    const p5 = await prisma.product.create({
      data: {
        sku: "CL-001", barcode: "8901234005", name: "Acuvue Oasys Daily 30 Pack",
        categoryId: catContacts.id, brandId: brandAcuvue.id, productType: "contact_lens",
        costPrice: 1200, sellingPrice: 2500, mrp: 2800, taxRate: 18,
        imageUrl: "https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?w=400",
        isActive: true,
        inventory: { create: { quantity: 25, location: "main" } },
      },
    });

    // ── 1 Customer: Nasir Qureshi ──
    const customer = await prisma.customer.create({
      data: {
        customerNo: "CUST00001", firstName: "Nasir", lastName: "Qureshi",
        phone: "+92-300-1234567", whatsapp: "+92-300-1234567",
        email: "nasir.qureshi@example.com", address: "Block 15, Gulistan-e-Johar",
        city: "Karachi", state: "Sindh", country: "Pakistan",
        gender: "male", dateOfBirth: "1985-05-15",
        isActive: true, loyaltyPoints: 250, totalPurchases: 0,
      },
    });

    // ── 3 Prescriptions by Dr. Muddasar ──
    const rx1 = await prisma.prescription.create({
      data: {
        prescriptionNo: "RX00001", customerId: customer.id,
        prescriptionDate: "2026-01-10", expiryDate: "2027-01-10",
        prescribedBy: "Dr. Muddasar",
        odDistanceSphere: -2.5, odDistanceCylinder: -0.75, odDistanceAxis: 180, odAddSphere: 0, odPd: 32,
        osDistanceSphere: -2.75, osDistanceCylinder: -0.5, osDistanceAxis: 175, osAddSphere: 0, osPd: 32,
        photoUrl: "https://images.unsplash.com/photo-1631248055579-7e8c9c3c5c0e?w=400",
      },
    });
    const rx2 = await prisma.prescription.create({
      data: {
        prescriptionNo: "RX00002", customerId: customer.id,
        prescriptionDate: "2026-01-20", expiryDate: "2027-01-20",
        prescribedBy: "Dr. Muddasar",
        odDistanceSphere: -3.0, odDistanceCylinder: -1.0, odDistanceAxis: 180, odAddSphere: 1.0, odPd: 31,
        osDistanceSphere: -3.25, osDistanceCylinder: -0.75, osDistanceAxis: 170, osAddSphere: 1.0, osPd: 31,
        photoUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400",
      },
    });
    const rx3 = await prisma.prescription.create({
      data: {
        prescriptionNo: "RX00003", customerId: customer.id,
        prescriptionDate: "2026-02-05", expiryDate: "2027-02-05",
        prescribedBy: "Dr. Muddasar",
        odDistanceSphere: -2.75, odDistanceCylinder: -0.5, odDistanceAxis: 175, odAddSphere: 0.5, odPd: 32,
        osDistanceSphere: -3.0, osDistanceCylinder: -0.75, osDistanceAxis: 180, osAddSphere: 0.5, osPd: 32,
        photoUrl: "https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=400",
      },
    });

    // ── 5 Sales for Nasir Qureshi ──
    const sale1 = await prisma.sale.create({
      data: {
        invoiceNo: "INV00001", customerId: customer.id, prescriptionId: rx1.id,
        saleDate: "2026-01-12", subtotal: 14499, discountAmount: 500,
        taxAmount: 2519.82, cgstAmount: 1259.91, sgstAmount: 1259.91,
        totalAmount: 16518.82, paidAmount: 16518.82, balanceAmount: 0,
        status: "completed", paymentStatus: "paid",
        notes: "Aviator frame with blue light lenses - Prescription RX00001",
        items: {
          create: [
            { productId: p1.id, quantity: 1, unitPrice: 8999, costPrice: 4500, discountPct: 0, discountAmount: 0, taxRate: 18, taxAmount: 1619.82, cgst: 809.91, sgst: 809.91, total: 10618.82 },
            { productId: p3.id, quantity: 1, unitPrice: 5500, costPrice: 2800, discountPct: 0, discountAmount: 500, taxRate: 18, taxAmount: 900, cgst: 450, sgst: 450, total: 5900 },
          ],
        },
      },
    });
    await prisma.payment.create({
      data: { paymentNo: "PAY00001", paymentType: "receipt", saleId: sale1.id, customerId: customer.id, paymentDate: "2026-01-12", amount: 16518.82, paymentMethod: "cash" },
    });

    const sale2 = await prisma.sale.create({
      data: {
        invoiceNo: "INV00002", customerId: customer.id, prescriptionId: rx2.id,
        saleDate: "2026-01-25", subtotal: 13499, discountAmount: 0,
        taxAmount: 2429.82, cgstAmount: 1214.91, sgstAmount: 1214.91,
        totalAmount: 15928.82, paidAmount: 15928.82, balanceAmount: 0,
        status: "completed", paymentStatus: "paid",
        notes: "Oakley frame with prescription lenses - RX00002",
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
      data: { paymentNo: "PAY00002", paymentType: "receipt", saleId: sale2.id, customerId: customer.id, paymentDate: "2026-01-25", amount: 15928.82, paymentMethod: "card" },
    });

    const sale3 = await prisma.sale.create({
      data: {
        invoiceNo: "INV00003", customerId: customer.id,
        saleDate: "2026-02-02", subtotal: 9999, discountAmount: 1000,
        taxAmount: 1619.82, cgstAmount: 809.91, sgstAmount: 809.91,
        totalAmount: 10618.82, paidAmount: 10618.82, balanceAmount: 0,
        status: "completed", paymentStatus: "paid",
        notes: "Ray-Ban Wayfarer sunglasses with 10% discount",
        items: {
          create: [
            { productId: p4.id, quantity: 1, unitPrice: 9999, costPrice: 5000, discountPct: 10, discountAmount: 1000, taxRate: 18, taxAmount: 1619.82, cgst: 809.91, sgst: 809.91, total: 10618.82 },
          ],
        },
      },
    });
    await prisma.payment.create({
      data: { paymentNo: "PAY00003", paymentType: "receipt", saleId: sale3.id, customerId: customer.id, paymentDate: "2026-02-02", amount: 10618.82, paymentMethod: "cash" },
    });

    const sale4 = await prisma.sale.create({
      data: {
        invoiceNo: "INV00004", customerId: customer.id, prescriptionId: rx3.id,
        saleDate: "2026-02-08", subtotal: 14499, discountAmount: 0,
        taxAmount: 2609.82, cgstAmount: 1304.91, sgstAmount: 1304.91,
        totalAmount: 17108.82, paidAmount: 17108.82, balanceAmount: 0,
        status: "completed", paymentStatus: "paid",
        notes: "Reading glasses - Prescription RX00003",
        items: {
          create: [
            { productId: p1.id, quantity: 1, unitPrice: 8999, costPrice: 4500, discountPct: 0, discountAmount: 0, taxRate: 18, taxAmount: 1619.82, cgst: 809.91, sgst: 809.91, total: 10618.82 },
            { productId: p3.id, quantity: 1, unitPrice: 5500, costPrice: 2800, discountPct: 0, discountAmount: 0, taxRate: 18, taxAmount: 990, cgst: 495, sgst: 495, total: 6490 },
          ],
        },
      },
    });
    await prisma.payment.create({
      data: { paymentNo: "PAY00004", paymentType: "receipt", saleId: sale4.id, customerId: customer.id, paymentDate: "2026-02-08", amount: 17108.82, paymentMethod: "cash" },
    });

    const sale5 = await prisma.sale.create({
      data: {
        invoiceNo: "INV00005", customerId: customer.id,
        saleDate: "2026-02-10", subtotal: 5000, discountAmount: 0,
        taxAmount: 900, cgstAmount: 450, sgstAmount: 450,
        totalAmount: 5900, paidAmount: 3000, balanceAmount: 2900,
        status: "pending", paymentStatus: "partial",
        notes: "Contact lenses - Balance payment pending",
        items: {
          create: [
            { productId: p5.id, quantity: 2, unitPrice: 2500, costPrice: 1200, discountPct: 0, discountAmount: 0, taxRate: 18, taxAmount: 900, cgst: 450, sgst: 450, total: 5900 },
          ],
        },
      },
    });
    await prisma.payment.create({
      data: { paymentNo: "PAY00005", paymentType: "receipt", saleId: sale5.id, customerId: customer.id, paymentDate: "2026-02-10", amount: 3000, paymentMethod: "cash" },
    });

    // Update customer total purchases
    await prisma.customer.update({ 
      where: { id: customer.id }, 
      data: { totalPurchases: 16518.82 + 15928.82 + 10618.82 + 17108.82 + 3000 } 
    });

    return NextResponse.json({
      success: true,
      message: "Database reset and seeded successfully",
      data: {
        categories: 5,
        brands: 6,
        products: 5,
        customers: 1,
        customerName: "Nasir Qureshi",
        prescriptions: 3,
        prescribedBy: "Dr. Muddasar",
        sales: 5,
        summary: "1 customer (Nasir Qureshi) | 3 prescriptions by Dr. Muddasar | 5 sales (4 completed, 1 partial) | 5 products with images",
      },
    });
  } catch (error: any) {
    console.error("Error resetting data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

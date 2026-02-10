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

    // ── 10 Products with varied stock levels ──
    const p1 = await prisma.product.create({
      data: {
        sku: "FRM-001", barcode: "8901234001", name: "Ray-Ban Aviator Gold",
        categoryId: catFrames.id, brandId: brandRayBan.id, productType: "frame",
        costPrice: 4500, sellingPrice: 8999, mrp: 9500, taxRate: 18,
        imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
        isActive: true,
        inventory: { create: { quantity: 25, location: "main" } }, // High stock
      },
    });
    const p2 = await prisma.product.create({
      data: {
        sku: "FRM-002", barcode: "8901234002", name: "Oakley Holbrook Matte Black",
        categoryId: catFrames.id, brandId: brandOakley.id, productType: "frame",
        costPrice: 3800, sellingPrice: 7500, mrp: 8000, taxRate: 18,
        imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400",
        isActive: true,
        inventory: { create: { quantity: 3, location: "main" } }, // Low stock
      },
    });
    const p3 = await prisma.product.create({
      data: {
        sku: "FRM-003", barcode: "8901234003", name: "Tom Ford Cat Eye Tortoise",
        categoryId: catFrames.id, brandId: brandTomFord.id, productType: "frame",
        costPrice: 6200, sellingPrice: 12500, mrp: 13000, taxRate: 18,
        imageUrl: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400",
        isActive: true,
        inventory: { create: { quantity: 0, location: "main" } }, // Out of stock
      },
    });
    const p4 = await prisma.product.create({
      data: {
        sku: "LNS-001", barcode: "8901234004", name: "Essilor Crizal Sapphire",
        categoryId: catLenses.id, brandId: brandEssilor.id, productType: "lens",
        costPrice: 2800, sellingPrice: 5500, mrp: 6000, taxRate: 18,
        imageUrl: "https://images.unsplash.com/photo-1616444536069-a13e1423e839?w=400",
        isActive: true,
        inventory: { create: { quantity: 50, location: "main" } }, // High stock
      },
    });
    const p5 = await prisma.product.create({
      data: {
        sku: "LNS-002", barcode: "8901234005", name: "Blue Light Blocking Lenses",
        categoryId: catLenses.id, brandId: brandEssilor.id, productType: "lens",
        costPrice: 1800, sellingPrice: 3500, mrp: 4000, taxRate: 18,
        imageUrl: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=400",
        isActive: true,
        inventory: { create: { quantity: 15, location: "main" } }, // Medium stock
      },
    });
    const p6 = await prisma.product.create({
      data: {
        sku: "SUN-001", barcode: "8901234006", name: "Ray-Ban Wayfarer Classic",
        categoryId: catSunglasses.id, brandId: brandRayBan.id, productType: "frame",
        costPrice: 5000, sellingPrice: 9999, mrp: 10500, taxRate: 18,
        imageUrl: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400",
        isActive: true,
        inventory: { create: { quantity: 1, location: "main" } }, // Critical low
      },
    });
    const p7 = await prisma.product.create({
      data: {
        sku: "SUN-002", barcode: "8901234007", name: "Gucci Oversized Sunglasses",
        categoryId: catSunglasses.id, brandId: brandGucci.id, productType: "frame",
        costPrice: 8500, sellingPrice: 16999, mrp: 18000, taxRate: 18,
        imageUrl: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400",
        isActive: true,
        inventory: { create: { quantity: 8, location: "main" } }, // Medium stock
      },
    });
    const p8 = await prisma.product.create({
      data: {
        sku: "CL-001", barcode: "8901234008", name: "Acuvue Oasys Daily 30pk",
        categoryId: catContacts.id, brandId: brandAcuvue.id, productType: "contact_lens",
        costPrice: 1200, sellingPrice: 2500, mrp: 2800, taxRate: 18,
        imageUrl: "https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?w=400",
        isActive: true,
        inventory: { create: { quantity: 35, location: "main" } }, // High stock
      },
    });
    const p9 = await prisma.product.create({
      data: {
        sku: "CL-002", barcode: "8901234009", name: "Acuvue Vita Monthly 6pk",
        categoryId: catContacts.id, brandId: brandAcuvue.id, productType: "contact_lens",
        costPrice: 2000, sellingPrice: 3800, mrp: 4200, taxRate: 18,
        imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400",
        isActive: true,
        inventory: { create: { quantity: 0, location: "main" } }, // Out of stock
      },
    });
    const p10 = await prisma.product.create({
      data: {
        sku: "ACC-001", barcode: "8901234010", name: "Microfiber Cleaning Kit",
        categoryId: catAccessories.id, productType: "accessory",
        costPrice: 200, sellingPrice: 499, mrp: 599, taxRate: 18,
        imageUrl: "https://images.unsplash.com/photo-1556015048-4d3aa10df74c?w=400",
        isActive: true,
        inventory: { create: { quantity: 5, location: "main" } }, // Low stock
      },
    });

    // ── 2 Customers from Pakistan ──
    const customer = await prisma.customer.create({
      data: {
        customerNo: "CUST00001", firstName: "Ahmed", lastName: "Hassan",
        phone: "+92-300-1234567", whatsapp: "+92-300-1234567",
        email: "ahmed.hassan@example.com", address: "Block 15, Gulistan-e-Johar",
        city: "Karachi", state: "Sindh", country: "Pakistan",
        gender: "male", dateOfBirth: "1988-03-22",
        isActive: true, loyaltyPoints: 150, totalPurchases: 0,
      },
    });
    const customer2 = await prisma.customer.create({
      data: {
        customerNo: "CUST00002", firstName: "Fatima", lastName: "Ali",
        phone: "+92-321-9876543", whatsapp: "+92-321-9876543",
        email: "fatima.ali@example.com", address: "Sector F-7, Street 45",
        city: "Islamabad", state: "Islamabad Capital Territory", country: "Pakistan",
        gender: "female", dateOfBirth: "1995-11-08",
        isActive: true, loyaltyPoints: 80, totalPurchases: 0,
      },
    });

    // ── Prescriptions with images ──
    const rx1 = await prisma.prescription.create({
      data: {
        prescriptionNo: "RX00001", customerId: customer.id,
        prescriptionDate: "2026-01-15", expiryDate: "2027-01-15",
        prescribedBy: "Dr. Ahmed Khan",
        odSphere: -2.5, odCylinder: -0.75, odAxis: 180, odAdd: 0, odPd: 32,
        osSphere: -2.75, osCylinder: -0.5, osAxis: 175, osAdd: 0, osPd: 32,
        photoUrl: "https://images.unsplash.com/photo-1631248055579-7e8c9c3c5c0e?w=400",
      },
    });
    const rx2 = await prisma.prescription.create({
      data: {
        prescriptionNo: "RX00002", customerId: customer2.id,
        prescriptionDate: "2026-02-01", expiryDate: "2027-02-01",
        prescribedBy: "Dr. Sara Ali",
        odSphere: -3.0, odCylinder: -1.0, odAxis: 180, odAdd: 1.5, odPd: 31,
        osSphere: -3.25, osCylinder: -0.75, osAxis: 170, osAdd: 1.5, osPd: 31,
        photoUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400",
      },
    });

    // ── Sale 1: Completed with prescription ──
    const sale1 = await prisma.sale.create({
      data: {
        invoiceNo: "INV00001", customerId: customer.id, prescriptionId: rx1.id,
        saleDate: "2026-02-05", subtotal: 14499, discountAmount: 500,
        taxAmount: 2519.82, cgstAmount: 1259.91, sgstAmount: 1259.91,
        totalAmount: 16518.82, paidAmount: 16518.82, balanceAmount: 0,
        status: "completed", paymentStatus: "paid",
        notes: "Complete eyeglass set with prescription",
        items: {
          create: [
            { productId: p1.id, quantity: 1, unitPrice: 8999, costPrice: 4500, discountPct: 0, discountAmount: 0, taxRate: 18, taxAmount: 1619.82, cgst: 809.91, sgst: 809.91, total: 10618.82 },
            { productId: p4.id, quantity: 1, unitPrice: 5500, costPrice: 2800, discountPct: 0, discountAmount: 500, taxRate: 18, taxAmount: 900, cgst: 450, sgst: 450, total: 5900 },
          ],
        },
      },
    });
    await prisma.payment.create({
      data: { paymentNo: "PAY00001", paymentType: "receipt", saleId: sale1.id, customerId: customer.id, paymentDate: "2026-02-05", amount: 16518.82, paymentMethod: "cash" },
    });

    // ── Sale 2: Completed sunglasses ──
    const sale2 = await prisma.sale.create({
      data: {
        invoiceNo: "INV00002", customerId: customer2.id,
        saleDate: "2026-02-08", subtotal: 16999, discountAmount: 1000,
        taxAmount: 2879.82, cgstAmount: 1439.91, sgstAmount: 1439.91,
        totalAmount: 18878.82, paidAmount: 18878.82, balanceAmount: 0,
        status: "completed", paymentStatus: "paid",
        notes: "Designer sunglasses with 10% discount",
        items: {
          create: [
            { productId: p7.id, quantity: 1, unitPrice: 16999, costPrice: 8500, discountPct: 0, discountAmount: 1000, taxRate: 18, taxAmount: 2879.82, cgst: 1439.91, sgst: 1439.91, total: 18878.82 },
          ],
        },
      },
    });
    await prisma.payment.create({
      data: { paymentNo: "PAY00002", paymentType: "receipt", saleId: sale2.id, customerId: customer2.id, paymentDate: "2026-02-08", amount: 18878.82, paymentMethod: "card" },
    });

    // ── Sale 3: Pending ──
    const sale3 = await prisma.sale.create({
      data: {
        invoiceNo: "INV00003", customerId: customer.id,
        saleDate: "2026-02-09", subtotal: 8999, discountAmount: 0,
        taxAmount: 1619.82, cgstAmount: 809.91, sgstAmount: 809.91,
        totalAmount: 10618.82, paidAmount: 5000, balanceAmount: 5618.82,
        status: "pending", paymentStatus: "partial",
        notes: "Pending balance payment",
        items: {
          create: [
            { productId: p2.id, quantity: 1, unitPrice: 7500, costPrice: 3800, discountPct: 0, discountAmount: 0, taxRate: 18, taxAmount: 1350, cgst: 675, sgst: 675, total: 8850 },
            { productId: p10.id, quantity: 3, unitPrice: 499, costPrice: 200, discountPct: 0, discountAmount: 0, taxRate: 18, taxAmount: 269.82, cgst: 134.91, sgst: 134.91, total: 1768.82 },
          ],
        },
      },
    });
    await prisma.payment.create({
      data: { paymentNo: "PAY00003", paymentType: "receipt", saleId: sale3.id, customerId: customer.id, paymentDate: "2026-02-09", amount: 5000, paymentMethod: "cash" },
    });

    // Update customer totals
    await prisma.customer.update({ where: { id: customer.id }, data: { totalPurchases: 16518.82 + 5000 } });
    await prisma.customer.update({ where: { id: customer2.id }, data: { totalPurchases: 18878.82 } });

    return NextResponse.json({
      success: true,
      message: "Database reset and seeded successfully",
      data: {
        categories: 5,
        brands: 6,
        products: 10,
        customers: 2,
        prescriptions: 2,
        sales: 3,
        summary: "Stock levels: 2 out of stock, 3 low stock, 5 in stock | 2 completed sales, 1 pending",
      },
    });
  } catch (error: any) {
    console.error("Error resetting data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

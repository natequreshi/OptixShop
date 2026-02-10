import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log('🗑️  Clearing all records...');

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
    await prisma.product.deleteMany({});
    await prisma.productCategory.deleteMany({});
    await prisma.brand.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.vendor.deleteMany({});
    await prisma.expense.deleteMany({});
    await prisma.loyaltyTransaction.deleteMany({});

    console.log('✅ All records cleared');

    console.log('👤 Creating customer: Nasir Qureshi...');
    const customer = await prisma.customer.create({
      data: {
        customerNo: 'CUST00001',
        firstName: 'Nasir',
        lastName: 'Qureshi',
        phone: '+92-300-1234567',
        whatsapp: '+92-300-1234567',
        email: 'nasir.qureshi@example.com',
        address: '123 Main Street',
        city: 'Karachi',
        state: 'Sindh',
        country: 'Pakistan',
        gender: 'male',
        dateOfBirth: '1985-05-15',
        isActive: true,
        loyaltyPoints: 0,
        totalPurchases: 0,
      },
    });

    console.log('👓 Creating category and products...');
    const category = await prisma.productCategory.create({
      data: {
        name: 'Eyeglasses',
        isActive: true,
      },
    });

    const products = await Promise.all([
      prisma.product.create({
        data: {
          sku: 'PROD001',
          name: 'Ray-Ban Classic Frames',
          categoryId: category.id,
          productType: 'frame',
          costPrice: 1500,
          sellingPrice: 2999,
          taxRate: 18,
          isActive: true,
          inventory: {
            create: {
              quantity: 10,
              location: 'main',
            },
          },
        },
      }),
      prisma.product.create({
        data: {
          sku: 'PROD002',
          name: 'John Jacobs Cat Eye',
          categoryId: category.id,
          productType: 'frame',
          costPrice: 1200,
          sellingPrice: 2500,
          taxRate: 18,
          isActive: true,
          inventory: {
            create: {
              quantity: 15,
              location: 'main',
            },
          },
        },
      }),
      prisma.product.create({
        data: {
          sku: 'PROD003',
          name: 'Essilor Prescription Lenses',
          categoryId: category.id,
          productType: 'lens',
          costPrice: 800,
          sellingPrice: 1500,
          taxRate: 18,
          isActive: true,
          inventory: {
            create: {
              quantity: 25,
              location: 'main',
            },
          },
        },
      }),
    ]);

    console.log('📋 Creating prescriptions...');
    await prisma.prescription.create({
      data: {
        prescriptionNo: 'RX00001',
        customerId: customer.id,
        prescriptionDate: '2026-01-15',
        expiryDate: '2027-01-15',
        prescribedBy: 'Dr. Ahmed Khan',
        odSphere: -2.5,
        odCylinder: -0.75,
        odAxis: 180,
        odAdd: 0,
        odPd: 32,
        osSphere: -2.75,
        osCylinder: -0.5,
        osAxis: 175,
        osAdd: 0,
        osPd: 32,
      },
    });

    await prisma.prescription.create({
      data: {
        prescriptionNo: 'RX00002',
        customerId: customer.id,
        prescriptionDate: '2026-02-01',
        expiryDate: '2027-02-01',
        prescribedBy: 'Dr. Sara Ali',
        odSphere: -3.0,
        odCylinder: -1.0,
        odAxis: 180,
        odAdd: 1.5,
        odPd: 32,
        osSphere: -3.25,
        osCylinder: -0.75,
        osAxis: 170,
        osAdd: 1.5,
        osPd: 32,
      },
    });

    console.log('💰 Creating sale...');
    const sale = await prisma.sale.create({
      data: {
        invoiceNo: 'INV00001',
        customerId: customer.id,
        saleDate: '2026-02-10',
        subtotal: 4499,
        discountAmount: 0,
        taxAmount: 809.82,
        cgstAmount: 404.91,
        sgstAmount: 404.91,
        totalAmount: 5308.82,
        paidAmount: 5308.82,
        balanceAmount: 0,
        status: 'completed',
        paymentStatus: 'paid',
        notes: 'First sale - Complete eyeglass purchase',
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 1,
              unitPrice: 2999,
              costPrice: 1500,
              discountPct: 0,
              discountAmount: 0,
              taxRate: 18,
              taxAmount: 539.82,
              cgst: 269.91,
              sgst: 269.91,
              total: 3538.82,
            },
            {
              productId: products[2].id,
              quantity: 1,
              unitPrice: 1500,
              costPrice: 800,
              discountPct: 0,
              discountAmount: 0,
              taxRate: 18,
              taxAmount: 270,
              cgst: 135,
              sgst: 135,
              total: 1770,
            },
          ],
        },
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        paymentNo: 'PAY00001',
        paymentType: 'receipt',
        saleId: sale.id,
        customerId: customer.id,
        paymentDate: '2026-02-10',
        amount: 5308.82,
        paymentMethod: 'cash',
      },
    });

    // Update inventory
    await prisma.inventory.updateMany({
      where: { productId: products[0].id },
      data: { quantity: { decrement: 1 } },
    });
    await prisma.inventory.updateMany({
      where: { productId: products[2].id },
      data: { quantity: { decrement: 1 } },
    });

    // Update customer totals
    await prisma.customer.update({
      where: { id: customer.id },
      data: { totalPurchases: 5308.82 },
    });

    return NextResponse.json({
      success: true,
      message: 'Database reset and seeded successfully',
      data: {
        customer: customer.customerNo,
        products: 3,
        prescriptions: 2,
        sales: 1,
        total: 5308.82,
      },
    });
  } catch (error: any) {
    console.error('Error resetting data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

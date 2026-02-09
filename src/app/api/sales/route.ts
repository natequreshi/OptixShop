import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const body = await req.json();

  const count = await prisma.sale.count();
  const invoiceNo = `INV${String(count + 1).padStart(5, "0")}`;
  const today = new Date().toISOString().split("T")[0];

  // Calculate totals
  let subtotal = 0;
  let totalTax = 0;
  const itemsData = body.items.map((item: any) => {
    const lineTotal = item.unitPrice * item.quantity;
    const discountAmt = (item.discount ?? 0) * item.quantity;
    const taxableAmt = lineTotal - discountAmt;
    const taxAmt = taxableAmt * ((item.taxRate ?? 0) / 100);
    subtotal += lineTotal;
    totalTax += taxAmt;
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      costPrice: 0,
      discountPct: 0,
      discountAmount: item.discount ?? 0,
      taxRate: item.taxRate ?? 0,
      taxAmount: taxAmt,
      cgst: taxAmt / 2,
      sgst: taxAmt / 2,
      total: taxableAmt + taxAmt,
    };
  });

  const totalAmount = subtotal + totalTax;
  const paidAmount = body.amountTendered ?? totalAmount;

  const sale = await prisma.sale.create({
    data: {
      invoiceNo,
      customerId: body.customerId || null,
      saleDate: today,
      subtotal,
      discountAmount: 0,
      taxAmount: totalTax,
      cgstAmount: totalTax / 2,
      sgstAmount: totalTax / 2,
      totalAmount,
      paidAmount: Math.min(paidAmount, totalAmount),
      balanceAmount: Math.max(0, totalAmount - paidAmount),
      status: "completed",
      paymentStatus: paidAmount >= totalAmount ? "paid" : "partial",
      cashierId: (session?.user as any)?.id || null,
      items: { create: itemsData },
    },
  });

  // Create payment record
  const payCount = await prisma.payment.count();
  await prisma.payment.create({
    data: {
      paymentNo: `PAY${String(payCount + 1).padStart(5, "0")}`,
      paymentType: "receipt",
      saleId: sale.id,
      customerId: body.customerId || null,
      paymentDate: today,
      amount: Math.min(paidAmount, totalAmount),
      paymentMethod: body.paymentMethod ?? "cash",
    },
  });

  // Update inventory
  for (const item of body.items) {
    await prisma.inventory.updateMany({
      where: { productId: item.productId },
      data: { quantity: { decrement: item.quantity } },
    });
    await prisma.inventoryMovement.create({
      data: {
        productId: item.productId,
        movementType: "sale",
        quantity: -item.quantity,
        referenceType: "sale",
        referenceId: sale.id,
      },
    });
  }

  // Update customer totals
  if (body.customerId) {
    await prisma.customer.update({
      where: { id: body.customerId },
      data: { totalPurchases: { increment: totalAmount } },
    });
  }

  return NextResponse.json(sale, { status: 201 });
}

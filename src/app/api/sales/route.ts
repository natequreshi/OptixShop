import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendWhatsAppNotification, formatCurrencyPlain } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get("customerId");
  if (!customerId) {
    return NextResponse.json([]);
  }
  const sales = await prisma.sale.findMany({
    where: { customerId },
    orderBy: { saleDate: "desc" },
    take: 10,
    select: { id: true, invoiceNo: true, saleDate: true, totalAmount: true, status: true },
  });
  return NextResponse.json(sales);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const body = await req.json();

  const count = await prisma.sale.count();
  const invoiceNo = `INV${String(count + 1).padStart(5, "0")}`;
  const today = new Date().toISOString().split("T")[0];

  // Calculate totals
  let subtotal = 0;
  let totalTax = 0;
  let itemDiscountsTotal = 0;
  const taxEnabled = body.taxEnabled !== false; // Default to true for backwards compatibility
  
  const itemsData = body.items.map((item: any) => {
    const lineTotal = item.unitPrice * item.quantity;
    const itemDiscount = (item.discount ?? 0) * item.quantity;
    itemDiscountsTotal += itemDiscount;
    subtotal += lineTotal;
    
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      costPrice: 0,
      discountPct: 0,
      discountAmount: item.discount ?? 0,
      taxRate: taxEnabled ? (item.taxRate ?? 0) : 0,
      taxAmount: 0, // Will calculate after global discount
      cgst: 0,
      sgst: 0,
      total: 0, // Will calculate after
    };
  });

  // Apply global discount percentage
  const globalDiscountAmount = (subtotal * (body.discountPercent ?? 0)) / 100;
  const afterGlobalDiscount = subtotal - globalDiscountAmount;
  const afterAllDiscounts = afterGlobalDiscount - itemDiscountsTotal;
  
  // Calculate tax on the discounted amounts (only if tax is enabled)
  if (taxEnabled) {
    body.items.forEach((item: any, index: number) => {
      const lineTotal = item.unitPrice * item.quantity;
      const itemDiscount = (item.discount ?? 0) * item.quantity;
      const lineAfterItemDiscount = lineTotal - itemDiscount;
      const lineAfterGlobalDiscount = lineAfterItemDiscount * (1 - (body.discountPercent ?? 0) / 100);
      const taxAmt = lineAfterGlobalDiscount * ((item.taxRate ?? 0) / 100);
      
      totalTax += taxAmt;
      itemsData[index].taxAmount = taxAmt;
      itemsData[index].cgst = taxAmt / 2;
      itemsData[index].sgst = taxAmt / 2;
      itemsData[index].total = lineAfterGlobalDiscount + taxAmt;
    });
  } else {
    // Tax disabled - set totals without tax
    body.items.forEach((item: any, index: number) => {
      const lineTotal = item.unitPrice * item.quantity;
      const itemDiscount = (item.discount ?? 0) * item.quantity;
      const lineAfterItemDiscount = lineTotal - itemDiscount;
      const lineAfterGlobalDiscount = lineAfterItemDiscount * (1 - (body.discountPercent ?? 0) / 100);
      
      itemsData[index].total = lineAfterGlobalDiscount;
    });
  }

  const totalDiscount = globalDiscountAmount + itemDiscountsTotal;
  const totalAmount = afterAllDiscounts + totalTax;
  const paidAmount = body.amountTendered ?? totalAmount;
  const actualPaidAmount = Math.min(paidAmount, totalAmount);
  const balanceAmount = Math.max(0, totalAmount - paidAmount);

  const userId = (session?.user as any)?.id;
  let cashierId: string | null = null;
  if (userId) {
    const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (userExists) cashierId = userId;
  }

  const sale = await prisma.sale.create({
    data: {
      invoiceNo,
      customerId: body.customerId || null,
      saleDate: today,
      subtotal,
      discountAmount: totalDiscount,
      taxAmount: totalTax,
      cgstAmount: totalTax / 2,
      sgstAmount: totalTax / 2,
      totalAmount,
      paidAmount: actualPaidAmount,
      balanceAmount: balanceAmount,
      status: paidAmount >= totalAmount ? "completed" : "pending",
      paymentStatus: paidAmount >= totalAmount ? "paid" : "partial",
      cashierId,
      notes: body.notes || null,
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
      amount: actualPaidAmount,
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

    // Send WhatsApp notification if enabled
    const whatsappSettings = await prisma.setting.findUnique({
      where: { key: "whatsapp_enabled" },
    });
    const whatsappEnabled = whatsappSettings?.value === "true";

    if (whatsappEnabled) {
      const customer = await prisma.customer.findUnique({ where: { id: body.customerId } });
      const waNumber = customer?.whatsapp || customer?.phone;
      if (waNumber) {
        const itemsList = body.items.map((i: any) => `${i.productName ?? "Item"} × ${i.quantity}`).join(", ");
        const itemsDetailed = body.items.map((i: any) => 
          `• ${i.productName ?? "Item"} × ${i.quantity} - ${formatCurrencyPlain(i.total)}`
        ).join("\n");
        
        const paymentMethodDisplay = (body.paymentMethod ?? "cash").toUpperCase();
        const paymentStatusDisplay = (paidAmount >= totalAmount ? "Paid" : actualPaidAmount > 0 ? "Partial" : "Unpaid").toUpperCase();
        
        sendWhatsAppNotification(waNumber, "whatsapp_order_template", {
          customerName: `${customer!.firstName} ${customer!.lastName ?? ""}`.trim(),
          invoiceNo: invoiceNo,
          orderDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
          totalAmount: formatCurrencyPlain(totalAmount),
          items: itemsList,
          itemsDetailed: itemsDetailed,
          subtotal: formatCurrencyPlain(subtotal),
          discount: formatCurrencyPlain(totalDiscount),
          tax: formatCurrencyPlain(totalTax),
          paidAmount: formatCurrencyPlain(actualPaidAmount),
          balanceAmount: formatCurrencyPlain(balanceAmount),
          paymentMethod: paymentMethodDisplay,
          paymentStatus: paymentStatusDisplay,
        }).catch((err) => console.error("[WhatsApp] notification error:", err));
      }
    }
  }

  return NextResponse.json(sale, { status: 201 });
}

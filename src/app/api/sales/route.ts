import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendWhatsAppNotification, formatCurrencyPlain } from "@/lib/whatsapp";

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

    // Send WhatsApp notification
    const customer = await prisma.customer.findUnique({ where: { id: body.customerId } });
    const waNumber = customer?.whatsapp || customer?.phone;
    if (waNumber) {
      const itemsList = body.items.map((i: any) => `${i.productName ?? "Item"} × ${i.quantity}`).join(", ");
      sendWhatsAppNotification(waNumber, "whatsapp_order_template", {
        customerName: `${customer!.firstName} ${customer!.lastName ?? ""}`.trim(),
        invoiceNo: invoiceNo,
        totalAmount: formatCurrencyPlain(totalAmount),
        items: itemsList,
      }).catch((err) => console.error("[WhatsApp] notification error:", err));
    }
  }

  return NextResponse.json(sale, { status: 201 });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "10");

  // If filtering by customer
  if (customerId) {
    const sales = await prisma.sale.findMany({
      where: { customerId },
      include: { items: true, customer: true },
      orderBy: { saleDate: "desc" },
      take: limit,
    });
    return NextResponse.json(sales);
  }

  // If filtering by status
  if (status) {
    const statusMap: Record<string, string> = {
      completed: "completed",
      pending: "pending",
      draft: "draft",
      cancelled: "cancelled",
      paid: "paid",
      partial: "partial",
      unpaid: "unpaid",
    };

    const mappedStatus = statusMap[status] || status;
    
    const sales = await prisma.sale.findMany({
      where: {
        ...(status === "completed" ? { status: "completed" } : {}),
        ...(status === "pending" || status === "unpaid" ? { paymentStatus: "unpaid", status: "completed" } : {}),
        ...(status === "partial" ? { paymentStatus: "partial", status: "completed" } : {}),
        ...(status === "draft" ? { status: "draft" } : {}),
      },
      include: { 
        items: {
          include: { product: { select: { name: true } } }
        }, 
        customer: { select: { id: true, firstName: true, lastName: true } } 
      },
      orderBy: { saleDate: "desc" },
      take: limit,
    });

    // Transform data to match expected format
    return NextResponse.json(sales.map((sale: any) => ({
      id: sale.id,
      invoiceNo: sale.invoiceNo,
      customerName: sale.customer ? `${sale.customer.firstName} ${sale.customer.lastName || ""}`.trim() : "Walk-in Customer",
      saleDate: sale.saleDate,
      totalAmount: sale.totalAmount,
      status: sale.status,
      paymentStatus: sale.paymentStatus,
      itemCount: sale.items?.length || 0,
      items: sale.items?.map((item: any) => ({
        productName: item.product?.name || "Item",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discountAmount || 0,
        taxAmount: item.taxAmount || 0,
        total: item.total || (item.unitPrice * item.quantity),
      })) || [],
      paidAmount: sale.paidAmount,
      balanceAmount: sale.balanceAmount,
    })));
  }

  // Default: return all recent sales
  const sales = await prisma.sale.findMany({
    include: { 
      items: {
        include: { product: { select: { name: true } } }
      }, 
      customer: { select: { id: true, firstName: true, lastName: true } } 
    },
    orderBy: { saleDate: "desc" },
    take: limit,
  });

  return NextResponse.json(sales.map((sale: any) => ({
    id: sale.id,
    invoiceNo: sale.invoiceNo,
    customerName: sale.customer ? `${sale.customer.firstName} ${sale.customer.lastName || ""}`.trim() : "Walk-in Customer",
    saleDate: sale.saleDate,
    totalAmount: sale.totalAmount,
    status: sale.status,
    paymentStatus: sale.paymentStatus,
    itemCount: sale.items?.length || 0,
    items: sale.items?.map((item: any) => ({
      productName: item.product?.name || "Item",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discountAmount || 0,
      taxAmount: item.taxAmount || 0,
      total: item.total || (item.unitPrice * item.quantity),
    })) || [],
    paidAmount: sale.paidAmount,
    balanceAmount: sale.balanceAmount,
  })));
}

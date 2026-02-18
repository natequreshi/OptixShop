import { prisma } from "@/lib/prisma";
import SalesClient from "./client";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const sales = await prisma.sale.findMany({
    take: 200,
    select: {
      id: true, invoiceNo: true, saleDate: true, subtotal: true,
      discountAmount: true, taxAmount: true, totalAmount: true,
      paidAmount: true, balanceAmount: true, status: true,
      paymentStatus: true, customerId: true, notes: true,
      customer: { select: { firstName: true, lastName: true } },
      cashier: { select: { fullName: true } },
      items: { select: { quantity: true, unitPrice: true, discountAmount: true, taxAmount: true, total: true, product: { select: { name: true } } } },
      payments: { select: { paymentMethod: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = sales.map((s) => ({
    id: s.id,
    invoiceNo: s.invoiceNo,
    customerName: s.customer ? `${s.customer.firstName} ${s.customer.lastName ?? ""}`.trim() : "Walk-in",
    cashierName: s.cashier?.fullName ?? "—",
    saleDate: s.saleDate,
    subtotal: s.subtotal,
    discountAmount: s.discountAmount,
    taxAmount: s.taxAmount,
    totalAmount: s.totalAmount,
    paidAmount: s.paidAmount,
    balanceAmount: s.balanceAmount,
    status: s.status,
    paymentStatus: s.paymentStatus,
    itemCount: s.items.length,
    paymentMethods: [...new Set(s.payments.map((p) => p.paymentMethod))].join(", "),
    items: s.items.map((i) => ({
      productName: i.product.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      discount: i.discountAmount,
      taxAmount: i.taxAmount,
      total: i.total,
    })),
    customerId: s.customerId,
    notes: s.notes,
  }));

  return <SalesClient sales={data} />;
}

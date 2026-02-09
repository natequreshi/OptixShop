import { prisma } from "@/lib/prisma";
import PIClient from "./client";

export const dynamic = "force-dynamic";

export default async function PurchaseInvoicesPage() {
  const invoices = await prisma.purchaseInvoice.findMany({
    include: { vendor: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  const data = invoices.map((inv) => ({
    id: inv.id, invoiceNo: inv.invoiceNo, vendorInvoiceNo: inv.vendorInvoiceNo ?? "",
    vendorName: inv.vendor.companyName, invoiceDate: inv.invoiceDate,
    dueDate: inv.dueDate ?? "", totalAmount: inv.totalAmount,
    paidAmount: inv.paidAmount, balanceAmount: inv.balanceAmount,
    status: inv.status, itemCount: inv.items.length,
  }));

  return <PIClient invoices={data} />;
}

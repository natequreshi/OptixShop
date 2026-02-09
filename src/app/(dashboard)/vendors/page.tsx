import { prisma } from "@/lib/prisma";
import VendorsClient from "./client";

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { purchaseOrders: true, purchaseInvoices: true } } },
  });

  const data = vendors.map((v) => ({
    id: v.id, vendorCode: v.vendorCode, companyName: v.companyName,
    contactPerson: v.contactPerson ?? "", phone: v.phone ?? "", email: v.email ?? "",
    city: v.city ?? "", paymentTerms: v.paymentTerms ?? "", creditDays: v.creditDays,
    poCount: v._count.purchaseOrders, invoiceCount: v._count.purchaseInvoices, isActive: v.isActive,
  }));

  return <VendorsClient vendors={data} />;
}

import { prisma } from "@/lib/prisma";
import POClient from "./client";

export const dynamic = "force-dynamic";

export default async function PurchaseOrdersPage() {
  const [pos, vendors] = await Promise.all([
    prisma.purchaseOrder.findMany({
      include: { vendor: true, items: { select: { id: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.vendor.findMany({ where: { isActive: true }, select: { id: true, companyName: true } }),
  ]);

  const data = pos.map((po) => ({
    id: po.id, poNumber: po.poNumber, vendorName: po.vendor.companyName,
    orderDate: po.orderDate, expectedDelivery: po.expectedDelivery ?? "",
    totalAmount: po.totalAmount, status: po.status, itemCount: po.items.length,
  }));

  return <POClient purchaseOrders={data} vendors={vendors.map(v => ({ id: v.id, name: v.companyName }))} />;
}

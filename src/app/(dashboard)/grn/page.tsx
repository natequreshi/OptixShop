import { prisma } from "@/lib/prisma";
import GRNClient from "./client";

export const dynamic = "force-dynamic";

export default async function GRNPage() {
  const grns = await prisma.goodsReceiptNote.findMany({
    include: { vendor: true, po: true, receivedBy: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  const data = grns.map((g) => ({
    id: g.id, grnNumber: g.grnNumber, poNumber: g.po?.poNumber ?? "—",
    vendorName: g.vendor.companyName, receiptDate: g.receiptDate,
    status: g.status, receivedBy: g.receivedBy?.fullName ?? "—",
    itemCount: g.items.length,
    totalQty: g.items.reduce((s, i) => s + i.acceptedQty, 0),
  }));

  return <GRNClient grns={data} />;
}

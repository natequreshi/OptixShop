import { prisma } from "@/lib/prisma";
import LabOrdersClient from "./client";

export const dynamic = "force-dynamic";

export default async function LabOrdersPage() {
  const labOrders = await prisma.labOrder.findMany({
    include: {
      customer: true, prescription: true,
      frameProduct: true, lensProduct: true, createdBy: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const data = labOrders.map((lo) => ({
    id: lo.id, orderNo: lo.orderNo,
    customerName: `${lo.customer.firstName} ${lo.customer.lastName ?? ""}`.trim(),
    frameName: lo.frameProduct?.name ?? "—",
    lensName: lo.lensProduct?.name ?? "—",
    status: lo.status, labType: lo.labType,
    orderDate: lo.orderDate,
    estimatedDelivery: lo.estimatedDelivery ?? "",
    actualDelivery: lo.actualDelivery ?? "",
    labCost: lo.labCost,
    createdBy: lo.createdBy?.fullName ?? "—",
  }));

  return <LabOrdersClient labOrders={data} />;
}

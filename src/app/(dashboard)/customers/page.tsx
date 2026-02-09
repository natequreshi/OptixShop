import { prisma } from "@/lib/prisma";
import CustomersClient from "./client";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { sales: true, prescriptions: true } } },
  });

  const data = customers.map((c) => ({
    id: c.id,
    customerNo: c.customerNo,
    firstName: c.firstName,
    lastName: c.lastName ?? "",
    phone: c.phone ?? "",
    email: c.email ?? "",
    city: c.city ?? "",
    loyaltyPoints: c.loyaltyPoints,
    totalPurchases: c.totalPurchases,
    salesCount: c._count.sales,
    rxCount: c._count.prescriptions,
    isActive: c.isActive,
  }));

  return <CustomersClient customers={data} />;
}

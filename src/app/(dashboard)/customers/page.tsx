import { prisma } from "@/lib/prisma";
import CustomersClient from "./client";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { sales: true, prescriptions: true } },
      prescriptions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      sales: {
        orderBy: { createdAt: "desc" },
        include: {
          items: { include: { product: { select: { name: true } } } },
        },
      },
    },
  });

  const settingsRaw = await prisma.setting.findMany();
  const settings: Record<string, string> = {};
  settingsRaw.forEach((s) => { settings[s.key] = s.value; });

  const data = customers.map((c) => {
    const rx = c.prescriptions[0] ?? null;
    return {
      id: c.id,
      customerNo: c.customerNo,
      firstName: c.firstName,
      lastName: c.lastName ?? "",
      phone: c.phone ?? "",
      whatsapp: c.whatsapp ?? "",
      email: c.email ?? "",
      city: c.city ?? "",
      country: c.country ?? "Pakistan",
      gender: c.gender ?? "",
      address: c.address ?? "",
      state: c.state ?? "",
      loyaltyPoints: c.loyaltyPoints,
      totalPurchases: c.totalPurchases,
      salesCount: c._count.sales,
      rxCount: c._count.prescriptions,
      isActive: c.isActive,
      latestRx: rx ? {
        prescriptionNo: rx.prescriptionNo,
        date: rx.prescriptionDate,
        odSph: rx.odSphere,
        odCyl: rx.odCylinder,
        odAxis: rx.odAxis,
        osSph: rx.osSphere,
        osCyl: rx.osCylinder,
        osAxis: rx.osAxis,
      } : null,
      sales: c.sales.map((s) => ({
        id: s.id,
        invoiceNo: s.invoiceNo,
        date: s.saleDate,
        totalAmount: s.totalAmount,
        status: s.status,
        items: s.items.map((i) => ({
          productName: i.product.name,
          quantity: i.quantity,
          total: i.total,
        })),
      })),
    };
  });

  return <CustomersClient customers={data} settings={settings} />;
}

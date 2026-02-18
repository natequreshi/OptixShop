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
        // Use old field names that actually exist in database
        odDistanceSphere: rx.odSphere,
        odDistanceCylinder: rx.odCylinder,
        odDistanceAxis: rx.odAxis,
        osDistanceSphere: rx.osSphere,
        osDistanceCylinder: rx.osCylinder,
        osDistanceAxis: rx.osAxis,
        // Near Vision (null for now until fields are available)
        odNearSphere: rx.odNearSphere,
        odNearCylinder: rx.odNearCylinder,
        odNearAxis: rx.odNearAxis,
        osNearSphere: rx.osNearSphere,
        osNearCylinder: rx.osNearCylinder,
        osNearAxis: rx.osNearAxis,
        // Add Power (null for now until fields are available)
        odAddSphere: rx.odAddSphere,
        odAddCylinder: rx.odAddCylinder,
        odAddAxis: rx.odAddAxis,
        osAddSphere: rx.osAddSphere,
        osAddCylinder: rx.osAddCylinder,
        osAddAxis: rx.osAddAxis,
        odPd: rx.odPd,
        osPd: rx.osPd,
      } : null,
      sales: [],
    };
  });

  return <CustomersClient customers={data} settings={settings} />;
}

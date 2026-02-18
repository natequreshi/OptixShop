import { prisma } from "@/lib/prisma";
import CustomersClient from "./client";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, customerNo: true, firstName: true, lastName: true,
      phone: true, whatsapp: true, email: true, city: true, country: true,
      gender: true, address: true, state: true, totalPurchases: true, isActive: true,
      _count: { select: { sales: true, prescriptions: true } },
      prescriptions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          prescriptionNo: true, prescriptionDate: true,
          odDistanceSphere: true, odDistanceCylinder: true, odDistanceAxis: true,
          osDistanceSphere: true, osDistanceCylinder: true, osDistanceAxis: true,
          odNearSphere: true, odNearCylinder: true, odNearAxis: true,
          osNearSphere: true, osNearCylinder: true, osNearAxis: true,
          odAddSphere: true, odAddCylinder: true, odAddAxis: true,
          osAddSphere: true, osAddCylinder: true, osAddAxis: true,
          odPd: true, osPd: true,
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
      totalPurchases: c.totalPurchases,
      salesCount: c._count.sales,
      rxCount: c._count.prescriptions,
      isActive: c.isActive,
      latestRx: rx ? {
        prescriptionNo: rx.prescriptionNo,
        date: rx.prescriptionDate,
        odDistanceSphere: rx.odDistanceSphere,
        odDistanceCylinder: rx.odDistanceCylinder,
        odDistanceAxis: rx.odDistanceAxis,
        osDistanceSphere: rx.osDistanceSphere,
        osDistanceCylinder: rx.osDistanceCylinder,
        osDistanceAxis: rx.osDistanceAxis,
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

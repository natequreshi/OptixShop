import { prisma } from "@/lib/prisma";
import PrescriptionsClient from "./client";

export const dynamic = "force-dynamic";

export default async function PrescriptionsPage() {
  const [prescriptions, customers] = await Promise.all([
    prisma.prescription.findMany({
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.findMany({ where: { isActive: true }, select: { id: true, firstName: true, lastName: true, customerNo: true }, orderBy: { firstName: "asc" } }),
  ]);

  const data = prescriptions.map((p) => ({
    id: p.id,
    prescriptionNo: p.prescriptionNo,
    customerName: `${p.customer.firstName} ${p.customer.lastName ?? ""}`.trim(),
    customerId: p.customerId,
    prescribedBy: p.prescribedBy ?? "",
    prescriptionDate: p.prescriptionDate,
    expiryDate: p.expiryDate ?? "",
    // Map to actual database field names that exist
    odDistanceSphere: p.odSphere,
    odDistanceCylinder: p.odCylinder,
    odDistanceAxis: p.odAxis,
    odNearSphere: null, // These fields don't exist yet in DB
    odNearCylinder: null,
    odNearAxis: null,
    odAddSphere: null,
    odAddCylinder: null,
    odAddAxis: null,
    odPd: null,
    osDistanceSphere: p.osSphere,
    osDistanceCylinder: p.osCylinder,
    osDistanceAxis: p.osAxis,
    osNearSphere: null,
    osNearCylinder: null,
    osNearAxis: null,
    osAddSphere: null,
    osAddCylinder: null,
    osAddAxis: null,
    osPd: null,
  }));

  const custList = customers.map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName ?? ""}`.trim(), no: c.customerNo }));

  return <PrescriptionsClient prescriptions={data} customers={custList} />;
}

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const customer = await prisma.customer.update({
    where: { id: params.id },
    data: {
      firstName: body.firstName,
      lastName: body.lastName || null,
      phone: body.phone || body.whatsapp || null,
      whatsapp: body.whatsapp || null,
      email: body.email || null,
      city: body.city || null,
      state: body.state || null,
      country: body.country || null,
      address: body.address || null,
      gender: body.gender || null,
    },
  });

  if (body.rx) {
    const rxCount = await prisma.prescription.count();
    const prescriptionNo = `RX${String(rxCount + 1).padStart(5, "0")}`;
    const today = new Date().toISOString().split("T")[0];
    await prisma.prescription.create({
      data: {
        prescriptionNo,
        customerId: params.id,
        prescriptionDate: today,
        odDistanceSphere: body.rx.odSphere ?? null,
        odDistanceCylinder: body.rx.odCylinder ?? null,
        odDistanceAxis: body.rx.odAxis ?? null,
        osDistanceSphere: body.rx.osSphere ?? null,
        osDistanceCylinder: body.rx.osCylinder ?? null,
        osDistanceAxis: body.rx.osAxis ?? null,
        odNearSphere: body.rx.odNearSphere ?? null,
        odNearCylinder: body.rx.odNearCylinder ?? null,
        odNearAxis: body.rx.odNearAxis ?? null,
        osNearSphere: body.rx.osNearSphere ?? null,
        osNearCylinder: body.rx.osNearCylinder ?? null,
        osNearAxis: body.rx.osNearAxis ?? null,
        odAddSphere: body.rx.odAdd ?? null,
        odAddCylinder: body.rx.odAddCylinder ?? null,
        odAddAxis: body.rx.odAddAxis ?? null,
        osAddSphere: body.rx.osAdd ?? null,
        osAddCylinder: body.rx.osAddCylinder ?? null,
        osAddAxis: body.rx.osAddAxis ?? null,
      },
    });
  }

  return NextResponse.json(customer);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.customer.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

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

  // Create/update prescription if Rx data provided
  if (body.rx) {
    const rxCount = await prisma.prescription.count();
    const prescriptionNo = `RX${String(rxCount + 1).padStart(5, "0")}`;
    const today = new Date().toISOString().split("T")[0];
    await prisma.prescription.create({
      data: {
        prescriptionNo,
        customerId: params.id,
        prescriptionDate: today,
        odSphere: body.rx.odSphere ?? null,
        odCylinder: body.rx.odCylinder ?? null,
        odAxis: body.rx.odAxis ?? null,
        odAdd: body.rx.odAdd ?? null,
        osSphere: body.rx.osSphere ?? null,
        osCylinder: body.rx.osCylinder ?? null,
        osAxis: body.rx.osAxis ?? null,
        osAdd: body.rx.osAdd ?? null,
      },
    });
  }

  return NextResponse.json(customer);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.customer.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

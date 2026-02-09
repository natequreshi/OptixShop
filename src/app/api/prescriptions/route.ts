import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const count = await prisma.prescription.count();
  const prescriptionNo = `RX${String(count + 1).padStart(5, "0")}`;
  const rx = await prisma.prescription.create({
    data: {
      prescriptionNo,
      customerId: body.customerId,
      prescribedBy: body.prescribedBy || null,
      prescriptionDate: body.prescriptionDate,
      expiryDate: body.expiryDate || null,
      odSphere: body.odSphere, odCylinder: body.odCylinder, odAxis: body.odAxis, odAdd: body.odAdd,
      osSphere: body.osSphere, osCylinder: body.osCylinder, osAxis: body.osAxis, osAdd: body.osAdd,
    },
  });
  return NextResponse.json(rx, { status: 201 });
}

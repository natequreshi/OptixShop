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
      odDistanceSphere: body.odSphere, odDistanceCylinder: body.odCylinder, odDistanceAxis: body.odAxis, odAddSphere: body.odAdd,
      osDistanceSphere: body.osSphere, osDistanceCylinder: body.osCylinder, osDistanceAxis: body.osAxis, osAddSphere: body.osAdd,
    },
  });
  return NextResponse.json(rx, { status: 201 });
}

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
      odDistanceSphere: body.odDistanceSphere ?? body.odSphere ?? null,
      odDistanceCylinder: body.odDistanceCylinder ?? body.odCylinder ?? null,
      odDistanceAxis: body.odDistanceAxis ?? body.odAxis ?? null,
      odAddSphere: body.odAddSphere ?? body.odAdd ?? null,
      odNearSphere: body.odNearSphere ?? null,
      odNearCylinder: body.odNearCylinder ?? null,
      odNearAxis: body.odNearAxis ?? null,
      odAddCylinder: body.odAddCylinder ?? null,
      odAddAxis: body.odAddAxis ?? null,
      odPd: body.odPd ?? null,
      osDistanceSphere: body.osDistanceSphere ?? body.osSphere ?? null,
      osDistanceCylinder: body.osDistanceCylinder ?? body.osCylinder ?? null,
      osDistanceAxis: body.osDistanceAxis ?? body.osAxis ?? null,
      osAddSphere: body.osAddSphere ?? body.osAdd ?? null,
      osNearSphere: body.osNearSphere ?? null,
      osNearCylinder: body.osNearCylinder ?? null,
      osNearAxis: body.osNearAxis ?? null,
      osAddCylinder: body.osAddCylinder ?? null,
      osAddAxis: body.osAddAxis ?? null,
      osPd: body.osPd ?? null,
    },
  });
  return NextResponse.json(rx, { status: 201 });
}

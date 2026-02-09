import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const vendor = await prisma.vendor.update({ where: { id: params.id }, data: { companyName: body.companyName, contactPerson: body.contactPerson, phone: body.phone, email: body.email, city: body.city, creditDays: body.creditDays } });
  return NextResponse.json(vendor);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.vendor.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

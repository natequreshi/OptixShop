import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const count = await prisma.vendor.count();
  const vendorCode = `VND${String(count + 1).padStart(4, "0")}`;
  const vendor = await prisma.vendor.create({
    data: { vendorCode, companyName: body.companyName, contactPerson: body.contactPerson || null, phone: body.phone || null, email: body.email || null, city: body.city || null, creditDays: body.creditDays ?? 30 },
  });
  return NextResponse.json(vendor, { status: 201 });
}

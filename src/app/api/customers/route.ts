import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const customers = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(customers);
}

export async function POST(req: Request) {
  const body = await req.json();
  const count = await prisma.customer.count();
  const customerNo = `CUST${String(count + 1).padStart(5, "0")}`;
  const customer = await prisma.customer.create({
    data: {
      customerNo,
      firstName: body.firstName,
      lastName: body.lastName || null,
      phone: body.phone || null,
      whatsapp: body.whatsapp || null,
      email: body.email || null,
      city: body.city || null,
      address: body.address || null,
      state: body.state || null,
      country: body.country || "Pakistan",
      pincode: body.pincode || null,
      gender: body.gender || null,
      gstNo: body.gstNo || null,
    },
  });
  return NextResponse.json(customer, { status: 201 });
}

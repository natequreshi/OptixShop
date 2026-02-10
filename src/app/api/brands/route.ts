import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(brands);
}

export async function POST(req: Request) {
  const { name } = await req.json();
  const brand = await prisma.brand.create({
    data: { name },
  });
  return NextResponse.json(brand, { status: 201 });
}

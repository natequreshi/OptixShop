import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.productCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const { name, sortOrder } = await req.json();
  const cat = await prisma.productCategory.create({
    data: { name, sortOrder: sortOrder ?? 0 },
  });
  return NextResponse.json(cat, { status: 201 });
}

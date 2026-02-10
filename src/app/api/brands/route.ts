import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const brands = await prisma.brand.findMany({ 
    where: { isActive: true },
    orderBy: { name: "asc" } 
  });
  return NextResponse.json(brands);
}

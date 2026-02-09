import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { name, sortOrder } = await req.json();
  const cat = await prisma.productCategory.update({
    where: { id: params.id },
    data: { name, sortOrder },
  });
  return NextResponse.json(cat);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.productCategory.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

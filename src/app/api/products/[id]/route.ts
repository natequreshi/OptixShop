import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      sku: body.sku,
      name: body.name,
      productType: body.productType,
      categoryId: body.categoryId || null,
      brandId: body.brandId || null,
      costPrice: body.costPrice,
      sellingPrice: body.sellingPrice,
      mrp: body.mrp,
      taxRate: body.taxRate,
      description: body.description,
      imageUrl: body.imageUrl || null,
      isActive: body.isActive,
    },
  });
  return NextResponse.json(product);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (q) {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
          { barcode: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true, sku: true, barcode: true, name: true,
        sellingPrice: true, costPrice: true, taxRate: true, imageUrl: true,
        inventory: { select: { quantity: true } },
      },
      take: 10,
    });
    return NextResponse.json(products);
  }

  const products = await prisma.product.findMany({
    include: { category: true, brand: true, inventory: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const body = await req.json();
  const product = await prisma.product.create({
    data: {
      sku: body.sku,
      name: body.name,
      productType: body.productType ?? "frame",
      categoryId: body.categoryId || null,
      brandId: body.brandId || null,
      costPrice: body.costPrice ?? 0,
      sellingPrice: body.sellingPrice ?? 0,
      mrp: body.mrp ?? 0,
      taxRate: body.taxRate ?? 18,
      hsnSacCode: body.hsnSacCode,
      description: body.description,
      imageUrl: body.imageUrl || null,
      colors: body.colors || null,
      colorVariants: body.colorVariants || null,
      openingBalance: body.openingBalance ?? 0,
    },
  });
  // Create inventory record with opening balance
  await prisma.inventory.create({
    data: { productId: product.id, quantity: body.openingBalance ?? 0, avgCost: body.costPrice ?? 0 },
  });
  return NextResponse.json(product, { status: 201 });
}

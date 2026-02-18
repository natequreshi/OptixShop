import { prisma } from "@/lib/prisma";
import ProductsClient from "./client";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true, sku: true, name: true, productType: true,
        categoryId: true, brandId: true, costPrice: true, sellingPrice: true,
        mrp: true, taxRate: true, imageUrl: true, description: true,
        colorVariants: true, openingBalance: true, isActive: true,
        category: { select: { name: true } },
        brand: { select: { name: true } },
        inventory: { select: { quantity: true } },
        _count: { select: { saleItems: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.productCategory.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  const serialized = products.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    productType: p.productType,
    categoryId: p.categoryId ?? "",
    category: p.category?.name ?? "—",
    brandId: p.brandId ?? "",
    brand: p.brand?.name ?? "—",
    costPrice: p.costPrice,
    sellingPrice: p.sellingPrice,
    mrp: p.mrp,
    taxRate: p.taxRate,
    stock: p.inventory?.quantity ?? 0,
    sold: p._count.saleItems,
    imageUrl: p.imageUrl ?? "",
    description: p.description ?? "",
    colorVariants: p.colorVariants ? JSON.parse(p.colorVariants) : [],
    openingBalance: p.openingBalance,
    isActive: p.isActive,
  }));

  return (
    <ProductsClient
      products={serialized}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      brands={brands.map((b) => ({ id: b.id, name: b.name }))}
    />
  );
}

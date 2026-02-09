import { prisma } from "@/lib/prisma";
import ProductsClient from "./client";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      include: { category: true, brand: true, inventory: true },
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
    category: p.category?.name ?? "—",
    brand: p.brand?.name ?? "—",
    costPrice: p.costPrice,
    sellingPrice: p.sellingPrice,
    mrp: p.mrp,
    taxRate: p.taxRate,
    stock: p.inventory?.quantity ?? 0,
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

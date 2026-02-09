import { prisma } from "@/lib/prisma";
import InventoryClient from "./client";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const inventory = await prisma.inventory.findMany({
    include: { product: { include: { category: true, brand: true } } },
    orderBy: { product: { name: "asc" } },
  });

  const data = inventory.map((i) => ({
    id: i.id,
    productId: i.productId,
    sku: i.product.sku,
    name: i.product.name,
    productType: i.product.productType,
    category: i.product.category?.name ?? "—",
    brand: i.product.brand?.name ?? "—",
    quantity: i.quantity,
    avgCost: i.avgCost,
    location: i.location,
    sellingPrice: i.product.sellingPrice,
  }));

  return <InventoryClient inventory={data} />;
}

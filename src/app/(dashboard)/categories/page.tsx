import { prisma } from "@/lib/prisma";
import CategoriesClient from "./client";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.productCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  const data = categories.map((c) => ({
    id: c.id,
    name: c.name,
    sortOrder: c.sortOrder,
    productCount: c._count.products,
  }));

  return <CategoriesClient categories={data} />;
}

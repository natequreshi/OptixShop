import { prisma } from "@/lib/prisma";
import DashboardClient from "./client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const today = new Date().toISOString().split("T")[0];
  const monthStart = today.slice(0, 7) + "-01";

  const [
    totalProducts,
    totalCustomers,
    todaySales,
    monthSales,
    lowStockCount,
    pendingLabOrders,
    recentSales,
    topProducts,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.customer.count({ where: { isActive: true } }),
    prisma.sale.aggregate({
      where: { saleDate: today },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.sale.aggregate({
      where: { saleDate: { gte: monthStart } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.inventory.count({ where: { quantity: { lte: 5 } } }),
    prisma.labOrder.count({ where: { status: { in: ["pending", "in_progress"] } } }),
    prisma.sale.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { customer: true, items: { include: { product: true } } },
    }),
    prisma.saleItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),
  ]);

  // Fetch product names for top products
  const topProductIds = topProducts.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true },
  });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p.name]));

  const stats = {
    totalProducts,
    totalCustomers,
    todaySalesCount: todaySales._count,
    todaySalesAmount: todaySales._sum.totalAmount ?? 0,
    monthSalesCount: monthSales._count,
    monthSalesAmount: monthSales._sum.totalAmount ?? 0,
    lowStockCount,
    pendingLabOrders,
  };

  const topProductsData = topProducts.map((p) => ({
    name: productMap[p.productId] ?? "Unknown",
    revenue: p._sum.total ?? 0,
    qty: p._sum.quantity ?? 0,
  }));

  const serializedSales = recentSales.map((s) => ({
    id: s.id,
    invoiceNo: s.invoiceNo,
    customerName: s.customer
      ? `${s.customer.firstName} ${s.customer.lastName ?? ""}`.trim()
      : "Walk-in",
    totalAmount: s.totalAmount,
    status: s.status,
    saleDate: s.saleDate,
    itemCount: s.items.length,
  }));

  return (
    <DashboardClient
      stats={stats}
      recentSales={serializedSales}
      topProducts={topProductsData}
    />
  );
}

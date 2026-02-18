import { prisma } from "@/lib/prisma";
import ReportsClient from "./client";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  const endOfMonth = today.toISOString().split("T")[0];

  const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1).toISOString().split("T")[0];

  const [sales, monthlySalesRaw] = await Promise.all([
    prisma.sale.aggregate({
      where: { status: "completed" },
      _sum: { totalAmount: true, taxAmount: true },
      _count: true,
    }),
    prisma.sale.findMany({
      where: { status: "completed", saleDate: { gte: twelveMonthsAgo } },
      select: { saleDate: true, totalAmount: true, taxAmount: true },
    }),
  ]);

  const monthlyMap = new Map<string, { revenue: number; tax: number; count: number }>();
  for (const s of monthlySalesRaw) {
    const month = s.saleDate.slice(0, 7);
    const existing = monthlyMap.get(month) || { revenue: 0, tax: 0, count: 0 };
    existing.revenue += s.totalAmount;
    existing.tax += s.taxAmount;
    existing.count += 1;
    monthlyMap.set(month, existing);
  }

  const monthlySales = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, data]) => ({ month, ...data }));

  // Top customers
  const topCustomers = await prisma.customer.findMany({
    where: { totalPurchases: { gt: 0 } },
    orderBy: { totalPurchases: "desc" },
    take: 10,
    select: { firstName: true, lastName: true, totalPurchases: true },
  });

  // Product type distribution
  const typeDistribution = await prisma.product.groupBy({
    by: ["productType"],
    _count: true,
  });

  // Inventory value
  const invValue = await prisma.inventory.aggregate({
    _sum: { quantity: true },
  });

  const totalRevenue = sales._sum.totalAmount ?? 0;
  const totalTax = sales._sum.taxAmount ?? 0;
  const totalCount = sales._count;

  const stats = {
    totalRevenue,
    totalTax,
    totalSales: totalCount,
    avgTicket: totalCount > 0 ? totalRevenue / totalCount : 0,
  };

  return (
    <ReportsClient
      stats={stats}
      monthlySales={monthlySales}
      topCustomers={topCustomers.map(c => ({
        name: `${c.firstName} ${c.lastName ?? ""}`.trim(),
        totalPurchases: c.totalPurchases,
      }))}
      typeDistribution={typeDistribution.map(t => ({ type: t.productType, count: t._count }))}
    />
  );
}

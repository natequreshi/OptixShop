import { prisma } from "@/lib/prisma";
import ReportsClient from "./client";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  const endOfMonth = today.toISOString().split("T")[0];

  // Get last 12 months sales
  const sales = await prisma.sale.findMany({
    where: { status: "completed" },
    select: { saleDate: true, totalAmount: true, taxAmount: true, discountAmount: true },
  });

  // Monthly aggregation
  const monthlyMap = new Map<string, { revenue: number; tax: number; count: number }>();
  for (const s of sales) {
    const month = s.saleDate.slice(0, 7); // YYYY-MM
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
    select: { firstName: true, lastName: true, totalPurchases: true, loyaltyPoints: true },
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

  const stats = {
    totalRevenue: sales.reduce((s, sale) => s + sale.totalAmount, 0),
    totalTax: sales.reduce((s, sale) => s + sale.taxAmount, 0),
    totalSales: sales.length,
    avgTicket: sales.length > 0 ? sales.reduce((s, sale) => s + sale.totalAmount, 0) / sales.length : 0,
  };

  return (
    <ReportsClient
      stats={stats}
      monthlySales={monthlySales}
      topCustomers={topCustomers.map(c => ({
        name: `${c.firstName} ${c.lastName ?? ""}`.trim(),
        totalPurchases: c.totalPurchases,
        loyaltyPoints: c.loyaltyPoints,
      }))}
      typeDistribution={typeDistribution.map(t => ({ type: t.productType, count: t._count }))}
    />
  );
}

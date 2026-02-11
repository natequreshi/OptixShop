import { prisma } from "@/lib/prisma";
import DashboardClient from "./client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const today = new Date().toISOString().split("T")[0];
  const monthStart = today.slice(0, 7) + "-01";
  const yearStart = today.slice(0, 4) + "-01-01";

  // Get date 30 days ago
  const d30 = new Date();
  d30.setDate(d30.getDate() - 30);
  const thirtyDaysAgo = d30.toISOString().split("T")[0];

  const [
    totalProducts,
    totalCustomers,
    todaySales,
    monthSales,
    allTimeSales,
    lowStockCount,
    pendingLabOrders,
    totalPurchases,
    purchaseDue,
    totalReturns,
    totalPurchaseReturns,
    totalExpenses,
    invoiceDue,
    last30DaysSales,
    yearSales,
    recentSalesData,
    topProductsData,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.customer.count({ where: { isActive: true } }),
    prisma.sale.aggregate({ where: { saleDate: today }, _sum: { totalAmount: true }, _count: true }),
    prisma.sale.aggregate({ where: { saleDate: { gte: monthStart } }, _sum: { totalAmount: true }, _count: true }),
    prisma.sale.aggregate({ _sum: { totalAmount: true, paidAmount: true }, _count: true }),
    prisma.inventory.count({ where: { quantity: { lte: 5 } } }),
    prisma.labOrder.count({ where: { status: { in: ["pending", "in_progress"] } } }),
    // Total purchases (purchase invoices)
    prisma.purchaseInvoice.aggregate({ _sum: { totalAmount: true, paidAmount: true, balanceAmount: true } }),
    // Purchase due (unpaid balance)
    prisma.purchaseInvoice.aggregate({ where: { status: { in: ["unpaid", "partial"] } }, _sum: { balanceAmount: true } }),
    // Sell returns
    prisma.return.aggregate({ _sum: { totalAmount: true } }),
    // Purchase returns (we don't have a purchase return model, use 0)
    Promise.resolve({ _sum: { totalAmount: 0 } }),
    // Total expenses
    prisma.expense.aggregate({ _sum: { amount: true } }),
    // Invoice due (unpaid sales)
    prisma.sale.aggregate({ where: { paymentStatus: { in: ["partial", "unpaid"] } }, _sum: { balanceAmount: true } }),
    // Last 30 days sales grouped by date
    prisma.sale.findMany({
      where: { saleDate: { gte: thirtyDaysAgo } },
      select: { saleDate: true, totalAmount: true },
    }),
    // Financial year sales (by month)
    prisma.sale.findMany({
      where: { saleDate: { gte: yearStart } },
      select: { saleDate: true, totalAmount: true },
    }),
    // Recent sales (last 10)
    prisma.sale.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { firstName: true, lastName: true } },
        items: true,
      },
    }),
    // Top products by revenue
    prisma.$queryRaw<{ productName: string; totalRevenue: number; totalQty: number }[]>`
      SELECT 
        p.name as "productName",
        CAST(COALESCE(SUM(si.total), 0) AS DECIMAL) as "totalRevenue",
        CAST(COALESCE(SUM(si.quantity), 0) AS INTEGER) as "totalQty"
      FROM products p
      LEFT JOIN sale_items si ON p.id = si.product_id
      WHERE p.is_active = true
      GROUP BY p.id, p.name
      ORDER BY "totalRevenue" DESC
      LIMIT 10
    `,
  ]);

  // Aggregate last 30 days into daily data
  const dailyMap: Record<string, number> = {};
  last30DaysSales.forEach((s) => {
    dailyMap[s.saleDate] = (dailyMap[s.saleDate] ?? 0) + s.totalAmount;
  });
  const salesLast30Days: { date: string; amount: number }[] = [];
  for (let i = 30; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    salesLast30Days.push({ date: dateStr, amount: dailyMap[dateStr] ?? 0 });
  }

  // Aggregate financial year by month
  const monthlyMap: Record<string, number> = {};
  yearSales.forEach((s) => {
    const month = s.saleDate.slice(0, 7);
    monthlyMap[month] = (monthlyMap[month] ?? 0) + s.totalAmount;
  });
  const currentYear = parseInt(today.slice(0, 4));
  const salesByMonth: { month: string; amount: number }[] = [];
  for (let m = 1; m <= 12; m++) {
    const monthStr = `${currentYear}-${String(m).padStart(2, "0")}`;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    salesByMonth.push({ month: `${monthNames[m - 1]}-${currentYear}`, amount: monthlyMap[monthStr] ?? 0 });
  }

  const totalSalesAmount = allTimeSales._sum.totalAmount ?? 0;
  const totalPaidSales = allTimeSales._sum.paidAmount ?? 0;
  const totalReturnAmount = totalReturns._sum.totalAmount ?? 0;
  const netSales = totalSalesAmount - totalReturnAmount;

  const stats = {
    totalProducts,
    totalCustomers,
    todaySalesCount: todaySales._count,
    todaySalesAmount: todaySales._sum.totalAmount ?? 0,
    monthSalesCount: monthSales._count,
    monthSalesAmount: monthSales._sum.totalAmount ?? 0,
    lowStockCount,
    pendingLabOrders,
    totalSales: totalSalesAmount,
    netSales,
    invoiceDue: invoiceDue._sum.balanceAmount ?? 0,
    totalSellReturn: totalReturnAmount,
    totalPurchase: totalPurchases._sum.totalAmount ?? 0,
    purchaseDue: purchaseDue._sum.balanceAmount ?? 0,
    totalPurchaseReturn: totalPurchaseReturns._sum.totalAmount ?? 0,
    totalExpense: totalExpenses._sum.amount ?? 0,
  };

  // Transform recent sales
  const recentSales = recentSalesData.map(sale => ({
    id: sale.id,
    invoiceNo: sale.invoiceNo,
    customerName: sale.customer 
      ? `${sale.customer.firstName} ${sale.customer.lastName || ''}`.trim()
      : 'Walk-in Customer',
    totalAmount: sale.totalAmount,
    status: sale.paymentStatus,
    saleDate: sale.saleDate,
    itemCount: sale.items.length,
  }));

  // Transform top products
  const topProducts = topProductsData.map(p => ({
    name: p.productName,
    revenue: Number(p.totalRevenue),
    qty: Number(p.totalQty),
  }));

  return (
    <DashboardClient
      stats={stats}
      recentSales={recentSales}
      topProducts={topProducts}
      salesLast30Days={salesLast30Days}
      salesByMonth={salesByMonth}
    />
  );
}

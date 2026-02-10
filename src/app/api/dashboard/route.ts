import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from") || "";
  const to = req.nextUrl.searchParams.get("to") || "";

  const today = new Date().toISOString().split("T")[0];
  const monthStart = today.slice(0, 7) + "-01";
  const yearStart = today.slice(0, 4) + "-01-01";

  const dateFilter = from && to ? { gte: from, lte: to } : undefined;
  const expenseDateFilter = from && to ? { expenseDate: { gte: from, lte: to } } : {};

  const [
    totalProducts, totalCustomers,
    todaySales, monthSales, filteredSales,
    lowStockCount,
    totalPurchases, purchaseDue,
    totalReturns, totalExpenses, invoiceDue,
    salesChartData,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.customer.count({ where: { isActive: true } }),
    prisma.sale.aggregate({ where: { saleDate: today }, _sum: { totalAmount: true }, _count: true }),
    prisma.sale.aggregate({ where: { saleDate: { gte: monthStart } }, _sum: { totalAmount: true }, _count: true }),
    prisma.sale.aggregate({ where: dateFilter ? { saleDate: dateFilter } : {}, _sum: { totalAmount: true, paidAmount: true }, _count: true }),
    prisma.inventory.count({ where: { quantity: { lte: 5 } } }),
    prisma.purchaseInvoice.aggregate({ _sum: { totalAmount: true } }),
    prisma.purchaseInvoice.aggregate({ where: { status: { in: ["unpaid", "partial"] } }, _sum: { balanceAmount: true } }),
    prisma.return.aggregate({ where: dateFilter ? { returnDate: dateFilter } : {}, _sum: { totalAmount: true } }),
    prisma.expense.aggregate({ where: dateFilter ? { expenseDate: dateFilter } : {}, _sum: { amount: true } }),
    prisma.sale.aggregate({ where: { paymentStatus: { in: ["partial", "unpaid"] } }, _sum: { balanceAmount: true } }),
    prisma.sale.findMany({
      where: dateFilter ? { saleDate: dateFilter } : { saleDate: { gte: new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0] } },
      select: { saleDate: true, totalAmount: true },
      orderBy: { saleDate: "asc" },
    }),
  ]);

  // Aggregate sales chart data by date
  const dailyMap: Record<string, number> = {};
  salesChartData.forEach((s) => {
    dailyMap[s.saleDate] = (dailyMap[s.saleDate] ?? 0) + s.totalAmount;
  });

  const chartData = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }));

  // Monthly aggregation for year chart
  const monthlyMap: Record<string, number> = {};
  salesChartData.forEach((s) => {
    const month = s.saleDate.slice(0, 7);
    monthlyMap[month] = (monthlyMap[month] ?? 0) + s.totalAmount;
  });

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const salesByMonth = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([m, amount]) => {
      const [y, mo] = m.split("-");
      return { month: `${monthNames[parseInt(mo) - 1]}-${y}`, amount };
    });

  const totalSalesAmount = filteredSales._sum.totalAmount ?? 0;
  const totalReturnAmount = totalReturns._sum.totalAmount ?? 0;

  return NextResponse.json({
    stats: {
      totalProducts, totalCustomers,
      todaySalesCount: todaySales._count,
      todaySalesAmount: todaySales._sum.totalAmount ?? 0,
      monthSalesCount: monthSales._count,
      monthSalesAmount: monthSales._sum.totalAmount ?? 0,
      lowStockCount,
      totalSales: totalSalesAmount,
      netSales: totalSalesAmount - totalReturnAmount,
      invoiceDue: invoiceDue._sum.balanceAmount ?? 0,
      totalSellReturn: totalReturnAmount,
      totalPurchase: totalPurchases._sum.totalAmount ?? 0,
      purchaseDue: purchaseDue._sum.balanceAmount ?? 0,
      totalPurchaseReturn: 0,
      totalExpense: totalExpenses._sum.amount ?? 0,
    },
    salesChart: chartData,
    salesByMonth,
  });
}

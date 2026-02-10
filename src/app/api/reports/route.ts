import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "summary";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  const dateFilter: any = {};
  if (from) dateFilter.gte = from;
  if (to) dateFilter.lte = to;
  const hasDateFilter = from || to;

  try {
    switch (type) {
      case "summary": {
        const salesAgg = await prisma.sale.aggregate({
          where: hasDateFilter ? { saleDate: dateFilter } : {},
          _sum: { totalAmount: true, taxAmount: true, paidAmount: true },
          _count: true,
        });
        const totalRevenue = salesAgg._sum.totalAmount ?? 0;
        const totalTax = salesAgg._sum.taxAmount ?? 0;
        const totalSales = salesAgg._count;
        const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
        return NextResponse.json({ totalRevenue, totalTax, totalSales, avgTicket });
      }

      case "profit-loss": {
        const sales = await prisma.sale.findMany({
          where: hasDateFilter ? { saleDate: dateFilter } : {},
          select: { saleDate: true, totalAmount: true, taxAmount: true },
        });
        const expenses = await prisma.expense.findMany({
          where: hasDateFilter ? { expenseDate: dateFilter } : {},
          select: { expenseDate: true, amount: true, category: true },
        });
        const purchases = await prisma.purchaseInvoice.findMany({
          where: hasDateFilter ? { invoiceDate: dateFilter } : {},
          select: { invoiceDate: true, totalAmount: true },
        });

        // Group by month
        const monthlyMap: Record<string, { revenue: number; cogs: number; expenses: number; profit: number }> = {};
        sales.forEach(s => {
          const m = s.saleDate.slice(0, 7);
          if (!monthlyMap[m]) monthlyMap[m] = { revenue: 0, cogs: 0, expenses: 0, profit: 0 };
          monthlyMap[m].revenue += s.totalAmount;
        });
        purchases.forEach(p => {
          const m = p.invoiceDate.slice(0, 7);
          if (!monthlyMap[m]) monthlyMap[m] = { revenue: 0, cogs: 0, expenses: 0, profit: 0 };
          monthlyMap[m].cogs += p.totalAmount;
        });
        expenses.forEach(e => {
          const m = e.expenseDate.slice(0, 7);
          if (!monthlyMap[m]) monthlyMap[m] = { revenue: 0, cogs: 0, expenses: 0, profit: 0 };
          monthlyMap[m].expenses += e.amount;
        });

        const months = Object.keys(monthlyMap).sort();
        const data = months.map(m => {
          const d = monthlyMap[m];
          const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
          const mi = parseInt(m.split("-")[1]) - 1;
          return { month: monthNames[mi], revenue: d.revenue, cogs: d.cogs, expenses: d.expenses, profit: d.revenue - d.cogs - d.expenses };
        });

        const totals = data.reduce((a, b) => ({
          revenue: a.revenue + b.revenue, cogs: a.cogs + b.cogs,
          expenses: a.expenses + b.expenses, profit: a.profit + b.profit
        }), { revenue: 0, cogs: 0, expenses: 0, profit: 0 });

        return NextResponse.json({ data, totals });
      }

      case "purchase-sale": {
        const sales = await prisma.sale.findMany({
          where: hasDateFilter ? { saleDate: dateFilter } : {},
          select: { saleDate: true, totalAmount: true },
        });
        const purchases = await prisma.purchaseInvoice.findMany({
          where: hasDateFilter ? { invoiceDate: dateFilter } : {},
          select: { invoiceDate: true, totalAmount: true },
        });

        const monthlyMap: Record<string, { purchases: number; sales: number }> = {};
        sales.forEach(s => {
          const m = s.saleDate.slice(0, 7);
          if (!monthlyMap[m]) monthlyMap[m] = { purchases: 0, sales: 0 };
          monthlyMap[m].sales += s.totalAmount;
        });
        purchases.forEach(p => {
          const m = p.invoiceDate.slice(0, 7);
          if (!monthlyMap[m]) monthlyMap[m] = { purchases: 0, sales: 0 };
          monthlyMap[m].purchases += p.totalAmount;
        });

        const months = Object.keys(monthlyMap).sort();
        const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const data = months.map(m => {
          const mi = parseInt(m.split("-")[1]) - 1;
          return { month: monthNames[mi], ...monthlyMap[m] };
        });

        return NextResponse.json({ data });
      }

      case "tax": {
        const sales = await prisma.sale.findMany({
          where: hasDateFilter ? { saleDate: dateFilter } : {},
          select: { saleDate: true, taxAmount: true },
        });

        const monthlyMap: Record<string, number> = {};
        sales.forEach(s => {
          const m = s.saleDate.slice(0, 7);
          monthlyMap[m] = (monthlyMap[m] ?? 0) + s.taxAmount;
        });

        const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const months = Object.keys(monthlyMap).sort();
        const data = months.map(m => {
          const mi = parseInt(m.split("-")[1]) - 1;
          return { month: monthNames[mi], taxCollected: monthlyMap[m] };
        });

        const totalTax = sales.reduce((s, sale) => s + sale.taxAmount, 0);
        return NextResponse.json({ data, totalTax });
      }

      case "stock": {
        const products = await prisma.product.findMany({
          where: { isActive: true },
          include: { inventory: true },
          orderBy: { name: "asc" },
        });

        const data = products.map(p => ({
          product: p.name,
          sku: p.sku,
          stock: p.inventory?.quantity ?? 0,
          value: (p.inventory?.quantity ?? 0) * p.costPrice,
          costPrice: p.costPrice,
          sellingPrice: p.sellingPrice,
          reorderLevel: 10,
        }));

        const totalValue = data.reduce((s, d) => s + d.value, 0);
        const totalItems = data.reduce((s, d) => s + d.stock, 0);
        return NextResponse.json({ data, totalValue, totalItems });
      }

      case "trending": {
        const saleItems = await prisma.saleItem.findMany({
          where: hasDateFilter ? { sale: { saleDate: dateFilter } } : {},
          include: { product: { select: { name: true, sku: true } } },
        });

        const productMap: Record<string, { name: string; sales: number; revenue: number }> = {};
        saleItems.forEach(item => {
          const pid = item.productId;
          if (!productMap[pid]) productMap[pid] = { name: item.product.name, sales: 0, revenue: 0 };
          productMap[pid].sales += item.quantity;
          productMap[pid].revenue += item.total;
        });

        const data = Object.values(productMap)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 20);

        return NextResponse.json({ data });
      }

      case "expense": {
        const expenses = await prisma.expense.findMany({
          where: hasDateFilter ? { expenseDate: dateFilter } : {},
          select: { category: true, amount: true, expenseDate: true },
        });

        const catMap: Record<string, number> = {};
        expenses.forEach(e => {
          catMap[e.category] = (catMap[e.category] ?? 0) + e.amount;
        });

        const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
        const data = Object.entries(catMap)
          .map(([category, amount]) => ({ category, amount, percent: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0 }))
          .sort((a, b) => b.amount - a.amount);

        // Monthly trend
        const monthlyMap: Record<string, number> = {};
        expenses.forEach(e => {
          const m = e.expenseDate.slice(0, 7);
          monthlyMap[m] = (monthlyMap[m] ?? 0) + e.amount;
        });
        const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const months = Object.keys(monthlyMap).sort();
        const monthlyData = months.map(m => {
          const mi = parseInt(m.split("-")[1]) - 1;
          return { month: monthNames[mi], amount: monthlyMap[m] };
        });

        return NextResponse.json({ data, totalExpenses, monthlyData });
      }

      case "sell-payment": {
        const sales = await prisma.sale.findMany({
          where: hasDateFilter ? { saleDate: dateFilter } : {},
          select: { invoiceNo: true, saleDate: true, totalAmount: true, paidAmount: true, balanceAmount: true, paymentStatus: true, payments: { select: { paymentMethod: true }, take: 1 } },
          orderBy: { saleDate: "desc" },
          take: 100,
        });
        const data = sales.map(s => ({
          invoiceNo: s.invoiceNo,
          saleDate: s.saleDate,
          totalAmount: s.totalAmount,
          paidAmount: s.paidAmount,
          balanceAmount: s.balanceAmount,
          paymentMethod: s.payments[0]?.paymentMethod ?? "N/A",
          paymentStatus: s.paymentStatus,
        }));
        return NextResponse.json({ data });
      }

      case "purchase-payment": {
        const purchases = await prisma.purchaseInvoice.findMany({
          where: hasDateFilter ? { invoiceDate: dateFilter } : {},
          select: { invoiceNo: true, invoiceDate: true, totalAmount: true, paidAmount: true, balanceAmount: true, status: true },
          orderBy: { invoiceDate: "desc" },
          take: 100,
        });
        return NextResponse.json({ data: purchases });
      }

      default:
        return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}

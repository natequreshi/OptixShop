import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [
      totalSales,
      pendingSales,
      draftSales,
      deletedSales,
      lowStockItems,
      unpaidSales,
    ] = await Promise.all([
      prisma.sale.count(),
      prisma.sale.count({ where: { status: "pending" } }),
      prisma.sale.count({ where: { status: "draft" } }),
      prisma.sale.count({ where: { status: "cancelled" } }),
      prisma.inventory.findMany({
        where: { quantity: { lte: 5 } },
        include: { product: { select: { name: true, sku: true } } },
      }),
      prisma.sale.count({ where: { paymentStatus: { in: ["unpaid", "partial"] } } }),
    ]);

    const notifications: { id: string; type: string; title: string; message: string; count: number; color: string; route: string }[] = [];

    if (pendingSales > 0) {
      notifications.push({
        id: "pending-sales",
        type: "warning",
        title: "Pending Sales",
        message: `${pendingSales} sale${pendingSales > 1 ? "s" : ""} awaiting completion`,
        count: pendingSales,
        color: "yellow",
        route: "/sales",
      });
    }

    if (draftSales > 0) {
      notifications.push({
        id: "draft-sales",
        type: "info",
        title: "Draft Sales",
        message: `${draftSales} draft sale${draftSales > 1 ? "s" : ""} not yet finalized`,
        count: draftSales,
        color: "blue",
        route: "/sales",
      });
    }

    if (unpaidSales > 0) {
      notifications.push({
        id: "unpaid-sales",
        type: "warning",
        title: "Unpaid / Partial Sales",
        message: `${unpaidSales} sale${unpaidSales > 1 ? "s" : ""} with pending payment`,
        count: unpaidSales,
        color: "orange",
        route: "/sales",
      });
    }

    if (lowStockItems.length > 0) {
      notifications.push({
        id: "low-stock",
        type: "danger",
        title: "Low Stock Alert",
        message: `${lowStockItems.length} product${lowStockItems.length > 1 ? "s" : ""} running low on stock`,
        count: lowStockItems.length,
        color: "red",
        route: "/inventory",
      });
    }

    if (deletedSales > 0) {
      notifications.push({
        id: "cancelled-sales",
        type: "danger",
        title: "Cancelled Sales",
        message: `${deletedSales} sale${deletedSales > 1 ? "s" : ""} have been cancelled`,
        count: deletedSales,
        color: "red",
        route: "/sales",
      });
    }

    const totalCount = notifications.reduce((sum, n) => sum + n.count, 0);

    return NextResponse.json({
      totalSales,
      totalCount,
      notifications,
      lowStockItems: lowStockItems.map((i) => ({
        productName: i.product.name,
        sku: i.product.sku,
        quantity: i.quantity,
      })),
    });
  } catch (error: any) {
    console.error("Notifications error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const { productIds, field, type, value } = await req.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "No products specified" }, { status: 400 });
    }
    if (!["sellingPrice", "costPrice"].includes(field)) {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }
    if (!["percent", "fixed"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Fetch current prices
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, sellingPrice: true, costPrice: true },
    });

    let count = 0;
    for (const product of products) {
      const currentPrice = field === "sellingPrice" ? product.sellingPrice : product.costPrice;
      let newPrice: number;

      if (type === "percent") {
        newPrice = currentPrice * (1 + value / 100);
      } else {
        newPrice = currentPrice + value;
      }

      // Ensure price doesn't go below 0
      newPrice = Math.max(0, Math.round(newPrice * 100) / 100);

      await prisma.product.update({
        where: { id: product.id },
        data: { [field]: newPrice },
      });
      count++;
    }

    return NextResponse.json({ count, message: `Updated ${count} products` });
  } catch (error) {
    console.error("Global price update error:", error);
    return NextResponse.json({ error: "Failed to update prices" }, { status: 500 });
  }
}

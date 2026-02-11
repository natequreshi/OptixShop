import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: any;
    
    try {
      decoded = verify(token, process.env.NEXTAUTH_SECRET || "secret");
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (decoded.type !== "customer") {
      return NextResponse.json({ error: "Invalid token type" }, { status: 401 });
    }

    // Fetch lab orders
    const labOrders = await prisma.labOrder.findMany({
      where: { customerId: decoded.customerId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(labOrders);
  } catch (error) {
    console.error("Fetch lab orders error:", error);
    return NextResponse.json({ error: "Failed to fetch lab orders" }, { status: 500 });
  }
}

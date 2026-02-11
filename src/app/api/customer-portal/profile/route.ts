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

    // Fetch customer profile
    const customer = await prisma.customer.findUnique({
      where: { id: decoded.customerId },
      select: {
        id: true,
        customerNo: true,
        firstName: true,
        lastName: true,
        phone: true,
        whatsapp: true,
        email: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        city: true,
        state: true,
        country: true,
        pincode: true,
        loyaltyPoints: true,
        totalPurchases: true,
        createdAt: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Fetch profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

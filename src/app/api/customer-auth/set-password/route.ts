import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verify } from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    // Get token from Authorization header
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

    const { password } = await req.json();

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update customer
    await prisma.customer.update({
      where: { id: decoded.customerId },
      data: { passwordHash },
    });

    return NextResponse.json({ success: true, message: "Password set successfully" });
  } catch (error) {
    console.error("Set password error:", error);
    return NextResponse.json({ error: "Failed to set password" }, { status: 500 });
  }
}

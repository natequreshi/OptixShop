import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import { normalizePhone } from "@/lib/phoneUtils";

export async function POST(req: Request) {
  try {
    const { phoneOrEmail, password } = await req.json();

    if (!phoneOrEmail || !password) {
      return NextResponse.json({ error: "Phone/email and password required" }, { status: 400 });
    }

    // Check if it's email or phone
    const isEmail = phoneOrEmail.includes("@");
    const normalizedPhone = isEmail ? null : normalizePhone(phoneOrEmail);

    // Find customer
    const customer = await prisma.customer.findFirst({
      where: {
        OR: isEmail ? [
          { email: phoneOrEmail },
        ] : [
          { phone: normalizedPhone },
          { whatsapp: normalizedPhone },
          { phone: phoneOrEmail },
          { whatsapp: phoneOrEmail },
        ],
        isActive: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Check if password is set
    if (!customer.passwordHash) {
      return NextResponse.json({ 
        error: "No password set. Please use OTP login or contact store to set password." 
      }, { status: 400 });
    }

    // Verify password
    const valid = await bcrypt.compare(password, customer.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Generate JWT token
    const token = sign(
      {
        customerId: customer.id,
        customerNo: customer.customerNo,
        name: `${customer.firstName} ${customer.lastName || ""}`.trim(),
        type: "customer",
      },
      process.env.NEXTAUTH_SECRET || "secret",
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      success: true,
      token,
      customer: {
        id: customer.id,
        customerNo: customer.customerNo,
        name: `${customer.firstName} ${customer.lastName || ""}`.trim(),
        email: customer.email,
        phone: customer.phone,
        loyaltyPoints: customer.loyaltyPoints,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}

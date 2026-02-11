import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sign } from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { phoneOrEmail, otp } = await req.json();

    if (!phoneOrEmail || !otp) {
      return NextResponse.json({ error: "Phone/email and OTP required" }, { status: 400 });
    }

    // Find customer
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { phone: phoneOrEmail },
          { whatsapp: phoneOrEmail },
          { email: phoneOrEmail },
        ],
        isActive: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Verify OTP
    if (customer.lastOtp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
    }

    // Check OTP expiry
    if (!customer.otpExpiry || new Date() > customer.otpExpiry) {
      return NextResponse.json({ error: "OTP expired" }, { status: 401 });
    }

    // Clear OTP after successful verification
    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastOtp: null, otpExpiry: null },
    });

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
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}

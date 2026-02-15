import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Phone and password are required" },
        { status: 400 }
      );
    }

    // Find customer by phone
    const customer = await prisma.customer.findFirst({
      where: { phone },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 401 }
      );
    }

    // For now, we'll use a simple password check
    // In production, you'd want to hash passwords properly
    // Since customers don't have passwordHash in schema, we'll create a simple auth
    const isValid = password === "customer123"; // Default password for demo

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error("Customer login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

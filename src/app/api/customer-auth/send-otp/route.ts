import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendWhatsAppNotification } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const { phoneOrEmail } = await req.json();

    if (!phoneOrEmail) {
      return NextResponse.json({ error: "Phone or email required" }, { status: 400 });
    }

    // Find customer by phone or email
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

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastOtp: otp, otpExpiry },
    });

    // Send OTP via WhatsApp or SMS
    const waNumber = customer.whatsapp || customer.phone;
    if (waNumber) {
      const message = `Your OTP for customer portal login is: ${otp}\n\nValid for 10 minutes.\n\nDo not share this code with anyone.`;
      
      // Try to send via WhatsApp (will log to console if not configured)
      await sendWhatsAppNotification(waNumber, "whatsapp_order_template", {
        customerName: `${customer.firstName} ${customer.lastName || ""}`.trim(),
        items: message,
      }).catch(console.error);
    }

    // For demo purposes, also return OTP in response (remove in production)
    return NextResponse.json({ 
      success: true, 
      message: "OTP sent successfully",
      // Remove this in production:
      debug: { otp, phone: waNumber }
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendWhatsAppNotification } from "@/lib/whatsapp";
import { normalizePhone } from "@/lib/phoneUtils";

export async function POST(req: Request) {
  try {
    const { phoneOrEmail } = await req.json();

    if (!phoneOrEmail) {
      return NextResponse.json({ error: "Phone or email required" }, { status: 400 });
    }

    // Check if it's email or phone
    const isEmail = phoneOrEmail.includes("@");
    const normalizedPhone = isEmail ? null : normalizePhone(phoneOrEmail);

    // Find customer by phone or email
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
      // Format message for Web OTP API compatibility
      // Format: @domain.com #code (for auto-fill to work)
      const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || "optixshop.com";
      const message = `Your OTP for customer portal login is: ${otp}\n\nValid for 10 minutes.\n\n@${domain} #${otp}\n\nDo not share this code with anyone.`;
      
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

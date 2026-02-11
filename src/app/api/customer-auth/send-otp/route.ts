import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendWhatsAppNotification } from "@/lib/whatsapp";
import { normalizePhone } from "@/lib/phoneUtils";
import { sendEmailOTP } from "@/lib/emailOTP";

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

    // Fetch notification settings
    const emailSettings = await prisma.setting.findUnique({
      where: { key: "email_notifications_enabled" },
    });
    const whatsappSettings = await prisma.setting.findUnique({
      where: { key: "whatsapp_enabled" },
    });
    const smsSettings = await prisma.setting.findUnique({
      where: { key: "sms_otp_enabled" },
    });

    const emailEnabled = emailSettings?.value === "true";
    const whatsappEnabled = whatsappSettings?.value === "true";
    const smsEnabled = smsSettings?.value === "true";

    // Send OTP via configured channels
    const customerName = `${customer.firstName} ${customer.lastName || ""}`.trim();
    let otpSent = false;
    let sendMethod = "";

    // If email login, send via email (if enabled)
    if (isEmail && customer.email && emailEnabled) {
      const result = await sendEmailOTP({
        to: customer.email,
        otp,
        customerName,
      });
      otpSent = result.success;
      sendMethod = "email";
    } 
    // If phone login, try enabled channels in order: WhatsApp → SMS → Email
    else {
      const waNumber = customer.whatsapp || customer.phone;
      
      // Try WhatsApp if enabled
      if (!otpSent && whatsappEnabled && waNumber) {
        const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || "optixshop.com";
        const message = `Your OTP for customer portal login is: ${otp}\n\nValid for 10 minutes.\n\n@${domain} #${otp}\n\nDo not share this code with anyone.`;
        
        const waResult = await sendWhatsAppNotification(waNumber, "whatsapp_order_template", {
          customerName,
          items: message,
        }).catch(() => ({ success: false, message: "WhatsApp not configured" }));

        if (waResult.success) {
          otpSent = true;
          sendMethod = "WhatsApp";
        }
      }

      // Try SMS if enabled (placeholder - implement SMS provider integration)
      if (!otpSent && smsEnabled && waNumber) {
        // TODO: Integrate SMS provider (Twilio, etc.)
        // For now, SMS is configured but not implemented
        console.log(`SMS OTP would be sent to ${waNumber}: ${otp}`);
        // Uncomment when SMS provider is integrated:
        // otpSent = true;
        // sendMethod = "SMS";
      }

      // Fallback to email if enabled and other methods failed
      if (!otpSent && emailEnabled && customer.email) {
        const result = await sendEmailOTP({
          to: customer.email,
          otp,
          customerName,
        });
        otpSent = result.success;
        sendMethod = "email";
      }
    }

    // For demo purposes, also return OTP in response (remove in production)
    return NextResponse.json({ 
      success: true, 
      message: otpSent ? `OTP sent via ${sendMethod}` : "OTP generated (check console)",
      // Remove this in production:
      debug: { otp, method: sendMethod || "console", phone: customer.phone, email: customer.email }
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

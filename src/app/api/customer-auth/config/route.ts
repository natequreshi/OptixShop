import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s) => { map[s.key] = s.value; });

    const config = {
      otpEnabled: map["customer_otp_login_enabled"] === "true",
      passwordEnabled: map["customer_password_login_enabled"] === "true",
      emailNotifications: map["email_notifications_enabled"] === "true",
      whatsappNotifications: map["whatsapp_enabled"] === "true",
      smsOtp: map["sms_otp_enabled"] === "true",
    };

    // If both are disabled, enable OTP by default
    if (!config.otpEnabled && !config.passwordEnabled) {
      config.otpEnabled = true;
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Get customer auth config error:", error);
    return NextResponse.json({ 
      otpEnabled: true, 
      passwordEnabled: true,
      emailNotifications: false,
      whatsappNotifications: false,
      smsOtp: false,
    });
  }
}

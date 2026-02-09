import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  return NextResponse.json(map);
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const entries = Object.entries(body);

    for (const [key, value] of entries) {
      const strValue = value === null || value === undefined ? "" : String(value);
      await prisma.setting.upsert({
        where: { key },
        update: { value: strValue },
        create: { key, value: strValue, category: inferCategory(key) },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Settings PUT] Error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}

function inferCategory(key: string): string {
  if (key.startsWith("store_") || key === "currency" || key === "logo_url" || key.startsWith("date_")) return "general";
  if (key.startsWith("tax_") || key === "gst_number" || key === "default_tax_rate") return "tax";
  if (key.startsWith("loyalty_")) return "loyalty";
  if (key.startsWith("module_")) return "modules";
  if (key.startsWith("receipt_") || key.startsWith("invoice_")) return "receipt";
  if (key.startsWith("whatsapp_")) return "whatsapp";
  if (key.startsWith("customer_")) return "customers";
  if (key.startsWith("primary_") || key.startsWith("sidebar_")) return "appearance";
  return "general";
}

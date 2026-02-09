import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  return NextResponse.json(map);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const entries = Object.entries(body) as [string, string][];

  for (const [key, value] of entries) {
    await prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value), category: inferCategory(key) },
    });
  }

  return NextResponse.json({ success: true });
}

function inferCategory(key: string): string {
  if (key.startsWith("store_") || key === "currency" || key === "logo_url") return "general";
  if (key.startsWith("tax_") || key === "gst_number" || key === "default_tax_rate") return "tax";
  if (key.startsWith("loyalty_")) return "loyalty";
  if (key.startsWith("module_")) return "modules";
  if (key.startsWith("receipt_") || key.startsWith("invoice_")) return "receipt";
  return "general";
}

import { prisma } from "@/lib/prisma";

interface WhatsAppMessageData {
  customerName: string;
  invoiceNo?: string;
  orderNo?: string;
  totalAmount?: string;
  items?: string;
}

async function getSettings(): Promise<Record<string, string>> {
  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  settings.forEach((s) => { map[s.key] = s.value; });
  return map;
}

function fillTemplate(template: string, data: WhatsAppMessageData, storeName: string): string {
  return template
    .replace(/{customer_name}/g, data.customerName)
    .replace(/{invoice_no}/g, data.invoiceNo ?? "")
    .replace(/{order_no}/g, data.orderNo ?? "")
    .replace(/{total_amount}/g, data.totalAmount ?? "")
    .replace(/{store_name}/g, storeName)
    .replace(/{items}/g, data.items ?? "");
}

export async function sendWhatsAppNotification(
  phoneNumber: string,
  templateKey: "whatsapp_order_template" | "whatsapp_delivery_template" | "whatsapp_lab_ready_template",
  data: WhatsAppMessageData
): Promise<{ success: boolean; message: string }> {
  try {
    const settings = await getSettings();

    if (settings["whatsapp_enabled"] !== "true") {
      return { success: false, message: "WhatsApp notifications are disabled" };
    }

    const apiUrl = settings["whatsapp_api_url"];
    const apiToken = settings["whatsapp_api_token"];
    const storeName = settings["store_name"] ?? "OptixShop";
    const template = settings[templateKey] ?? "";

    if (!apiUrl || !apiToken) {
      // Log the message even if API isn't configured (for debugging)
      const message = fillTemplate(template, data, storeName);
      console.log(`[WhatsApp] Would send to ${phoneNumber}: ${message}`);
      return { success: false, message: "WhatsApp API not configured. Message logged to console." };
    }

    const message = fillTemplate(template, data, storeName);
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");

    // Send via WhatsApp Business API (Meta Graph API format)
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: cleanPhone,
        type: "text",
        text: { body: message },
      }),
    });

    if (response.ok) {
      return { success: true, message: "WhatsApp notification sent" };
    } else {
      const error = await response.text();
      console.error("[WhatsApp] API error:", error);
      return { success: false, message: `WhatsApp API error: ${response.status}` };
    }
  } catch (err) {
    console.error("[WhatsApp] Error:", err);
    return { success: false, message: "Failed to send WhatsApp notification" };
  }
}

export function formatCurrencyPlain(amount: number): string {
  return `Rs. ${Math.round(amount).toLocaleString("en-PK")}`;
}

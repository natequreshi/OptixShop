import { prisma } from "@/lib/prisma";

interface WhatsAppMessageData {
  customerName: string;
  invoiceNo?: string;
  orderNo?: string;
  orderDate?: string;
  totalAmount?: string;
  items?: string;
  itemsDetailed?: string;
  subtotal?: string;
  discount?: string;
  tax?: string;
  paidAmount?: string;
  balanceAmount?: string;
  paymentMethod?: string;
  paymentStatus?: string;
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

    // Use enhanced message for order template, otherwise use template
    const message = templateKey === "whatsapp_order_template" && data.itemsDetailed
      ? createEnhancedOrderMessage(data, settings)
      : fillTemplate(template, data, storeName);
    
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

export function createEnhancedOrderMessage(data: WhatsAppMessageData, settings: Record<string, string>): string {
  const storeName = settings["store_name"] || "OptixShop";
  const storePhone = settings["store_phone"] || "";
  const hasTax = data.tax && parseFloat(data.tax.replace(/[^0-9.-]/g, "")) > 0;
  
  let message = `🛍️ ORDER CONFIRMATION\n\n`;
  message += `Dear ${data.customerName},\n`;
  message += `Thank you for your purchase!\n\n`;
  message += `━━━━━━━━━━━━━━━━━━\n`;
  message += `📋 ORDER DETAILS\n`;
  message += `Invoice: ${data.invoiceNo}\n`;
  message += `Date: ${data.orderDate}\n\n`;
  message += `📦 ITEMS:\n${data.itemsDetailed}\n\n`;
  message += `━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 PAYMENT SUMMARY\n`;
  message += `Subtotal: ${data.subtotal}\n`;
  
  if (data.discount && parseFloat(data.discount.replace(/[^0-9.-]/g, "")) > 0) {
    message += `Discount: ${data.discount}\n`;
  }
  
  if (hasTax) {
    message += `Tax: ${data.tax}\n`;
  }
  
  message += `Total: ${data.totalAmount}\n`;
  message += `Paid: ${data.paidAmount}\n`;
  
  if (data.balanceAmount && parseFloat(data.balanceAmount.replace(/[^0-9.-]/g, "")) > 0) {
    message += `Balance: ${data.balanceAmount}\n`;
  }
  
  message += `\nPayment: ${data.paymentMethod}\n`;
  message += `Status: ${data.paymentStatus}\n\n`;
  message += `━━━━━━━━━━━━━━━━━━\n`;
  message += `📍 ${storeName}\n`;
  
  if (storePhone) {
    message += `📞 ${storePhone}\n`;
  }
  
  message += `\nVisit us again! 🙏`;
  
  return message;
}

/**
 * Normalize phone number to standard format
 * Handles: 03337168984, 00923337168984, +923337168984, 923337168984
 * Returns: 923337168984 (without +)
 */
export function normalizePhone(phone: string): string {
  if (!phone) return "";
  
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, "");
  
  // Remove leading +
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }
  
  // If starts with 0092, replace with 92
  if (cleaned.startsWith("0092")) {
    cleaned = "92" + cleaned.substring(4);
  }
  
  // If starts with 00, assume it's international format
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.substring(2);
  }
  
  // If starts with 0 (Pakistan local format), replace with 92
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = "92" + cleaned.substring(1);
  }
  
  // If doesn't start with 92 and is 10 digits, add 92
  if (!cleaned.startsWith("92") && cleaned.length === 10) {
    cleaned = "92" + cleaned;
  }
  
  return cleaned;
}

/**
 * Check if two phone numbers are the same after normalization
 */
export function isSamePhone(phone1: string, phone2: string): boolean {
  return normalizePhone(phone1) === normalizePhone(phone2);
}

/**
 * Format phone for display
 */
export function formatPhoneDisplay(phone: string): string {
  const normalized = normalizePhone(phone);
  if (normalized.startsWith("92") && normalized.length === 12) {
    return `+92-${normalized.substring(2, 5)}-${normalized.substring(5)}`;
  }
  return phone;
}

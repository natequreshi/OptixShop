import { v4 as uuidv4 } from 'uuid';

export function generateId(): string {
  return uuidv4();
}

export function generateSequentialNo(prefix: string, lastNo: string | null): string {
  if (!lastNo) return `${prefix}-0001`;
  const parts = lastNo.split('-');
  const num = parseInt(parts[parts.length - 1], 10) + 1;
  return `${prefix}-${num.toString().padStart(4, '0')}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

export function calculateTax(amount: number, taxRate: number, inclusive: boolean): { base: number; tax: number; total: number } {
  if (inclusive) {
    const base = amount / (1 + taxRate / 100);
    const tax = amount - base;
    return { base: Math.round(base * 100) / 100, tax: Math.round(tax * 100) / 100, total: amount };
  }
  const tax = amount * taxRate / 100;
  return { base: amount, tax: Math.round(tax * 100) / 100, total: Math.round((amount + tax) * 100) / 100 };
}

export function splitGST(taxAmount: number, isInterState: boolean): { cgst: number; sgst: number; igst: number } {
  if (isInterState) {
    return { cgst: 0, sgst: 0, igst: taxAmount };
  }
  const half = Math.round(taxAmount * 50) / 100;
  return { cgst: half, sgst: half, igst: 0 };
}

import { prisma } from "@/lib/prisma";
import VendorsClient from "./client";

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const [vendors, purchaseOrders, products] = await Promise.all([
    prisma.vendor.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { purchaseOrders: true, purchaseInvoices: true } } },
    }),
    prisma.purchaseOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: { vendor: true },
    }),
    prisma.product.findMany({
      orderBy: { name: "asc" },
      include: { category: true, brand: true },
    }),
  ]);

  const vendorData = vendors.map((v) => ({
    id: v.id, vendorCode: v.vendorCode, companyName: v.companyName,
    contactPerson: v.contactPerson ?? "", phone: v.phone ?? "", email: v.email ?? "",
    city: v.city ?? "", paymentTerms: v.paymentTerms ?? "", creditDays: v.creditDays,
    poCount: v._count.purchaseOrders, invoiceCount: v._count.purchaseInvoices, isActive: v.isActive,
  }));

  const orderData = purchaseOrders.map((po) => ({
    id: po.id, 
    orderNo: po.poNumber || `PO-${po.id.slice(-6)}`, 
    vendorId: po.vendorId, 
    vendorName: po.vendor.companyName,
    orderDate: po.createdAt.toISOString().split('T')[0], 
    expectedDate: "", // Field doesn't exist yet
    status: (po.status as 'pending' | 'confirmed' | 'received' | 'cancelled') || 'pending',
    totalAmount: po.totalAmount || 0, 
    itemCount: 1, // Default value since items field doesn't exist yet
    notes: po.notes || undefined,
  }));

  const productData = products.map((p) => ({
    id: p.id, 
    name: p.name, 
    sku: p.sku, 
    category: p.category?.name || "Uncategorized", 
    brand: p.brand?.name || "No Brand",
    currentStock: 0, // Field doesn't exist yet, using default
    minStock: 0, // Field doesn't exist yet, using default
    maxStock: 0, // Field doesn't exist yet, using default
    costPrice: p.costPrice || 0, 
    sellPrice: p.sellingPrice || 0,
  }));

  return <VendorsClient vendors={vendorData} purchaseOrders={orderData} products={productData} />;
}

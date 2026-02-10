import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/customers/[id]/history
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        prescriptions: {
          orderBy: { createdAt: "desc" },
        },
        sales: {
          orderBy: { createdAt: "desc" },
          include: {
            items: {
              include: {
                product: { select: { name: true, sku: true, imageUrl: true } },
              },
            },
            payments: {
              select: { paymentMethod: true, amount: true },
            },
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({
      prescriptions: customer.prescriptions.map((rx) => ({
        id: rx.id,
        prescriptionNo: rx.prescriptionNo,
        prescriptionDate: rx.prescriptionDate,
        expiryDate: rx.expiryDate,
        prescribedBy: rx.prescribedBy,
        odSphere: rx.odSphere,
        odCylinder: rx.odCylinder,
        odAxis: rx.odAxis,
        odAdd: rx.odAdd,
        odPd: rx.odPd,
        osSphere: rx.osSphere,
        osCylinder: rx.osCylinder,
        osAxis: rx.osAxis,
        osAdd: rx.osAdd,
        osPd: rx.osPd,
        photoUrl: rx.photoUrl,
        notes: rx.notes,
      })),
      sales: customer.sales.map((s) => ({
        id: s.id,
        invoiceNo: s.invoiceNo,
        saleDate: s.saleDate,
        totalAmount: s.totalAmount,
        discountAmount: s.discountAmount,
        taxAmount: s.taxAmount,
        status: s.status,
        paymentMethod: s.payments?.[0]?.paymentMethod || "cash",
        items: s.items.map((i) => ({
          productName: i.product.name,
          sku: i.product.sku,
          imageUrl: i.product.imageUrl,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.total,
        })),
      })),
    });
  } catch (err) {
    console.error("[CUSTOMER HISTORY]", err);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

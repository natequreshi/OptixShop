import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    // Limit to recent 20 items for performance
    const LIMIT = 20;

    // Fetch customer and history in parallel for better performance
    const [customer, prescriptions, sales] = await Promise.all([
      // Customer basic info only
      prisma.customer.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          customerNo: true,
          firstName: true,
          lastName: true,
          phone: true,
          whatsapp: true,
          email: true,
        },
      }),

      // Recent prescriptions only (limit 20)
      prisma.prescription.findMany({
        where: { customerId: params.id },
        select: {
          id: true,
          prescriptionNo: true,
          prescriptionDate: true,
          odSphere: true,
          odCylinder: true,
          odAxis: true,
          odAdd: true,
          odPd: true,
          osSphere: true,
          osCylinder: true,
          osAxis: true,
          osAdd: true,
          osPd: true,
          photoUrl: true,
          notes: true,
          prescribedBy: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: LIMIT,
      }),

      // Recent sales with items (limit 20)
      prisma.sale.findMany({
        where: { customerId: params.id },
        select: {
          id: true,
          invoiceNo: true,
          saleDate: true,
          totalAmount: true,
          status: true,
          items: {
            select: {
              quantity: true,
              unitPrice: true,
              total: true,
              product: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: LIMIT,
      }),
    ]);

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({
      customer,
      prescriptions: prescriptions.map((p) => ({
        id: p.id,
        prescriptionNo: p.prescriptionNo,
        date: p.prescriptionDate,
        odSphere: p.odSphere,
        odCylinder: p.odCylinder,
        odAxis: p.odAxis,
        odAdd: p.odAdd,
        odPd: p.odPd,
        osSphere: p.osSphere,
        osCylinder: p.osCylinder,
        osAxis: p.osAxis,
        osAdd: p.osAdd,
        osPd: p.osPd,
        photoUrl: p.photoUrl,
        notes: p.notes,
        prescribedBy: p.prescribedBy,
      })),
      sales: sales.map((s) => ({
        id: s.id,
        invoiceNo: s.invoiceNo,
        date: s.saleDate,
        totalAmount: s.totalAmount,
        status: s.status,
        items: s.items.map((i) => ({
          productName: i.product.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.total,
        })),
      })),
    });
  } catch (error) {
    console.error("Error fetching customer history:", error);
    return NextResponse.json({ error: "Failed to fetch customer history" }, { status: 500 });
  }
}

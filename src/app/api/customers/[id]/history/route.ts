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
          odDistanceSphere: true,
          odDistanceCylinder: true,
          odDistanceAxis: true,
          odAddSphere: true,
          odPd: true,
          osDistanceSphere: true,
          osDistanceCylinder: true,
          osDistanceAxis: true,
          osAddSphere: true,
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
        odSphere: p.odDistanceSphere,
        odCylinder: p.odDistanceCylinder,
        odAxis: p.odDistanceAxis,
        odAdd: p.odAddSphere,
        odPd: p.odPd,
        osSphere: p.osDistanceSphere,
        osCylinder: p.osDistanceCylinder,
        osAxis: p.osDistanceAxis,
        osAdd: p.osAddSphere,
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

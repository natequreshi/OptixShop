import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        prescriptions: {
          orderBy: { createdAt: "desc" },
        },
        sales: {
          orderBy: { saleDate: "desc" },
          include: {
            items: {
              include: {
                product: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({
      customer: {
        id: customer.id,
        customerNo: customer.customerNo,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        whatsapp: customer.whatsapp,
        email: customer.email,
      },
      prescriptions: customer.prescriptions.map((p) => ({
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
      sales: customer.sales.map((s) => ({
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

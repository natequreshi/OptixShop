import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const sale = await prisma.sale.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      cashier: true,
      items: { include: { product: true } },
      payments: true,
    },
  });
  if (!sale) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(sale);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const sale = await prisma.sale.findUnique({ where: { id: params.id } });
    if (!sale) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const paidAmount = body.paidAmount ?? sale.paidAmount;
    const balanceAmount = Math.max(0, sale.totalAmount - paidAmount);
    const paymentStatus = paidAmount >= sale.totalAmount ? "paid" : paidAmount > 0 ? "partial" : "unpaid";

    const updated = await prisma.sale.update({
      where: { id: params.id },
      data: {
        status: body.status ?? sale.status,
        paidAmount,
        balanceAmount,
        paymentStatus,
        notes: body.notes ?? sale.notes,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[Sale PUT] Error:", error);
    return NextResponse.json({ error: "Failed to update sale" }, { status: 500 });
  }
}

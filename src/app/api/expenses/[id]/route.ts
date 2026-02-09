import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const expense = await prisma.expense.update({
      where: { id: params.id },
      data: {
        category: body.category,
        description: body.description,
        amount: parseFloat(body.amount),
        expenseDate: body.expenseDate,
        paymentMethod: body.paymentMethod,
        reference: body.reference || null,
        notes: body.notes || null,
        isRecurring: body.isRecurring || false,
        recurringType: body.recurringType || null,
      },
    });
    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.expense.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

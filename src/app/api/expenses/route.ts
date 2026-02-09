import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const expenses = await prisma.expense.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { fullName: true } } },
  });
  return NextResponse.json(expenses);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const count = await prisma.expense.count();
    const expenseNo = `EXP${String(count + 1).padStart(5, "0")}`;

    const expense = await prisma.expense.create({
      data: {
        expenseNo,
        category: body.category || "general",
        description: body.description,
        amount: parseFloat(body.amount),
        expenseDate: body.expenseDate || new Date().toISOString().split("T")[0],
        paymentMethod: body.paymentMethod || "cash",
        reference: body.reference || null,
        notes: body.notes || null,
        isRecurring: body.isRecurring || false,
        recurringType: body.recurringType || null,
        createdById: (session?.user as any)?.id || null,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("[Expenses POST] Error:", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import ExpensesClient from "./client";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const expenses = await prisma.expense.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { fullName: true } } },
  });

  const data = expenses.map((e) => ({
    id: e.id,
    expenseNo: e.expenseNo,
    category: e.category,
    description: e.description,
    amount: e.amount,
    expenseDate: e.expenseDate,
    paymentMethod: e.paymentMethod,
    reference: e.reference ?? "",
    notes: e.notes ?? "",
    isRecurring: e.isRecurring,
    recurringType: e.recurringType ?? "",
    createdBy: e.createdBy?.fullName ?? "",
  }));

  // Aggregate daily & monthly
  const today = new Date().toISOString().split("T")[0];
  const monthStart = today.slice(0, 7) + "-01";

  const dailyTotal = await prisma.expense.aggregate({
    where: { expenseDate: today },
    _sum: { amount: true },
    _count: true,
  });

  const monthlyTotal = await prisma.expense.aggregate({
    where: { expenseDate: { gte: monthStart } },
    _sum: { amount: true },
    _count: true,
  });

  const yearStart = today.slice(0, 4) + "-01-01";
  const yearlyTotal = await prisma.expense.aggregate({
    where: { expenseDate: { gte: yearStart } },
    _sum: { amount: true },
    _count: true,
  });

  const summary = {
    dailyAmount: dailyTotal._sum.amount ?? 0,
    dailyCount: dailyTotal._count,
    monthlyAmount: monthlyTotal._sum.amount ?? 0,
    monthlyCount: monthlyTotal._count,
    yearlyAmount: yearlyTotal._sum.amount ?? 0,
    yearlyCount: yearlyTotal._count,
  };

  return <ExpensesClient expenses={data} summary={summary} />;
}

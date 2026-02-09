import { prisma } from "@/lib/prisma";
import AccountingClient from "./client";

export const dynamic = "force-dynamic";

export default async function AccountingPage() {
  const [accounts, journalEntries] = await Promise.all([
    prisma.chartOfAccount.findMany({ orderBy: { accountCode: "asc" } }),
    prisma.journalEntry.findMany({
      include: { lines: { include: { debitAccount: true, creditAccount: true } }, createdBy: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const accountData = accounts.map(a => ({
    id: a.id, accountCode: a.accountCode, accountName: a.accountName,
    accountType: a.accountType, isGroup: a.isGroup, isSystem: a.isSystem,
  }));

  const entryData = journalEntries.map(je => ({
    id: je.id, entryNo: je.entryNo, entryDate: je.entryDate,
    description: je.description ?? "", totalAmount: je.totalAmount,
    status: je.status, createdBy: je.createdBy?.fullName ?? "—",
    lines: je.lines.map(l => {
      const acc = l.debit > 0 ? l.debitAccount : (l.creditAccount ?? l.debitAccount);
      return {
        accountCode: acc.accountCode, accountName: acc.accountName,
        debit: l.debit, credit: l.credit, narration: l.narration ?? "",
      };
    }),
  }));

  // Trial balance
  const trialBalance = await prisma.journalEntryLine.groupBy({
    by: ["accountId"],
    _sum: { debit: true, credit: true },
  });

  const accountMap = Object.fromEntries(accounts.map(a => [a.id, a]));
  const tbData = trialBalance.map(tb => ({
    accountCode: accountMap[tb.accountId]?.accountCode ?? "",
    accountName: accountMap[tb.accountId]?.accountName ?? "",
    accountType: accountMap[tb.accountId]?.accountType ?? "",
    debit: tb._sum.debit ?? 0,
    credit: tb._sum.credit ?? 0,
    balance: (tb._sum.debit ?? 0) - (tb._sum.credit ?? 0),
  })).sort((a, b) => a.accountCode.localeCompare(b.accountCode));

  return <AccountingClient accounts={accountData} journalEntries={entryData} trialBalance={tbData} />;
}

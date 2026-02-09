import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { productId, quantity, notes } = await req.json();
  
  // Update inventory
  const inv = await prisma.inventory.findUnique({ where: { productId } });
  if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.inventory.update({
    where: { productId },
    data: { quantity: inv.quantity + quantity },
  });

  // Create movement record
  await prisma.inventoryMovement.create({
    data: {
      productId,
      movementType: quantity > 0 ? "adjustment_in" : "adjustment_out",
      quantity,
      referenceType: "manual",
      notes,
    },
  });

  return NextResponse.json({ ok: true });
}

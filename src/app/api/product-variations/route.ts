import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/product-variations?productId=xxx
export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    const variations = await prisma.productVariation.findMany({
      where: { productId, isActive: true },
      orderBy: [{ attributeType: "asc" }, { sortOrder: "asc" }],
    });

    return NextResponse.json(variations);
  } catch (err) {
    console.error("[VARIATIONS GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch variations" },
      { status: 500 }
    );
  }
}

// POST /api/product-variations
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, name, value, attributeType, imageUrl } = body;

    if (!productId || !name || !value || !attributeType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const variation = await prisma.productVariation.create({
      data: {
        productId,
        name,
        value,
        attributeType,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(variation, { status: 201 });
  } catch (err: any) {
    console.error("[VARIATIONS POST]", err);
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "This variation already exists for this product" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create variation" },
      { status: 500 }
    );
  }
}

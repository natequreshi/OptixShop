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

// PUT /api/product-variations/:id
export async function PUT(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").pop();
    const body = await req.json();
    const { name, value, attributeType, imageUrl, isActive, sortOrder } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Variation ID is required" },
        { status: 400 }
      );
    }

    const variation = await prisma.productVariation.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(value && { value }),
        ...(attributeType && { attributeType }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json(variation);
  } catch (err: any) {
    console.error("[VARIATIONS PUT]", err);
    if (err.code === "P2025") {
      return NextResponse.json(
        { error: "Variation not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update variation" },
      { status: 500 }
    );
  }
}

// DELETE /api/product-variations/:id
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "Variation ID is required" },
        { status: 400 }
      );
    }

    await prisma.productVariation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[VARIATIONS DELETE]", err);
    if (err.code === "P2025") {
      return NextResponse.json(
        { error: "Variation not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete variation" },
      { status: 500 }
    );
  }
}

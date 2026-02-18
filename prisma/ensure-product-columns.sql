-- Add product columns if missing (idempotent)
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "color_variants" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "colors" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "opening_balance" DOUBLE PRECISION NOT NULL DEFAULT 0;

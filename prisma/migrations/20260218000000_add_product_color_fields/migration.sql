-- AlterTable
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "color_variants" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "colors" TEXT;

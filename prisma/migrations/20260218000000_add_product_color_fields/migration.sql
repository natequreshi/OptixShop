-- Add missing product columns
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "color_variants" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "colors" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "opening_balance" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Add missing prescription distance/near/add columns
ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "od_distance_sphere" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "od_distance_cylinder" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "od_distance_axis" INTEGER;
ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "od_near_sphere" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "od_near_cylinder" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "od_near_axis" INTEGER;
ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "od_add_sphere" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "od_add_cylinder" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "od_add_axis" INTEGER;
ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "os_distance_sphere" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "os_distance_cylinder" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "os_distance_axis" INTEGER;
ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "os_near_sphere" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "os_near_cylinder" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "os_near_axis" INTEGER;
ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "os_add_sphere" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "os_add_cylinder" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "os_add_axis" INTEGER;

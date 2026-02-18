-- AlterTable
ALTER TABLE "prescriptions" ADD COLUMN "od_distance_sphere" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN "od_distance_cylinder" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN "od_distance_axis" INTEGER;
ALTER TABLE "prescriptions" ADD COLUMN "od_near_sphere" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN "od_near_cylinder" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN "od_near_axis" INTEGER;
ALTER TABLE "prescriptions" ADD COLUMN "od_add_sphere" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN "od_add_cylinder" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN "od_add_axis" INTEGER;
ALTER TABLE "prescriptions" ADD COLUMN "os_distance_sphere" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN "os_distance_cylinder" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN "os_distance_axis" INTEGER;
ALTER TABLE "prescriptions" ADD COLUMN "os_near_sphere" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN "os_near_cylinder" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN "os_near_axis" INTEGER;
ALTER TABLE "prescriptions" ADD COLUMN "os_add_sphere" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN "os_add_cylinder" DOUBLE PRECISION;
ALTER TABLE "prescriptions" ADD COLUMN "os_add_axis" INTEGER;

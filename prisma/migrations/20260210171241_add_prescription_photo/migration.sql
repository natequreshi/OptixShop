/*
  Warnings:

  - You are about to drop the `product_variations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "product_variations" DROP CONSTRAINT "product_variations_product_id_fkey";

-- DropTable
DROP TABLE "product_variations";

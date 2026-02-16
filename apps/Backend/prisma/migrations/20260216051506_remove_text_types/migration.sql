/*
  Warnings:

  - You are about to drop the `text_types` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "texts" DROP CONSTRAINT "texts_type_id_fkey";

-- DropTable
DROP TABLE "text_types";

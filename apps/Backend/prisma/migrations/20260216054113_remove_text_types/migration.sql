/*
  Warnings:

  - You are about to drop the column `created_by` on the `texts` table. All the data in the column will be lost.
  - Added the required column `created_by_id` to the `texts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "texts" DROP COLUMN "created_by",
ADD COLUMN     "created_by_id" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "CreatedBy";

-- CreateTable
CREATE TABLE "text_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "text_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "text_types_name_key" ON "text_types"("name");

-- AddForeignKey
ALTER TABLE "texts" ADD CONSTRAINT "texts_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "text_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "texts" ADD CONSTRAINT "texts_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

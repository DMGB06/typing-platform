-- AlterTable
ALTER TABLE "users" ADD COLUMN     "default_difficulty_id" INTEGER;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_default_difficulty_id_fkey" FOREIGN KEY ("default_difficulty_id") REFERENCES "difficulties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

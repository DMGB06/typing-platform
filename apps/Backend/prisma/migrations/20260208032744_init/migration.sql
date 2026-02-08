-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "CreatedBy" AS ENUM ('ADMIN', 'AI');

-- CreateTable
CREATE TABLE "difficulties" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "difficulties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "text_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "text_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "texts" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "difficulty_id" INTEGER NOT NULL,
    "type_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "created_by" "CreatedBy" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "texts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_stats_by_difficulty" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "difficulty_id" INTEGER NOT NULL,
    "best_wpm" INTEGER NOT NULL DEFAULT 0,
    "avg_wpm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_sessions" INTEGER NOT NULL DEFAULT 0,
    "total_time_seconds" INTEGER NOT NULL DEFAULT 0,
    "avg_error_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "user_stats_by_difficulty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "typing_sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "text_id" INTEGER NOT NULL,
    "wpm" INTEGER,
    "accuracy" DOUBLE PRECISION,
    "time_seconds" INTEGER,
    "error_rate" DOUBLE PRECISION,
    "improvement_rate" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "typing_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "typing_errors" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "wrong_word" TEXT,
    "correct_word" TEXT,
    "position" INTEGER,

    CONSTRAINT "typing_errors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_text_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "text_id" INTEGER NOT NULL,
    "last_attempt_at" TIMESTAMP(3) NOT NULL,
    "total_attempts" INTEGER NOT NULL DEFAULT 1,
    "best_wpm" INTEGER,
    "best_accuracy" DOUBLE PRECISION,

    CONSTRAINT "user_text_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "difficulties_name_key" ON "difficulties"("name");

-- CreateIndex
CREATE UNIQUE INDEX "text_types_name_key" ON "text_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_text_filters" ON "texts"("difficulty_id", "type_id", "language_id");

-- CreateIndex
CREATE INDEX "idx_difficulty_ranking" ON "user_stats_by_difficulty"("difficulty_id", "best_wpm");

-- CreateIndex
CREATE UNIQUE INDEX "user_stats_by_difficulty_user_id_difficulty_id_key" ON "user_stats_by_difficulty"("user_id", "difficulty_id");

-- CreateIndex
CREATE INDEX "idx_user_sessions" ON "typing_sessions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "user_text_history_user_id_last_attempt_at_idx" ON "user_text_history"("user_id", "last_attempt_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_text_history_user_id_text_id_key" ON "user_text_history"("user_id", "text_id");

-- AddForeignKey
ALTER TABLE "texts" ADD CONSTRAINT "texts_difficulty_id_fkey" FOREIGN KEY ("difficulty_id") REFERENCES "difficulties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "texts" ADD CONSTRAINT "texts_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "text_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "texts" ADD CONSTRAINT "texts_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stats_by_difficulty" ADD CONSTRAINT "user_stats_by_difficulty_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stats_by_difficulty" ADD CONSTRAINT "user_stats_by_difficulty_difficulty_id_fkey" FOREIGN KEY ("difficulty_id") REFERENCES "difficulties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "typing_sessions" ADD CONSTRAINT "typing_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "typing_sessions" ADD CONSTRAINT "typing_sessions_text_id_fkey" FOREIGN KEY ("text_id") REFERENCES "texts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "typing_errors" ADD CONSTRAINT "typing_errors_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "typing_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_text_history" ADD CONSTRAINT "user_text_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_text_history" ADD CONSTRAINT "user_text_history_text_id_fkey" FOREIGN KEY ("text_id") REFERENCES "texts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

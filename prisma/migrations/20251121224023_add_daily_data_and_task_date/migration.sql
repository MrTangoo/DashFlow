/*
  Warnings:

  - Added the required column `date` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add date column with a temporary default
ALTER TABLE "Task" ADD COLUMN "date" TEXT NOT NULL DEFAULT '2024-01-01';

-- Update existing tasks to use their createdAt date
UPDATE "Task" SET "date" = TO_CHAR("createdAt", 'YYYY-MM-DD');

-- Remove the default value (new tasks will require explicit date)
ALTER TABLE "Task" ALTER COLUMN "date" DROP DEFAULT;

-- CreateTable
CREATE TABLE "DailyData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "waterBottles" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyData_userId_date_idx" ON "DailyData"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyData_userId_date_key" ON "DailyData"("userId", "date");

-- CreateIndex
CREATE INDEX "Task_userId_date_idx" ON "Task"("userId", "date");

-- AddForeignKey
ALTER TABLE "DailyData" ADD CONSTRAINT "DailyData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

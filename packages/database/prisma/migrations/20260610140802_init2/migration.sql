/*
  Warnings:

  - You are about to alter the column `estimatedHours` on the `Task` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `Integer`.
  - Made the column `estimatedHours` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "estimatedHours" SET NOT NULL,
ALTER COLUMN "estimatedHours" SET DATA TYPE INTEGER;

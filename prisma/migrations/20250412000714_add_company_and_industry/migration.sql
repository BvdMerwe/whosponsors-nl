/*
  Warnings:

  - A unique constraint covering the columns `[tradeName]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `industryId` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tradeName` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "industryId" INTEGER NOT NULL,
ADD COLUMN     "tradeName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Industry" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_tradeName_key" ON "Company"("tradeName");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

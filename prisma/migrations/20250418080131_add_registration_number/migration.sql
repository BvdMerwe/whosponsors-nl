/*
  Warnings:

  - A unique constraint covering the columns `[registrationNumber]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `registrationNumber` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- First add the column as nullable
ALTER TABLE "Company" ADD COLUMN "registrationNumber" TEXT;

-- Update existing records with a unique value based on ID
UPDATE "Company"
SET "registrationNumber" = 'LEGACY_' || id::text
WHERE "registrationNumber" IS NULL;

-- Now make it non-nullable
ALTER TABLE "Company" ALTER COLUMN "registrationNumber" SET NOT NULL;

-- Create the unique index
CREATE UNIQUE INDEX "Company_registrationNumber_key" ON "Company"("registrationNumber");

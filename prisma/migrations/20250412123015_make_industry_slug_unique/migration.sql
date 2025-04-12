/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Industry` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Industry_slug_key" ON "Industry"("slug");

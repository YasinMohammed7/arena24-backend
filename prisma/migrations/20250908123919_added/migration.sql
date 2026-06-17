/*
  Warnings:

  - Added the required column `imageUrl` to the `offer_categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `offer_categories` ADD COLUMN `imageUrl` VARCHAR(191) NOT NULL;

/*
  Warnings:

  - Added the required column `meniuUrl` to the `locations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `locations` ADD COLUMN `meniuUrl` VARCHAR(191) NULL;

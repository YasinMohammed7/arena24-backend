-- AlterTable
ALTER TABLE `event_facilities` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `location_amenities` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `location_facilities` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

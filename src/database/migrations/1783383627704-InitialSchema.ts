import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1783383627704 implements MigrationInterface {
  name = "InitialSchema1783383627704";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`offer_categories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(191) NOT NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`offer_categories_name_idx\` (\`name\`), UNIQUE INDEX \`offer_categories_name_key\` (\`name\`), UNIQUE INDEX \`IDX_39aa831b9f7ccd805ad0d08860\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`offers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(191) NOT NULL, \`description\` text NULL, \`image\` varchar(191) NULL, \`startDate\` datetime NOT NULL, \`endDate\` datetime NOT NULL, \`discount\` int NULL, \`locationId\` int NULL, \`categoryId\` int NOT NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`offers_categoryId_idx\` (\`categoryId\`), INDEX \`offers_locationId_idx\` (\`locationId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`location_facilities\` (\`id\` int NOT NULL AUTO_INCREMENT, \`facilityId\` int NOT NULL, \`locationId\` int NOT NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`isActive\` tinyint NOT NULL DEFAULT 1, INDEX \`location_facilities_locationId_idx\` (\`locationId\`), INDEX \`location_facilities_facilityId_idx\` (\`facilityId\`), UNIQUE INDEX \`location_facilities_facilityId_locationId_key\` (\`facilityId\`, \`locationId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`facilities\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(191) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`facilities_name_idx\` (\`name\`), UNIQUE INDEX \`facilities_name_key\` (\`name\`), UNIQUE INDEX \`IDX_06bcfef94e04a223a5c4692193\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`event_facilities\` (\`eventId\` int NOT NULL, \`facilityId\` int NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, INDEX \`event_facilities_facilityId_fkey\` (\`facilityId\`), PRIMARY KEY (\`eventId\`, \`facilityId\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`event_included_options\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(191) NOT NULL, \`eventId\` int NOT NULL, INDEX \`event_included_options_eventId_fkey\` (\`eventId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`event_requirements\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(191) NOT NULL, \`eventId\` int NOT NULL, INDEX \`event_requirements_eventId_fkey\` (\`eventId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`event\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(191) NOT NULL, \`description\` text NULL, \`date\` datetime NOT NULL, \`startHour\` datetime NOT NULL, \`endHour\` datetime NOT NULL, \`address\` varchar(191) NOT NULL, \`price\` decimal(10,2) NULL, \`maxPeople\` int NULL, \`imageUrl\` varchar(191) NULL, \`locationId\` int NOT NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`event_locationId_fkey\` (\`locationId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`reviews\` (\`id\` int NOT NULL AUTO_INCREMENT, \`comment\` text NULL, \`stars\` int NOT NULL, \`userId\` uuid NOT NULL, \`locationId\` int NOT NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`reviews_locationId_idx\` (\`locationId\`), INDEX \`reviews_userId_idx\` (\`userId\`), UNIQUE INDEX \`reviews_userId_locationId_key\` (\`userId\`, \`locationId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`businesses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(191) NOT NULL, \`description\` varchar(191) NULL, \`ownerId\` uuid NOT NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`businesses_name_idx\` (\`name\`), INDEX \`businesses_ownerId_idx\` (\`ownerId\`), UNIQUE INDEX \`businesses_name_ownerId_key\` (\`name\`, \`ownerId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`user_permissions\` (\`userId\` uuid NOT NULL, \`permissionId\` uuid NOT NULL, \`assignedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`assignedBy\` varchar(191) NULL, \`expiresAt\` datetime NULL, INDEX \`user_permissions_permissionId_fkey\` (\`permissionId\`), PRIMARY KEY (\`userId\`, \`permissionId\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`role_permissions\` (\`roleId\` uuid NOT NULL, \`permissionId\` uuid NOT NULL, INDEX \`role_permissions_permissionId_fkey\` (\`permissionId\`), PRIMARY KEY (\`roleId\`, \`permissionId\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`Permission\` (\`id\` uuid NOT NULL, \`name\` varchar(191) NOT NULL, UNIQUE INDEX \`Permission_name_key\` (\`name\`), UNIQUE INDEX \`IDX_a99587dcc7fa748b044eb5a90e\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`user_roles\` (\`userId\` uuid NOT NULL, \`roleId\` uuid NOT NULL, \`assignedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(3), INDEX \`user_roles_roleId_fkey\` (\`roleId\`), PRIMARY KEY (\`userId\`, \`roleId\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`Role\` (\`id\` uuid NOT NULL, \`name\` varchar(191) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`Role_name_key\` (\`name\`), UNIQUE INDEX \`IDX_b852abd9e268a63287bc815aab\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`user_business_roles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` uuid NOT NULL, \`businessId\` int NULL, \`locationId\` int NULL, \`roleId\` uuid NOT NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`user_business_roles_roleId_idx\` (\`roleId\`), INDEX \`user_business_roles_locationId_idx\` (\`locationId\`), INDEX \`user_business_roles_businessId_idx\` (\`businessId\`), INDEX \`user_business_roles_userId_idx\` (\`userId\`), UNIQUE INDEX \`user_business_roles_userId_businessId_locationId_key\` (\`userId\`, \`businessId\`, \`locationId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`password_reset_tokens\` (\`id\` uuid NOT NULL, \`token\` varchar(191) NOT NULL, \`userId\` uuid NOT NULL, \`expiresAt\` datetime NOT NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`password_reset_tokens_userId_key\` (\`userId\`), UNIQUE INDEX \`password_reset_tokens_token_key\` (\`token\`), UNIQUE INDEX \`IDX_ab673f0e63eac966762155508e\` (\`token\`), UNIQUE INDEX \`IDX_d6a19d4b4f6c62dcd29daa497e\` (\`userId\`), UNIQUE INDEX \`REL_d6a19d4b4f6c62dcd29daa497e\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`location_managers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` uuid NOT NULL, \`locationId\` int NOT NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`location_managers_userId_idx\` (\`userId\`), INDEX \`location_managers_locationId_idx\` (\`locationId\`), UNIQUE INDEX \`location_managers_userId_locationId_key\` (\`userId\`, \`locationId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`refresh_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`token\` varchar(191) NOT NULL, \`userId\` uuid NOT NULL, \`expiresAt\` datetime NOT NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`refresh_tokens_userId_fkey\` (\`userId\`), UNIQUE INDEX \`refresh_tokens_token_key\` (\`token\`), UNIQUE INDEX \`IDX_4542dd2f38a61354a040ba9fd5\` (\`token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`User\` (\`id\` uuid NOT NULL, \`email\` varchar(191) NOT NULL, \`password\` varchar(191) NOT NULL, \`name\` varchar(191) NOT NULL, \`phone\` varchar(191) NOT NULL, \`ownerId\` varchar(191) NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`deletedAt\` datetime NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`imageUrl\` varchar(191) NULL, UNIQUE INDEX \`User_phone_key\` (\`phone\`), UNIQUE INDEX \`User_email_key\` (\`email\`), UNIQUE INDEX \`IDX_4a257d2c9837248d70640b3e36\` (\`email\`), UNIQUE INDEX \`IDX_1f5c894f79cd0159ff4e1a4450\` (\`phone\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`reservations\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` uuid NULL, \`name\` varchar(191) NOT NULL, \`email\` varchar(191) NULL, \`phone\` varchar(191) NULL, \`peopleCount\` int NOT NULL, \`status\` enum ('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING', \`details\` varchar(191) NULL, \`eventId\` int NULL, \`locationId\` int NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`reservations_locationId_idx\` (\`locationId\`), INDEX \`reservations_eventId_idx\` (\`eventId\`), INDEX \`reservations_userId_idx\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`schedules\` (\`id\` int NOT NULL AUTO_INCREMENT, \`locationId\` int NOT NULL, \`dayOfWeek\` tinyint UNSIGNED NOT NULL, \`startTime\` time NOT NULL, \`endTime\` time NOT NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`schedules_locationId_idx\` (\`locationId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`locations\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(191) NOT NULL, \`name\` varchar(191) NOT NULL, \`address\` varchar(191) NOT NULL, \`contact\` varchar(191) NULL, \`capacity\` int NULL, \`latitude\` double NULL, \`longitude\` double NULL, \`experience\` varchar(191) NULL, \`amenities\` varchar(191) NULL, \`imageUrl\` varchar(191) NULL, \`description\` text NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`deletedAt\` datetime NULL, \`openingHours\` varchar(191) NULL, \`businessId\` int NOT NULL, \`ownerId\` uuid NOT NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`meniuUrl\` varchar(191) NULL, INDEX \`locations_ownerId_idx\` (\`ownerId\`), INDEX \`locations_businessId_idx\` (\`businessId\`), UNIQUE INDEX \`locations_name_businessId_key\` (\`name\`, \`businessId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`location_amenities\` (\`id\` int NOT NULL AUTO_INCREMENT, \`amenityId\` int NOT NULL, \`locationId\` int NOT NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`isActive\` tinyint NOT NULL DEFAULT 1, INDEX \`location_amenities_locationId_idx\` (\`locationId\`), INDEX \`location_amenities_amenityId_idx\` (\`amenityId\`), UNIQUE INDEX \`location_amenities_locationId_amenityId_key\` (\`locationId\`, \`amenityId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`amenities\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(191) NOT NULL, \`description\` varchar(191) NULL, \`iconUrl\` varchar(191) NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`amenities_name_idx\` (\`name\`), UNIQUE INDEX \`amenities_name_key\` (\`name\`), UNIQUE INDEX \`IDX_8c5f9c7ff7e2174b53d4be1024\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`media\` (\`id\` uuid NOT NULL, \`modelType\` varchar(191) NOT NULL, \`modelId\` varchar(191) NOT NULL, \`type\` varchar(191) NOT NULL, \`fileName\` varchar(191) NOT NULL, \`mimeType\` varchar(191) NOT NULL, \`size\` int NOT NULL, \`path\` varchar(191) NOT NULL, \`url\` varchar(191) NOT NULL, \`altText\` varchar(191) NULL, \`sortOrder\` int NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`media_modelType_modelId_idx\` (\`modelType\`, \`modelId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`verification_codes\` (\`id\` uuid NOT NULL, \`contact\` varchar(191) NOT NULL, \`code\` varchar(191) NOT NULL, \`expiresAt\` datetime NOT NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`verification_codes_contact_key\` (\`contact\`), UNIQUE INDEX \`IDX_4a217eba52e13118082a3aa5c3\` (\`contact\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_06792d0c62ce6b0203c03643cd\` ON \`role_permissions\` (\`permissionId\`)`
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_b4599f8b8f548d35850afa2d12\` ON \`role_permissions\` (\`roleId\`)`
    );
    await queryRunner.query(
      `ALTER TABLE \`offers\` ADD CONSTRAINT \`FK_be9924237a352f6e10375154edd\` FOREIGN KEY (\`categoryId\`) REFERENCES \`offer_categories\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`offers\` ADD CONSTRAINT \`FK_a1f2fa9f71c5f5035126be337a5\` FOREIGN KEY (\`locationId\`) REFERENCES \`locations\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`location_facilities\` ADD CONSTRAINT \`FK_5dbf718a72e879502bf473c0bab\` FOREIGN KEY (\`facilityId\`) REFERENCES \`facilities\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`location_facilities\` ADD CONSTRAINT \`FK_7a2468c5de60f95fc9c1c307053\` FOREIGN KEY (\`locationId\`) REFERENCES \`locations\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`event_facilities\` ADD CONSTRAINT \`FK_6787625a055634d606f1a7066f3\` FOREIGN KEY (\`eventId\`) REFERENCES \`event\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`event_facilities\` ADD CONSTRAINT \`FK_56989da9e175c6529b6304ea33c\` FOREIGN KEY (\`facilityId\`) REFERENCES \`facilities\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`event_included_options\` ADD CONSTRAINT \`FK_5dfad9dad5c3d8d997e6cdf4408\` FOREIGN KEY (\`eventId\`) REFERENCES \`event\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`event_requirements\` ADD CONSTRAINT \`FK_ad3c7e804aa8182ffa3a3943dae\` FOREIGN KEY (\`eventId\`) REFERENCES \`event\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`event\` ADD CONSTRAINT \`FK_3abacb54776ac9da25ca49c609f\` FOREIGN KEY (\`locationId\`) REFERENCES \`locations\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_4d7dd9fcc84b64206c7f58dde7e\` FOREIGN KEY (\`locationId\`) REFERENCES \`locations\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_7ed5659e7139fc8bc039198cc1f\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`businesses\` ADD CONSTRAINT \`FK_02e7bfb8e766e8e0ef449cc0f36\` FOREIGN KEY (\`ownerId\`) REFERENCES \`User\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`user_permissions\` ADD CONSTRAINT \`FK_cf38f85e52ee274ba9a01901ed2\` FOREIGN KEY (\`permissionId\`) REFERENCES \`Permission\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`user_permissions\` ADD CONSTRAINT \`FK_f05ccc7935f14874d7f89ba030f\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_b4599f8b8f548d35850afa2d12c\` FOREIGN KEY (\`roleId\`) REFERENCES \`Role\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_06792d0c62ce6b0203c03643cdd\` FOREIGN KEY (\`permissionId\`) REFERENCES \`Permission\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_86033897c009fcca8b6505d6be2\` FOREIGN KEY (\`roleId\`) REFERENCES \`Role\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_472b25323af01488f1f66a06b67\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`user_business_roles\` ADD CONSTRAINT \`FK_0f21661b9e351b6fa8b1b01956c\` FOREIGN KEY (\`businessId\`) REFERENCES \`businesses\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`user_business_roles\` ADD CONSTRAINT \`FK_003ee222764833734857cfb276c\` FOREIGN KEY (\`locationId\`) REFERENCES \`locations\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`user_business_roles\` ADD CONSTRAINT \`FK_da5fb1b59822f1728a890a66ea5\` FOREIGN KEY (\`roleId\`) REFERENCES \`Role\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`user_business_roles\` ADD CONSTRAINT \`FK_2c43d1b152431f260129ca502c9\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`password_reset_tokens\` ADD CONSTRAINT \`FK_d6a19d4b4f6c62dcd29daa497e2\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`location_managers\` ADD CONSTRAINT \`FK_7f87bd12ddd8830eefef6d6cb38\` FOREIGN KEY (\`locationId\`) REFERENCES \`locations\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`location_managers\` ADD CONSTRAINT \`FK_fd8ad8607863e11f9446beb6586\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_tokens\` ADD CONSTRAINT \`FK_610102b60fea1455310ccd299de\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`reservations\` ADD CONSTRAINT \`FK_c6fda79964e4d3a3e3f9843fbc1\` FOREIGN KEY (\`eventId\`) REFERENCES \`event\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`reservations\` ADD CONSTRAINT \`FK_555ed2106e52035c4a5ebddce41\` FOREIGN KEY (\`locationId\`) REFERENCES \`locations\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`reservations\` ADD CONSTRAINT \`FK_aa0e1cc2c4f54da32bf8282154c\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`schedules\` ADD CONSTRAINT \`FK_8357ac25b11be2be0b836a7f76b\` FOREIGN KEY (\`locationId\`) REFERENCES \`locations\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`locations\` ADD CONSTRAINT \`FK_33623320f11bfed9dd419e3806a\` FOREIGN KEY (\`businessId\`) REFERENCES \`businesses\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`locations\` ADD CONSTRAINT \`FK_0eb76d13e724b54c5b114728f6d\` FOREIGN KEY (\`ownerId\`) REFERENCES \`User\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`location_amenities\` ADD CONSTRAINT \`FK_bf6f58903294e8a73c48f4247a1\` FOREIGN KEY (\`amenityId\`) REFERENCES \`amenities\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`location_amenities\` ADD CONSTRAINT \`FK_5807bd97ffbb265d53d9eb3c0e0\` FOREIGN KEY (\`locationId\`) REFERENCES \`locations\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`location_amenities\` DROP FOREIGN KEY \`FK_5807bd97ffbb265d53d9eb3c0e0\``
    );
    await queryRunner.query(
      `ALTER TABLE \`location_amenities\` DROP FOREIGN KEY \`FK_bf6f58903294e8a73c48f4247a1\``
    );
    await queryRunner.query(
      `ALTER TABLE \`locations\` DROP FOREIGN KEY \`FK_0eb76d13e724b54c5b114728f6d\``
    );
    await queryRunner.query(
      `ALTER TABLE \`locations\` DROP FOREIGN KEY \`FK_33623320f11bfed9dd419e3806a\``
    );
    await queryRunner.query(
      `ALTER TABLE \`schedules\` DROP FOREIGN KEY \`FK_8357ac25b11be2be0b836a7f76b\``
    );
    await queryRunner.query(
      `ALTER TABLE \`reservations\` DROP FOREIGN KEY \`FK_aa0e1cc2c4f54da32bf8282154c\``
    );
    await queryRunner.query(
      `ALTER TABLE \`reservations\` DROP FOREIGN KEY \`FK_555ed2106e52035c4a5ebddce41\``
    );
    await queryRunner.query(
      `ALTER TABLE \`reservations\` DROP FOREIGN KEY \`FK_c6fda79964e4d3a3e3f9843fbc1\``
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_tokens\` DROP FOREIGN KEY \`FK_610102b60fea1455310ccd299de\``
    );
    await queryRunner.query(
      `ALTER TABLE \`location_managers\` DROP FOREIGN KEY \`FK_fd8ad8607863e11f9446beb6586\``
    );
    await queryRunner.query(
      `ALTER TABLE \`location_managers\` DROP FOREIGN KEY \`FK_7f87bd12ddd8830eefef6d6cb38\``
    );
    await queryRunner.query(
      `ALTER TABLE \`password_reset_tokens\` DROP FOREIGN KEY \`FK_d6a19d4b4f6c62dcd29daa497e2\``
    );
    await queryRunner.query(
      `ALTER TABLE \`user_business_roles\` DROP FOREIGN KEY \`FK_2c43d1b152431f260129ca502c9\``
    );
    await queryRunner.query(
      `ALTER TABLE \`user_business_roles\` DROP FOREIGN KEY \`FK_da5fb1b59822f1728a890a66ea5\``
    );
    await queryRunner.query(
      `ALTER TABLE \`user_business_roles\` DROP FOREIGN KEY \`FK_003ee222764833734857cfb276c\``
    );
    await queryRunner.query(
      `ALTER TABLE \`user_business_roles\` DROP FOREIGN KEY \`FK_0f21661b9e351b6fa8b1b01956c\``
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_472b25323af01488f1f66a06b67\``
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_86033897c009fcca8b6505d6be2\``
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_06792d0c62ce6b0203c03643cdd\``
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_b4599f8b8f548d35850afa2d12c\``
    );
    await queryRunner.query(
      `ALTER TABLE \`user_permissions\` DROP FOREIGN KEY \`FK_f05ccc7935f14874d7f89ba030f\``
    );
    await queryRunner.query(
      `ALTER TABLE \`user_permissions\` DROP FOREIGN KEY \`FK_cf38f85e52ee274ba9a01901ed2\``
    );
    await queryRunner.query(
      `ALTER TABLE \`businesses\` DROP FOREIGN KEY \`FK_02e7bfb8e766e8e0ef449cc0f36\``
    );
    await queryRunner.query(
      `ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_7ed5659e7139fc8bc039198cc1f\``
    );
    await queryRunner.query(
      `ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_4d7dd9fcc84b64206c7f58dde7e\``
    );
    await queryRunner.query(
      `ALTER TABLE \`event\` DROP FOREIGN KEY \`FK_3abacb54776ac9da25ca49c609f\``
    );
    await queryRunner.query(
      `ALTER TABLE \`event_requirements\` DROP FOREIGN KEY \`FK_ad3c7e804aa8182ffa3a3943dae\``
    );
    await queryRunner.query(
      `ALTER TABLE \`event_included_options\` DROP FOREIGN KEY \`FK_5dfad9dad5c3d8d997e6cdf4408\``
    );
    await queryRunner.query(
      `ALTER TABLE \`event_facilities\` DROP FOREIGN KEY \`FK_56989da9e175c6529b6304ea33c\``
    );
    await queryRunner.query(
      `ALTER TABLE \`event_facilities\` DROP FOREIGN KEY \`FK_6787625a055634d606f1a7066f3\``
    );
    await queryRunner.query(
      `ALTER TABLE \`location_facilities\` DROP FOREIGN KEY \`FK_7a2468c5de60f95fc9c1c307053\``
    );
    await queryRunner.query(
      `ALTER TABLE \`location_facilities\` DROP FOREIGN KEY \`FK_5dbf718a72e879502bf473c0bab\``
    );
    await queryRunner.query(
      `ALTER TABLE \`offers\` DROP FOREIGN KEY \`FK_a1f2fa9f71c5f5035126be337a5\``
    );
    await queryRunner.query(
      `ALTER TABLE \`offers\` DROP FOREIGN KEY \`FK_be9924237a352f6e10375154edd\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_b4599f8b8f548d35850afa2d12\` ON \`role_permissions\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_06792d0c62ce6b0203c03643cd\` ON \`role_permissions\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_4a217eba52e13118082a3aa5c3\` ON \`verification_codes\``
    );
    await queryRunner.query(
      `DROP INDEX \`verification_codes_contact_key\` ON \`verification_codes\``
    );
    await queryRunner.query(`DROP TABLE \`verification_codes\``);
    await queryRunner.query(
      `DROP INDEX \`media_modelType_modelId_idx\` ON \`media\``
    );
    await queryRunner.query(`DROP TABLE \`media\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_8c5f9c7ff7e2174b53d4be1024\` ON \`amenities\``
    );
    await queryRunner.query(
      `DROP INDEX \`amenities_name_key\` ON \`amenities\``
    );
    await queryRunner.query(
      `DROP INDEX \`amenities_name_idx\` ON \`amenities\``
    );
    await queryRunner.query(`DROP TABLE \`amenities\``);
    await queryRunner.query(
      `DROP INDEX \`location_amenities_locationId_amenityId_key\` ON \`location_amenities\``
    );
    await queryRunner.query(
      `DROP INDEX \`location_amenities_amenityId_idx\` ON \`location_amenities\``
    );
    await queryRunner.query(
      `DROP INDEX \`location_amenities_locationId_idx\` ON \`location_amenities\``
    );
    await queryRunner.query(`DROP TABLE \`location_amenities\``);
    await queryRunner.query(
      `DROP INDEX \`locations_name_businessId_key\` ON \`locations\``
    );
    await queryRunner.query(
      `DROP INDEX \`locations_businessId_idx\` ON \`locations\``
    );
    await queryRunner.query(
      `DROP INDEX \`locations_ownerId_idx\` ON \`locations\``
    );
    await queryRunner.query(`DROP TABLE \`locations\``);
    await queryRunner.query(
      `DROP INDEX \`schedules_locationId_idx\` ON \`schedules\``
    );
    await queryRunner.query(`DROP TABLE \`schedules\``);
    await queryRunner.query(
      `DROP INDEX \`reservations_userId_idx\` ON \`reservations\``
    );
    await queryRunner.query(
      `DROP INDEX \`reservations_eventId_idx\` ON \`reservations\``
    );
    await queryRunner.query(
      `DROP INDEX \`reservations_locationId_idx\` ON \`reservations\``
    );
    await queryRunner.query(`DROP TABLE \`reservations\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_1f5c894f79cd0159ff4e1a4450\` ON \`User\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_4a257d2c9837248d70640b3e36\` ON \`User\``
    );
    await queryRunner.query(`DROP INDEX \`User_email_key\` ON \`User\``);
    await queryRunner.query(`DROP INDEX \`User_phone_key\` ON \`User\``);
    await queryRunner.query(`DROP TABLE \`User\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_4542dd2f38a61354a040ba9fd5\` ON \`refresh_tokens\``
    );
    await queryRunner.query(
      `DROP INDEX \`refresh_tokens_token_key\` ON \`refresh_tokens\``
    );
    await queryRunner.query(
      `DROP INDEX \`refresh_tokens_userId_fkey\` ON \`refresh_tokens\``
    );
    await queryRunner.query(`DROP TABLE \`refresh_tokens\``);
    await queryRunner.query(
      `DROP INDEX \`location_managers_userId_locationId_key\` ON \`location_managers\``
    );
    await queryRunner.query(
      `DROP INDEX \`location_managers_locationId_idx\` ON \`location_managers\``
    );
    await queryRunner.query(
      `DROP INDEX \`location_managers_userId_idx\` ON \`location_managers\``
    );
    await queryRunner.query(`DROP TABLE \`location_managers\``);
    await queryRunner.query(
      `DROP INDEX \`REL_d6a19d4b4f6c62dcd29daa497e\` ON \`password_reset_tokens\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_d6a19d4b4f6c62dcd29daa497e\` ON \`password_reset_tokens\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_ab673f0e63eac966762155508e\` ON \`password_reset_tokens\``
    );
    await queryRunner.query(
      `DROP INDEX \`password_reset_tokens_token_key\` ON \`password_reset_tokens\``
    );
    await queryRunner.query(
      `DROP INDEX \`password_reset_tokens_userId_key\` ON \`password_reset_tokens\``
    );
    await queryRunner.query(`DROP TABLE \`password_reset_tokens\``);
    await queryRunner.query(
      `DROP INDEX \`user_business_roles_userId_businessId_locationId_key\` ON \`user_business_roles\``
    );
    await queryRunner.query(
      `DROP INDEX \`user_business_roles_userId_idx\` ON \`user_business_roles\``
    );
    await queryRunner.query(
      `DROP INDEX \`user_business_roles_businessId_idx\` ON \`user_business_roles\``
    );
    await queryRunner.query(
      `DROP INDEX \`user_business_roles_locationId_idx\` ON \`user_business_roles\``
    );
    await queryRunner.query(
      `DROP INDEX \`user_business_roles_roleId_idx\` ON \`user_business_roles\``
    );
    await queryRunner.query(`DROP TABLE \`user_business_roles\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_b852abd9e268a63287bc815aab\` ON \`Role\``
    );
    await queryRunner.query(`DROP INDEX \`Role_name_key\` ON \`Role\``);
    await queryRunner.query(`DROP TABLE \`Role\``);
    await queryRunner.query(
      `DROP INDEX \`user_roles_roleId_fkey\` ON \`user_roles\``
    );
    await queryRunner.query(`DROP TABLE \`user_roles\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_a99587dcc7fa748b044eb5a90e\` ON \`Permission\``
    );
    await queryRunner.query(
      `DROP INDEX \`Permission_name_key\` ON \`Permission\``
    );
    await queryRunner.query(`DROP TABLE \`Permission\``);
    await queryRunner.query(
      `DROP INDEX \`role_permissions_permissionId_fkey\` ON \`role_permissions\``
    );
    await queryRunner.query(`DROP TABLE \`role_permissions\``);
    await queryRunner.query(
      `DROP INDEX \`user_permissions_permissionId_fkey\` ON \`user_permissions\``
    );
    await queryRunner.query(`DROP TABLE \`user_permissions\``);
    await queryRunner.query(
      `DROP INDEX \`businesses_name_ownerId_key\` ON \`businesses\``
    );
    await queryRunner.query(
      `DROP INDEX \`businesses_ownerId_idx\` ON \`businesses\``
    );
    await queryRunner.query(
      `DROP INDEX \`businesses_name_idx\` ON \`businesses\``
    );
    await queryRunner.query(`DROP TABLE \`businesses\``);
    await queryRunner.query(
      `DROP INDEX \`reviews_userId_locationId_key\` ON \`reviews\``
    );
    await queryRunner.query(`DROP INDEX \`reviews_userId_idx\` ON \`reviews\``);
    await queryRunner.query(
      `DROP INDEX \`reviews_locationId_idx\` ON \`reviews\``
    );
    await queryRunner.query(`DROP TABLE \`reviews\``);
    await queryRunner.query(
      `DROP INDEX \`event_locationId_fkey\` ON \`event\``
    );
    await queryRunner.query(`DROP TABLE \`event\``);
    await queryRunner.query(
      `DROP INDEX \`event_requirements_eventId_fkey\` ON \`event_requirements\``
    );
    await queryRunner.query(`DROP TABLE \`event_requirements\``);
    await queryRunner.query(
      `DROP INDEX \`event_included_options_eventId_fkey\` ON \`event_included_options\``
    );
    await queryRunner.query(`DROP TABLE \`event_included_options\``);
    await queryRunner.query(
      `DROP INDEX \`event_facilities_facilityId_fkey\` ON \`event_facilities\``
    );
    await queryRunner.query(`DROP TABLE \`event_facilities\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_06bcfef94e04a223a5c4692193\` ON \`facilities\``
    );
    await queryRunner.query(
      `DROP INDEX \`facilities_name_key\` ON \`facilities\``
    );
    await queryRunner.query(
      `DROP INDEX \`facilities_name_idx\` ON \`facilities\``
    );
    await queryRunner.query(`DROP TABLE \`facilities\``);
    await queryRunner.query(
      `DROP INDEX \`location_facilities_facilityId_locationId_key\` ON \`location_facilities\``
    );
    await queryRunner.query(
      `DROP INDEX \`location_facilities_facilityId_idx\` ON \`location_facilities\``
    );
    await queryRunner.query(
      `DROP INDEX \`location_facilities_locationId_idx\` ON \`location_facilities\``
    );
    await queryRunner.query(`DROP TABLE \`location_facilities\``);
    await queryRunner.query(
      `DROP INDEX \`offers_locationId_idx\` ON \`offers\``
    );
    await queryRunner.query(
      `DROP INDEX \`offers_categoryId_idx\` ON \`offers\``
    );
    await queryRunner.query(`DROP TABLE \`offers\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_39aa831b9f7ccd805ad0d08860\` ON \`offer_categories\``
    );
    await queryRunner.query(
      `DROP INDEX \`offer_categories_name_key\` ON \`offer_categories\``
    );
    await queryRunner.query(
      `DROP INDEX \`offer_categories_name_idx\` ON \`offer_categories\``
    );
    await queryRunner.query(`DROP TABLE \`offer_categories\``);
  }
}

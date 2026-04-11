/*
  Warnings:

  - A unique constraint covering the columns `[verification_token]` on the table `sites` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `campaigns_advertiser_id_fkey` ON `campaigns`;

-- DropIndex
DROP INDEX `creatives_campaign_id_fkey` ON `creatives`;

-- DropIndex
DROP INDEX `payments_processed_by_fkey` ON `payments`;

-- DropIndex
DROP INDEX `sites_publisher_id_fkey` ON `sites`;

-- DropIndex
DROP INDEX `ticket_messages_sender_id_fkey` ON `ticket_messages`;

-- DropIndex
DROP INDEX `zones_site_id_fkey` ON `zones`;

-- AlterTable
ALTER TABLE `campaigns` ADD COLUMN `auto_optimize` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `cpa_goal` DECIMAL(10, 2) NULL,
    ADD COLUMN `freq_cap` INTEGER NOT NULL DEFAULT 3,
    ADD COLUMN `freq_interval` INTEGER NOT NULL DEFAULT 24,
    ADD COLUMN `pacing` VARCHAR(191) NULL DEFAULT 'EVEN',
    ADD COLUMN `postback_url` TEXT NULL,
    ADD COLUMN `schedule` JSON NULL,
    ADD COLUMN `total_conversions` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `creatives` ADD COLUMN `label` VARCHAR(191) NULL,
    ADD COLUMN `weight` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `sites` ADD COLUMN `ads_txt_verified_at` DATETIME(3) NULL,
    ADD COLUMN `verification_method` VARCHAR(191) NULL,
    ADD COLUMN `verification_token` VARCHAR(191) NULL,
    ADD COLUMN `verified_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `two_factor_backup_codes` JSON NULL,
    ADD COLUMN `two_factor_enabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `two_factor_secret` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `conversions` (
    `id` VARCHAR(191) NOT NULL,
    `impression_id` VARCHAR(191) NOT NULL,
    `campaign_id` VARCHAR(191) NOT NULL,
    `ip` VARCHAR(191) NULL,
    `user_agent` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `conversions_impression_id_key`(`impression_id`),
    INDEX `conversions_campaign_id_idx`(`campaign_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `geo_floors` (
    `id` VARCHAR(191) NOT NULL,
    `country_code` VARCHAR(2) NOT NULL,
    `ad_format` VARCHAR(20) NOT NULL,
    `min_bid` DECIMAL(10, 4) NOT NULL DEFAULT 0,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `geo_floors_country_code_idx`(`country_code`),
    UNIQUE INDEX `geo_floors_country_code_ad_format_key`(`country_code`, `ad_format`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `sites_verification_token_key` ON `sites`(`verification_token`);

-- AddForeignKey
ALTER TABLE `publishers` ADD CONSTRAINT `publishers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sites` ADD CONSTRAINT `sites_publisher_id_fkey` FOREIGN KEY (`publisher_id`) REFERENCES `publishers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `zones` ADD CONSTRAINT `zones_site_id_fkey` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advertisers` ADD CONSTRAINT `advertisers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaigns` ADD CONSTRAINT `campaigns_advertiser_id_fkey` FOREIGN KEY (`advertiser_id`) REFERENCES `advertisers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `creatives` ADD CONSTRAINT `creatives_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `backfill_impressions` ADD CONSTRAINT `backfill_impressions_zone_id_fkey` FOREIGN KEY (`zone_id`) REFERENCES `zones`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `impressions` ADD CONSTRAINT `impressions_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `impressions` ADD CONSTRAINT `impressions_zone_id_fkey` FOREIGN KEY (`zone_id`) REFERENCES `zones`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversions` ADD CONSTRAINT `conversions_impression_id_fkey` FOREIGN KEY (`impression_id`) REFERENCES `impressions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversions` ADD CONSTRAINT `conversions_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_processed_by_fkey` FOREIGN KEY (`processed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_payment_methods` ADD CONSTRAINT `user_payment_methods_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_tickets` ADD CONSTRAINT `support_tickets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_messages` ADD CONSTRAINT `ticket_messages_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_messages` ADD CONSTRAINT `ticket_messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referrer_id_fkey` FOREIGN KEY (`referrer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referred_id_fkey` FOREIGN KEY (`referred_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

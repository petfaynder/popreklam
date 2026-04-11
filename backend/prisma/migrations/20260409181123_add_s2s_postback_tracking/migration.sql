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
ALTER TABLE `campaigns` ADD COLUMN `postback_goals` JSON NULL,
    ADD COLUMN `postback_secret_token` VARCHAR(64) NULL;

-- AlterTable
ALTER TABLE `conversions` ADD COLUMN `goal` VARCHAR(100) NULL,
    ADD COLUMN `payout` DECIMAL(10, 2) NULL,
    ADD COLUMN `postback_raw` JSON NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'CONFIRMED',
    ADD COLUMN `tracking_method` VARCHAR(191) NOT NULL DEFAULT 'PIXEL',
    MODIFY `impression_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `postback_logs` (
    `id` VARCHAR(191) NOT NULL,
    `campaign_id` VARCHAR(191) NULL,
    `click_id` VARCHAR(191) NULL,
    `raw_query` TEXT NOT NULL,
    `ip` VARCHAR(45) NULL,
    `status` VARCHAR(30) NOT NULL,
    `error_msg` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `postback_logs_campaign_id_idx`(`campaign_id`),
    INDEX `postback_logs_click_id_idx`(`click_id`),
    INDEX `postback_logs_status_idx`(`status`),
    INDEX `postback_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `conversions_tracking_method_idx` ON `conversions`(`tracking_method`);

-- CreateIndex
CREATE INDEX `conversions_status_idx` ON `conversions`(`status`);

-- CreateIndex
CREATE INDEX `conversions_created_at_idx` ON `conversions`(`created_at`);

-- AddForeignKey
ALTER TABLE `publishers` ADD CONSTRAINT `publishers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sites` ADD CONSTRAINT `sites_publisher_id_fkey` FOREIGN KEY (`publisher_id`) REFERENCES `publishers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `zones` ADD CONSTRAINT `zones_site_id_fkey` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advertisers` ADD CONSTRAINT `advertisers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audiences` ADD CONSTRAINT `audiences_advertiser_id_fkey` FOREIGN KEY (`advertiser_id`) REFERENCES `advertisers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advertiser_tier_history` ADD CONSTRAINT `advertiser_tier_history_advertiser_id_fkey` FOREIGN KEY (`advertiser_id`) REFERENCES `advertisers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE `conversions` ADD CONSTRAINT `conversions_impression_id_fkey` FOREIGN KEY (`impression_id`) REFERENCES `impressions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE `push_subscriptions` ADD CONSTRAINT `push_subscriptions_site_id_fkey` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `push_deliveries` ADD CONSTRAINT `push_deliveries_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `push_deliveries` ADD CONSTRAINT `push_deliveries_subscription_id_fkey` FOREIGN KEY (`subscription_id`) REFERENCES `push_subscriptions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

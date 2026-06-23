ALTER TABLE `listings` ADD `price_unit` text DEFAULT 'stack' NOT NULL;--> statement-breakpoint
ALTER TABLE `listings` ADD `price_per_count` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `order_items` ADD `price_unit` text DEFAULT 'stack' NOT NULL;--> statement-breakpoint
ALTER TABLE `order_items` ADD `price_per_count` integer DEFAULT 1 NOT NULL;

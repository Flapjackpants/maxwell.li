CREATE TABLE `shop_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`store_open` integer DEFAULT true NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);

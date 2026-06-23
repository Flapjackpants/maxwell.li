PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` text NOT NULL,
	`listing_id` integer,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`quantity` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_order_items`("id", "order_id", "listing_id", "name", "price", "quantity") SELECT "id", "order_id", "listing_id", "name", "price", "quantity" FROM `order_items`;--> statement-breakpoint
DROP TABLE `order_items`;--> statement-breakpoint
ALTER TABLE `__new_order_items` RENAME TO `order_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`status` text DEFAULT 'gathering_materials' NOT NULL,
	`fulfillment_type` text NOT NULL,
	`delivery_fee` integer DEFAULT 0 NOT NULL,
	`delivery_x` integer,
	`delivery_y` integer,
	`delivery_z` integer,
	`delivery_dimension` text,
	`pickup_location` text,
	`total` integer NOT NULL,
	`dm_failed` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_orders`("id", "user_id", "status", "fulfillment_type", "delivery_fee", "delivery_x", "delivery_y", "delivery_z", "delivery_dimension", "pickup_location", "total", "dm_failed", "created_at", "updated_at") SELECT "id", "user_id", "status", "fulfillment_type", "delivery_fee", "delivery_x", "delivery_y", "delivery_z", "delivery_dimension", "pickup_location", "total", "dm_failed", "created_at", "updated_at" FROM `orders`;--> statement-breakpoint
DROP TABLE `orders`;--> statement-breakpoint
ALTER TABLE `__new_orders` RENAME TO `orders`;
import type { FulfillmentType, OrderStatus } from "./order-status";
import type { MinecraftDimension } from "./constants";

export type Listing = {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItem = {
  id: number;
  orderId: string;
  listingId: number;
  name: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  userId: number;
  status: OrderStatus;
  fulfillmentType: FulfillmentType;
  deliveryFee: number;
  deliveryX: number | null;
  deliveryY: number | null;
  deliveryZ: number | null;
  deliveryDimension: MinecraftDimension | null;
  pickupLocation: string | null;
  total: number;
  dmFailed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderWithDetails = Order & {
  items: OrderItem[];
  buyerUsername: string;
};

export type CartItem = {
  listingId: number;
  quantity: number;
};

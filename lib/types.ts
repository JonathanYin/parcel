export const categories = [
  "Electronics",
  "Food",
  "Accessories",
  "Clothing",
  "Home",
  "Gaming",
  "Books",
  "Beauty",
  "Outdoors",
] as const;

export type Category = (typeof categories)[number];

export type Product = {
  id: string;
  name: string;
  category: Category;
  brand: string;
  price: number;
  rating: number;
  reviewCount: number;
  inventory: number;
  deliveryDays: number;
  description: string;
  highlights: string[];
  emoji: string;
  gradient: string;
  imageSrc: string;
  badge?: string;
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type OrderItem = CartItem & {
  product: Pick<Product, "id" | "name" | "category" | "brand" | "price" | "emoji" | "imageSrc">;
};

export type ShippingAddress = {
  fullName: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zip: string;
};

export type TrackingStatus =
  | "Order placed"
  | "Preparing shipment"
  | "Shipped"
  | "Out for delivery"
  | "Delivered";

export type TrackingEvent = {
  status: TrackingStatus;
  location: string;
  timestamp: string;
  complete: boolean;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  orderId?: string;
};

export type Order = {
  orderId: string;
  createdAt: string;
  estimatedDeliveryDate: string;
  items: OrderItem[];
  total: number;
  shippingAddress: ShippingAddress;
  trackingStatus: TrackingStatus;
  trackingStep: number;
  trackingNumber: string;
  carrier: string;
};

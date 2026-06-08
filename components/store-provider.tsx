"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { CartItem, Order, ShippingAddress, TrackingStatus } from "@/lib/types";
import { calculatePricing } from "@/lib/pricing";

type StoreContextValue = {
  cart: CartItem[];
  orders: Order[];
  recentlyViewed: string[];
  hydrated: boolean;
  addToCart: (productId: string, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  createOrder: (address: ShippingAddress) => Order;
  progressOrder: (orderId: string) => void;
  markViewed: (productId: string) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);
const CART_KEY = "parcel-cart";
const ORDERS_KEY = "parcel-orders";
const RECENT_KEY = "parcel-recent";
const trackingStatuses: TrackingStatus[] = [
  "Order placed",
  "Preparing shipment",
  "Shipped",
  "Out for delivery",
  "Delivered",
];

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Keep the in-memory experience working when storage is unavailable.
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCart(readStorage(CART_KEY, []));
      setOrders(readStorage(ORDERS_KEY, []));
      setRecentlyViewed(readStorage(RECENT_KEY, []));
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated) writeStorage(CART_KEY, cart);
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) writeStorage(ORDERS_KEY, orders);
  }, [orders, hydrated]);

  useEffect(() => {
    if (hydrated) writeStorage(RECENT_KEY, recentlyViewed);
  }, [recentlyViewed, hydrated]);

  const addToCart = (productId: string, quantity = 1) =>
    setCart((current) => {
      const found = current.find((item) => item.productId === productId);
      return found
        ? current.map((item) =>
            item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item,
          )
        : [...current, { productId, quantity }];
    });

  const updateQuantity = (productId: string, quantity: number) =>
    setCart((current) =>
      quantity < 1
        ? current.filter((item) => item.productId !== productId)
        : current.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
    );

  const removeFromCart = (productId: string) =>
    setCart((current) => current.filter((item) => item.productId !== productId));

  const createOrder = (shippingAddress: ShippingAddress) => {
    const createdAt = new Date();
    const delivery = new Date(createdAt);
    delivery.setDate(delivery.getDate() + 4);
    const order: Order = {
      orderId: `PCL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      createdAt: createdAt.toISOString(),
      estimatedDeliveryDate: delivery.toISOString(),
      items: cart.map((item) => ({ ...item })),
      total: calculatePricing(cart).total,
      shippingAddress,
      trackingStatus: "Order placed",
      trackingStep: 0,
      trackingNumber: `PKG${crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`,
      carrier: "Parcel Express",
    };
    setOrders((current) => [order, ...current]);
    setCart([]);
    return order;
  };

  const progressOrder = (orderId: string) =>
    setOrders((current) =>
      current.map((order) => {
        if (order.orderId !== orderId) return order;
        const trackingStep = Math.min(order.trackingStep + 1, trackingStatuses.length - 1);
        return { ...order, trackingStep, trackingStatus: trackingStatuses[trackingStep] };
      }),
    );

  const markViewed = useCallback(
    (productId: string) =>
      setRecentlyViewed((current) =>
        [productId, ...current.filter((id) => id !== productId)].slice(0, 8),
      ),
    [],
  );

  return (
    <StoreContext.Provider
      value={{
        cart,
        orders,
        recentlyViewed,
        hydrated,
        addToCart,
        updateQuantity,
        removeFromCart,
        createOrder,
        progressOrder,
        markViewed,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}

"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { CartItem, Notification, Order, ShippingAddress, TrackingStatus } from "@/lib/types";
import { calculatePricing } from "@/lib/pricing";

type StoreContextValue = {
  cart: CartItem[];
  orders: Order[];
  recentlyViewed: string[];
  notifications: Notification[];
  unreadCount: number;
  savedShippingAddress: ShippingAddress | null;
  hydrated: boolean;
  addToCart: (productId: string, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  createOrder: (address: ShippingAddress) => Order;
  progressOrder: (orderId: string) => void;
  markViewed: (productId: string) => void;
  markNotificationsRead: () => void;
  saveShippingAddress: (address: ShippingAddress | null) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);
const CART_KEY = "parcel-cart";
const ORDERS_KEY = "parcel-orders";
const RECENT_KEY = "parcel-recent";
const NOTIFICATIONS_KEY = "parcel-notifications";
const SAVED_ADDRESS_KEY = "parcel-saved-shipping-address";
const TRACKING_STEP_MS = 30_000;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [savedShippingAddress, setSavedShippingAddressState] =
    useState<ShippingAddress | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCart(readStorage(CART_KEY, []));
      setOrders(readStorage(ORDERS_KEY, []));
      setRecentlyViewed(readStorage(RECENT_KEY, []));
      setNotifications(readStorage(NOTIFICATIONS_KEY, []));
      setSavedShippingAddressState(readStorage(SAVED_ADDRESS_KEY, null));
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

  useEffect(() => {
    if (hydrated) writeStorage(NOTIFICATIONS_KEY, notifications);
  }, [notifications, hydrated]);

  useEffect(() => {
    if (hydrated) writeStorage(SAVED_ADDRESS_KEY, savedShippingAddress);
  }, [savedShippingAddress, hydrated]);

  const addTrackingNotification = useCallback((orderId: string, step: number) => {
    const status = trackingStatuses[step];
    const id = `${orderId}-${step}`;
    setNotifications((current) =>
      current.some((notification) => notification.id === id)
        ? current
        : [
            {
              id,
              title: status,
              message:
                step === 4
                  ? `Order ${orderId} has been delivered.`
                  : `Order ${orderId} is now ${status.toLowerCase()}.`,
              createdAt: new Date().toISOString(),
              read: false,
              orderId,
            },
            ...current,
          ],
    );
  }, []);

  const syncAutomaticTracking = useCallback(() => {
    const now = Date.now();
    let changed = false;
    const updatedOrders = orders.map((order) => {
        const elapsedStep = Math.min(
          Math.floor((now - new Date(order.createdAt).getTime()) / TRACKING_STEP_MS),
          trackingStatuses.length - 1,
        );
        if (elapsedStep <= order.trackingStep) return order;
        changed = true;
        addTrackingNotification(order.orderId, elapsedStep);
        return {
          ...order,
          trackingStep: elapsedStep,
          trackingStatus: trackingStatuses[elapsedStep],
        };
      });
    if (changed) setOrders(updatedOrders);
  }, [addTrackingNotification, orders]);

  useEffect(() => {
    if (!hydrated) return;
    const initialTimer = window.setTimeout(syncAutomaticTracking, 0);
    const timer = window.setInterval(syncAutomaticTracking, 10_000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [hydrated, syncAutomaticTracking]);

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
    setNotifications((current) => [
      {
        id: `${order.orderId}-0`,
        title: "Order confirmed",
        message: `Order ${order.orderId} has been received.`,
        createdAt: createdAt.toISOString(),
        read: false,
        orderId: order.orderId,
      },
      ...current,
    ]);
    setCart([]);
    return order;
  };

  const progressOrder = (orderId: string) => {
    const order = orders.find((item) => item.orderId === orderId);
    if (!order) return;
    const trackingStep = Math.min(order.trackingStep + 1, trackingStatuses.length - 1);
    addTrackingNotification(order.orderId, trackingStep);
    setOrders((current) =>
      current.map((item) =>
        item.orderId === orderId
          ? { ...item, trackingStep, trackingStatus: trackingStatuses[trackingStep] }
          : item,
      ),
    );
  };

  const markViewed = useCallback(
    (productId: string) =>
      setRecentlyViewed((current) =>
        [productId, ...current.filter((id) => id !== productId)].slice(0, 8),
      ),
    [],
  );

  const markNotificationsRead = () =>
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));

  const saveShippingAddress = (address: ShippingAddress | null) => {
    setSavedShippingAddressState(address);
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        orders,
        recentlyViewed,
        notifications,
        unreadCount: notifications.filter((notification) => !notification.read).length,
        savedShippingAddress,
        hydrated,
        addToCart,
        updateQuantity,
        removeFromCart,
        createOrder,
        progressOrder,
        markViewed,
        markNotificationsRead,
        saveShippingAddress,
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

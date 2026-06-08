"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CartItem, categories, Notification, Order, OrderItem, ShippingAddress, TrackingStatus } from "@/lib/types";
import { calculatePricing } from "@/lib/pricing";
import { getProduct, resolveProductId } from "@/lib/products";
import { isRecord, readVersionedStorage, writeVersionedStorage } from "@/lib/storage";

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

function normalizeCartItems(value: unknown) {
  const merged = new Map<string, number>();

  if (!Array.isArray(value)) return [];
  for (const item of value) {
    if (!isRecord(item) || typeof item.productId !== "string" || typeof item.quantity !== "number") {
      continue;
    }
    const productId = resolveProductId(item.productId);
    const quantity = Math.floor(item.quantity);
    if (!Number.isFinite(quantity)) continue;
    if (!getProduct(productId) || quantity < 1) continue;
    merged.set(productId, (merged.get(productId) ?? 0) + quantity);
  }

  return Array.from(merged, ([productId, quantity]) => ({ productId, quantity }));
}

function snapshotOrderItem(item: CartItem): OrderItem | null {
  const product = getProduct(item.productId);
  if (!product) return null;
  return {
    ...item,
    product: {
      id: product.id,
      name: product.name,
      category: product.category,
      brand: product.brand,
      price: product.price,
      emoji: product.emoji,
      imageSrc: product.imageSrc,
    },
  };
}

function normalizeOrderItems(value: unknown): OrderItem[] {
  if (!Array.isArray(value)) return [];
  const merged = new Map<string, OrderItem>();

  for (const candidate of value) {
    if (
      !isRecord(candidate) ||
      typeof candidate.productId !== "string" ||
      typeof candidate.quantity !== "number"
    ) {
      continue;
    }

    const productId = resolveProductId(candidate.productId);
    const quantity = Math.floor(candidate.quantity);
    if (!Number.isFinite(quantity) || quantity < 1) continue;

    let normalizedItem: OrderItem | null = null;
    if (isRecord(candidate.product)) {
      const product = candidate.product;
      if (
        typeof product.id === "string" &&
        typeof product.name === "string" &&
        categories.includes(product.category as (typeof categories)[number]) &&
        typeof product.brand === "string" &&
        typeof product.price === "number" &&
        Number.isFinite(product.price) &&
        product.price >= 0 &&
        typeof product.emoji === "string" &&
        typeof product.imageSrc === "string"
      ) {
        normalizedItem = {
          productId,
          quantity,
          product: { ...product, id: productId } as OrderItem["product"],
        };
      }
    }

    normalizedItem ??= snapshotOrderItem({ productId, quantity });
    if (!normalizedItem) continue;

    const existing = merged.get(productId);
    merged.set(
      productId,
      existing ? { ...existing, quantity: existing.quantity + normalizedItem.quantity } : normalizedItem,
    );
  }

  return Array.from(merged.values());
}

function normalizeOrders(value: unknown): Order[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((candidate) => {
    if (
      !isRecord(candidate) ||
      typeof candidate.orderId !== "string" ||
      typeof candidate.createdAt !== "string" ||
      !isValidDate(candidate.createdAt) ||
      typeof candidate.estimatedDeliveryDate !== "string" ||
      !isValidDate(candidate.estimatedDeliveryDate) ||
      typeof candidate.total !== "number" ||
      !Number.isFinite(candidate.total) ||
      candidate.total < 0 ||
      !normalizeShippingAddress(candidate.shippingAddress) ||
      typeof candidate.trackingStep !== "number" ||
      !Number.isInteger(candidate.trackingStep) ||
      candidate.trackingStep < 0 ||
      candidate.trackingStep >= trackingStatuses.length ||
      typeof candidate.trackingNumber !== "string" ||
      typeof candidate.carrier !== "string"
    ) {
      return [];
    }

    const items = normalizeOrderItems(candidate.items);
    if (!items.length) return [];

    return [{
      ...candidate,
      shippingAddress: normalizeShippingAddress(candidate.shippingAddress),
      trackingStatus: trackingStatuses[candidate.trackingStep],
      items,
    } as Order];
  });
}

function normalizeStringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map(resolveProductId)
    .filter((id, index, items) => Boolean(getProduct(id)) && items.indexOf(id) === index)
    .slice(0, 8);
}

function normalizeNotifications(value: unknown): Notification[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Notification =>
    isRecord(item) &&
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.message === "string" &&
    typeof item.createdAt === "string" &&
    isValidDate(item.createdAt) &&
    typeof item.read === "boolean",
  );
}

function normalizeShippingAddress(value: unknown): ShippingAddress | null {
  if (!isRecord(value)) return null;
  const keys: (keyof ShippingAddress)[] = ["fullName", "email", "street", "city", "state", "zip"];
  if (!keys.every((key) => typeof value[key] === "string")) return null;
  return value as ShippingAddress;
}

function isValidDate(value: string) {
  return Number.isFinite(Date.parse(value));
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [savedShippingAddress, setSavedShippingAddressState] =
    useState<ShippingAddress | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const readOnlyStorageKeys = useRef(new Set<string>());

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const cartResult = readVersionedStorage(CART_KEY, [], normalizeCartItems);
      const ordersResult = readVersionedStorage(ORDERS_KEY, [], normalizeOrders);
      const recentResult = readVersionedStorage(RECENT_KEY, [], normalizeStringList);
      const notificationsResult = readVersionedStorage(NOTIFICATIONS_KEY, [], normalizeNotifications);
      const addressResult = readVersionedStorage(SAVED_ADDRESS_KEY, null, normalizeShippingAddress);
      if (!cartResult.writable) readOnlyStorageKeys.current.add(CART_KEY);
      if (!ordersResult.writable) readOnlyStorageKeys.current.add(ORDERS_KEY);
      if (!recentResult.writable) readOnlyStorageKeys.current.add(RECENT_KEY);
      if (!notificationsResult.writable) readOnlyStorageKeys.current.add(NOTIFICATIONS_KEY);
      if (!addressResult.writable) readOnlyStorageKeys.current.add(SAVED_ADDRESS_KEY);
      setCart(cartResult.data);
      setOrders(ordersResult.data);
      setRecentlyViewed(recentResult.data);
      setNotifications(notificationsResult.data);
      setSavedShippingAddressState(addressResult.data);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated && !readOnlyStorageKeys.current.has(CART_KEY)) writeVersionedStorage(CART_KEY, cart);
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated && !readOnlyStorageKeys.current.has(ORDERS_KEY)) writeVersionedStorage(ORDERS_KEY, orders);
  }, [orders, hydrated]);

  useEffect(() => {
    if (hydrated && !readOnlyStorageKeys.current.has(RECENT_KEY)) writeVersionedStorage(RECENT_KEY, recentlyViewed);
  }, [recentlyViewed, hydrated]);

  useEffect(() => {
    if (hydrated && !readOnlyStorageKeys.current.has(NOTIFICATIONS_KEY)) writeVersionedStorage(NOTIFICATIONS_KEY, notifications);
  }, [notifications, hydrated]);

  useEffect(() => {
    if (hydrated && !readOnlyStorageKeys.current.has(SAVED_ADDRESS_KEY)) writeVersionedStorage(SAVED_ADDRESS_KEY, savedShippingAddress);
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
      const resolvedProductId = resolveProductId(productId);
      const found = current.find((item) => item.productId === resolvedProductId);
      return found
        ? current.map((item) =>
            item.productId === resolvedProductId
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        : [...current, { productId: resolvedProductId, quantity }];
    });

  const updateQuantity = (productId: string, quantity: number) =>
    setCart((current) => {
      const resolvedProductId = resolveProductId(productId);
      return quantity < 1
        ? current.filter((item) => item.productId !== resolvedProductId)
        : current.map((item) =>
            item.productId === resolvedProductId ? { ...item, quantity } : item,
          );
    });

  const removeFromCart = (productId: string) =>
    setCart((current) => {
      const resolvedProductId = resolveProductId(productId);
      return current.filter((item) => item.productId !== resolvedProductId);
    });

  const createOrder = (shippingAddress: ShippingAddress) => {
    const createdAt = new Date();
    const delivery = new Date(createdAt);
    delivery.setDate(delivery.getDate() + 4);
    const order: Order = {
      orderId: `PCL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      createdAt: createdAt.toISOString(),
      estimatedDeliveryDate: delivery.toISOString(),
      items: cart.map(snapshotOrderItem).filter((item): item is OrderItem => item !== null),
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
        [
          resolveProductId(productId),
          ...current.filter((id) => resolveProductId(id) !== resolveProductId(productId)),
        ].slice(0, 8),
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

"use client";

import Link from "next/link";
import { CartItem as CartItemType } from "@/lib/types";
import { formatMoney, getProduct } from "@/lib/products";
import { ProductVisual } from "./product-visual";
import { useStore } from "./store-provider";

export function CartItem({ item }: { item: CartItemType }) {
  const product = getProduct(item.productId);
  const { updateQuantity, removeFromCart } = useStore();
  if (!product) return null;
  return (
    <div className="grid grid-cols-[110px_1fr] gap-4 border-b border-slate-200 py-5 last:border-0 sm:grid-cols-[150px_1fr]">
      <Link href={`/product/${product.id}`} className="group"><ProductVisual product={product} /></Link>
      <div>
        <Link href={`/product/${product.id}`} className="text-lg font-black hover:text-blue-700">{product.name}</Link>
        <p className="mt-1 text-xs font-bold text-emerald-700">{product.brand} · {product.inventory} in stock · Arrives soon</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-full border border-slate-300">
            <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="px-3 py-1.5 font-bold">−</button>
            <span className="min-w-6 text-center text-sm font-bold">{item.quantity}</span>
            <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="px-3 py-1.5 font-bold">+</button>
          </div>
          <button onClick={() => removeFromCart(item.productId)} className="text-xs font-bold text-blue-700 hover:underline">Remove</button>
        </div>
        <p className="mt-3 font-black">{formatMoney(product.price * item.quantity)}</p>
      </div>
    </div>
  );
}

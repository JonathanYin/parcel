"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types";
import { deliveryEstimate, formatMoney } from "@/lib/products";
import { ProductVisual } from "./product-visual";
import { useStore } from "./store-provider";

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart, hydrated, markViewed } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (hydrated) markViewed(product.id);
  }, [hydrated, markViewed, product.id]);

  const add = () => {
    addToCart(product.id, quantity);
    setAdded(true);
  };
  const buyNow = () => {
    addToCart(product.id, quantity);
    router.push("/checkout");
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <div className="grid gap-8 rounded-[2rem] bg-white p-5 shadow-sm md:grid-cols-2 md:p-8">
        <ProductVisual product={product} large />
        <div className="flex flex-col justify-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">{product.category}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">{product.name}</h1>
          <div className="mt-3 text-sm text-amber-500">{"★".repeat(Math.round(product.rating))} <span className="font-medium text-slate-500">{product.rating} · {product.reviewCount.toLocaleString()} reviews</span></div>
          <div className="mt-5 text-4xl font-black">{formatMoney(product.price)}</div>
          <p className="mt-4 max-w-xl leading-7 text-slate-600">{product.description} Designed to make opening your package feel especially satisfying.</p>
          <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
            <strong>FREE delivery</strong><br />Arrives {deliveryEstimate(product.deliveryDays)}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <label htmlFor="quantity" className="text-sm font-bold">Quantity</label>
            <select id="quantity" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className="rounded-xl border border-slate-300 bg-white px-3 py-2">
              {[1,2,3,4,5].map((value) => <option key={value}>{value}</option>)}
            </select>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button disabled={!hydrated} onClick={add} className="rounded-full bg-amber-400 px-5 py-3 font-black transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60">{added ? "Added to cart ✓" : "Add to cart"}</button>
            <button disabled={!hydrated} onClick={buyNow} className="rounded-full bg-orange-500 px-5 py-3 font-black text-white transition hover:bg-orange-400 disabled:cursor-wait disabled:opacity-60">Buy now</button>
          </div>
        </div>
      </div>
    </main>
  );
}

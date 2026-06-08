"use client";

import Link from "next/link";
import { Product } from "@/lib/types";
import { deliveryEstimate, formatMoney } from "@/lib/products";
import { ProductVisual } from "./product-visual";
import { useStore } from "./store-provider";
import { useState } from "react";

export function ProductCard({ product, eager = false }: { product: Product; eager?: boolean }) {
  const { addToCart, hydrated } = useStore();
  const [added, setAdded] = useState(false);

  const add = () => {
    addToCart(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1100);
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white">
      <Link href={`/product/${product.id}`} className="relative block">
        <ProductVisual product={product} eager={eager} />
        <div className="absolute inset-0 rounded-2xl bg-black/0 transition group-hover:bg-black/10" />
      </Link>
      <div className="px-1 pb-2 pt-2">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-[#62625b]">{product.category}</span>
          {product.badge && <span className="rounded-full bg-[#f6f6f3] px-2 py-0.5 text-[10px] font-bold text-[#211922]">{product.badge}</span>}
        </div>
        <Link href={`/product/${product.id}`} className="text-sm font-bold leading-snug text-[#211922] hover:underline sm:text-base">
          {product.name}
        </Link>
        <p className="mt-0.5 text-[11px] font-medium text-[#62625b]">{product.brand}</p>
        <div className="mt-1 text-lg font-black tracking-tight text-black">{formatMoney(product.price)}</div>
        <div className="mt-0.5 text-[11px] text-[#62625b]">
          {product.inventory} in stock · Arrives <strong>{deliveryEstimate(product.deliveryDays)}</strong>
        </div>
        <button
          onClick={add}
          disabled={!hydrated}
          className={`mt-2 rounded-2xl px-4 py-2 text-xs font-bold transition sm:text-sm ${
            added
              ? "bg-[#103c25] text-white"
              : "bg-[#e60023] text-white hover:bg-[#cc001f] disabled:cursor-wait disabled:opacity-60"
          }`}
        >
          {added ? "Added ✓" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}

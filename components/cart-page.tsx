"use client";

import Link from "next/link";
import { CartItem } from "./cart-item";
import { PriceSummary } from "./price-summary";
import { useStore } from "./store-provider";

export function CartPage() {
  const { cart, hydrated } = useStore();
  if (!hydrated) return <Loading />;
  if (!cart.length) return (
    <main className="mx-auto max-w-4xl px-4 py-16 text-center">
      <div className="rounded-[2rem] bg-white p-12 shadow-sm"><div className="text-7xl">🛒</div><h1 className="mt-5 text-3xl font-black">Your cart is ready for fun</h1><p className="mt-2 text-slate-500">Add a few things and come back when you&apos;re ready.</p><Link href="/" className="mt-6 inline-block rounded-full bg-amber-400 px-6 py-3 font-black">Browse products</Link></div>
    </main>
  );
  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_340px]">
      <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7"><h1 className="text-3xl font-black">Shopping cart</h1><p className="text-sm text-slate-500">Excellent choices. Completely consequence-free.</p><div className="mt-4">{cart.map((item) => <CartItem key={item.productId} item={item} />)}</div></section>
      <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm lg:sticky lg:top-28"><p className="mb-4 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800">✓ Your order qualifies for FREE shipping</p><PriceSummary items={cart} /><Link href="/checkout" className="mt-5 block rounded-full bg-amber-400 px-5 py-3 text-center font-black transition hover:bg-amber-300">Proceed to checkout</Link></aside>
    </main>
  );
}

function Loading() { return <main className="mx-auto max-w-7xl animate-pulse px-4 py-12"><div className="h-72 rounded-3xl bg-slate-200" /></main>; }

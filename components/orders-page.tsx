"use client";

import Link from "next/link";
import { useStore } from "./store-provider";
import { formatMoney } from "@/lib/products";

export function OrdersPage() {
  const { orders, hydrated } = useStore();
  if (!hydrated) return null;
  return (
    <main className="mx-auto max-w-5xl px-4 py-8"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Order history</p><h1 className="mb-6 text-3xl font-black">Orders</h1>
      {!orders.length ? <div className="rounded-3xl bg-white p-12 text-center"><div className="text-6xl">📦</div><h2 className="mt-4 text-xl font-black">No orders yet</h2><Link href="/" className="mt-5 inline-block rounded-full bg-amber-400 px-5 py-2.5 font-black">Start shopping</Link></div> :
      <div className="space-y-4">{orders.map((order) => <article key={order.orderId} className="overflow-hidden rounded-3xl bg-white shadow-sm"><div className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-slate-100 px-5 py-3 text-xs text-slate-500"><span>ORDER PLACED <strong className="block text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</strong></span><span>TOTAL <strong className="block text-slate-900">{formatMoney(order.total)}</strong></span><span className="ml-auto">ORDER # {order.orderId}</span></div><div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><div className="flex -space-x-2">{order.items.slice(0,4).map((item) => <div key={item.productId} className="grid size-12 place-items-center rounded-full border-2 border-white bg-slate-100 text-xl">{item.product.emoji}</div>)}</div><div className="flex-1"><h2 className="text-lg font-black">{order.trackingStatus}</h2><p className="text-sm text-slate-500">{order.items.length} item type(s) · Parcel Express</p></div><Link href={`/tracking/${order.orderId}`} className="rounded-full border border-slate-300 px-5 py-2 text-center text-sm font-black hover:bg-slate-50">Track package</Link></div></article>)}</div>}
    </main>
  );
}

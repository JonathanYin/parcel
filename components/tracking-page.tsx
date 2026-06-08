"use client";

import Link from "next/link";
import { useStore } from "./store-provider";
import { TrackingTimeline } from "./tracking-timeline";
import { getProduct } from "@/lib/products";

const locations = ["Parcel HQ · Order received", "Joyful Fulfillment Center · Packing bench 7", "Regional distribution center", "Your neighborhood · Probably nearby", "Your front door"];

export function TrackingPage({ orderId }: { orderId: string }) {
  const { orders, progressOrder, hydrated } = useStore();
  const order = orders.find((item) => item.orderId === orderId);
  if (!hydrated) return null;
  if (!order) return <main className="mx-auto max-w-3xl px-4 py-16 text-center"><h1 className="text-2xl font-black">Tracking number wandered off</h1><Link href="/orders" className="mt-4 inline-block text-blue-700">Return to orders</Link></main>;
  return (
    <main className="mx-auto max-w-6xl px-4 py-8"><div className="mb-6"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Parcel Express · {order.trackingNumber}</p><h1 className="mt-1 text-3xl font-black sm:text-4xl">Your package is {order.trackingStatus.toLowerCase()}</h1><p className="mt-2 text-slate-500">Estimated delivery: <strong>{new Date(order.estimatedDeliveryDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</strong></p></div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]"><section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center justify-between gap-4"><h2 className="text-xl font-black">Package journey</h2><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{Math.round(((order.trackingStep + 1) / 5) * 100)}% complete</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${((order.trackingStep + 1) / 5) * 100}%` }} /></div><TrackingTimeline step={order.trackingStep} />{order.trackingStep < 4 ? <button onClick={() => progressOrder(order.orderId)} className="mt-8 w-full rounded-full bg-amber-400 px-5 py-3 font-black transition hover:bg-amber-300">Show next update →</button> : <div className="mt-8 rounded-2xl bg-emerald-50 p-4 text-center font-black text-emerald-800">Package delivered. Enjoy!</div>}</section>
      <aside className="space-y-5"><section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm"><div className="text-5xl">📦</div><h2 className="mt-4 text-xl font-black">{order.items.reduce((sum, item) => sum + item.quantity, 0)} item(s) on the move</h2><div className="mt-4 flex flex-wrap gap-2">{order.items.map((item) => <div key={item.productId} className="grid size-12 place-items-center rounded-xl bg-white/10 text-2xl">{getProduct(item.productId)?.emoji}</div>)}</div><p className="mt-5 text-xs leading-5 text-slate-400">Carrier: {order.carrier}<br />Tracking: {order.trackingNumber}</p></section><section className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="font-black">Location history</h2><div className="mt-4 space-y-4">{locations.slice(0, order.trackingStep + 1).reverse().map((location, index) => <div key={location} className="flex gap-3 text-sm"><span className={`mt-1 size-2 shrink-0 rounded-full ${index === 0 ? "bg-emerald-500" : "bg-slate-300"}`} /><span>{location}<small className="block text-slate-400">{index === 0 ? "Latest update" : "Earlier"}</small></span></div>)}</div></section></aside></div>
    </main>
  );
}

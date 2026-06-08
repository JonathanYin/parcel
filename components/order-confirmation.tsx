"use client";

import Link from "next/link";
import { useStore } from "./store-provider";
import { formatMoney, getProduct } from "@/lib/products";

export function OrderConfirmation({ orderId }: { orderId: string }) {
  const { orders, hydrated } = useStore();
  const order = orders.find((item) => item.orderId === orderId);
  if (!hydrated) return null;
  if (!order) return <main className="mx-auto max-w-3xl px-4 py-16 text-center"><h1 className="text-2xl font-black">Order not found</h1><Link href="/orders" className="mt-4 inline-block text-blue-700">View orders</Link></main>;
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-white p-6 text-center shadow-xl sm:p-10">
        <Confetti />
        <div className="relative z-10">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-100 text-4xl">✓</div><p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Purchase complete</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">Your order has been placed!</h1><p className="mx-auto mt-3 max-w-xl text-slate-500">Our team is preparing your package with unreasonable enthusiasm.</p>
        <div className="mx-auto mt-6 inline-flex rounded-full bg-slate-100 px-5 py-2 font-mono text-sm font-bold">{order.orderId}</div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2"><Link href={`/tracking/${order.orderId}`} className="rounded-full bg-amber-400 px-5 py-3 font-black">Track package</Link><Link href="/" className="rounded-full border border-slate-300 px-5 py-3 font-black">Continue shopping</Link></div>
        </div>
      </section>
      <section className="relative mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 bg-slate-50 px-6 py-4 text-left"><p className="text-xs font-black uppercase tracking-widest text-slate-400">Email confirmation preview</p><p className="mt-1 font-bold">To: {order.shippingAddress.email}</p><p className="text-sm">Subject: Your Parcel order is confirmed</p></div><div className="p-6"><p className="text-2xl font-black">Thanks, {order.shippingAddress.fullName.split(" ")[0]}!</p><p className="mt-2 text-slate-600">We received your order for {order.items.reduce((sum, item) => sum + item.quantity, 0)} delightful item(s).</p><div className="my-5 space-y-2 border-y border-slate-200 py-4">{order.items.map((item) => { const product = getProduct(item.productId); return product ? <div className="flex justify-between text-sm" key={item.productId}><span>{product.emoji} {item.quantity}× {product.name}</span><strong>{formatMoney(product.price * item.quantity)}</strong></div> : null; })}</div><p className="text-right text-xl font-black">Total: {formatMoney(order.total)}</p><p className="mt-5 rounded-xl bg-blue-50 p-3 text-xs font-bold text-blue-800">Email preview only. No email was sent.</p></div></section>
    </main>
  );
}

function Confetti() {
  const colors = ["bg-amber-400","bg-blue-500","bg-rose-500","bg-emerald-500","bg-violet-500"];
  return (
    <div
      data-testid="confetti-layer"
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
      aria-hidden="true"
    >
      {Array.from({ length: 36 }, (_, index) => (
        <span
          key={index}
          data-testid="confetti-piece"
          className={`confetti-piece absolute -top-3 h-3 w-2 rounded-sm ${colors[index % colors.length]}`}
          style={{
            left: `${(index * 37) % 100}%`,
            animationDelay: `${(index % 9) * 0.03}s`,
            animationDuration: `${1.35 + (index % 5) * 0.08}s`,
            "--confetti-drift": `${((index % 7) - 3) * 22}px`,
            "--confetti-spin": `${180 + (index % 4) * 90}deg`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

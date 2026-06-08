"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ShippingAddress } from "@/lib/types";
import { getProduct } from "@/lib/products";
import { PriceSummary } from "./price-summary";
import { useStore } from "./store-provider";

const initialAddress: ShippingAddress = { fullName: "", email: "", street: "", city: "", state: "", zip: "" };

export function CheckoutForm() {
  const router = useRouter();
  const { cart, createOrder, hydrated, savedShippingAddress, saveShippingAddress } = useStore();
  const [draftAddress, setDraftAddress] = useState<ShippingAddress | null>(null);
  const [placing, setPlacing] = useState(false);
  const [saveForNextTime, setSaveForNextTime] = useState(Boolean(savedShippingAddress));
  const address = draftAddress ?? savedShippingAddress ?? initialAddress;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (placing) return;
    setPlacing(true);
    saveShippingAddress(saveForNextTime ? address : null);
    const order = createOrder(address);
    setTimeout(() => router.push(`/order-confirmation/${order.orderId}`), 700);
  };
  const field = (key: keyof ShippingAddress, label: string, type = "text") => (
    <label className="block text-sm font-bold text-slate-700">{label}<input required type={type} value={address[key]} onChange={(event) => setDraftAddress({ ...address, [key]: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
  );

  if (!hydrated) return null;
  if (placing) return <OrderPlacementTransition />;
  if (!cart.length) return <main className="mx-auto max-w-3xl px-4 py-16 text-center"><div className="rounded-3xl bg-white p-10"><h1 className="text-2xl font-black">Nothing to check out yet</h1><button onClick={() => router.push("/")} className="mt-5 rounded-full bg-amber-400 px-5 py-2.5 font-black">Go shopping</button></div></main>;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Final step</p><h1 className="text-3xl font-black">Checkout</h1></div>
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="text-xl font-black">1. Shipping address</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">{field("fullName", "Full name")} {field("email", "Email for order confirmation", "email")}<div className="sm:col-span-2">{field("street", "Street address")}</div>{field("city", "City")}{field("state", "State")}{field("zip", "ZIP code")}</div><label className="mt-5 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700"><input type="checkbox" checked={saveForNextTime} onChange={(event) => setSaveForNextTime(event.target.checked)} className="mt-1 size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /><span><span className="block font-bold text-slate-900">Save my information for next time</span><span className="block text-sm text-slate-500">Stores your shipping name and address in this browser.</span></span></label></section>
          <section className="rounded-3xl border-2 border-amber-300 bg-amber-50 p-6"><h2 className="text-xl font-black">2. Payment method</h2><div className="mt-4 flex items-center gap-4 rounded-2xl bg-white p-4"><div className="grid size-12 place-items-center rounded-xl bg-slate-900 text-xl text-white">∞</div><div><p className="font-black">ParcelPay</p><p className="text-sm text-slate-500">Simulation only — no real payment</p></div><div className="ml-auto text-emerald-600">✓</div></div></section>
        </div>
        <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm lg:sticky lg:top-28"><h2 className="text-xl font-black">Order review</h2><div className="my-4 space-y-3">{cart.map((item) => { const product = getProduct(item.productId); return product ? <div key={item.productId} className="flex justify-between gap-3 text-sm"><span>{item.quantity}× {product.name}</span><span className="font-bold">${(product.price * item.quantity).toFixed(2)}</span></div> : null; })}</div><PriceSummary items={cart} /><button disabled={placing} className="mt-5 w-full rounded-full bg-orange-500 px-5 py-3 font-black text-white transition hover:bg-orange-400 disabled:opacity-60">{placing ? "Creating your order..." : "Place order"}</button></aside>
      </form>
    </main>
  );
}

function OrderPlacementTransition() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="rounded-[2rem] bg-white p-10 shadow-sm">
        <div className="mx-auto grid size-20 animate-pulse place-items-center rounded-full bg-amber-100 text-4xl">
          📦
        </div>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-orange-600">
          Almost there
        </p>
        <h1 className="mt-2 text-3xl font-black">Placing your order...</h1>
        <p className="mt-2 text-slate-500">We&apos;re preparing your confirmation.</p>
      </div>
    </main>
  );
}

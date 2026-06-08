"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "./store-provider";
import { NotificationCenter } from "./notification-center";

export function Header() {
  const router = useRouter();
  const { cart } = useStore();
  const [query, setQuery] = useState("");
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    router.push(query.trim() ? `/?q=${encodeURIComponent(query.trim())}` : "/");
  };

  return (
      <header className="sticky top-0 z-40 border-b border-[#e5e5e0] bg-white/95 px-4 py-3 text-[#211922] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Link href="/" className="shrink-0 text-xl font-black tracking-tight text-[#e60023] sm:text-2xl">
            parcel<span>↗</span>
          </Link>
          <form onSubmit={submit} className="flex min-w-0 flex-1 overflow-hidden rounded-full bg-[#f6f6f3] ring-2 ring-transparent transition focus-within:bg-white focus-within:ring-[#435ee5]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search fun things"
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm font-medium text-[#211922] outline-none"
            />
            <button className="px-4 text-lg text-[#62625b] transition hover:text-black" aria-label="Search">
              ⌕
            </button>
          </form>
          <Link href="/orders" className="hidden rounded-2xl px-3 py-2 text-sm font-bold hover:bg-[#f6f6f3] sm:block">
            Orders
          </Link>
          <NotificationCenter />
          <Link href="/cart" className="relative rounded-full bg-[#f6f6f3] px-3 py-2 text-lg transition hover:bg-[#e5e5e0]">
            🛒 <span className="hidden text-sm font-bold sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-2 grid size-5 place-items-center rounded-full bg-[#e60023] text-[10px] font-black text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </header>
  );
}

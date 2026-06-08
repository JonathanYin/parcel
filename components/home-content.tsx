"use client";

import Link from "next/link";
import { categoryGlyphs, products } from "@/lib/products";
import { categories } from "@/lib/types";
import { CatalogFilters, filterAndSortProducts } from "@/lib/catalog";
import { CatalogControls } from "./catalog-controls";
import { ProductGrid } from "./product-grid";
import { useStore } from "./store-provider";

export function HomeContent({ query, filters }: { query: string; filters: CatalogFilters }) {
  const { recentlyViewed } = useStore();
  const results = filterAndSortProducts(products, filters, query);
  const recentProducts = recentlyViewed
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is (typeof products)[number] => product !== undefined);

  if (query) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-black tracking-tight">Results for “{query}”</h1>
        <p className="mb-6 mt-1 text-[#62625b]">Refine your search by category, price, rating, and delivery speed.</p>
        <CatalogControls action="/" filters={filters} query={query} resultCount={results.length} showCategory />
        {results.length ? <ProductGrid products={results} eagerImages={results.length <= 20} /> : <EmptySearch />}
      </main>
    );
  }

  return (
    <main>
      <section className="bg-[#fbfbf9] px-4 py-14 text-[#211922] sm:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <span className="rounded-full bg-[#e5e5e0] px-4 py-2 text-xs font-bold">
            The no-spend spree
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-black tracking-[-0.05em] sm:text-7xl">
            Find something delightful. <span className="text-[#e60023]">Make it yours.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#62625b] sm:text-lg">
            Fill your cart, place your order, then watch your package make its very important journey.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#deals" className="rounded-2xl bg-[#e60023] px-6 py-3 font-bold text-white transition hover:bg-[#cc001f]">Start browsing</a>
            <Link href="/orders" className="rounded-2xl bg-[#e5e5e0] px-6 py-3 font-bold transition hover:bg-[#c8c8c1]">Track an order</Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-8">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {categories.map((category, index) => (
            <Link key={category} href={`/category/${category.toLowerCase()}`} className="flex min-w-32 items-center gap-2 rounded-2xl bg-[#f6f6f3] p-3 transition hover:bg-[#e5e5e0]">
              <div className="text-2xl">{categoryGlyphs[category] ?? ["💻","🍿","🎒","👕","🏠","🎮","📚","✨","🏕️"][index]}</div>
              <div className="text-sm font-bold">{category}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-14">
        <Section id="deals" eyebrow="Hot right now" title="Trending deals" products={products.filter((product) => product.badge === "Trending")} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Promo icon="⚡" title="Instant gratification" copy="Every add-to-cart is immediate. Every checkout feels delightful." />
          <Promo icon="📦" title="Big package energy" copy="Track your parcel from packed to delivered." />
          <Promo icon="💸" title="$0 actually spent" copy="Your wallet can relax. No payment details go anywhere." />
        </div>
        <Section eyebrow="Picked for no particular reason" title="Recommended for you" products={products.slice(8, 18)} />
        {recentProducts.length > 0 && <Section eyebrow="One more look?" title="Recently viewed" products={recentProducts} />}
      </div>
    </main>
  );
}

function Section({ id, eyebrow, title, products: sectionProducts }: { id?: string; eyebrow: string; title: string; products: typeof products }) {
  return (
    <section id={id}>
      <p className="text-xs font-bold text-[#62625b]">{eyebrow}</p>
      <h2 className="mb-6 mt-1 text-3xl font-black tracking-tight">{title}</h2>
      <ProductGrid products={sectionProducts} />
    </section>
  );
}

function Promo({ icon, title, copy }: { icon: string; title: string; copy: string }) {
  return <div className="rounded-2xl bg-[#f6f6f3] p-7"><div className="text-4xl">{icon}</div><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-1 text-sm leading-6 text-[#62625b]">{copy}</p></div>;
}

function EmptySearch() {
  return <div className="rounded-3xl bg-[#f6f6f3] p-12 text-center"><div className="text-6xl">🔎</div><h2 className="mt-4 text-xl font-black">No products found</h2><p className="mt-1 text-[#62625b]">Try “laptop”, “serum”, “snack”, or “camp”.</p></div>;
}

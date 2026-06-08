import Link from "next/link";
import { CatalogFilters } from "@/lib/catalog";
import { categories } from "@/lib/types";

export function CatalogControls({
  action,
  filters,
  query,
  resultCount,
  showCategory = false,
}: {
  action: string;
  filters: CatalogFilters;
  query?: string;
  resultCount: number;
  showCategory?: boolean;
}) {
  const resetHref = query ? `${action}?q=${encodeURIComponent(query)}` : action;

  return (
    <form action={action} className="mb-7 rounded-3xl bg-[#f6f6f3] p-4">
      {query && <input type="hidden" name="q" value={query} />}
      <div className="flex flex-wrap items-end gap-3">
        {showCategory && (
          <Control label="Category">
            <select name="category" defaultValue={filters.category ?? ""} className={inputClass}>
              <option value="">All categories</option>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </Control>
        )}
        <Control label="Price">
          <select name="maxPrice" defaultValue={filters.maxPrice ?? ""} className={inputClass}>
            <option value="">Any price</option>
            <option value="25">Under $25</option>
            <option value="50">Under $50</option>
            <option value="100">Under $100</option>
            <option value="500">Under $500</option>
            <option value="1000">Under $1,000</option>
          </select>
        </Control>
        <Control label="Rating">
          <select name="minRating" defaultValue={filters.minRating ?? ""} className={inputClass}>
            <option value="">Any rating</option>
            <option value="4.5">4.5 and up</option>
          </select>
        </Control>
        <Control label="Delivery">
          <select name="delivery" defaultValue={filters.maxDeliveryDays ?? ""} className={inputClass}>
            <option value="">Any speed</option>
            <option value="1">Within 1 day</option>
            <option value="2">Within 2 days</option>
          </select>
        </Control>
        <Control label="Sort by">
          <select name="sort" defaultValue={filters.sort} className={inputClass}>
            <option value="recommended">Recommended</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Highest rated</option>
            <option value="delivery">Fastest delivery</option>
          </select>
        </Control>
        <button className="rounded-2xl bg-[#211922] px-5 py-2.5 text-sm font-bold text-white hover:bg-black">
          Apply
        </button>
        <Link href={resetHref} className="rounded-2xl px-4 py-2.5 text-sm font-bold hover:bg-[#e5e5e0]">
          Reset
        </Link>
        <p className="ml-auto pb-2 text-sm font-bold text-[#62625b]">{resultCount} products found</p>
      </div>
    </form>
  );
}

const inputClass = "rounded-2xl border border-[#dadad3] bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-[#435ee5] focus:ring-2 focus:ring-[#435ee5]/20";

function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-xs font-bold text-[#62625b]">
      {label}
      {children}
    </label>
  );
}

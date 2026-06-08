import { ProductGrid } from "@/components/product-grid";
import { getCategoryProducts } from "@/lib/products";
import { categories } from "@/lib/types";
import { notFound } from "next/navigation";
import { CatalogControls } from "@/components/catalog-controls";
import { filterAndSortProducts, parseCatalogFilters, SearchParams } from "@/lib/catalog";

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.toLowerCase() }));
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { category } = await params;
  const categoryProducts = getCategoryProducts(category);
  if (!categoryProducts.length) notFound();
  const name = categoryProducts[0].category;
  const filters = parseCatalogFilters(await searchParams);
  const results = filterAndSortProducts(categoryProducts, { ...filters, category: undefined });
  return <main className="mx-auto max-w-7xl px-4 py-8"><div className="mb-10 rounded-[2rem] bg-[#f6f6f3] p-8 text-center sm:p-12"><p className="text-xs font-bold text-[#62625b]">Browse department</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-6xl">{name}</h1><p className="mx-auto mt-3 max-w-lg text-[#62625b]">Excellent reasons to press “add to cart.” Zero reasons to worry about your budget.</p></div><CatalogControls action={`/category/${category}`} filters={filters} resultCount={results.length} /><ProductGrid products={results} eagerImages /></main>;
}

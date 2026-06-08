import { HomeContent } from "@/components/home-content";
import { parseCatalogFilters, SearchParams } from "@/lib/catalog";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const { q = "" } = resolvedSearchParams;
  return <HomeContent query={Array.isArray(q) ? q[0] ?? "" : q} filters={parseCatalogFilters(resolvedSearchParams)} />;
}

import { HomeContent } from "@/components/home-content";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q = "" } = await searchParams;
  return <HomeContent query={Array.isArray(q) ? q[0] ?? "" : q} />;
}

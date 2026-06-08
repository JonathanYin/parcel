import { ProductDetail } from "@/components/product-detail";
import { getProduct, products } from "@/lib/products";
import { notFound } from "next/navigation";

export function generateStaticParams() { return products.map((product) => ({ id: product.id })); }

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}

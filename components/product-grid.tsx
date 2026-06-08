import { Product } from "@/lib/types";
import { ProductCard } from "./product-card";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="columns-2 gap-2 sm:columns-3 lg:columns-4 xl:columns-5">
      {products.map((product) => <div key={product.id} className="mb-5 break-inside-avoid"><ProductCard product={product} /></div>)}
    </div>
  );
}

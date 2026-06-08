import { categories, Category, Product } from "./types";

export type CatalogSort = "recommended" | "price-asc" | "price-desc" | "rating" | "delivery";

export type CatalogFilters = {
  category?: Category;
  maxPrice?: number;
  minRating?: number;
  maxDeliveryDays?: number;
  sort: CatalogSort;
};

export type SearchParams = Record<string, string | string[] | undefined>;

const sortOptions: CatalogSort[] = ["recommended", "price-asc", "price-desc", "rating", "delivery"];

export function parseCatalogFilters(searchParams: SearchParams): CatalogFilters {
  const categoryValue = first(searchParams.category);
  const category = categories.find((item) => item.toLowerCase() === categoryValue?.toLowerCase());
  const maxPrice = parseAllowedNumber(searchParams.maxPrice, [25, 50, 100, 500, 1000]);
  const minRating = parseAllowedNumber(searchParams.minRating, [4.5]);
  const maxDeliveryDays = parseAllowedNumber(searchParams.delivery, [1, 2]);
  const sortValue = first(searchParams.sort);
  const sort = sortOptions.includes(sortValue as CatalogSort)
    ? (sortValue as CatalogSort)
    : "recommended";

  return { category, maxPrice, minRating, maxDeliveryDays, sort };
}

export function filterAndSortProducts(
  source: Product[],
  filters: CatalogFilters,
  query = "",
) {
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = source.filter((product) => {
    const searchable = `${product.name} ${product.brand} ${product.category} ${product.description} ${product.highlights.join(" ")} ${product.badge ?? ""}`.toLowerCase();
    return (
      (!normalizedQuery || searchable.includes(normalizedQuery)) &&
      (!filters.category || product.category === filters.category) &&
      (!filters.maxPrice || product.price <= filters.maxPrice) &&
      (!filters.minRating || product.rating >= filters.minRating) &&
      (!filters.maxDeliveryDays || product.deliveryDays <= filters.maxDeliveryDays)
    );
  });

  return filtered.toSorted((a, b) => {
    if (filters.sort === "price-asc") return a.price - b.price;
    if (filters.sort === "price-desc") return b.price - a.price;
    if (filters.sort === "rating") return b.rating - a.rating || b.reviewCount - a.reviewCount;
    if (filters.sort === "delivery") return a.deliveryDays - b.deliveryDays || a.price - b.price;
    return 0;
  });
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseAllowedNumber(value: string | string[] | undefined, allowed: number[]) {
  const parsed = Number(first(value));
  return allowed.includes(parsed) ? parsed : undefined;
}

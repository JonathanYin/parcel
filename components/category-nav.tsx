import Link from "next/link";
import { categories as categoryList } from "@/lib/types";
import { categoryGlyphs } from "@/lib/products";

export function CategoryNav() {
  return (
    <nav className="no-scrollbar flex gap-2 overflow-x-auto bg-white px-4 py-2 text-sm text-[#211922] sm:justify-center">
      {categoryList.map((category) => (
        <Link
          key={category}
          href={`/category/${category.toLowerCase()}`}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#f6f6f3] px-4 py-2 font-bold transition hover:bg-[#e5e5e0]"
        >
          <span aria-hidden="true">{categoryGlyphs[category]}</span>
          {category}
        </Link>
      ))}
    </nav>
  );
}

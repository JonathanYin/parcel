import Link from "next/link";
import { categories } from "@/lib/types";

export function CategoryNav() {
  return (
    <nav className="no-scrollbar flex gap-2 overflow-x-auto bg-white px-4 py-2 text-sm text-[#211922] sm:justify-center">
      {categories.map((category) => (
        <Link
          key={category}
          href={`/category/${category.toLowerCase()}`}
          className="whitespace-nowrap rounded-full bg-[#f6f6f3] px-4 py-2 font-bold transition hover:bg-[#e5e5e0]"
        >
          {category}
        </Link>
      ))}
    </nav>
  );
}

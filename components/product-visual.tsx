import Image from "next/image";
import { Product } from "@/lib/types";

export function ProductVisual({
  product,
  large = false,
}: {
  product: Product;
  large?: boolean;
}) {
  const shape = Number(product.id.at(-1)) % 3;
  const aspect = shape === 0 ? "aspect-square" : shape === 1 ? "aspect-[3/4]" : "aspect-[4/5]";
  return (
    <div
      className={`relative grid place-items-center overflow-hidden bg-gradient-to-br ${product.gradient} ${
        large ? "aspect-square rounded-[2rem] text-8xl sm:text-9xl" : `${aspect} rounded-2xl text-6xl`
      }`}
    >
      <Image
        src={product.imageSrc}
        alt={product.name}
        fill
        sizes={large ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw"}
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/5" />
      <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#211922] backdrop-blur">
        Parcel pick
      </span>
    </div>
  );
}

import { CartItem } from "@/lib/types";
import { calculatePricing } from "@/lib/pricing";
import { formatMoney } from "@/lib/products";

export function PriceSummary({ items }: { items: CartItem[] }) {
  const pricing = calculatePricing(items);
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(pricing.subtotal)}</span></div>
      <div className="flex justify-between"><span>Estimated tax</span><span>{formatMoney(pricing.tax)}</span></div>
      <div className="flex justify-between"><span>Shipping</span><span>{pricing.shipping === 0 ? "FREE" : formatMoney(pricing.shipping)}</span></div>
      <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-black"><span>Total</span><span>{formatMoney(pricing.total)}</span></div>
    </div>
  );
}

import { CartItem } from "./types";
import { getProduct } from "./products";

export const calculatePricing = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => {
    const product = getProduct(item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);
  const shipping = subtotal === 0 || subtotal >= 35 ? 0 : 5.99;
  const tax = subtotal * 0.0825;
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
};

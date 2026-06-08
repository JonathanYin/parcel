import { OrderConfirmation } from "@/components/order-confirmation";
export default async function Page({ params }: { params: Promise<{ orderId: string }> }) { const { orderId } = await params; return <OrderConfirmation orderId={orderId} />; }

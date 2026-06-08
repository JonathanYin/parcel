import { TrackingPage } from "@/components/tracking-page";
export default async function Page({ params }: { params: Promise<{ orderId: string }> }) { const { orderId } = await params; return <TrackingPage orderId={orderId} />; }

import { TrackingStatus } from "@/lib/types";

const statuses: TrackingStatus[] = ["Order placed", "Preparing shipment", "Shipped", "Out for delivery", "Delivered"];
const descriptions = ["We got your order.", "Your items are getting cozy in a box.", "Your package has begun its journey.", "It is very nearly delivery time.", "Delivered! Go look by your front door."];

export function TrackingTimeline({ step }: { step: number }) {
  return <div className="mt-7 space-y-0">{statuses.map((status, index) => { const complete = index <= step; return <div key={status} className="relative flex gap-4 pb-7 last:pb-0">{index < statuses.length - 1 && <div className={`absolute left-[15px] top-8 h-full w-0.5 ${index < step ? "bg-emerald-500" : "bg-slate-200"}`} />}<div className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 text-xs font-black transition-all duration-500 ${complete ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "border-slate-300 bg-white text-slate-400"}`}>{complete ? "✓" : index + 1}</div><div><h3 className={`font-black ${complete ? "text-slate-900" : "text-slate-400"}`}>{status}</h3><p className="text-sm text-slate-500">{descriptions[index]}</p>{index === step && <span className="mt-2 inline-block rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-800">Current status</span>}</div></div>; })}</div>;
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "./store-provider";

export function NotificationCenter() {
  const { notifications, unreadCount, markNotificationsRead } = useStore();
  const [open, setOpen] = useState(false);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) markNotificationsRead();
  };

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="relative grid size-10 place-items-center rounded-full bg-[#f6f6f3] text-lg transition hover:bg-[#e5e5e0]"
        aria-label="Notifications"
        aria-expanded={open}
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#e60023] text-[10px] font-black text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#e5e5e0] bg-white shadow-xl">
          <div className="border-b border-[#e5e5e0] px-4 py-3 font-black">Notifications</div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-6 text-center text-sm text-[#62625b]">No updates yet.</p>
            ) : (
              notifications.slice(0, 8).map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.orderId ? `/tracking/${notification.orderId}` : "/orders"}
                  onClick={() => setOpen(false)}
                  className="block border-b border-[#e5e5e0] px-4 py-3 last:border-0 hover:bg-[#fbfbf9]"
                >
                  <p className="text-sm font-black">{notification.title}</p>
                  <p className="mt-0.5 text-xs text-[#62625b]">{notification.message}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

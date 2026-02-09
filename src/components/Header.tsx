"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, User, Settings } from "lucide-react";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h2 className="text-sm font-medium text-gray-400">Welcome back,</h2>
        <p className="text-sm font-semibold text-gray-800">
          {session?.user?.name ?? "User"}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User dropdown */}
        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold">
              {(session?.user?.name ?? "U").charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-gray-700">{session?.user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{(session?.user as any)?.role}</p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {open && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-50">
              <button onClick={() => { setOpen(false); router.push("/profile"); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <User size={16} /> Profile
              </button>
              <button onClick={() => { setOpen(false); router.push("/settings"); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Settings size={16} /> Settings
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

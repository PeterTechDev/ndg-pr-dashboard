"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export default function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!session?.user) return null;

  const { name, image } = session.user;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="User menu"
        aria-expanded={open}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
      >
        {image ? (
          <img src={image} alt="" width={24} height={24} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center text-xs text-[var(--color-text-secondary)]">
            {name?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        <span className="text-sm text-[var(--color-text-secondary)] hidden sm:inline max-w-[120px] truncate">
          {name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-lg shadow-xl overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-text-primary)] truncate">{name}</p>
            <p className="text-xs text-[var(--color-text-tertiary)] truncate">{session.user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full px-3 py-2 text-left text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-red-400 transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

// components/MobileSidebar.tsx
// Royal Galaxy style — mobile-only overlay drawer (no layout push)
// Clean, premium, glassy; grouped sections; active left glow; CTA footer.

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export type NavItem = { label: string; href: string; icon?: React.ReactNode };

interface MobileSidebarProps {
  items?: NavItem[];
  logoSrc?: string;
  onOpenChange?: (open: boolean) => void;
}

export default function MobileSidebar({
  items,
  logoSrc = "/images/rocket-blue.png",
  onOpenChange,
}: MobileSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const startX = useRef<number | null>(null);
  const deltaX = useRef<number>(0);

  // Groups
  const groups = useMemo(
    () => [
      {
        title: "Play",
        items: [
          { label: "Home", href: "/", icon: IconHome() },
          { label: "Matches", href: "/matches", icon: IconController() },
        ],
      },
      {
        title: "Compete",
        items: [
          { label: "Tournaments", href: "/tournaments", icon: IconTrophy() },
          { label: "Leaderboard", href: "/leaderboard", icon: IconChart() },
        ],
      },
      {
        title: "You",
        items: [
          { label: "Profile", href: "/profile", icon: IconUser() },
          { label: "Refer", href: "/refer", icon: IconUsers() },
          { label: "How To Use", href: "/help", icon: IconBook() },
        ],
      },
    ],
    []
  );

  const allItems: NavItem[] = useMemo(() => {
    if (items) return items;
    return groups.flatMap((g) => g.items);
  }, [items, groups]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Click outside to close
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Touch swipe to close
  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    deltaX.current = 0;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (startX.current == null) return;
    deltaX.current = e.touches[0].clientX - startX.current;
  }
  function onTouchEnd() {
    if (Math.abs(deltaX.current) > 40) setOpen(false);
    startX.current = null;
    deltaX.current = 0;
  }

  useEffect(() => onOpenChange?.(open), [open, onOpenChange]);

  // Helpers
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <div className="md:hidden">
      {/* Trigger (hamburger) */}
      <button
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur transition active:scale-95"
      >
        <div className="space-y-1.5">
          <span className="block h-0.5 w-6 bg-white" />
          <span className="block h-0.5 w-6 bg-white" />
          <span className="block h-0.5 w-6 bg-white" />
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />

          {/* Edge tap to close */}
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute right-0 top-0 h-full w-6"
          />

          {/* Panel */}
          <div
            ref={panelRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="absolute left-0 top-0 h-full w-[72vw] max-w-[320px] sm:w-[68vw] overflow-hidden rounded-r-2xl border border-white/10 bg-[#120626]/92 shadow-2xl ring-1 ring-white/10 animate-[slideIn_.22s_ease-out]"
          >
            {/* Subtle neon edge + aurora gradient rim */}
            <div className="pointer-events-none absolute inset-0 rounded-r-2xl" style={{
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), 0 0 22px rgba(137, 88, 255, 0.25)",
              background: "radial-gradient(120% 60% at -20% 0%, rgba(88,40,180,0.25) 0%, rgba(0,0,0,0) 60%), radial-gradient(80% 40% at 120% 100%, rgba(255,214,102,0.12) 0%, rgba(0,0,0,0) 60%)",
            }} />

            {/* Content */}
            <div
              className="relative flex h-full flex-col"
              style={{
                paddingTop: "calc(env(safe-area-inset-top) + 12px)",
                paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
              }}
            >
              {/* Glass top bar */}
              <div className="mx-3 mb-2 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur">
                <div className="flex items-center gap-2">
                  <Image src={logoSrc} alt="TrenPlay" width={22} height={22} />
                  <span className="text-[15px] font-semibold">TrenPlay</span>
                </div>
                <button
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5"
                >
                  {IconClose()}
                </button>
              </div>

              {/* Section groups */}
              <nav className="mt-1 px-1 space-y-3 overflow-y-auto">
                {groups.map((group, gi) => (
                  <div key={group.title}>
                    {/* Group label with tiny coin bullet */}
                    <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-purple-200/80">
                      <span className="text-[10px]">🪙</span>
                      <span>{group.title}</span>
                    </div>

                    <ul className="mt-1 space-y-1">
                      {group.items.map((item) => {
                        const active = isActive(item.href);
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setOpen(false)}
                              className="group relative grid grid-cols-[20px,1fr,14px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm leading-5 text-yellow-300/90 hover:bg-white/5 hover:text-yellow-300"
                            >
                              {/* Active left glow bar */}
                              {active && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r bg-gradient-to-b from-yellow-300 to-purple-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]" />
                              )}

                              {/* Icon */}
                              <span className="grid h-6 w-6 place-items-center text-[18px] opacity-95">
                                {item.icon}
                              </span>

                              {/* Label */}
                              <span className={`truncate font-medium ${active ? "text-yellow-300" : "text-yellow-200/90"}`}>
                                {item.label}
                              </span>

                              {/* Chevron */}
                              <span className="opacity-0 transition-opacity group-hover:opacity-100">
                                {IconChevron()}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>

                    {/* Faded divider */}
                    {gi < groups.length - 1 && (
                      <div className="mx-3 my-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    )}
                  </div>
                ))}
              </nav>

              {/* Footer CTAs */}
              <div className="mt-auto px-3 pt-3">
                <div className="flex gap-2">
                  <Link
                    href="/matches/create"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#ffd166] to-[#a78bfa] px-4 py-2 text-center text-sm font-semibold text-black shadow hover:opacity-95 active:scale-[0.99]"
                  >
                    Create Match
                  </Link>
                  <Link
                    href="/refer"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-center text-sm font-semibold text-yellow-200 hover:bg-white/10 active:scale-[0.99]"
                  >
                    Refer & Earn
                  </Link>
                </div>
                {/* Scroll hint */}
                <div className="pointer-events-none mt-3 h-6 bg-gradient-to-t from-[#120626]/95 to-transparent rounded-b-2xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyframes */}
      <style jsx>{`
        @keyframes slideIn { from { transform: translateX(-8%); opacity: 0.6; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ---------------- Icons (20px, duotone-friendly) ----------------
function IconHome() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 10.5 12 4l8 6.5V20a2 2 0 0 1-2 2h-4v-6H10v6H6a2 2 0 0 1-2-2v-9.5Z" stroke="currentColor" strokeWidth="1.6" opacity="0.95"/>
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 20h16M7 17V9m5 8V5m5 12v-6" stroke="currentColor" strokeWidth="1.6" opacity="0.95"/>
    </svg>
  );
}
function IconTrophy() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 5h12v2a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V5Zm1 16h10M9 19h6" stroke="currentColor" strokeWidth="1.6" opacity="0.95"/>
      <path d="M18 7h2a2 2 0 0 1-2 2M6 7H4a2 2 0 0 0 2 2" stroke="currentColor" strokeWidth="1.6" opacity="0.6"/>
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" opacity="0.95"/>
      <path d="M5 19.5c1.5-3 4.5-4.5 7-4.5s5.5 1.5 7 4.5" stroke="currentColor" strokeWidth="1.6" opacity="0.6"/>
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="8.5" r="3" stroke="currentColor" strokeWidth="1.6" opacity="0.95"/>
      <path d="M3.5 18c1.2-2.6 3.6-3.9 5.5-3.9s4.3 1.3 5.5 3.9" stroke="currentColor" strokeWidth="1.6" opacity="0.6"/>
      <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4" opacity="0.6"/>
    </svg>
  );
}
function IconController() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="10" width="18" height="7" rx="3.5" stroke="currentColor" strokeWidth="1.6" opacity="0.95"/>
      <path d="M8 13.5h3M9.5 12v3" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="16.5" cy="13.5" r="1" fill="currentColor" opacity="0.8"/>
      <circle cx="18.8" cy="12.8" r=".7" fill="currentColor" opacity="0.6"/>
    </svg>
  );
}
function IconBook() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 5h9a3 3 0 0 1 3 3v12H7a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z" stroke="currentColor" strokeWidth="1.6" opacity="0.95"/>
      <path d="M6 8h12" stroke="currentColor" strokeWidth="1.6" opacity="0.6"/>
    </svg>
  );
}
function IconChevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// components/MobileHeader.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useWallet } from "@solana/wallet-adapter-react";
import { persistAvatarIfMissing, normalizeAvatar } from "@/utils/avatar";
import RocketAcrossHeader from "@/components/RocketAcrossHeader";

// ✅ Pages Router import (fix for your app setup)
import { useRouter } from "next/router";

const STARTER_AVATARS = [
  "/avatars/Starter-1.png","/avatars/Starter-2.png","/avatars/Starter-3.png","/avatars/Starter-4.png",
  "/avatars/Starter-5.png","/avatars/Starter-6.png","/avatars/Starter-7.png","/avatars/Starter-8.png",
  "/avatars/Starter-9.png","/avatars/Starter-10.png",
];

function divisionEmoji(d: string) {
  const key = (d || "").toLowerCase();
  if (key === "pro") return "⚔️";
  if (key === "elite") return "👑";
  if (key === "legend") return "🐉";
  return "🪙"; // Rookie (default)
}

export default function MobileHeader() {
  const [mounted, setMounted] = useState(false);
  const [user] = useAuthState(auth);
  const { disconnect } = useWallet();
  const router = useRouter(); // ✅ Pages Router

  const [username, setUsername] = useState("Player");
  const [avatarUrl, setAvatarUrl] = useState(STARTER_AVATARS[0]);
  const [division, setDivision] = useState("Rookie");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    (async () => {
      if (!user?.uid) {
        setUsername("Player");
        setAvatarUrl(STARTER_AVATARS[0]);
        setDivision("Rookie");
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.data() || {};
        setUsername(data.username || user.email?.split("@")[0] || "Player");
        const saved = normalizeAvatar(data.avatar);
        setAvatarUrl(saved || (await persistAvatarIfMissing(user.uid)));
        setDivision(typeof data.division === "string" && data.division ? data.division : "Rookie");
      } catch {
        setUsername(user?.email?.split("@")[0] || "Player");
      }
    })();
  }, [mounted, user]);

  // Mobile starfield (lightweight)
  type Star = { top: string; left: string; delay: string; duration: string; size: number; opacity: number };
  const stars: Star[] = useMemo(() => {
    if (!mounted) return [];
    const count = 12;
    return Array.from({ length: count }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 4}s`,
      duration: `${2 + Math.random() * 2.5}s`,
      size: Math.random() < 0.5 ? 2 : 3,
      opacity: 0.55 + Math.random() * 0.25,
    }));
  }, [mounted]);

  if (!mounted) {
    return <header className="md:hidden h-14 border-b border-white/10 bg-[#0b0f0c]/95" />;
  }

  // ✅ Works with Pages Router: scroll if already on /howto, else navigate
  function goHowToUse() {
    const onHowTo = router.pathname === "/howto";
    if (onHowTo) {
      const el = document.getElementById("how-to-use");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    router.push("/howto#how-to-use");
  }

  return (
    <header
      className="md:hidden sticky top-0 z-[60] overflow-hidden"
      style={{ paddingTop: "var(--safe-top)" }}
    >
      {/* Background gradient + glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0030] via-[#2a0a55] to-[#3b1a74]" />
        <div className="absolute inset-0 ring-1 ring-white/10" style={{ boxShadow: "0 0 28px rgba(128, 90, 213, 0.35)" }} />
      </div>

      {/* Rocket & stars */}
      <div className="pointer-events-none absolute inset-0 -z-5">
        <RocketAcrossHeader intervalMs={55000} size={100} />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-5">
        {stars.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full animate-mobile-sparkle"
            style={{
              width: s.size,
              height: s.size,
              top: s.top,
              left: s.left,
              background: "white",
              opacity: s.opacity,
              animationDelay: s.delay,
              animationDuration: s.duration,
            }}
          />
        ))}
      </div>

      {/* Foreground content */}
      <div className="flex items-center gap-2 px-3 h-14 text-white">
        {/* Logo */}
        <div className="flex-none">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/trenplay-logo.png"
              alt="TrenPlay Logo"
              width={110}
              height={30}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Wallet */}
        <div className="flex-none ml-1">
          <WalletMultiButton className="!bg-[#6c4bd3] !text-white !rounded-lg !px-2 !py-0 !h-7 !text-[11px] !font-semibold !min-h-0 whitespace-nowrap" />
        </div>

        {/* Right side: profile cluster OR How to Use (logged-out) */}
        <div className="flex-1 min-w-0 flex justify-end">
          {user ? (
            <div className="flex items-center gap-2 rounded-xl border border-yellow-400 px-2.5 py-1 bg-gradient-to-br from-[#200041] via-[#2e005f] to-[#431078] shadow-md w-full max-w-[280px]">
              <span
                className="flex-none grid place-items-center w-6 h-6 text-[15px] rounded-md bg-[#2d0140] border border-yellow-500/80"
                title={division}
              >
                {divisionEmoji(division)}
              </span>
              <span className="flex-1 truncate text-white font-semibold bg-[#3c1867] px-2 py-0.5 rounded-md shadow border border-purple-600 text-[12px]">
                {username}
              </span>
              <Link href="/profile" className="flex-none">
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-7 h-7 rounded-full border border-yellow-400 shadow hover:border-purple-400 transition"
                />
              </Link>
              <button
                onClick={async () => {
                  try {
                    localStorage?.clear();
                    await auth.signOut();
                  } catch {}
                  disconnect();
                }}
                className="flex-none text-[12px] font-bold text-red-500 border border-red-700 px-2 py-0.5 rounded hover:text-yellow-300 hover:border-yellow-300 transition whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          ) : (
            // Logged out: pulsing How to Use button (now using Pages Router handler)
            <button
              onClick={goHowToUse}
              type="button"
              className="animate-howto-pulse rounded-lg border border-purple-400 bg-purple-700/40 px-3 py-1 text-[12px] font-semibold text-purple-100 shadow hover:bg-purple-700/60 hover:text-yellow-300 transition whitespace-nowrap"
            >
              ❓ How to Use
            </button>
          )}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes mobile-sparkle {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(0.6); }
        }
        .animate-mobile-sparkle {
          animation-name: mobile-sparkle;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
        @keyframes howto-pulse {
          0% { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0.45); transform: translateZ(0); }
          70% { box-shadow: 0 0 16px 6px rgba(167, 139, 250, 0.18); }
          100% { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0); }
        }
        .animate-howto-pulse { animation: howto-pulse 2.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .animate-mobile-sparkle, .animate-howto-pulse { animation: none; }
        }
      `}</style>

      {/* Compact wallet guard on mobile */}
      <style jsx global>{`
        @media (max-width: 767px) {
          .wallet-adapter-button-trigger {
            padding: 0 8px !important;
            height: 28px !important;
            font-size: 11px !important;
            line-height: 28px !important;
          }
        }
      `}</style>
    </header>
  );
}

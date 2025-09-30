// components/Header.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import RocketAcrossHeader from './RocketAcrossHeader';
import { persistAvatarIfMissing, normalizeAvatar } from '../utils/avatar';

const STARTER_AVATARS = [
  '/avatars/Starter-1.png','/avatars/Starter-2.png','/avatars/Starter-3.png','/avatars/Starter-4.png',
  '/avatars/Starter-5.png','/avatars/Starter-6.png','/avatars/Starter-7.png','/avatars/Starter-8.png',
  '/avatars/Starter-9.png','/avatars/Starter-10.png',
];

interface HeaderProps {
  user?: any;
  tc?: number;
  division?: string; // optional fallback
}

type Star = { top: string; left: string; delay: string; duration: string };

const DIVISION_BOUNDS: Record<string, { min: number; max: number | null; next?: string; nextAt?: number }> = {
  Rookie: { min: 0,   max: 700,  next: 'Pro',    nextAt: 700 },
  Pro:    { min: 700, max: 900,  next: 'Elite',  nextAt: 900 },
  Elite:  { min: 900, max: 1200, next: 'Legend', nextAt: 1200 },
  Legend: { min: 1200, max: null },
};

const Header: React.FC<HeaderProps> = ({ user, division: divisionProp }) => {
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(STARTER_AVATARS[0]);

  const [division, setDivision] = useState<string | null>(divisionProp ?? null);
  const [elo, setElo] = useState<number | null>(null);

  const [showDivPopover, setShowDivPopover] = useState(false);

  const { disconnect } = useWallet();
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const fetchProfile = async () => {
      if (!user?.uid) {
        setUsername(null);
        setAvatarUrl(STARTER_AVATARS[0]);
        setDivision(null);
        setElo(null);
        return;
      }
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        const data = snap.data() || {};

        setUsername(data.username || user.email?.split('@')[0] || 'Player');
        const saved = normalizeAvatar(data.avatar);
        if (saved) {
          setAvatarUrl(saved);
        } else {
          const ensured = await persistAvatarIfMissing(user.uid);
          setAvatarUrl(ensured);
        }
        setDivision((typeof data.division === 'string' && data.division) || divisionProp || null);
        setElo(typeof data.elo === 'number' && Number.isFinite(data.elo) ? data.elo : null);
      } catch {
        setUsername(user?.email?.split('@')[0] || 'Player');
        setAvatarUrl(STARTER_AVATARS[0]);
        setDivision(divisionProp ?? null);
        setElo(null);
      }
    };
    fetchProfile();
  }, [mounted, user, divisionProp]);

  const stars: Star[] = useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: 20 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${2 + Math.random() * 3}s`,
    }));
  }, [mounted]);

  const { pct, minLabel, maxLabel, nextLabel } = useMemo(() => {
    const div = (division ?? 'Rookie') as keyof typeof DIVISION_BOUNDS;
    const bounds = DIVISION_BOUNDS[div] || DIVISION_BOUNDS.Rookie;
    const min = bounds.min;
    const max = bounds.max ?? Math.max(min + 200, (elo ?? min) + 100);
    const current = Math.max(min, Math.min(max, elo ?? min));
    const percent = Math.max(0, Math.min(100, ((current - min) / (max - min)) * 100));
    return {
      pct: Number.isFinite(percent) ? percent : 0,
      minLabel: min,
      maxLabel: bounds.max === null ? '∞' : max,
      nextLabel: bounds.next && bounds.nextAt ? `Next: ${bounds.next} @ ${bounds.nextAt}` : 'Max tier',
    };
  }, [division, elo]);

  // ---------- SSR shell ----------
  const headerShell = (
    <header
      className="hidden md:flex relative z-40 justify-between items-center pr-6 bg-[#1a0030] text-white border-b border-[#3b2060]"
      style={{ minHeight: 80, height: 80, maxHeight: 80 }}
    >
      <div className="flex items-center h-full ml-0">
        <Link href="/">
          <Image
            src="/images/trenplay-logo.png"
            alt="TrenPlay Logo"
            width={180}
            height={50}
            className="block object-contain"
            priority
          />
        </Link>
      </div>
      <div className="flex items-center gap-6 text-sm relative z-10 h-20" aria-hidden>
        <div className="w-56 h-8 rounded-lg bg-white/10" />
      </div>
    </header>
  );

  if (!mounted) return headerShell;

  // ---------- Real header ----------
  return (
    <header
      className="hidden md:flex relative z-40 justify-between items-center pr-6 bg-[#1a0030] text-white border-b border-[#3b2060]"
      style={{ minHeight: 80, height: 80, maxHeight: 80 }}
    >
      <RocketAcrossHeader intervalMs={60_000} size={140} />

      {/* Starfield */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {stars.map((s, i) => (
          <span
            key={i}
            className="absolute bg-white rounded-full opacity-70 animate-sparkle"
            style={{
              width: 3,
              height: 3,
              top: s.top,
              left: s.left,
              animationDelay: s.delay,
              animationDuration: s.duration,
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <div className="flex items-center h-full ml-0">
        <Link href="/">
          <Image
            src="/images/trenplay-logo.png"
            alt="TrenPlay Logo"
            width={180}
            height={50}
            className="block object-contain"
            priority
          />
        </Link>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-6 text-sm relative z-10 h-20">
        {/* 👇 Wallet balance */}
        <div id="wallet-balance">
          <WalletMultiButton
            className="!bg-[#6c4bd3] !text-white !rounded-lg !px-5 !py-2 !h-auto !min-h-0"
          />
        </div>

        {!user ? (
          <div className="flex items-center">
            <div className="flex items-center gap-4 bg-gradient-to-r from-[#2d0140] via-[#1a0030] to-[#5e2297] px-6 py-3 rounded-2xl shadow-lg border border-purple-700">
              <Link href="/signup" className="flex items-center gap-1 text-red-300 font-bold hover:text-yellow-300 text-lg">
                <span className="text-2xl">👤</span>
                <span className="text-xl">+</span>
                Sign Up
              </Link>
              <span className="border-r border-purple-400 h-8 mx-2" />
              <Link href="/login" className="flex items-center gap-1 text-red-300 font-bold hover:text-yellow-300 text-lg">
                <span className="text-2xl">➡️</span>
                Log In
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-gradient-to-br from-[#200041] via-[#2e005f] to-[#431078] px-5 py-2 rounded-xl shadow-lg border border-yellow-400">
            {/* 👇 Division badge */}
            <div
              id="division-badge"
              className="relative z-[1000]"
              onMouseEnter={() => setShowDivPopover(true)}
              onMouseLeave={() => setShowDivPopover(false)}
            >
              <button
                type="button"
                className="text-yellow-300 bg-[#2d0140] px-3 py-1 rounded-lg text-lg font-bold border border-yellow-500 shadow"
                onClick={() => setShowDivPopover(v => !v)}
                aria-haspopup="dialog"
                aria-expanded={showDivPopover}
                aria-label="Division & Elo"
              >
                🥇 {division || 'Rookie'}
              </button>

              {/* Popover */}
              {showDivPopover && (
                <div
                  role="dialog"
                  className="absolute top-full mt-3 right-0 w-80 rounded-xl border border-purple-700 bg-[#1b0933] shadow-2xl p-4 z-[999]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🏅</span>
                      <span className="text-yellow-300 font-semibold">
                        {division || 'Rookie'}
                      </span>
                    </div>
                    <div className="text-sm text-purple-200">
                      Elo <span className="font-semibold text-white">{elo ?? '—'}</span>
                    </div>
                  </div>

                  {elo != null ? (
                    division === 'Legend' ? (
                      <div className="text-purple-200 text-sm">
                        Legend — <span className="text-purple-100">Max tier</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-full h-3 rounded-full bg-purple-900/50 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-purple-400 transition-[width] duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-purple-300">
                          <span>{minLabel}</span>
                          <span className="text-purple-100">{nextLabel}</span>
                          <span>{maxLabel}</span>
                        </div>
                      </>
                    )
                  ) : (
                    <div className="text-purple-300 text-sm">Elo unavailable</div>
                  )}
                </div>
              )}
            </div>

            {/* Username */}
            <span className="text-white font-semibold bg-[#3c1867] px-3 py-1 rounded-lg shadow border border-purple-600 text-base">
              {username || 'Player'}
            </span>

            {/* 👇 Profile avatar */}
            <Link href="/profile">
              <img
                id="profile-avatar"
                src={avatarUrl}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-yellow-400 shadow hover:border-purple-400 cursor-pointer transition"
              />
            </Link>

            {/* Logout */}
            <button
              onClick={async () => {
                try {
                  localStorage?.clear();
                  const { auth } = await import('../lib/firebase');
                  await auth.signOut();
                } catch {}
                disconnect();
              }}
              className="ml-3 text-red-500 font-bold border border-red-700 px-3 py-1 rounded hover:text-yellow-300 hover:border-yellow-300 transition"
            >
              Log Out
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%      { opacity: 0;   transform: scale(0.5); }
        }
        .animate-sparkle {
          animation-name: sparkle;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
      `}</style>
    </header>
  );
};

export default Header;

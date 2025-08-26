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

const STARTER_AVATARS = [
  '/avatars/Starter-1.png','/avatars/Starter-2.png','/avatars/Starter-3.png','/avatars/Starter-4.png',
  '/avatars/Starter-5.png','/avatars/Starter-6.png','/avatars/Starter-7.png','/avatars/Starter-8.png',
  '/avatars/Starter-9.png','/avatars/Starter-10.png',
];
const pickRandomAvatar = () =>
  STARTER_AVATARS[Math.floor(Math.random() * STARTER_AVATARS.length)];

interface HeaderProps {
  user?: any;
  tc?: number;
  division?: string;
}

type Star = { top: string; left: string; delay: string; duration: string };

const Header: React.FC<HeaderProps> = ({ user, division }) => {
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(STARTER_AVATARS[0]);
  const { disconnect } = useWallet();

  // Ensure SSR/CSR match: render a simple shell on SSR; enable dynamic bits after mount
  useEffect(() => setMounted(true), []);

  // Load profile only after mount (client-only)
  useEffect(() => {
    if (!mounted) return;
    const fetchProfile = async () => {
      if (user?.uid) {
        try {
          const ref = doc(db, 'users', user.uid);
          const snap = await getDoc(ref);
          const data = snap.data() || {};
          setUsername(data.username || user.email?.split('@')[0] || 'Player');
          setAvatarUrl(data.avatar || pickRandomAvatar());
        } catch {
          setUsername(user?.email?.split('@')[0] || 'Player');
          setAvatarUrl(pickRandomAvatar());
        }
      } else {
        setUsername(null);
        setAvatarUrl(STARTER_AVATARS[0]);
      }
    };
    fetchProfile();
  }, [mounted, user]);

  // Generate star positions *after* mount so SSR doesn't randomize
  const stars: Star[] = useMemo(() => {
    if (!mounted) return [];
    const arr: Star[] = [];
    for (let i = 0; i < 20; i++) {
      arr.push({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${2 + Math.random() * 3}s`,
      });
    }
    return arr;
  }, [mounted]);

  const headerShell = (
    <header
      className="relative flex justify-between items-center pr-6 bg-[#1a0030] text-white border-b border-[#3b2060] overflow-hidden"
      style={{ minHeight: 80, height: 80, maxHeight: 80 }}
    >
      {/* Left: logo flush with sidebar */}
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

      {/* Right: keep a stable placeholder on SSR */}
      <div className="flex items-center gap-6 text-sm relative z-10 h-20" aria-hidden>
        <div className="w-36 h-8 rounded-lg bg-white/10" />
      </div>
    </header>
  );

  if (!mounted) {
    // SSR and the very first client render show the same shell → no hydration mismatch
    return headerShell;
  }

  return (
    <header
      className="relative flex justify-between items-center pr-6 bg-[#1a0030] text-white border-b border-[#3b2060] overflow-hidden"
      style={{ minHeight: 80, height: 80, maxHeight: 80 }}
    >
      {/* 🚀 Rocket animation overlay (client-only) */}
      <RocketAcrossHeader intervalMs={60_000} size={140} />

      {/* Starfield (generated after mount; no SSR randomness) */}
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

      {/* Left: logo */}
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

      {/* Right: wallet + auth (client-only) */}
      <div className="flex items-center gap-6 text-sm relative z-10 h-20">
        <WalletMultiButton className="!bg-[#6c4bd3] !text-white !rounded-lg !px-5 !py-2 !h-auto !min-h-0" />

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
            <span className="text-yellow-300 bg-[#2d0140] px-3 py-1 rounded-lg text-lg font-bold border border-yellow-500 shadow">
              🥇 {division || 'Rookie'}
            </span>
            <span className="text-white font-semibold bg-[#3c1867] px-3 py-1 rounded-lg shadow border border-purple-600 text-base">
              {username || 'Player'}
            </span>
            <Link href="/profile">
              {/* use <Image> if these are in /public for perf; <img> is fine too */}
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-yellow-400 shadow hover:border-purple-400 cursor-pointer transition"
              />
            </Link>
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

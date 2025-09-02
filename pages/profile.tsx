'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import SubscriptionButton from '../src/components/SubscriptionButton';
import { PublicKey } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { TREN_MINT } from '../lib/network';

type Stats = { wins?: number; matchesPlayed?: number; tournamentsWon?: number };
type FirestoreTs = { seconds: number; nanoseconds?: number } | string | number | Date | null | undefined;

type ProfileData = {
  wins?: number;
  matchesPlayed?: number;
  tournamentsWon?: number;
  losses?: number;
  winStreak?: number;
  favoriteGame?: string;
  division?: string;
  referralCode?: string;

  avatar?: string;
  username?: string;
  gamertag?: string;
  linkedAccount?: string;

  subscriptionActive?: boolean;
  subscriptionExpires?: FirestoreTs;
};

const AVATAR_OPTIONS: {
  src: string;
  label: string;
  unlock: (s: Stats) => boolean;
}[] = [
  { src: '/avatars/Starter-1.png', label: 'Starter 1', unlock: () => true },
  { src: '/avatars/Starter-2.png', label: 'Starter 2', unlock: () => true },
  { src: '/avatars/Starter-3.png', label: 'Starter 3', unlock: () => true },
  { src: '/avatars/Starter-4.png', label: 'Starter 4', unlock: () => true },
  { src: '/avatars/Starter-5.png', label: 'Starter 5', unlock: () => true },
  { src: '/avatars/Starter-6.png', label: 'Starter 6', unlock: () => true },
  { src: '/avatars/Starter-7.png', label: 'Starter 7', unlock: () => true },
  { src: '/avatars/Starter-8.png', label: 'Starter 8', unlock: () => true },
  { src: '/avatars/Starter-9.png', label: 'Starter 9', unlock: () => true },
  { src: '/avatars/Starter-10.png', label: 'Starter 10', unlock: () => true },
  {
    src: '/avatars/Match-wins.png',
    label: 'Win 50 Matches',
    unlock: (s) => (s.wins || 0) >= 50,
  },
  {
    src: '/avatars/Match-played.png',
    label: 'Play 100 Matches',
    unlock: (s) => (s.matchesPlayed || 0) >= 100,
  },
  {
    src: '/avatars/Tournaments-won.png',
    label: 'Win 5 Tournaments',
    unlock: (s) => (s.tournamentsWon || 0) >= 5,
  },
];

/* ---------- helpers ---------- */
function toDateSafe(input: FirestoreTs): Date | null {
  if (!input) return null;
  try {
    if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
    if (typeof input === 'number') {
      const ms = input > 1e12 ? input : input * 1000;
      const d = new Date(ms);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof input === 'string') {
      const d = new Date(input);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof input === 'object' && 'seconds' in input) {
      const ms = (input.seconds ?? 0) * 1000;
      const d = new Date(ms);
      return isNaN(d.getTime()) ? null : d;
    }
  } catch {}
  return null;
}

export default function ProfilePage() {
  const [user, loadingAuth] = useAuthState(auth);

  const [profile, setProfile] = useState<ProfileData>({});
  const [loading, setLoading] = useState(true);

  const [avatar, setAvatar] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [gamertag, setGamertag] = useState<string>('');

  const [saving, setSaving] = useState(false);

  // Platform wallet (env) → compute its TrenCoin ATA (vault)
  const PLATFORM_WALLET = process.env.NEXT_PUBLIC_PLATFORM_WALLET || '';
  const mintPk = useMemo(() => new PublicKey(TREN_MINT), []);
  const platformPk = useMemo(() => {
    try {
      return PLATFORM_WALLET ? new PublicKey(PLATFORM_WALLET) : null;
    } catch {
      return null;
    }
  }, [PLATFORM_WALLET]);

  const [vaultAta, setVaultAta] = useState<string>('');
  const [loadingAta, setLoadingAta] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!platformPk) return;
        const ata = await getAssociatedTokenAddress(
          mintPk,
          platformPk,
          false,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );
        if (mounted) setVaultAta(ata.toBase58());
      } finally {
        if (mounted) setLoadingAta(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [mintPk, platformPk]);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const data = (snap.exists() ? (snap.data() as ProfileData) : {}) || {};

      setProfile(data);
      setAvatar(data.avatar || AVATAR_OPTIONS[0].src);
      setUsername(data.username || '');

      // Prefer gamertag; fallback to legacy linkedAccount
      const tag =
        (typeof data.gamertag === 'string' && data.gamertag.trim()) ||
        (typeof data.linkedAccount === 'string' && data.linkedAccount.trim()) ||
        '';
      setGamertag(tag);

      setLoading(false);
    })();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const userRef = doc(db, 'users', user.uid);

    await setDoc(
      userRef,
      {
        avatar,
        username,
        gamertag: gamertag.trim(),
        // mirror to legacy key so older screens keep working
        linkedAccount: gamertag.trim(),
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    setSaving(false);
    alert('Profile updated!');
  };

  if (loadingAuth || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-2xl text-yellow-400">
        Loading Profile…
      </div>
    );
  }

  const stats = {
    wins: profile.wins ?? 0,
    matchesPlayed: profile.matchesPlayed ?? 0,
    tournamentsWon: profile.tournamentsWon ?? 0,
  };

  const subActive = Boolean(profile.subscriptionActive);
  const subExpiresDate = toDateSafe(profile.subscriptionExpires);

  return (
    <div className="relative min-h-screen px-4 py-10 flex flex-col items-center overflow-hidden">
      {/* Bright gradient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(1200px 600px at 20% -10%, rgba(255,215,0,0.18) 0%, rgba(255,215,0,0) 60%), radial-gradient(1000px 500px at 90% 10%, rgba(147,51,234,0.25) 0%, rgba(147,51,234,0) 65%), linear-gradient(180deg, #0f0520 0%, #1a0030 45%, #0e0524 100%)',
        }}
      />

      {/* Moving light wash */}
      <div className="absolute -z-10 inset-0 opacity-60">
        <div
          className="absolute -top-1/3 -left-1/3 w-[120vw] h-[120vh] animate-sweep"
          style={{
            background:
              'radial-gradient(40% 30% at 50% 50%, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0) 100%)',
            filter: 'blur(18px)',
          }}
        />
      </div>

      {/* Flickering particles — depth layers */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {[...Array(90)].map((_, i) => (
          <span
            key={`b-${i}`}
            className="absolute bg-white rounded-full animate-flicker-slow"
            style={{
              width: 2,
              height: 2,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.55,
              filter: 'blur(0.5px)',
              animationDelay: `${(Math.random() * 3).toFixed(2)}s`,
              animationDuration: `${(3.5 + Math.random() * 3).toFixed(2)}s`,
              boxShadow: '0 0 6px rgba(255,255,255,0.45)',
              willChange: 'opacity, transform',
            }}
          />
        ))}
        {[...Array(60)].map((_, i) => (
          <span
            key={`m-${i}`}
            className="absolute bg-white rounded-full animate-flicker"
            style={{
              width: Math.random() > 0.7 ? 3 : 2,
              height: Math.random() > 0.7 ? 3 : 2,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.75,
              filter: 'blur(0.4px)',
              animationDelay: `${(Math.random() * 2).toFixed(2)}s`,
              animationDuration: `${(2.4 + Math.random() * 2.4).toFixed(2)}s`,
              boxShadow: '0 0 8px rgba(255,255,255,0.6)',
              willChange: 'opacity, transform',
            }}
          />
        ))}
        {[...Array(30)].map((_, i) => (
          <span
            key={`f-${i}`}
            className="absolute bg-white rounded-full animate-flicker-fast"
            style={{
              width: Math.random() > 0.5 ? 4 : 3,
              height: Math.random() > 0.5 ? 4 : 3,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.9,
              filter: 'blur(0.3px)',
              animationDelay: `${(Math.random() * 1.5).toFixed(2)}s`,
              animationDuration: `${(1.4 + Math.random() * 1.4).toFixed(2)}s`,
              boxShadow: '0 0 10px rgba(255,255,255,0.85)',
              willChange: 'opacity, transform',
            }}
          />
        ))}
      </div>

      {/* Title + Avatar */}
      <div className="w-full max-w-3xl bg-[#191933]/85 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-12 border-2 border-purple-800 ring-1 ring-purple-400/20">
        <h1 className="text-4xl font-extrabold text-purple-100 mb-6 flex items-center gap-3 drop-shadow">
          <span role="img" aria-label="profile">👤</span> Profile
        </h1>

        <div className="flex gap-10 items-center flex-wrap">
          {/* Avatar picker */}
          <div>
            <div className="mb-2 text-lg font-semibold text-white">Avatar:</div>

            {/* MOBILE: 3-column grid; DESKTOP: keep original flex */}
            <div className="grid grid-cols-3 gap-3 justify-items-center md:flex md:flex-wrap md:gap-3">
              {AVATAR_OPTIONS.map((opt, i) => {
                const unlocked = opt.unlock({
                  wins: profile.wins ?? 0,
                  matchesPlayed: profile.matchesPlayed ?? 0,
                  tournamentsWon: profile.tournamentsWon ?? 0,
                });

                const isLast = i === AVATAR_OPTIONS.length - 1; // boxing-gloves avatar

                return (
                  <div
                    key={opt.src}
                    className={[
                      // center the last avatar on the final row (mobile only)
                      isLast ? 'col-start-2 md:col-start-auto' : '',
                      'relative rounded-full border-4 transition-transform cursor-pointer',
                      avatar === opt.src
                        ? 'border-yellow-400 scale-110'
                        : unlocked
                        ? 'border-purple-400 opacity-100'
                        : 'border-gray-500 opacity-50',
                    ].join(' ')}
                    onClick={() => unlocked && setAvatar(opt.src)}
                    title={opt.label}
                    style={{ width: 74, height: 74, overflow: 'hidden', background: '#221a40' }}
                  >
                    <Image src={opt.src} width={70} height={70} alt={opt.label} className="rounded-full" />
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold text-xs rounded-full">
                        🔒
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Profile settings */}
          <div className="flex-1">
            <div className="mb-3">
              <label className="text-white font-bold block mb-1">Username</label>
              <input
                className="bg-[#292947] rounded px-4 py-2 text-white w-full border border-purple-700/50 focus:border-yellow-400 outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={16}
              />
            </div>

            <div className="mb-3">
              <label className="text-white font-bold block mb-1">Gamertag</label>
              <input
                className="bg-[#292947] rounded px-4 py-2 text-white w-full border border-purple-700/50 focus:border-yellow-400 outline-none"
                value={gamertag}
                onChange={(e) => setGamertag(e.target.value)}
                placeholder="Your PSN/Xbox tag"
                maxLength={32}
              />
              {profile.gamertag === undefined && profile.linkedAccount && (
                <p className="text-xs text-gray-400 mt-1">Loaded from your previous “Linked Account”.</p>
              )}
            </div>

            <button
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-7 py-2 mt-2 rounded shadow-lg transition disabled:opacity-60"
              onClick={saveProfile}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>

          {/* Subscription */}
          <div>
            {!PLATFORM_WALLET && (
              <div className="text-red-400 text-sm mb-2">
                Set <code className="bg-black/30 px-1 rounded">NEXT_PUBLIC_PLATFORM_WALLET</code> in <code>.env.local</code>.
              </div>
            )}

            {loadingAta ? (
              <div className="text-gray-400">Computing vault ATA…</div>
            ) : platformPk && vaultAta ? (
              <SubscriptionButton
                user={{
                  uid: (auth.currentUser?.uid as string) || '',
                  subscriptionActive: subActive,
                  subscriptionExpires: subExpiresDate || null,
                }}
                vaultToken={vaultAta}
                priceUsd={14.99}
              />
            ) : (
              <div className="text-red-400 text-sm">
                Couldn’t compute vault ATA. Check your platform wallet env var.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Referral Code */}
      <div className="w-full max-w-3xl mb-7">
        <div className="bg-[#221a40]/85 backdrop-blur-sm rounded-2xl border border-purple-700 px-7 py-5 text-white flex items-center gap-2 ring-1 ring-purple-400/10">
          <span>Your Referral Code:</span>
          <strong className="text-yellow-300 text-lg">{profile.referralCode || 'N/A'}</strong>
        </div>
      </div>

      {/* Stats + Recent */}
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-7">
        <div className="rounded-3xl bg-gradient-to-br from-[#31204d]/90 to-[#201032]/90 border-2 border-purple-700 shadow-xl p-8 ring-1 ring-purple-400/10">
          <h2 className="text-2xl font-extrabold text-yellow-400 mb-5">🔥 Your Stats</h2>
          <ul className="text-white text-lg space-y-2">
            <li>Matches Played: <span className="text-yellow-300 font-bold">{profile.matchesPlayed ?? 0}</span></li>
            <li>Wins / Losses: <span className="text-yellow-300 font-bold">{profile.wins ?? 0} / {profile.losses ?? 0}</span></li>
            <li>Win Rate %: <span className="text-yellow-300 font-bold">
              {profile.matchesPlayed ? (((profile.wins ?? 0) / (profile.matchesPlayed || 1)) * 100).toFixed(1) : '0'}%
            </span></li>
            <li>Longest Win Streak: <span className="text-yellow-300 font-bold">{profile.winStreak ?? 0}</span></li>
            <li>Favorite Game: <span className="text-yellow-300 font-bold">{profile.favoriteGame || 'N/A'}</span></li>
            <li>Current Rank: <span className="text-yellow-300 font-bold">{profile.division || 'Unranked'}</span></li>
            <li>Tournaments Won: <span className="text-yellow-300 font-bold">{profile.tournamentsWon ?? 0}</span></li>
          </ul>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-[#1c1130]/90 to-[#160f25]/90 border-2 border-purple-700 shadow-xl p-8 flex flex-col ring-1 ring-purple-400/10">
          <h2 className="text-2xl font-extrabold text-yellow-400 mb-5">🎉 Recent Matches</h2>
          <div className="text-gray-300 italic">No recent matches played yet.</div>
        </div>
      </div>

      <style jsx>{`
        @keyframes sweep {
          0% { transform: rotate(12deg) translateX(-20%); }
          50% { transform: rotate(12deg) translateX(10%); }
          100% { transform: rotate(12deg) translateX(-20%); }
        }
        .animate-sweep { animation: sweep 9s ease-in-out infinite; }

        @keyframes flicker-slow { 0%,100% { opacity: .55; transform: scale(1); } 50% { opacity: .25; transform: scale(.9);} }
        .animate-flicker-slow { animation: flicker-slow 4.2s ease-in-out infinite; }

        @keyframes flicker { 0%,100% { opacity: .75; transform: scale(1);} 50% { opacity: .3; transform: scale(.9);} }
        .animate-flicker { animation: flicker 2.8s ease-in-out infinite; }

        @keyframes flicker-fast { 0%,100% { opacity: .9; transform: scale(1);} 50% { opacity: .45; transform: scale(.92);} }
        .animate-flicker-fast { animation: flicker-fast 1.8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import MatchCard from './MatchCard';
import { TrenGameId } from '../lib/games';
import { useEffect, useState } from 'react';

type Match = {
  id: string;
  gameId?: TrenGameId;
  game?: string;
  platform: string;
  entryFee: number;
  status: string; // "open" | "full" | "pending" | "expired" | ...
  creatorUserId: string;
  joinerUserId?: string | null;
  division: string;

  // 🔑 New: we’ll filter out expired matches in the UI
  // This can be a Firestore Timestamp, number (ms), or ISO string.
  expireAt?: any;
};

interface MatchGridProps {
  matches: Match[];
  selectedGameKey?: TrenGameId | 'all';
}

// 🔑 Helpers to interpret expireAt and decide if a match is still "alive"
const toMillis = (t: any): number | null => {
  if (t == null) return null;
  if (typeof t === 'number') return t;
  if (typeof t === 'string') return Number.isNaN(Date.parse(t)) ? null : Date.parse(t);
  // Firestore Timestamp
  if (typeof t?.toMillis === 'function') return t.toMillis();
  return null;
};

const isAlive = (m: Match) => {
  const ms = toMillis((m as any).expireAt);
  return ms == null || ms > Date.now();
};

export default function MatchGrid({ matches, selectedGameKey }: MatchGridProps) {
  const [user] = useAuthState(auth);
  const [pageSize, setPageSize] = useState(6); // default desktop

  // 🔁 Re-render periodically so items disappear exactly when expireAt passes
  useEffect(() => {
    const id = setInterval(() => {
      // trigger a re-render; no state needed besides this noop bump
      setPageSize((s) => s);
    }, 30_000); // every 30s is plenty
    return () => clearInterval(id);
  }, []);

  // detect screen size to switch between 5 (mobile) and 6 (desktop)
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 768) {
        setPageSize(5); // mobile (Tailwind md = 768px)
      } else {
        setPageSize(6); // desktop
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Helper: prioritize "open" first
  const sortOpenFirst = (arr: Match[]) =>
    [...arr].sort((a, b) => {
      const ao = (a.status ?? '').toLowerCase() === 'open' ? 0 : 1;
      const bo = (b.status ?? '').toLowerCase() === 'open' ? 0 : 1;
      return ao - bo;
    });

  // 🔑 Filter out expired and explicitly "expired" status before any slicing
  const alive = matches.filter((m) => isAlive(m) && (m.status ?? '').toLowerCase() !== 'expired');

  let limited: Match[] = [];

  if (!selectedGameKey || selectedGameKey === 'all') {
    // ALL: show open first, then slice
    const sorted = sortOpenFirst(alive);
    limited = sorted.slice(0, pageSize);
  } else {
    // SPECIFIC GAME: show first open matches for that game; backfill with others if needed
    const gameMatches = alive.filter((m) => m.gameId === selectedGameKey);
    const open = gameMatches.filter((m) => (m.status ?? '').toLowerCase() === 'open');
    const nonOpen = gameMatches.filter((m) => (m.status ?? '').toLowerCase() !== 'open');
    limited = [...open, ...nonOpen].slice(0, pageSize);
  }

  if (limited.length === 0) {
    return (
      <div className="text-center text-sm text-gray-400 py-8">
        No matches available
        {selectedGameKey && selectedGameKey !== 'all' ? ` for ${selectedGameKey.replace('_', ' ')}` : ''}.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-3 sm:px-0">
      {limited.map((match) => (
        <MatchCard key={match.id} match={match as any} currentUser={user} />
      ))}
    </div>
  );
}

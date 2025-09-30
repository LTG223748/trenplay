'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import MatchCard from './MatchCard';
import { TrenGameId } from '../lib/games';
import { useEffect, useState } from 'react';

type ReportsSide = { outcome?: 'win' | 'loss' | 'draw' | 'backed_out'; submittedAt?: any };
type Reports = { creator?: ReportsSide; joiner?: ReportsSide };

type Match = {
  id: string;
  gameId?: TrenGameId;
  game?: string;
  platform: string;
  entryFee: number;
  status?: string;
  creatorUserId: string;
  joinerUserId?: string | null;
  division: string;
  expireAt?: any;
  active?: boolean;
  reports?: Reports;
};

interface MatchGridProps {
  matches: Match[];
  selectedGameKey?: TrenGameId | 'all';
}

// ---------- helpers ----------
const toMillis = (t: any): number | null => {
  if (t == null) return null;
  if (typeof t === 'number') return t;
  if (typeof t === 'string') return Number.isNaN(Date.parse(t)) ? null : Date.parse(t);
  if (typeof t?.toMillis === 'function') return t.toMillis();
  return null;
};

const isNotExpiredByTime = (m: Match) => {
  const ms = toMillis(m.expireAt as any);
  return ms == null || ms > Date.now();
};

const bothReported = (m: Match) =>
  Boolean((m as any)?.reports?.creator?.outcome) &&
  Boolean((m as any)?.reports?.joiner?.outcome);

const isGridActive = (m: Match) => {
  if (typeof (m as any).active === 'boolean') {
    if ((m as any).active === false) return false;
  }
  const status = (m.status ?? '').toLowerCase();
  if (['completed', 'cancelled', 'expired', 'disputed'].includes(status)) return false;
  if (bothReported(m)) return false;
  return isNotExpiredByTime(m);
};

export default function MatchGrid({ matches, selectedGameKey }: MatchGridProps) {
  const [user] = useAuthState(auth);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    const id = setInterval(() => setPageSize((s) => s), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const update = () => setPageSize(window.innerWidth < 768 ? 5 : 6);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const sortOpenFirst = (arr: Match[]) =>
    [...arr].sort((a, b) => {
      const ao = (a.status ?? '').toLowerCase() === 'open' ? 0 : 1;
      const bo = (b.status ?? '').toLowerCase() === 'open' ? 0 : 1;
      return ao - bo;
    });

  const visible = matches.filter(isGridActive);

  let limited: Match[] = [];
  if (!selectedGameKey || selectedGameKey === 'all') {
    const sorted = sortOpenFirst(visible);
    limited = sorted.slice(0, pageSize);
  } else {
    const gameMatches = visible.filter((m) => m.gameId === selectedGameKey);
    const open = gameMatches.filter((m) => (m.status ?? '').toLowerCase() === 'open');
    const nonOpen = gameMatches.filter((m) => (m.status ?? '').toLowerCase() !== 'open');
    limited = [...open, ...nonOpen].slice(0, pageSize);
  }

  if (limited.length === 0) {
    return (
      <div className="text-center text-sm text-gray-400 py-8">
        No matches available
        {selectedGameKey && selectedGameKey !== 'all' ? ` for ${String(selectedGameKey).replace('_', ' ')}` : ''}.
      </div>
    );
  }

  return (
    <div
      id="matches-grid" // 👈 Added for onboarding tour
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-3 sm:px-0"
    >
      {limited.map((match) => (
        <MatchCard key={match.id} match={match as any} currentUser={user} />
      ))}
    </div>
  );
}


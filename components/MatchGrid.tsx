// components/MatchGrid.tsx
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
  status: string; // "open" | "full" | ...
  creatorUserId: string;
  joinerUserId?: string | null;
  division: string;
};

interface MatchGridProps {
  matches: Match[];
  selectedGameKey?: TrenGameId | 'all';
}

export default function MatchGrid({ matches, selectedGameKey }: MatchGridProps) {
  const [user] = useAuthState(auth);
  const [pageSize, setPageSize] = useState(6); // default desktop

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
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Helper: prioritize "open" first
  const sortOpenFirst = (arr: Match[]) =>
    [...arr].sort((a, b) => {
      const ao = (a.status ?? '').toLowerCase() === 'open' ? 0 : 1;
      const bo = (b.status ?? '').toLowerCase() === 'open' ? 0 : 1;
      return ao - bo;
    });

  let limited: Match[] = [];

  if (!selectedGameKey || selectedGameKey === 'all') {
    // ALL: show open first, then slice
    const sorted = sortOpenFirst(matches);
    limited = sorted.slice(0, pageSize);
  } else {
    // SPECIFIC GAME: show first open matches for that game; backfill with others if needed
    const gameMatches = matches.filter((m) => m.gameId === selectedGameKey);
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

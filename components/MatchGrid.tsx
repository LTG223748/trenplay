// components/MatchGrid.tsx
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import MatchCard from './MatchCard';
import { TrenGameId } from '../lib/games';

type Match = {
  id: string;
  /** NEW (preferred): gameId from lib/games.ts */
  gameId?: TrenGameId;
  /** BACKWARD COMPAT: older docs that stored a plain string */
  game?: string;

  platform: string;
  entryFee: number;
  status: string;
  creatorUserId: string;
  joinerUserId?: string | null;
  division: string;
};

interface MatchGridProps {
  matches: Match[];
  /** Optional: pass the selected tab (e.g., "rocket_league", "fortnite_build", or "all") */
  selectedGameKey?: TrenGameId | 'all';
}

export default function MatchGrid({ matches, selectedGameKey }: MatchGridProps) {
  const [user] = useAuthState(auth);

  // Filter by selected game if provided (keeps backward compatibility)
  const filtered = (() => {
    if (!selectedGameKey || selectedGameKey === 'all') return matches;
    return matches.filter((m) => m.gameId === selectedGameKey);
  })();

  if (!filtered || filtered.length === 0) {
    return (
      <div className="text-center text-sm text-gray-400 py-8">
        No matches available{selectedGameKey && selectedGameKey !== 'all' ? ` for ${selectedGameKey.replace('_', ' ')}` : ''}.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
      {filtered.map((match) => (
        <MatchCard key={match.id} match={match as any} currentUser={user} />
      ))}
    </div>
  );
}






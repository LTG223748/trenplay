import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import MatchCard from './MatchCard';

interface Match {
  id: string;
  game: string;
  platform: string;
  entryFee: number;
  status: string;
  creatorUserId: string;
  joinerUserId?: string | null;
  division: string;
}

interface MatchGridProps {
  matches: Match[];
}

export default function MatchGrid({ matches }: MatchGridProps) {
  const [user] = useAuthState(auth);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} currentUser={user} />
      ))}
    </div>
  );
}





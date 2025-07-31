import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  increment,
  Timestamp,
  addDoc,
  collection,
} from 'firebase/firestore';
import { generateBracketAndSchedule } from '../utils/generateBracketAndSchedule';

interface Tournament {
  id: string;
  name: string;
  entryfee: number;
  players: string[];
  prizepool: number;
  type: number;
  status: string;
  platform: string;   // required for split lobbies
  division?: string;
  [key: string]: any;
}

interface Props {
  tournament: Tournament;
}

function getTomorrowNoon(): Date {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);
  return tomorrow;
}

export default function JoinTournamentButton({ tournament }: Props) {
  const [user] = useAuthState(auth);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userDivision, setUserDivision] = useState<string>("");

  // Get user's division on mount
  useEffect(() => {
    if (!user) return;
    const fetchDivision = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        setUserDivision(userSnap.data()?.division || "Rookie");
      } catch {
        setUserDivision("Rookie");
      }
    };
    fetchDivision();
  }, [user]);

  // Track joined status
  useEffect(() => {
    if (!user || !Array.isArray(tournament.players)) return;
    setJoined(tournament.players.includes(user.uid));
  }, [user, tournament]);

  const handleJoin = async () => {
    setError(null);

    // --- Optional: Uncomment to restrict platform joining ---
    // if (user && tournament.platform) {
    //   const userPlatform = ... // <- If you store user platform, compare here!
    //   if (userPlatform !== tournament.platform) {
    //     setError(`This tournament is for ${tournament.platform} players only.`);
    //     return;
    //   }
    // }
    //------------------------------------------------------

    if (!user || joined || (Array.isArray(tournament.players) && tournament.players.length >= tournament.type)) return;
    if (tournament.division && tournament.division !== userDivision) {
      setError(`This is a ${tournament.division} tournament. You are in ${userDivision} division.`);
      return;
    }

    setLoading(true);

    const userRef = doc(db, 'users', user.uid);
    const tournamentRef = doc(db, 'tournaments', tournament.id);

    try {
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      if ((userData?.tc || 0) < tournament.entryfee) {
        setError('Not enough TC to join.');
        setLoading(false);
        return;
      }

      // Deduct TC and add player
      await updateDoc(userRef, { tc: increment(-tournament.entryfee) });
      await updateDoc(tournamentRef, {
        players: arrayUnion(user.uid),
        prizepool: increment(tournament.entryfee),
      });

      // Re-fetch updated players
      const updatedSnap = await getDoc(tournamentRef);
      const updated = updatedSnap.data();
      const updatedPlayers: string[] = Array.isArray(updated.players) ? updated.players.filter(Boolean) : [];

      // If full, auto-generate bracket and match schedule, then update Firestore
      if (updatedPlayers.length === tournament.type) {
        const startDate = getTomorrowNoon();
        const startTimestamp = Timestamp.fromDate(startDate);

        // Generate the bracket and match schedule
        const { rounds, matchSchedule } = generateBracketAndSchedule(
          updatedPlayers,
          startTimestamp
        );

        await updateDoc(tournamentRef, {
          rounds,
          matchSchedule,
          status: 'scheduled',
          startDate: startTimestamp,
        });

        // Optionally send emails or notifications here
        fetch('/api/sendTournamentEmails', {
          method: 'POST',
          body: JSON.stringify({
            playerIds: updatedPlayers,
            tournamentId: tournament.id,
            matchSchedule,
          }),
          headers: { 'Content-Type': 'application/json' },
        });

        // 🔥 AUTO-CREATE NEW TOURNAMENT (copy config)
        await addDoc(collection(db, 'tournaments'), {
          name: tournament.name,
          entryfee: tournament.entryfee,
          players: [],
          prizepool: 0,
          type: tournament.type,
          status: 'waiting',
          platform: tournament.platform || 'Unknown',
          division: tournament.division || 'Rookie',
          createdAt: new Date(),
        });
      }

      setJoined(true);
    } catch (err: any) {
      console.error('Failed to join tournament:', err.message);
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Safe player count
  const joinedCount = Array.isArray(tournament.players)
    ? tournament.players.filter(Boolean).length
    : 0;

  return (
    <>
      {error && (
        <div className="bg-yellow-400 text-black p-2 mb-2 rounded text-center font-bold">
          {error}
        </div>
      )}
      <button
        onClick={handleJoin}
        disabled={
          loading ||
          joined ||
          !user ||
          joinedCount >= tournament.type
        }
        className={`mt-4 px-4 py-2 rounded font-semibold shadow ${
          joined
            ? 'bg-gray-500 cursor-not-allowed text-white'
            : 'bg-yellow-400 hover:bg-yellow-300 text-black'
        }`}
      >
        {joined
          ? 'Joined'
          : loading
          ? 'Joining...'
          : `Join Tournament (${joinedCount}/${tournament.type})`
        }
      </button>
    </>
  );
}







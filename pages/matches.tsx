// pages/matches.tsx
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import MatchGrid from '../components/MatchGrid';
import GameFilterBar from '../components/GameFilterBar';
import { TrenGameId } from '../lib/games';

type Match = {
  id: string;
  gameId?: TrenGameId;
  game?: string;
  platform: string;
  entryFee: number;
  status: string;
  creatorUserId: string;
  joinerUserId?: string | null;
  division: string;
  [key: string]: any;
};

function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDivision, setUserDivision] = useState<string | null>(null);
  const [user, userLoading] = useAuthState(auth);
  const router = useRouter();

  type GameKey = TrenGameId | 'all';
  const [selectedGameKey, setSelectedGameKey] = useState<GameKey>('all');

  const PLATFORM_OPTIONS = [
    { label: 'Console (Green)', value: 'Console-Green' },
    { label: 'Console (Blue)',  value: 'Console-Blue' },
  ];
  const [selectedPlatform, setSelectedPlatform] = useState('Console-Green');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      setUserDivision(snap.data()?.division || 'Rookie');
    })();
  }, [user]);

  useEffect(() => {
    if (!userDivision) return;
    (async () => {
      try {
        const q = query(
          collection(db, 'matches'),
          where('status', '==', 'open'),
          where('division', '==', userDivision)
        );
        const snap = await getDocs(q);
        const data: Match[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Match),
        }));
        setMatches(data);
      } catch (err) {
        console.error('Error fetching matches:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userDivision]);

  if (userLoading || !user) {
    return <div className="text-white p-10">Loading...</div>;
  }

  const platformFiltered = matches.filter((m) => m.platform === selectedPlatform);

  const gameFiltered =
    selectedGameKey === 'all'
      ? platformFiltered
      : platformFiltered.filter((m) => m.gameId === selectedGameKey);

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden bg-[#0d0d1f] text-white">
      <div className="relative z-10 p-8 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-yellow-300 drop-shadow-xl tracking-wide">
            🎮 Live Matches
          </h1>

          {/* 🔥 TrenPlay-themed Create Match button */}
          <button
            onClick={() => router.push('/create-match')}
            className="
              group relative inline-flex items-center gap-2
              rounded-full px-7 py-3
              font-extrabold tracking-wide
              text-white
              bg-gradient-to-r from-fuchsia-500 via-purple-600 to-cyan-500
              shadow-[0_0_20px_rgba(139,92,246,0.5)]
              transition
              hover:scale-105 hover:shadow-[0_0_32px_rgba(6,182,212,0.75)]
              focus:outline-none focus:ring-2 focus:ring-purple-400/70 focus:ring-offset-2 focus:ring-offset-[#0d0d1f]
            "
          >
            <span className="text-2xl leading-none font-bold">+</span>
            Create Match

            {/* optional shimmer */}
            <span
              className="
                pointer-events-none absolute inset-0 rounded-full
                opacity-0 group-hover:opacity-100 transition-opacity
                bg-gradient-to-r from-transparent via-white/20 to-transparent
              "
              style={{ maskImage: 'linear-gradient(90deg, transparent, black, transparent)' }}
            />
          </button>
        </div>

        {/* Game tabs */}
        <GameFilterBar
          selectedGameKey={selectedGameKey}
          onChange={setSelectedGameKey}
        />

        {/* Platform selector */}
        <div className="flex gap-3 mb-6">
          {PLATFORM_OPTIONS.map((p) => {
            const isActive = selectedPlatform === p.value;
            const activeCls =
              p.value === 'Console-Green'
                ? 'bg-green-400 text-black border-green-400'
                : 'bg-blue-400 text-black border-blue-400';
            return (
              <button
                key={p.value}
                className={`px-4 py-2 rounded-lg font-bold border-2 transition ${
                  isActive
                    ? activeCls
                    : 'bg-[#1a1a2e] text-white border-[#292947] hover:bg-[#242446]'
                }`}
                onClick={() => setSelectedPlatform(p.value)}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Match Grid */}
        {loading ? (
          <p className="text-white">Loading...</p>
        ) : gameFiltered.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="bg-gradient-to-r from-purple-600 via-yellow-400 to-pink-500 text-black px-10 py-8 rounded-3xl shadow-2xl text-2xl font-extrabold flex items-center gap-3">
              <span className="text-4xl animate-bounce">😴</span>
              No live matches in your division right now!
              <br />
              <span className="text-base text-gray-800 font-normal">
                Check back soon or start one yourself!
              </span>
            </div>
          </div>
        ) : (
          <>
            <MatchGrid matches={gameFiltered} selectedGameKey={selectedGameKey} />
            <p className="text-xs text-gray-400 mt-6 italic text-center">
              *Only matches in your division ({userDivision}) are shown. TC value shown in USD for reference only. All wagers are placed in TrenCoin (TC).
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(Matches), { ssr: false });

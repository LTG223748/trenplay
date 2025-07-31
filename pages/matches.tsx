// pages/matches.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import MatchGrid from '../components/MatchGrid';

interface Match {
  id: string;
  game: string;
  platform: string;
  entryFee: number;
  status: string;
  creatorUserId: string;
  joinerUserId?: string | null;
  division: string;
  [key: string]: any;
}

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDivision, setUserDivision] = useState<string | null>(null);
  const [user, userLoading] = useAuthState(auth);
  const router = useRouter();

  // Refactored: Platform filter state ("Console" only, but future-proofed)
 const PLATFORM_OPTIONS = [
  { label: 'All', value: 'All' },
  { label: 'Console (Green)', value: 'Console-Green' },
  { label: 'Console (Blue)', value: 'Console-Blue' }
];
const [selectedPlatform, setSelectedPlatform] = useState('All');


  useEffect(() => {
    if (!user) return;
    const fetchDivision = async () => {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      setUserDivision(userSnap.data()?.division || 'Rookie');
    };
    fetchDivision();
  }, [user]);

  useEffect(() => {
    if (!userDivision) return;
    const fetchMatches = async () => {
      try {
        const q = query(
          collection(db, 'matches'),
          where('status', '==', 'open'),
          where('division', '==', userDivision)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Match),
        }));
        setMatches(data);
      } catch (err) {
        console.error('Error fetching matches:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [userDivision]);

  if (userLoading || !user) {
    return <div className="text-white p-10">Loading...</div>;
  }

  // Refactored: filter matches by selected platform ("Console" only for now)
  const filteredMatches =
  selectedPlatform === 'All'
    ? matches
    : matches.filter((m) => m.platform === selectedPlatform);


  return (
    <div className="min-h-screen w-full relative overflow-x-hidden bg-[#0d0d1f] text-white">
      <div className="relative z-10 p-8 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-yellow-300 drop-shadow-xl tracking-wide">
            🎮 Live Matches
          </h1>
          <button
            onClick={() => router.push('/create-match')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded shadow-md transition"
          >
            ➕ Create Match
          </button>
        </div>

        {/* Platform tabs */}
        <div className="flex gap-3 mb-6">
  {PLATFORM_OPTIONS.map((p) => (
    <button
      key={p.value}
      className={`px-4 py-2 rounded-lg font-bold border-2 transition ${
        selectedPlatform === p.value
          ? (p.value === 'Console-Green'
              ? 'bg-green-400 text-black border-green-400'
              : p.value === 'Console-Blue'
              ? 'bg-blue-400 text-black border-blue-400'
              : 'bg-yellow-400 text-black border-yellow-400')
          : 'bg-[#1a1a2e] text-white border-[#292947] hover:bg-yellow-700 hover:text-white'
      }`}
      onClick={() => setSelectedPlatform(p.value)}
    >
      {p.label}
    </button>
  ))}
</div>


        {/* Match Grid */}
        {loading ? (
          <p className="text-white">Loading...</p>
        ) : filteredMatches.length === 0 ? (
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
            <MatchGrid matches={filteredMatches} />
            <p className="text-xs text-gray-400 mt-6 italic text-center">
              *Only matches in your division ({userDivision}) are shown. TC value shown in USD for reference only. All wagers are placed in TrenCoin (TC).
            </p>
          </>
        )}
      </div>
    </div>
  );
}





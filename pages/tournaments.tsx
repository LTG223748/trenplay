// pages/tournaments.tsx
import { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  DocumentData,
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import Bracket from '../components/Bracket';
import JoinTournamentButton from '../components/JoinTournamentButton';

// Utility icons for color
function getConsoleIcon(platform: string) {
  if (platform === 'Console-Green') return <span className="text-green-400 text-2xl">🎮</span>;
  if (platform === 'Console-Blue') return <span className="text-blue-400 text-2xl">🎮</span>;
  return <span className="text-gray-400 text-2xl">🎮</span>;
}
function getCardBorder(platform: string) {
  if (platform === 'Console-Green') return 'border-green-500';
  if (platform === 'Console-Blue') return 'border-blue-500';
  return 'border-purple-700';
}

async function fetchTrenPrice(): Promise<number> {
  const MINT = '3WJYZL3npenDeutrnNHhGLpXCok3mqrmuxcLjWGCtirf';
  try {
    const res = await fetch(
      `https://public-api.birdeye.so/public/price?address=${MINT}`,
      { headers: { 'X-API-KEY': 'public' } }
    );
    const json = await res.json();
    return json.data?.value ?? 0;
  } catch {
    return 0;
  }
}

interface Tournament {
  id: string;
  name: string;
  entryfee: number;
  players: string[];
  prizepool: number;
  startDate: any;
  status: string;
  type: number;
  platform: string; // "Console-Green" or "Console-Blue"
  division?: string;
  [key: string]: any;
}

export default function TournamentsPage() {
  const [user] = useAuthState(auth);
  const [userDivision, setUserDivision] = useState<string | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [trenPrice, setTrenPrice] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const u = await getDoc(doc(db, 'users', user.uid));
      setUserDivision((u.data() as DocumentData)?.division ?? 'Rookie');
    })();
  }, [user]);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'tournaments'));
      const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as Tournament) }));
      setTournaments(list);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const price = await fetchTrenPrice();
      setTrenPrice(price);
    })();
  }, []);

  if (loading || (user && userDivision === null)) {
    return <div className="text-white p-10">Loading tournaments…</div>;
  }

  // Filter by division first
  const filtered = tournaments.filter(
    t => (t.division || 'Rookie') === userDivision
  );

  // Split by console color
  const greenTournaments = filtered.filter(t => t.platform === 'Console-Green');
  const blueTournaments = filtered.filter(t => t.platform === 'Console-Blue');

  function renderTournaments(list: Tournament[], icon: any, label: string, cardBorder: string) {
    if (list.length === 0) return null;
    return (
      <>
        <div className="flex items-center gap-2 mb-2 mt-8">
          {icon}
          <span className="text-2xl font-bold">{label}</span>
        </div>
        <div className="space-y-8">
          {list.map(t => {
            const usdValue =
              trenPrice != null ? (t.entryfee * trenPrice).toFixed(2) : '…';
            return (
              <div
                key={t.id}
                className={`relative group bg-gradient-to-br from-[#1a0030] to-[#29004d] p-6 rounded-3xl shadow-xl border-2 ${cardBorder} overflow-hidden`}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-[#4b0082] to-[#dcb0ff] opacity-20 blur-xl"></div>
                <div className="relative z-10 space-y-4">
                  <div className="absolute top-4 right-4 flex items-center">
                    {getConsoleIcon(t.platform)}
                    <span className="font-bold uppercase tracking-wide text-xs ml-1 text-white">Console</span>
                  </div>
                  <h2 className="text-2xl text-[#e3b7ff] font-bold">
                    {t.name || `${t.type}-Player Tournament`}
                  </h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                    <span>Entry: <span className="text-white">{t.entryfee} TC</span></span>
                    <span>≈ <span className="text-green-300">${usdValue} USD</span></span>
                    <span>Prize pool: <span className="text-white">{t.prizepool} TC</span></span>
                    <span>Status: <span className="text-white">{t.status}</span></span>
                  </div>
                  <Bracket tournamentId={t.id} />
                  <JoinTournamentButton tournament={t} />
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c001a] px-6 py-10 font-[Orbitron] text-white">
      <h1 className="text-4xl font-extrabold text-[#dcb0ff] mb-8 drop-shadow-lg">
        🏆 {userDivision} Division Tournaments
      </h1>

      {/* USD Disclaimer at top right */}
      <div className="w-full flex justify-end mb-4">
        <div className="text-xs text-gray-400 italic max-w-xs text-right">
          Disclaimer: All tournaments use TrenCoin (TC). USD values are estimates for reference only and do not represent an actual dollar transaction.
        </div>
      </div>

      {/* Green Console Tournaments */}
      {renderTournaments(
        greenTournaments,
        <span className="text-green-400 text-2xl">🎮</span>,
        'Console (Green)',
        'border-green-500'
      )}

      {/* Blue Console Tournaments */}
      {renderTournaments(
        blueTournaments,
        <span className="text-blue-400 text-2xl">🎮</span>,
        'Console (Blue)',
        'border-blue-500'
      )}
    </div>
  );
}







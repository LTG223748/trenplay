// pages/tournaments.tsx
import React, { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  DocumentData,
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import BracketDisplay from '../components/BracketDisplay';
import JoinTournamentButton from '../components/JoinTournamentButton';
import TournamentHero from '../components/TournamentHero';

function getConsoleIcon(platform: string) {
  if (platform === 'Console-Green')
    return <span className="text-green-400 text-2xl">🎮</span>;
  if (platform === 'Console-Blue')
    return <span className="text-blue-400 text-2xl">🎮</span>;
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
    return json?.data?.value ?? 0;
  } catch {
    return 0;
  }
}

type Division = 'Rookie' | 'Pro' | 'Elite' | 'Legend';

interface Tournament {
  id: string;
  name: string;
  entryfee: number;
  players: string[];
  prizepool: number;
  startDate: any;
  status: string;
  type: number;
  platform: string;            // "Console-Green" | "Console-Blue"
  division?: string;
  matchSchedule?: any[];
  [key: string]: any;
}

const mapToDivision = (d?: string): Division => {
  const v = (d || 'Rookie').toLowerCase();
  if (v === 'pro') return 'Pro';
  if (v === 'elite') return 'Elite';
  if (v === 'legend') return 'Legend';
  return 'Rookie';
};

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
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Tournament) }));
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

  const currentDivision: Division = mapToDivision(userDivision);
  const filtered = tournaments.filter(
    (t) => mapToDivision(t.division) === currentDivision
  );

  const greenTournaments = filtered.filter((t) => t.platform === 'Console-Green');
  const blueTournaments = filtered.filter((t) => t.platform === 'Console-Blue');
  const nothingHere = greenTournaments.length === 0 && blueTournaments.length === 0;

  function renderTournaments(
    list: Tournament[],
    icon: React.ReactNode,
    label: string,
    cardBorder: string
  ) {
    if (list.length === 0) return null;
    return (
      <>
        <div className="flex items-center gap-2 mb-2 mt-8">
          {icon}
          <span className="text-2xl font-bold">{label}</span>
        </div>
        <div className="space-y-8">
          {list.map((t) => {
            const usdValue =
              trenPrice != null ? (t.entryfee * trenPrice).toFixed(2) : '—';
            return (
              <div
                key={t.id}
                className={`relative group bg-gradient-to-br from-[#1a0030] to-[#29004d] p-6 rounded-3xl shadow-xl border-2 ${cardBorder} overflow-hidden`}
              >
                {/* soft gradient halo */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#4b0082] to-[#dcb0ff] opacity-20 blur-xl" />

                {/* tiny coin sparkles (global keyframe so they always animate) */}
                <div className="pointer-events-none absolute inset-0">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <span
                      key={i}
                      className="tp-sparkle absolute block rounded-full bg-yellow-300"
                      style={{
                        width: Math.random() < 0.25 ? 3 : 2,   // subtle variance
                        height: Math.random() < 0.25 ? 3 : 2,
                        top: `${5 + Math.random() * 85}%`,
                        left: `${5 + Math.random() * 85}%`,
                        animationDelay: `${(i * 137) % 1800}ms`,
                        animationDuration: `${2200 + ((i * 97) % 1200)}ms`,
                        opacity: 0.85,
                        willChange: 'opacity, transform',
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="absolute top-4 right-4 flex items-center">
                    {getConsoleIcon(t.platform)}
                    <span className="font-bold uppercase tracking-wide text-xs ml-1 text-white">
                      Console
                    </span>
                  </div>

                  <h2 className="text-2xl text-[#e3b7ff] font-bold">
                    {t.name || `${t.type}-Player Tournament`}
                  </h2>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                    <span>
                      Entry: <span className="text-white">{t.entryfee} TC</span>
                    </span>
                    <span>
                      ≈ <span className="text-green-300">{usdValue === '—' ? '—' : `$${usdValue}`} USD</span>
                    </span>
                    <span>
                      Prize pool:{' '}
                      <span className="text-white">{t.prizepool} TC</span>
                    </span>
                    <span>
                      Status: <span className="text-white">{t.status}</span>
                    </span>
                  </div>

                  {/* Bracket preview */}
                  <BracketDisplay tournament={t} />

                  {/* Join button with subtle "casino pop" */}
                  <div className="inline-block animate-[pop_1.8s_ease-in-out_infinite]">
                    <JoinTournamentButton tournament={t} />
                  </div>
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
      {/* Grand-entrance divider */}
      <TournamentHero division={currentDivision} />

      {/* Division title */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-[#dcb0ff] mb-6 drop-shadow-lg">
        🏆 {currentDivision} Division Tournaments
      </h1>

      {/* USD Disclaimer at top right */}
      <div className="w-full flex justify-end mb-4">
        <div className="text-xs text-gray-400 italic max-w-xs text-right">
          Disclaimer: All tournaments use TrenCoin (TC). USD values are estimates
          for reference only and do not represent an actual dollar transaction.
        </div>
      </div>

      {/* Empty state or console sections */}
      {nothingHere ? (
        <div className="my-16 flex flex-col items-center justify-center text-center">
          <div className="mb-4 text-5xl">😴</div>
          <h3 className="text-2xl font-extrabold text-yellow-300 mb-2">
            No tournaments available (yet)
          </h3>
          <p className="text-violet-200/80 max-w-md">
            Check back soon, or start one to get the action rolling.
          </p>
        </div>
      ) : (
        <>
          {renderTournaments(
            greenTournaments,
            <span className="text-green-400 text-2xl">🎮</span>,
            'Console (Green)',
            'border-green-500'
          )}

          {renderTournaments(
            blueTournaments,
            <span className="text-blue-400 text-2xl">🎮</span>,
            'Console (Blue)',
            'border-blue-500'
          )}
        </>
      )}

      {/* pop + GLOBAL sparkle keyframes/class (so the dots always animate) */}
      <style jsx global>{`
        @keyframes pop {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(250,204,21,0)); }
          50% { transform: scale(1.03); filter: drop-shadow(0 0 10px rgba(250,204,21,.45)); }
        }
        @keyframes tpTwinkle {
          0%, 100% { opacity: 0.75; transform: scale(1); }
          50%      { opacity: 0;    transform: scale(0.55); }
        }
        .tp-sparkle {
          animation: tpTwinkle 2.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}






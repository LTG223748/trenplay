// pages/matches.tsx
import { useEffect, useMemo, useState } from 'react';
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

// ------- tiny in-file UI atoms so we don't edit other files -------
function BackgroundDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* base gradient */}
      <div className="absolute inset-0 bg-[#0b0b1a]" />
      {/* soft spotlight left */}
      <div className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full blur-3xl opacity-40"
           style={{ background: 'radial-gradient(40% 40% at 50% 50%, #7c3aed55 0%, transparent 60%)' }} />
      {/* soft spotlight right */}
      <div className="absolute -bottom-24 -right-24 h-[520px] w-[520px] rounded-full blur-3xl opacity-40"
           style={{ background: 'radial-gradient(40% 40% at 50% 50%, #06b6d455 0%, transparent 60%)' }} />
      {/* subtle noise */}
      <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
           style={{ backgroundImage: 'url("data:image/svg+xml;utf8,\
<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'120\' viewBox=\'0 0 120 120\'>\
<filter id=\'n\'>\
<feTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'2\' stitchTiles=\'stitch\'/>\
<feColorMatrix type=\'saturate\' values=\'0\'/>\
</filter>\
<rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.6\'/>\
</svg>")' }} />
    </div>
  );
}

function PageShell(props: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <BackgroundDecor />
      <div className="relative z-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{props.children}</div>
      </div>
    </div>
  );
}

function SectionHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pt-10 pb-6">
      <div>
        <div className="inline-flex items-center gap-3">
          <span className="text-yellow-300 text-3xl leading-none">🎮</span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-yellow-300 drop-shadow-[0_2px_12px_rgba(250,204,21,.25)]">
            Live Matches
          </h1>
        </div>
        <p className="mt-2 text-sm text-white/70">
          Browse open lobbies in your division, filter by title, and jump in.
        </p>
      </div>

      <button
        onClick={onCreate}
        className="group relative inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold tracking-wide
                   bg-gradient-to-r from-fuchsia-500 via-purple-600 to-cyan-500
                   shadow-[0_0_24px_rgba(139,92,246,0.45)] transition
                   hover:scale-[1.02] hover:shadow-[0_0_36px_rgba(6,182,212,0.7)]
                   active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-purple-400/70 focus:ring-offset-2 focus:ring-offset-transparent"
      >
        <span className="text-xl leading-none font-extrabold">＋</span>
        Create Match
        <span
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity
                     bg-gradient-to-r from-transparent via-white/15 to-transparent"
          style={{ maskImage: 'linear-gradient(90deg, transparent, black, transparent)' }}
        />
      </button>
    </div>
  );
}

function StickyFilters({
  selectedPlatform,
  setSelectedPlatform,
  selectedGameKey,
  setSelectedGameKey,
}: {
  selectedPlatform: string;
  setSelectedPlatform: (v: string) => void;
  selectedGameKey: TrenGameId | 'all';
  setSelectedGameKey: (v: TrenGameId | 'all') => void;
}) {
  const PLATFORM_OPTIONS = [
    { label: 'Console (Green)', value: 'Console-Green' },
    { label: 'Console (Blue)', value: 'Console-Blue' },
  ];

  return (
    <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pb-4
                    bg-gradient-to-b from-[#0b0b1a]/85 to-transparent backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
        {/* game tabs */}
        <GameFilterBar selectedGameKey={selectedGameKey} onChange={setSelectedGameKey} />
        {/* platform toggle */}
        <div className="mt-3 flex gap-3">
          {PLATFORM_OPTIONS.map((p) => {
            const isActive = selectedPlatform === p.value;
            const activeCls =
              p.value === 'Console-Green'
                ? 'bg-green-400 text-black border-green-300 shadow-[0_0_24px_rgba(74,222,128,.35)]'
                : 'bg-blue-400 text-black border-blue-300 shadow-[0_0_24px_rgba(96,165,250,.35)]';
            return (
              <button
                key={p.value}
                className={`px-4 py-2 rounded-lg font-semibold border transition
                           ${isActive ? activeCls : 'bg-white/5 text-white/85 border-white/15 hover:bg-white/10'}`}
                onClick={() => setSelectedPlatform(p.value)}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ division }: { division: string | null }) {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-2xl max-w-xl">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600
                        shadow-[0_0_32px_rgba(168,85,247,.45)] grid place-items-center">
          <span className="text-2xl">😴</span>
        </div>
        <h3 className="text-xl font-bold">No live matches right now</h3>
        <p className="mt-2 text-sm text-white/70">
          Nothing open in your division{division ? ` (${division})` : ''}. Check back soon or start one yourself!
        </p>
      </div>
    </div>
  );
}

function SkeletonGrid() {
  const items = Array.from({ length: 6 });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((_, i) => (
        <div key={i} className="rounded-2xl h-40 bg-white/5 border border-white/10 overflow-hidden">
          <div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%]" />
        </div>
      ))}
    </div>
  );
}
// -------------------------------------------------------------------

function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDivision, setUserDivision] = useState<string | null>(null);
  const [user, userLoading] = useAuthState(auth);
  const router = useRouter();

  type GameKey = TrenGameId | 'all';
  const [selectedGameKey, setSelectedGameKey] = useState<GameKey>('all');
  const [selectedPlatform, setSelectedPlatform] = useState('Console-Green');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDoc(doc(db, 'users', user.uid));
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
        const data: Match[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Match) }));
        setMatches(data);
      } catch (err) {
        console.error('Error fetching matches:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userDivision]);

  const filtered = useMemo(() => {
    const pf = matches.filter((m) => m.platform === selectedPlatform);
    return selectedGameKey === 'all' ? pf : pf.filter((m) => m.gameId === selectedGameKey);
  }, [matches, selectedPlatform, selectedGameKey]);

  if (userLoading || !user) {
    return (
      <PageShell>
        <div className="py-24"><SkeletonGrid /></div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SectionHeader onCreate={() => router.push('/create-match')} />

      <StickyFilters
        selectedPlatform={selectedPlatform}
        setSelectedPlatform={setSelectedPlatform}
        selectedGameKey={selectedGameKey}
        setSelectedGameKey={setSelectedGameKey}
      />

      <div className="py-6">
        {loading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <EmptyState division={userDivision} />
        ) : (
          <>
            {/* MatchGrid handles card visuals; we give it clean spacing */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <MatchGrid matches={filtered} selectedGameKey={selectedGameKey} />
            </div>
            <p className="text-[11px] text-white/60 mt-4 text-center">
              *Only matches in your division ({userDivision}) are shown. TC value in USD is for reference.
              All wagers are placed in TrenCoin (TC).
            </p>
          </>
        )}
      </div>
    </PageShell>
  );
}

export default dynamic(() => Promise.resolve(Matches), { ssr: false });

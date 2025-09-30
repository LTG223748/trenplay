// pages/app/index.tsx
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { auth, db } from '../../lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

import BottomContent from '../../components/BottomContent';
import Footer from '../../components/Footer';

import Link from 'next/link';
import { FaQuestionCircle } from 'react-icons/fa';
import notify from '../../lib/notify';

import type { TrenGameId } from '../../lib/games';
import AuthGuard from '../../components/AuthGuard';

type GameKey = TrenGameId | 'all';

// Client-only components
const HeroSlider = dynamic(() => import('../../components/HeroSlider'), { ssr: false });
const DivisionFlanks = dynamic(() => import('../../components/DivisionFlanks'), { ssr: false });
const MatchGrid = dynamic(() => import('../../components/MatchGrid'), { ssr: false });
const GameFilterBar = dynamic(() => import('../../components/GameFilterBar'), { ssr: false });

// ---------- helpers ----------
const toMillis = (t: any) =>
  t?.toMillis?.() ?? (typeof t === 'number' ? t : typeof t === 'string' ? Date.parse(t) : null);

const isAlive = (m: any) => {
  const exp = toMillis(m?.expireAt);
  if (typeof exp === 'number') return exp > Date.now();
  const created = toMillis(m?.createdAt);
  return created ? Date.now() - created < 2 * 60 * 60 * 1000 : false;
};

const ALLOWED = new Set(['open', 'pending', 'active']);

export default function AppHome() {
  return (
    <AuthGuard>
      <HomePageContent />
    </AuthGuard>
  );
}

function HomePageContent() {
  const [user, loading, error] = useAuthState(auth);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [tc, setTc] = useState(0);
  const [division, setDivision] = useState('');
  const [matches, setMatches] = useState<any[]>([]);

  const [activeGame, setActiveGame] = useState<GameKey>('all');

  // Load profile
  useEffect(() => {
    if (!mounted || !user) return;
    (async () => {
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        const data = snap.data();
        setTc(data?.tc || 0);
        setDivision(data?.division || 'Unranked');
        if (data?.referralBonusJustReceived) {
          notify(
            '🎉 Referral Bonus!',
            'You and your friend just earned 1,000 TC each!',
            'success'
          );
          await updateDoc(ref, { referralBonusJustReceived: false });
        }
      } catch (err) {
        console.log('Error loading profile:', err);
      }
    })();
  }, [mounted, user]);

  // Load matches
  useEffect(() => {
    if (!mounted) return;
    (async () => {
      const snap = await getDocs(collection(db, 'matches'));
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as any));

      const cleaned = all
        .filter((m) => ALLOWED.has((m.status ?? '').toLowerCase()))
        .filter(isAlive);

      setMatches(cleaned);
    })();
  }, [mounted]);

  const norm = (s: any) =>
    (s ?? '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\s_-]/g, '');

  const CATEGORY_ALIASES: Record<string, string[]> = {
    nba2k: ['nba2k', '2k', 'nba2k24', 'nba2k25'],
    fifa: ['fifa', 'eafc', 'fc24', 'fc25', 'ea'],
    ufc: ['ufc'],
    madden: ['madden', 'nfl', 'madden24', 'madden25'],
    cfb: ['collegefootball', 'cfb', 'ncaa', 'ncaafootball'],
    mlb: ['mlbtheshow', 'mlb', 'theshow', 'mlb24', 'mlb25'],
    nhl: ['nhl', 'hockey'],
    fortnite_build: ['fortnite', 'fortnitebuild', 'fn', 'build'],
    rocket_league: ['rocketleague', 'rl', 'rocket', 'carball'],
  };

  const filteredMatches = useMemo(() => {
    const base = matches
      .filter((m: any) => ALLOWED.has((m.status ?? '').toLowerCase()))
      .filter(isAlive);

    if (activeGame === 'all') return base;

    return base.filter((m: any) => {
      const gameField = m.game ?? m.title ?? '';
      const g = norm(gameField);
      const key = norm(activeGame);
      if (g === key) return true;
      const aliases = CATEGORY_ALIASES[key] ?? [key];
      return aliases.some((a) => g.includes(a));
    });
  }, [matches, activeGame]);

  useEffect(() => {
    console.log('Auth state:', { user, loading, error });
  }, [user, loading, error]);

    return (
    <>
      {mounted ? <HeroSlider /> : <div style={{ height: 280 }} />}

      <GameFilterBar
        selectedGameKey={activeGame}
        onChange={(key) => setActiveGame(key as GameKey)}
      />

      {mounted ? <MatchGrid matches={filteredMatches} /> : <div className="min-h-[200px]" />}
      <BottomContent />

      {mounted ? <DivisionFlanks /> : null}

      {/* SECURITY & FAIR PLAY */}
      <section className="mt-16 max-w-4xl mx-auto px-6 text-white">
        <h2 className="text-3xl font-extrabold text-yellow-400 mb-6 text-center">
          Security & Fair Play
        </h2>
        {/* paste your 4 security cards here */}
      </section>

      {/* FAQ SNEAK PEEK */}
      <section className="mt-20 max-w-4xl mx-auto px-6 text-white">
        <h2 className="text-3xl font-extrabold text-yellow-400 mb-8 text-center">
          FAQ Sneak Peek
        </h2>
        {/* paste your FAQ list here */}
      </section>

      <Footer />
    </>
  );
}

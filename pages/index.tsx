import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

import HeroSlider from '../components/HeroSlider';
import GameFilterBar from '../components/GameFilterBar';
import MatchGrid from '../components/MatchGrid';
import BottomContent from '../components/BottomContent';
import DivisionFlanks from '../components/DivisionFlanks';
import Footer from '../components/Footer';

import Link from 'next/link';
import { FaQuestionCircle } from 'react-icons/fa';
import notify from '../lib/notify';

export default function HomePage() {
  const [user, loading, error] = useAuthState(auth);
  const [tc, setTc] = useState(0);
  const [division, setDivision] = useState('');
  const [matches, setMatches] = useState([]);
  const [activeGame, setActiveGame] = useState('All');

  const categories = [
    'All', 'NBA 2K', 'FIFA', 'UFC', 'Madden', 'College Football', 'MLB The Show'
  ];

  useEffect(() => {
    if (!user) {
      setTc(0);
      setDivision('');
      return;
    }
    const loadUserProfile = async () => {
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        const data = snap.data();
        setTc(data?.tc || 0);
        setDivision(data?.division || 'Unranked');
        if (data?.referralBonusJustReceived) {
          notify("🎉 Referral Bonus!", "You and your friend just earned 1,000 TC each!", "success");
          await updateDoc(ref, { referralBonusJustReceived: false });
        }
      } catch (err) {
        console.log('Error loading profile:', err);
      }
    };
    loadUserProfile();
  }, [user]);

  useEffect(() => {
    const loadMatches = async () => {
      const snap = await getDocs(collection(db, 'matches'));
      const allMatches = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMatches(allMatches);
    };
    loadMatches();
  }, []);

  // --- helpers for forgiving matching ---
  const norm = (s: any) =>
    (s ?? "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\s_-]/g, "");

  const CATEGORY_ALIASES: Record<string, string[]> = {
    nba2k: ["nba2k", "2k", "nba2k24", "nba2k25"],
    fifa: ["fifa", "eafc", "fc24", "fc25", "ea"],
    ufc: ["ufc"],
    madden: ["madden", "nfl", "madden24", "madden25"],
    collegefootball: ["collegefootball", "cfb", "ncaa", "ncaafootball"],
    mlbtheshow: ["mlbtheshow", "mlb", "theshow", "mlb24", "mlb25"],
  };

  // --- filtered matches ---
  const filteredMatches =
    activeGame === "All"
      ? matches
      : matches.filter((m: any) => {
          const gameField = m.game ?? m.title ?? ""; // adjust field name if needed
          const g = norm(gameField);

          const key = norm(activeGame); // e.g. "NBA 2K" -> "nba2k"
          if (g === key) return true;

          const aliases = CATEGORY_ALIASES[key] ?? [key];
          return aliases.some((a) => g.includes(a));
        });

  useEffect(() => {
    console.log('Auth state:', { user, loading, error });
  }, [user, loading, error]);

  return (
    <>
      <HeroSlider />

      <GameFilterBar
        categories={categories}
        activeGame={activeGame}
        setActiveGame={setActiveGame}
      />

      <MatchGrid matches={filteredMatches} />
      <BottomContent />

      {/* Division Flanks */}
      <DivisionFlanks />

      {/* SECURITY & FAIR PLAY */}
      <section className="mt-16 max-w-4xl mx-auto px-6 text-white">
        <h2 className="text-3xl font-extrabold text-yellow-400 mb-8 text-center [text-shadow:0_0_16px_rgba(250,204,21,.65)]">
          Security & Fair Play
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <svg width="60" height="60" viewBox="0 0 64 64" className="mx-auto mb-4">
              <path fill="#FACC15" d="M32 4l22 8v14c0 15.4-9.5 25.9-22 34-12.5-8.1-22-18.6-22-34V12l22-8z" />
              <path fill="#00000022" d="M32 4v52c12.5-8.1 22-18.6 22-34V12l-22-8z"/>
            </svg>
            <h3 className="font-semibold mb-2">Anti-Cheat Measures</h3>
            <p className="text-gray-300 text-sm">
              Detection, verification, and pattern checks keep every match fair.
            </p>
          </div>
          <div>
            <svg width="60" height="60" viewBox="0 0 64 64" className="mx-auto mb-4">
              <rect x="6" y="16" width="52" height="36" rx="6" fill="#FACC15" />
              <rect x="12" y="10" width="12" height="8" rx="2" fill="#FACC15" />
              <circle cx="32" cy="34" r="11" fill="#00000020" />
              <circle cx="32" cy="34" r="8" fill="#00000033" />
            </svg>
            <h3 className="font-semibold mb-2">Match Proof System</h3>
            <p className="text-gray-300 text-sm">
              Upload a screenshot or clip of the final score for instant verification.
            </p>
          </div>
          <div>
            <svg width="60" height="60" viewBox="0 0 64 64" className="mx-auto mb-4">
              <rect x="10" y="28" width="44" height="26" rx="6" fill="#FACC15" />
              <path fill="#FACC15" d="M20 28v-6c0-7 5-12 12-12s12 5 12 12v6h-6v-6c0-3.3-2.7-6-6-6s-6 2.7-6 6v6h-6z"/>
              <circle cx="32" cy="41" r="4.5" fill="#00000033" />
              <rect x="30.8" y="41" width="2.4" height="7" rx="1" fill="#00000033" />
            </svg>
            <h3 className="font-semibold mb-2">Secure Escrow</h3>
            <p className="text-gray-300 text-sm">
              Your coins are held safely while you play and released on confirmed results.
            </p>
          </div>
          <div>
            <svg width="60" height="60" viewBox="0 0 64 64" className="mx-auto mb-4">
              <path fill="#FACC15" d="M30 10h4v10h12v4H18v-4h12V10zM30 24h4v26h10v4H20v-4h10V24z"/>
              <line x1="32" y1="28" x2="18" y2="34" stroke="#FACC15" strokeWidth="4" />
              <path fill="#FACC15" d="M10 34l8-4 8 4c0 6-3.6 12-8 12s-8-6-8-12z" />
              <line x1="32" y1="28" x2="46" y2="34" stroke="#FACC15" strokeWidth="4" />
              <path fill="#FACC15" d="M38 34l8-4 8 4c0 6-3.6 12-8 12s-8-6-8-12z" />
            </svg>
            <h3 className="font-semibold mb-2">Dispute Resolution</h3>
            <p className="text-gray-300 text-sm">
              Transparent reviews for conflicts—evidence-based, fast, and fair.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SNEAK PEEK */}
      <section className="mt-20 max-w-4xl mx-auto px-6 text-white">
        <h2 className="text-3xl font-extrabold text-yellow-400 mb-8 text-center [text-shadow:0_0_14px_rgba(250,204,21,.6)]">
          FAQ Sneak Peek
        </h2>
        <ul className="space-y-4 max-w-xl mx-auto">
          {[
            'How do I connect my crypto wallet?',
            'What are Tren Coins used for?',
            'Is TrenPlay fair and skill-based?',
            'How do I start competing?',
            'How do divisions work?'
          ].map((q, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <FaQuestionCircle className="text-yellow-400 text-2xl flex-shrink-0" />
              <span>{q}</span>
            </li>
          ))}
        </ul>
        <div className="text-center mt-6">
          <Link
            href="/faq"
            className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-6 py-3 rounded-full transition shadow-[0_0_18px_rgba(250,204,21,.55)]"
          >
            View Full FAQ
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}

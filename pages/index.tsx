import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

import Layout from '../components/Layout';
import HeroSlider from '../components/HeroSlider';
import GameFilterBar from '../components/GameFilterBar';
import MatchGrid from '../components/MatchGrid';
import BottomContent from '../components/BottomContent';
import Footer from '../components/Footer';
import WalletConnectionProvider from '../context/WalletConnectionProvider';
import Link from 'next/link';
import { FaWallet, FaRocket, FaCoins, FaQuestionCircle } from 'react-icons/fa';
import notify from '../lib/notify'; // adjust the path if needed!

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [tc, setTc] = useState(0);
  const [division, setDivision] = useState('');
  const [matches, setMatches] = useState([]);
  const [activeGame, setActiveGame] = useState('All');

  const categories = [
    'All', 'NBA 2K', 'FIFA', 'UFC', 'Madden', 'College Football', 'MLB The Show'
  ];

  // Load user and handle referral toast
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const ref = doc(db, 'users', u.uid);
        const snap = await getDoc(ref);
        const data = snap.data();
        setTc(data?.tc || 0);
        setDivision(data?.division || 'Unranked');

        // === Referral Bonus Toast ===
        if (data?.referralBonusJustReceived) {
          notify("🎉 Referral Bonus!", "You and your friend just earned 1,000 TC each!", "success");
          // Optionally: unset the flag so it doesn't repeat
          await updateDoc(ref, { referralBonusJustReceived: false });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Load matches
  useEffect(() => {
    const loadMatches = async () => {
      const snap = await getDocs(collection(db, 'matches'));
      const allMatches = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMatches(allMatches);
    };
    loadMatches();
  }, []);

  const filteredMatches = activeGame === 'All'
    ? matches
    : matches.filter((match: any) => match.game === activeGame);

  return (
    <WalletConnectionProvider>
      <Layout user={user} tc={tc} division={division}>
        <HeroSlider />
        <GameFilterBar
          categories={categories}
          activeGame={activeGame}
          setActiveGame={setActiveGame}
        />
        <MatchGrid matches={filteredMatches} />
        <BottomContent />

        {/* HOW IT WORKS SECTION */}
        <section className="mt-16 max-w-4xl mx-auto px-6 text-white">
          <h2 className="text-3xl font-extrabold text-yellow-400 mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <FaWallet className="mx-auto mb-4 text-yellow-400 text-5xl" />
              <h3 className="font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-gray-300 text-sm">
                Securely link your Solana-compatible crypto wallet to manage your Tren Coins.
              </p>
            </div>
            <div>
              <FaCoins className="mx-auto mb-4 text-yellow-400 text-5xl" />
              <h3 className="font-semibold mb-2">Earn Tren Coins</h3>
              <p className="text-gray-300 text-sm">
                Compete in skill-based matches to earn Tren Coins that stay in your wallet.
              </p>
            </div>
            <div>
              <FaRocket className="mx-auto mb-4 text-yellow-400 text-5xl" />
              <h3 className="font-semibold mb-2">Climb the Leaderboard</h3>
              <p className="text-gray-300 text-sm">
                Use your skills to climb the ranks and prove you’re the best on TrenPlay.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ SNEAK PEEK */}
        <section className="mt-20 max-w-4xl mx-auto px-6 text-white">
          <h2 className="text-3xl font-extrabold text-yellow-400 mb-8 text-center">FAQ Sneak Peek</h2>
          <ul className="space-y-4 max-w-xl mx-auto">
            {[
              'How do I connect my crypto wallet?',
              'What are Tren Coins used for?',
              'Is TrenPlay fair and skill-based?',
              'How do I start competing?'
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
              className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-6 py-3 rounded-full shadow transition"
            >
              View Full FAQ
            </Link>
          </div>
        </section>

        <Footer />
      </Layout>
    </WalletConnectionProvider>
  );
}



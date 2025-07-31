import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

import Layout from '../components/Layout';
// Removed: import TrenLogo from '../components/TrenLogo';
import HeroSlider from '../components/HeroSlider';
import GameFilterBar from '../components/GameFilterBar';
import MatchGrid from '../components/MatchGrid';
import BottomContent from '../components/BottomContent';
import Footer from '../components/Footer';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [tc, setTc] = useState(0);
  const [division, setDivision] = useState('');
  const [matches, setMatches] = useState([]);
  const [activeGame, setActiveGame] = useState('All');

  const categories = ['All', 'NBA 2K', 'FIFA', 'UFC', 'Madden', 'College Football', 'MLB The Show'];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const ref = doc(db, 'users', u.uid);
        const snap = await getDoc(ref);
        const data = snap.data();
        setTc(data?.tc || 0);
        setDivision(data?.division || 'Unranked');
      }
    });
    return () => unsubscribe();
  }, []);

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
    : matches.filter((match) => match.game === activeGame);

  return (
    <Layout user={user} tc={tc} division={division}>
      {/* Removed: <TrenLogo /> */}
      <HeroSlider />
      <GameFilterBar
        categories={categories}
        activeGame={activeGame}
        setActiveGame={setActiveGame}
      />
      <MatchGrid matches={filteredMatches} />
      <BottomContent />
      <Footer />
    </Layout>
  );
}












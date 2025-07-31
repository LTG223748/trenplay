import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { getDocs, collection, doc, getDoc } from 'firebase/firestore';
import HeroSlider from './HeroSlider';
import MatchCard from './MatchCard';
import WelcomeSection from './WelcomeSection'; // import WelcomeSection

export default function HomeContent() {
  const [matches, setMatches] = useState([]);
  const [tc, setTc] = useState(0);
  const [division, setDivision] = useState('Unranked');

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        const data = snap.data();
        if (data) {
          setTc(data.tc || 0);
          setDivision(data.division || 'Unranked');
        }
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const loadMatches = async () => {
      const snap = await getDocs(collection(db, 'matches'));
      const allMatches = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMatches(allMatches);
    };
    loadMatches();
  }, []);

  return (
    <div className="p-6 text-white">
      {/* 🔥 Hero Banner Slider */}
      <HeroSlider />

      {/* 🔥 Match Grid Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-yellow-400 text-2xl font-bold">🔥 Live Matches</h2>
        <p className="text-sm text-gray-300 font-semibold">
          🪙 {tc} TC | 📈 {division}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>

      {/* 👋 Welcome Section BELOW matches */}
      <WelcomeSection />
    </div>
  );
} 

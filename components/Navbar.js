import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import {
  doc,
  onSnapshot,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import BuyCoinsModal from './BuyCoinsModal';

export default function Navbar() {
  const router = useRouter();
  const [balance, setBalance] = useState(null);
  const [division, setDivision] = useState('');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showLobbies, setShowLobbies] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setIsLoggedIn(!!user);

      if (!user) return;

      const ref = doc(db, 'users', user.email);
      const snap = await getDoc(ref);

      // 🔒 Create user doc if missing (failsafe)
      if (!snap.exists()) {
        await setDoc(ref, {
          email: user.email,
          username: 'NewUser',
          balance: 0,
          rank: 100,
          division: 'Rookie',
          online: true,
        });
      } else {
        await updateDoc(ref, { online: true });
      }

      // 🧠 Live balance + division
      const liveSnap = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setBalance(data.balance ?? 0);
          setDivision(data.division ?? '');
        }
      });

      // 📴 Mark offline on close
      const cleanup = () => updateDoc(ref, { online: false });
      window.addEventListener('beforeunload', cleanup);

      return () => {
        liveSnap();
        window.removeEventListener('beforeunload', cleanup);
        cleanup();
      };
    });

    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <>
      <nav className="bg-gray-900 text-white px-6 py-4 shadow-md flex justify-between items-center">
        <Link href="/" className="text-xl font-bold tracking-wide">
          TrenBet
        </Link>

        <div className="space-x-4 text-sm font-medium flex items-center">
          <Link href="/">Home</Link>
          <Link href="/create-match">Create</Link>
          <Link href="/matches">Matches</Link>
          <Link href="/upload-result">Results</Link>
          <Link href="/leaderboard">Leaderboard</Link>
          <Link href="/profile">Profile</Link>

          {/* 💰 Balance + Division */}
          {isLoggedIn && balance !== null && (
            <span className="text-green-400 font-semibold text-sm">
              {balance} TC {division && `| ${division}`}
            </span>
          )}

          {/* 💸 Buy TC */}
          <button
            onClick={() => setShowBuyModal(true)}
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-3 py-1 rounded transition"
          >
            Buy TC
          </button>

          {/* 🧩 Lobbies Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLobbies(!showLobbies)}
              className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-sm"
            >
              Lobbies ▾
            </button>
            {showLobbies && (
              <div className="absolute z-10 mt-2 bg-gray-800 text-white shadow-lg rounded p-2 space-y-1">
                <Link href="/lobby/5" className="block hover:text-yellow-400">5 TC</Link>
                <Link href="/lobby/10" className="block hover:text-yellow-400">10 TC</Link>
                <Link href="/lobby/25" className="block hover:text-yellow-400">25 TC</Link>
                <Link href="/lobby/50" className="block hover:text-yellow-400">50 TC</Link>
                <Link href="/lobby/100" className="block hover:text-yellow-400">100 TC</Link>
              </div>
            )}
          </div>

          {/* 🔐 Auth Buttons */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-500 px-4 py-1 rounded transition"
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/signup">
                <button className="bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1 rounded">
                  Sign Up
                </button>
              </Link>
              <Link href="/login">
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded">
                  Log In
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* 🪙 Buy Modal */}
      {showBuyModal && <BuyCoinsModal onClose={() => setShowBuyModal(false)} />}
    </>
  );
}
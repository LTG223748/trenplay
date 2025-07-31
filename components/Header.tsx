import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface HeaderProps {
  user: any;
  tc: number;
  division: string;
}

// Dynamically import wallet components (avoid SSR errors)
const WalletConnect = dynamic(() => import('./WalletConnect'), { ssr: false });
const TokenBalance = dynamic(() => import('./TokenBalance'), { ssr: false });

const STARTER_AVATARS = [
  '/avatars/Starter-1.png',
  '/avatars/Starter-2.png',
  '/avatars/Starter-3.png',
  '/avatars/Starter-4.png',
  '/avatars/Starter-5.png',
  '/avatars/Starter-6.png',
  '/avatars/Starter-7.png',
  '/avatars/Starter-8.png',
  '/avatars/Starter-9.png',
  '/avatars/Starter-10.png'
];

const pickRandomAvatar = () => STARTER_AVATARS[Math.floor(Math.random() * STARTER_AVATARS.length)];

const Header: React.FC<HeaderProps> = ({ user, tc, division }) => {
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(STARTER_AVATARS[0]);

  useEffect(() => {
    const fetchUsernameAndAvatar = async () => {
      if (user && user.uid) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userRef);
          setUsername(snap.data()?.username || user.email?.split('@')[0] || 'Player');
          // Avatar logic:
          if (snap.data()?.avatar) {
            setAvatarUrl(snap.data().avatar);
          } else {
            // Assign random avatar if none set, and (optionally) persist it:
            const randomAvatar = pickRandomAvatar();
            setAvatarUrl(randomAvatar);
            // Optionally persist to Firestore:
            // await updateDoc(userRef, { avatar: randomAvatar });
          }
        } catch (err) {
          setUsername(user.email?.split('@')[0] || 'Player');
          setAvatarUrl(pickRandomAvatar());
        }
      } else {
        setUsername(null);
        setAvatarUrl(STARTER_AVATARS[0]);
      }
    };
    fetchUsernameAndAvatar();
    // Only re-run if user changes
    // eslint-disable-next-line
  }, [user]);

  return (
    <header className="relative flex justify-between items-center px-6 py-4 bg-[#1a0030] text-white border-b border-[#3b2060] overflow-hidden">
      {/* Sparkle Overlay */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <span
            key={i}
            className="absolute bg-white rounded-full opacity-70 animate-sparkle"
            style={{
              width: '3px',
              height: '3px',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* LOGO on the left */}
      <div className="flex items-center relative z-10">
        <img
          src="/images/trenbet-logo.png"
          alt="Tren Bet Logo"
          className="h-24 w-auto mr-4"
          style={{ maxHeight: '120px' }}
        />
      </div>

      {/* Right side: Auth Box or Wallet + User Info */}
      <div className="flex items-center gap-6 text-sm relative z-10">
        {!user ? (
          <div className="flex items-center">
            <div className="flex items-center gap-4 bg-gradient-to-r from-[#2d0140] via-[#1a0030] to-[#5e2297] px-6 py-3 rounded-2xl shadow-lg border border-purple-700">
              <Link href="/signup">
                <button className="flex items-center gap-1 text-red-400 font-bold hover:text-yellow-300 text-lg">
                  <span className="text-2xl">👤</span>
                  <span className="text-xl">+</span>
                  Sign Up
                </button>
              </Link>
              <span className="border-r border-purple-400 h-8 mx-2"></span>
              <Link href="/login">
                <button className="flex items-center gap-1 text-red-400 font-bold hover:text-yellow-300 text-lg">
                  <span className="text-2xl">➡️</span>
                  Log In
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* WalletConnect untouched */}
            <WalletConnect />

            {/* User Info Box */}
            <div className="flex items-center gap-3 bg-gradient-to-br from-[#200041] via-[#2e005f] to-[#431078] px-5 py-2 rounded-xl shadow-lg border border-yellow-400">
              {/* Division */}
              <span className="text-yellow-300 bg-[#2d0140] px-3 py-1 rounded-lg text-lg font-bold border border-yellow-500 shadow">
                🥇 {division}
              </span>
              {/* Username from Firestore */}
              <span className="text-white font-semibold bg-[#3c1867] px-3 py-1 rounded-lg shadow border border-purple-600 text-base">
                {username}
              </span>
              {/* Avatar */}
              <Link href="/profile">
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-yellow-400 shadow hover:border-purple-400 cursor-pointer transition"
                />
              </Link>
              {/* Log Out button */}
              <button
                onClick={() => auth.signOut()}
                className="ml-3 text-red-500 font-bold border border-red-700 px-3 py-1 rounded hover:text-yellow-300 hover:border-yellow-300 transition"
              >
                Log Out
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes sparkle {
          0%, 100% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 0;
            transform: scale(0.5);
          }
        }
        .animate-sparkle {
          animation-name: sparkle;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
      `}</style>
    </header>
  );
};

export default Header;




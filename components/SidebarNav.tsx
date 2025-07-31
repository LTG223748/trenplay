import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FaHome,
  FaTrophy,
  FaChartBar,
  FaUser,
  FaGamepad,
  FaWallet,
  FaUsers,
  FaQuestionCircle,
  FaShieldAlt,
} from 'react-icons/fa';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const COLLAPSED_WIDTH = 40;
const EXPANDED_WIDTH = 224;

const navLinks = [
  { href: '/', label: 'Home', icon: <FaHome /> },
  { href: '/leaderboard', label: 'Leaderboard', icon: <FaChartBar /> },
  { href: '/tournaments', label: 'Tournaments', icon: <FaTrophy /> },
  { href: '/profile', label: 'Profile', icon: <FaUser /> },
  { href: '/matches', label: 'Matches', icon: <FaGamepad /> },
  { href: '/refer', label: 'Refer', icon: <FaUsers /> },
  { href: '/help', label: 'Help', icon: <FaQuestionCircle /> },
  { href: '/wallet', label: 'Wallet', icon: <FaWallet /> },
];

type SidebarNavProps = {
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
};

const SidebarNav: React.FC<SidebarNavProps> = ({ expanded, setExpanded }) => {
  const sidebarWidth = expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid)).then(docSnap => {
      setIsAdmin(!!docSnap.data()?.isAdmin);
    });
  }, [user]);

  return (
    <div
      className={`
        h-screen bg-[#2d0140] text-white flex flex-col items-center py-4
        transition-all duration-300 ease-in-out
        shadow-2xl z-40 fixed left-0 top-0
        ${expanded ? 'w-56 items-start px-4' : 'w-10 items-center'}
      `}
      style={{
        minWidth: sidebarWidth,
        width: sidebarWidth,
        borderTopRightRadius: 24,
        borderBottomRightRadius: 24,
      }}
    >
      {/* Hamburger menu */}
      <button
        onClick={() => setExpanded(x => !x)}
        className="mb-8 p-2 rounded hover:bg-[#38025b] transition"
        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <span className="text-xl">{expanded ? '←' : '☰'}</span>
      </button>

      {/* Nav links */}
      <nav className="flex flex-col gap-5 w-full">
        {navLinks.map(link => (
          <Link key={link.href} href={link.href} className="group relative">
            <div
              className={`flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[#3c1a5b] transition-all
                ${expanded ? 'justify-start w-full' : 'justify-center'}
              `}
              style={{ minHeight: 44 }}
            >
              <span
                className="text-2xl text-yellow-400 drop-shadow-[0_0_6px_rgba(255,238,102,0.9)]"
              >
                {link.icon}
              </span>
              {expanded && (
                <span className="text-base font-extrabold tracking-wider drop-shadow-lg font-[Orbitron] whitespace-nowrap text-yellow-300">
                  {link.label}
                </span>
              )}
            </div>
            {!expanded && (
              <span
                className="absolute left-12 top-1/2 -translate-y-1/2 bg-black bg-opacity-90 text-yellow-300 text-xs rounded-md px-2 py-1
                shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all whitespace-nowrap z-50"
              >
                {link.label}
              </span>
            )}
          </Link>
        ))}

        {/* Admin Link - only visible for admins */}
        {isAdmin && (
          <Link href="/admin" className="group relative">
            <div
              className={`flex items-center gap-4 px-4 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition-all
                ${expanded ? 'justify-start w-full' : 'justify-center'}
              `}
              style={{ minHeight: 44 }}
            >
              <span className="text-2xl drop-shadow-[0_0_6px_rgba(255,238,102,0.9)]">
                <FaShieldAlt />
              </span>
              {expanded && (
                <span className="text-base font-extrabold tracking-wider font-[Orbitron] whitespace-nowrap">
                  Admin
                </span>
              )}
            </div>
            {!expanded && (
              <span
                className="absolute left-12 top-1/2 -translate-y-1/2 bg-yellow-400 text-black text-xs rounded-md px-2 py-1
                shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all whitespace-nowrap z-50"
              >
                Admin
              </span>
            )}
          </Link>
        )}
      </nav>
    </div>
  );
};

export default SidebarNav;


   
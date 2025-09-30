// components/SidebarNav.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FaHome,
  FaTrophy,
  FaChartBar,
  FaUser,
  FaGamepad,
  FaUsers,
  FaQuestionCircle,
  FaShieldAlt,
  FaBookOpen,
  FaGift,           // 🎁 for Refer
} from 'react-icons/fa';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useSidebar } from '../context/SidebarContext';

const COLLAPSED_WIDTH = 40;
const EXPANDED_WIDTH = 224;

// ✅ Nav links updated
const navLinks = [
  { href: '/app', label: 'Home', icon: <FaHome /> },
  { href: '/leaderboard', label: 'Leaderboard', icon: <FaChartBar /> },
  { href: '/tournaments', label: 'Tournaments', icon: <FaTrophy /> },
  { href: '/profile', label: 'Profile', icon: <FaUser /> },
  { href: '/matches', label: 'Matches', icon: <FaGamepad /> },
  { href: '/friends', label: 'Friends', icon: <FaUsers /> },   // 👥 Friends list
  { href: '/refer', label: 'Refer', icon: <FaGift /> },        // 🎁 Referral program
  { href: '/howto', label: 'How To Use', icon: <FaBookOpen /> },
  { href: '/help', label: 'Help', icon: <FaQuestionCircle /> },
];

const SidebarNav: React.FC = () => {
  const router = useRouter();
  const { expanded, setExpanded } = useSidebar();
  const sidebarWidth = expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  // Auto-collapse sidebar on route change
  useEffect(() => {
    const handleRouteChange = () => setExpanded(false);
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events, setExpanded]);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid)).then(docSnap => {
      setIsAdmin(!!docSnap.data()?.isAdmin);
    });
  }, [user]);

  return (
    <div
      className={`
        h-screen bg-[#2d0140] text-white flex flex-col py-4
        shadow-2xl z-40 fixed left-0 top-0 border-r border-[#4b1d7a]
        overflow-hidden
        transition-all duration-500
        ${expanded ? 'items-start px-2' : 'items-center px-0'}
      `}
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        maxWidth: sidebarWidth,
        transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
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
          <Link key={link.href} href={link.href} className="group flex relative">
            <div
              className={`
                flex items-center py-3 rounded-xl hover:bg-[#3c1a5b] transition-colors duration-300
                ${expanded ? 'gap-4 justify-start w/full pl-3 pr-2' : 'justify-center w-full'}
              `}
              style={{
                minHeight: 44,
                ...(expanded ? {} : { paddingLeft: 0, paddingRight: 0 }),
              }}
            >
              <span
                className={`text-2xl text-yellow-400 drop-shadow-[0_0_6px_rgba(255,238,102,0.9)] flex items-center justify-center ${!expanded ? 'mx-auto' : ''}`}
                style={{ width: 32, minWidth: 32, height: 32 }}
              >
                {link.icon}
              </span>
              <span
                className="text-base font-extrabold tracking-wider drop-shadow-lg font-[Orbitron] whitespace-nowrap text-yellow-300"
                style={{
                  opacity: expanded ? 1 : 0,
                  transition: expanded
                    ? 'opacity 0.25s 0.23s cubic-bezier(.4,0,.2,1)'
                    : 'opacity 0.18s cubic-bezier(.4,0,.2,1)',
                  maxWidth: expanded ? 200 : 0,
                  marginLeft: expanded ? 8 : 0,
                  overflow: 'hidden',
                  pointerEvents: expanded ? 'auto' : 'none',
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                }}
              >
                {link.label}
              </span>
            </div>
            {/* Tooltip only when collapsed */}
            {!expanded && (
              <span
                className="fixed left-14 bg-black bg-opacity-90 text-yellow-300 text-xs rounded-md px-2 py-1
                  shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto 
                  transition-all whitespace-nowrap z-[9999]"
                style={{
                  marginTop: 8,
                  minWidth: 80,
                  left: 56,
                }}
              >
                {link.label}
              </span>
            )}
          </Link>
        ))}

        {/* Admin Link - only visible for admins */}
        {isAdmin && (
          <Link href="/admin" className="group flex relative">
            <div
              className={`
                flex items-center py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition-colors duration-300
                ${expanded ? 'gap-4 justify-start w-full pl-3 pr-2' : 'justify-center w-full'}
              `}
              style={{
                minHeight: 44,
                ...(expanded ? {} : { paddingLeft: 0, paddingRight: 0 }),
              }}
            >
              <span
                className={`text-2xl drop-shadow-[0_0_6px_rgba(255,238,102,0.9)] flex items-center justify-center ${!expanded ? 'mx-auto' : ''}`}
                style={{ width: 32, minWidth: 32, height: 32 }}
              >
                <FaShieldAlt />
              </span>
              <span
                className="text-base font-extrabold tracking-wider font-[Orbitron] whitespace-nowrap"
                style={{
                  opacity: expanded ? 1 : 0,
                  transition: expanded
                    ? 'opacity 0.25s 0.23s cubic-bezier(.4,0,.2,1)'
                    : 'opacity 0.18s cubic-bezier(.4,0,.2,1)',
                  maxWidth: expanded ? 200 : 0,
                  marginLeft: expanded ? 8 : 0,
                  overflow: 'hidden',
                  pointerEvents: expanded ? 'auto' : 'none',
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                }}
              >
                Admin
              </span>
            </div>
            {!expanded && (
              <span
                className="fixed left-14 bg-yellow-400 text-black text-xs rounded-md px-2 py-1
                  shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto 
                  transition-all whitespace-nowrap z-[9999]"
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


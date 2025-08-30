// components/Layout.tsx
'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import SidebarNav from './SidebarNav';
import Header from './Header';
import MobileHeader from '@/components/MobileHeader'; // mobile header
import MobileSignUp from '@/components/MobileSignUp'; // 👈 added
import { useSidebar } from '../context/SidebarContext';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';

interface LayoutProps {
  tc?: number;
  division?: string;
  children: ReactNode;
}

const COLLAPSED_WIDTH = 40;   // collapsed sidebar (px)
const EXPANDED_WIDTH = 224;   // expanded sidebar (px)

const Layout: React.FC<LayoutProps> = ({ tc, division, children }) => {
  const { expanded } = useSidebar();
  const sidebarWidth = expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  const pathname = usePathname();
  const isHome = pathname === '/';

  const [user] = useAuthState(auth);

  return (
    <div className="flex h-screen text-white overflow-hidden relative">
      {/* Background Glow */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#10001a] via-[#2d0140] to-black" />
        <div
          className="absolute right-0 bottom-0 w-1/2 h-1/2 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 80% 80%, #ffe06655 0%, #fff0 80%)',
            filter: 'blur(24px)',
          }}
        />
        <div
          className="absolute left-0 top-0 w-1/2 h-1/2 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 20% 10%, #ba8aff55 0%, #fff0 80%)',
            filter: 'blur(20px)',
          }}
        />
      </div>

      {/* Sidebar */}
      <SidebarNav />

      {/* Spacer for fixed sidebar */}
      <div
        style={{ width: sidebarWidth, minWidth: sidebarWidth, flexShrink: 0 }}
        aria-hidden
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden transition-all duration-300">
        {/* Mobile header (md:hidden inside component) */}
        <MobileHeader />

        {/* Desktop header (hidden on mobile inside Header.tsx with `hidden md:flex`) */}
        {isHome && <Header user={user} tc={tc} division={division} />}

        {/* Add bottom padding so content isn't hidden behind MobileSignUp on mobile */}
        <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile sticky Join/Login bar (only when logged out) */}
      {!user && <MobileSignUp />}
    </div>
  );
};

export default Layout;

'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import SidebarNav from './SidebarNav';
import Header from './Header';
import MobileHeader from '@/components/MobileHeader';
import MobileSidebar from '@/components/MobileSidebar';
import MobileSignUp from '@/components/MobileSignUp';
import { useSidebar } from '../context/SidebarContext';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import JoinedMatchWatcher from '@/components/JoinedMatchWatcher';
import TrenBot from './TrenBot';   // ✅ import TrenBot

interface LayoutProps {
  tc?: number;
  division?: string;
  children: ReactNode;
}

const COLLAPSED_WIDTH = 40;
const EXPANDED_WIDTH = 224;

const Layout: React.FC<LayoutProps> = ({ tc, division, children }) => {
  const { expanded } = useSidebar();
  const sidebarWidth = expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  const pathname = usePathname();
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

      {/* Sidebar (desktop only, hidden on mobile) */}
      <div className="hidden md:block">
        <SidebarNav />
      </div>

      {/* Spacer for fixed sidebar */}
      <div
        className="hidden md:block"
        style={{ width: sidebarWidth, minWidth: sidebarWidth, flexShrink: 0 }}
        aria-hidden
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden transition-all duration-300">
        {/* Mobile header */}
        <div className="md:hidden">
          <MobileHeader />
        </div>

        {/* Mobile sidebar trigger */}
        <div className="md:hidden">
          <MobileSidebar />
        </div>

        {/* ✅ Desktop header on app routes only */}
        {pathname !== '/' && (
          <div className="hidden md:block">
            <Header user={user} tc={tc} division={division} />
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile sticky Sign Up bar (only when logged out) */}
      {!user && <MobileSignUp />}

      {/* 👇 global watchers + TrenBot */}
      <JoinedMatchWatcher />
      <TrenBot />   {/* ✅ add here so it floats bottom-right */}
    </div>
  );
};

export default Layout;



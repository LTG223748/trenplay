// components/Layout.js
import React, { useState } from 'react';
import SidebarNav from './SidebarNav';
import Header from './Header';

const COLLAPSED_WIDTH = 40;    // Sidebar width when collapsed
const EXPANDED_WIDTH = 224;    // Sidebar width when expanded

export default function Layout({ user, tc, division, children }) {
  const [expanded, setExpanded] = useState(false);
  const sidebarWidth = expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  return (
    <div className="flex h-screen text-white overflow-hidden relative">
      {/* Background Glow */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#10001a] via-[#2d0140] to-black" />
        <div
          className="absolute right-0 bottom-0 w-1/2 h-1/2 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at 80% 80%, #ffe06655 0%, #fff0 80%)",
            filter: "blur(24px)",
          }}
        />
        <div
          className="absolute left-0 top-0 w-1/2 h-1/2 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at 20% 10%, #ba8aff55 0%, #fff0 80%)",
            filter: "blur(20px)",
          }}
        />
      </div>

      {/* Sidebar */}
      <SidebarNav expanded={expanded} setExpanded={setExpanded} />

      {/* Spacer for fixed sidebar */}
      <div
        style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          flexShrink: 0,
        }}
        aria-hidden
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden transition-all duration-300">
        <Header user={user} tc={tc} division={division} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}


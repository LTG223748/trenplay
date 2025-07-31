import React, { ReactNode, useState } from 'react';
import SidebarNav from './SidebarNav';
import Header from './Header';

interface LayoutProps {
  user: any;
  tc: number;
  division: string;
  children: ReactNode;
}

// Updated sidebar width to match new expanded width (224px = w-56)
const COLLAPSED_WIDTH = 40;  // px, w-10
const EXPANDED_WIDTH = 224;  // px, w-56

const Layout: React.FC<LayoutProps> = ({ user, tc, division, children }) => {
  const [expanded, setExpanded] = useState(false);
  const sidebarWidth = expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  return (
    <div className="flex h-screen text-white overflow-hidden relative">
      {/* TrenBet Theme Background */}
      <div className="fixed inset-0 -z-10">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#10001a] via-[#2d0140] to-black" />
        {/* Soft gold radial glow (bottom right) */}
        <div
          className="absolute right-0 bottom-0 w-1/2 h-1/2 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at 80% 80%, #ffe06655 0%, #fff0 80%)",
            filter: "blur(24px)",
          }}
        />
        {/* Purple soft top-left glow */}
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

      {/* Main Content (pushed right based on sidebar) */}
      <div
        className="flex flex-col flex-1 overflow-hidden transition-all duration-300"
        style={{
          marginLeft: sidebarWidth,
          transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <Header user={user} tc={tc} division={division} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;



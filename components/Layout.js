// components/Layout.js
import Header from './Header';
import SidebarNav from './SidebarNav';
import { useState } from 'react';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0e0020] via-[#1a0030] to-[#0a001a] text-white font-futuristic overflow-hidden">
      <Header />
      <div className="flex z-10 relative">
        <SidebarNav sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

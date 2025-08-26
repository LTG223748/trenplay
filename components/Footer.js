// components/Footer.js
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-24 px-6 py-12 text-gray-300 bg-gradient-to-t from-[#1a0030] to-transparent border-t border-[#3a2a5d]">
      <div className="grid md:grid-cols-4 gap-8 text-sm">

        {/* 🎮 TrenPlay Features */}
        <div>
          <h3 className="text-yellow-400 font-bold mb-3">🎮 TrenPlay Features</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/live-console-competitions" className="hover:text-yellow-300 transition">
                Live Console Competitions
              </Link>
            </li>
            <li>
              <Link href="/real-time-leaderboards" className="hover:text-yellow-300 transition">
                Real-Time Leaderboards
              </Link>
            </li>
            <li>
              <Link href="/fair-matches" className="hover:text-yellow-300 transition">
                Safe and Fair Matches
              </Link>
            </li>
            <li>
              <Link href="/earn-tc" className="hover:text-yellow-300 transition">
                Earn Tren Coins
              </Link>
            </li>
            <li>
              <Link href="/crypto-integration" className="hover:text-yellow-300 transition">
                Crypto Integration
              </Link>
            </li>
          </ul>
        </div>

        {/* 💼 Legal & Info */}
        <div>
          <h3 className="text-yellow-400 font-bold mb-3">💼 Legal & Info</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/terms" className="hover:text-yellow-300">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-yellow-300">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/in-game-currency" className="hover:text-yellow-300">
                In-Game Currency Only
              </Link>
            </li>
            <li>
              <Link href="/user-responsibility" className="hover:text-yellow-300">
                User Responsibility & Risks
              </Link>
            </li>
            <li>
              <Link href="/no-financial-advice" className="hover:text-yellow-300">
                No Financial Advice
              </Link>
            </li>
          </ul>
        </div>

        {/* ⚙️ Support */}
        <div>
          <h3 className="text-yellow-400 font-bold mb-3">⚙️ Support</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/contact" className="hover:text-yellow-300">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-yellow-300">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/security" className="hover:text-yellow-300">
                Security Practices
              </Link>
            </li>
            <li>
              <Link href="/responsible-gaming" className="hover:text-yellow-300">
                Responsible Gaming
              </Link>
            </li>
          </ul>
        </div>

        {/* 🌐 Company */}
        <div>
          <h3 className="text-yellow-400 font-bold mb-3">🌐 TrenPlay Inc</h3>
          <p>Built for gamers by gamers. Powered by Tren Coins.</p>
          <p className="text-xs mt-2 text-gray-500">
            © {new Date().getUTCFullYear()} TrenPlay Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

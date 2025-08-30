"use client";

import Link from "next/link";

export default function MobileSignUp() {
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0b0f0c]/95 backdrop-blur"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 6px)" }}
    >
      <div className="px-4 py-3 flex gap-3">
        {/* Join Now - Primary CTA */}
        <Link
          href="/signup"
          className="flex-1 text-center font-extrabold rounded-xl py-3
                     bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500
                     text-black shadow-[0_0_15px_rgba(250,204,21,.6)]
                     active:scale-[0.98] transition"
        >
          JOIN NOW
        </Link>

        {/* Login - Secondary */}
        <Link
          href="/login"
          className="flex-1 text-center font-extrabold rounded-xl py-3
                     border border-purple-400 text-purple-200
                     hover:bg-purple-500/20 hover:text-white
                     active:scale-[0.98] transition"
        >
          LOGIN
        </Link>
      </div>
    </div>
  );
}

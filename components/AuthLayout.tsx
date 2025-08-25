// components/AuthLayout.tsx
'use client';

import { ReactNode } from 'react';
import Image from 'next/image';

type Props = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

export default function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className="relative flex min-h-screen w-full bg-[#0c0220] text-white overflow-hidden">
      {/* ===== Sparkling Light / Starfield Layer (global background) ===== */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* deep vignette gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_40%,rgba(108,75,211,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_10%,rgba(0,200,255,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(65%_50%_at_15%_85%,rgba(255,215,0,0.08),transparent_60%)]" />

        {/* soft corner glows */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl opacity-30 bg-purple-700/50 animate-pulse-slow" />
        <div className="absolute -bottom-40 -right-32 w-96 h-96 rounded-full blur-3xl opacity-25 bg-cyan-500/40 animate-pulse-slower" />

        {/* twinkling stars */}
        <div className="absolute inset-0">
          {[...Array(28)].map((_, i) => (
            <span
              key={i}
              className="absolute block rounded-full bg-white/80 animate-twinkle"
              style={{
                width: Math.random() < 0.8 ? 2 : 3,
                height: Math.random() < 0.8 ? 2 : 3,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
                opacity: 0.6 + Math.random() * 0.4,
              }}
            />
          ))}
        </div>
      </div>

      {/* ===== Left panel (mascot + promo) — hidden on small screens ===== */}
      <aside className="relative hidden md:flex flex-col justify-center items-center w-1/2 px-10 lg:px-14 bg-gradient-to-br from-[#2a0044] via-[#160036] to-[#0f0126] border-r border-white/10">
        {/* subtle glass card behind mascot for pop */}
        <div className="absolute inset-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 pointer-events-none" />
        {/* Mascot */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <Image
            src="/images/x.png"               // 🔁 your mascot here
            alt="Mascot"
            width={260}
            height={260}
            priority
            className="drop-shadow-[0_0_30px_rgba(108,75,211,0.45)]"
          />
          {title && (
            <h2 className="mt-6 text-3xl lg:text-4xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-yellow-300 via-yellow-200 to-white bg-clip-text text-transparent">
                {title}
              </span>
            </h2>
          )}
          {subtitle && (
            <p className="mt-3 max-w-md text-base lg:text-lg text-purple-100/80">
              {subtitle}
            </p>
          )}
        </div>
      </aside>

      {/* ===== Right panel (form card) ===== */}
      <main className="flex-1 flex items-center justify-center px-6 sm:px-8">
        <div className="relative z-10 w-full max-w-md">
          {/* card */}
          <div className="rounded-2xl border border-[#5b2ba3] bg-[#16023a]/70 backdrop-blur-md p-6 shadow-[0_0_40px_rgba(108,75,211,0.35)]">
            {children}
          </div>

          {/* optional footer note */}
          <p className="mt-4 text-center text-xs text-purple-200/70">
            Secure by design • Email verification required
          </p>
        </div>
      </main>

      {/* ===== Animations (styled-jsx) ===== */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50%      { opacity: 1;    transform: scale(1.25); }
        }
        .animate-twinkle {
          animation-name: twinkle;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50%      { opacity: 0.4;  transform: scale(1.08); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 5.5s ease-in-out infinite;
        }

        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50%      { opacity: 0.35; transform: scale(1.06); }
        }
        .animate-pulse-slower {
          animation: pulse-slower 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// components/TournamentHero.tsx
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Division = "Rookie" | "Pro" | "Elite" | "Legend";

interface TournamentHeroProps {
  title?: string;
  subtitle?: string;
  ctaHref?: string;
  ctaLabel?: string;
  /** Division tint for the glow/accent */
  division?: Division;
  /** Background & mascot images (defaults to your new assets) */
  backgroundSrc?: string;
  mascotSrc?: string;
}

const DIVISION_ACCENTS: Record<Division, { ring: string; glowFrom: string; glowTo: string }> = {
  Rookie: { ring: "ring-gray-400/40",  glowFrom: "#cbd5e1", glowTo: "#94a3b8" }, // silver
  Pro:    { ring: "ring-sky-400/40",   glowFrom: "#38bdf8", glowTo: "#0ea5e9" }, // neon blue
  Elite:  { ring: "ring-violet-500/40",glowFrom: "#a78bfa", glowTo: "#8b5cf6" }, // royal purple
  Legend: { ring: "ring-amber-400/50", glowFrom: "#fbbf24", glowTo: "#f59e0b" }, // gold
};

export default function TournamentHero({
  title = "Welcome to the Arena — TrenPlay Tournaments",
  subtitle = "Compete in 4, 8, and 16-player brackets across every division. Win big — up to 15× your money in TrenCoin.",
  ctaHref = "/tournaments/how-it-works",
  ctaLabel = "Learn how tournaments work",
  division = "Elite",
  backgroundSrc = "/images/arena-tournament.png",
  mascotSrc = "/images/mascotarena-tournament.png",
}: TournamentHeroProps) {
  const accent = DIVISION_ACCENTS[division];

  return (
    <section
      className={`relative w-full overflow-hidden rounded-2xl mb-8 shadow-xl ring-2 ${accent.ring}`}
      aria-label="Tournaments hero"
    >
      {/* HEIGHT: shorter than homepage hero */}
      <div className="relative h-[220px] sm:h-[260px] lg:h-[300px]">
        {/* Background arena */}
        <Image
          src={backgroundSrc}
          alt="Esports arena background"
          fill
          priority
          className="object-cover"
        />

        {/* Dark overlay + division-tinted gradient */}
        <div className="absolute inset-0 bg-black/55" />
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              `radial-gradient(120% 80% at 80% 70%, ${accent.glowFrom}22 0%, transparent 60%),
               radial-gradient(120% 80% at 20% 30%, ${accent.glowTo}22 0%, transparent 60%)`,
          }}
        />

        {/* Neon frame sweep (soft casino feel) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 animate-sweep opacity-30" />
        </div>

        {/* Foreground mascot on coin pile (right side) */}
        <div className="absolute right-3 sm:right-6 -bottom-16 z-20 w-[180px] sm:w-[240px] lg:w-[280px]">
          {/* Spotlight glow behind mascot */}
          <div
            className="absolute -top-6 right-0 w-[140%] h-[140%] blur-2xl opacity-50"
            style={{
              background: `radial-gradient(closest-side, ${accent.glowFrom}66, transparent 70%)`,
              filter: "saturate(120%)",
            }}
          />
          <div className="relative">
            <Image
              src={mascotSrc}
              alt="TrenPlay mascot"
              width={800}
              height={800}
              className="object-contain drop-shadow-[0_0_20px_rgba(255,224,102,0.4)] animate-bob"
              priority
            />
          </div>
        </div>

        {/* Copy + CTAs */}
        <div className="relative z-30 h-full max-w-3xl px-5 sm:px-8 lg:px-10 py-6 flex flex-col justify-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-yellow-300 [text-shadow:0_0_18px_rgba(250,204,21,.55)]">
            {title}
          </h1>
          <p className="mt-2 text-base sm:text-lg lg:text-xl text-violet-100/90 max-w-2xl">
            {subtitle}
          </p>

          <div className="mt-4 flex items-center gap-4">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-2 font-bold text-black shadow-[0_0_18px_rgba(250,204,21,.45)] hover:bg-yellow-300 hover:shadow-[0_0_24px_rgba(250,204,21,.65)] transition"
            >
              ❓ {ctaLabel}
            </Link>

            <Link
              href="/tournaments/how-it-works#fees"
              className="text-sm text-gray-200/90 underline-offset-4 hover:underline"
            >
              Fees & payouts explained
            </Link>
          </div>

          {/* Division chips preview (highlight current division) */}
          <div className="mt-3 flex items-center gap-2 text-xs">
            {(["Rookie","Pro","Elite","Legend"] as const).map((d) => {
              const isActive = d === division;
              return (
                <span
                  key={d}
                  aria-current={isActive ? "true" : undefined}
                  className={[
                    "rounded-full px-2 py-0.5 border transition",
                    isActive
                      ? "bg-yellow-400 text-black border-yellow-300 shadow-[0_0_14px_rgba(250,204,21,.45)]"
                      : "bg-white/10 text-violet-100/80 border-white/20"
                  ].join(" ")}
                >
                  {d}
                </span>
              );
            })}
          </div>
        </div>

        {/* Subtle coin sparkles */}
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="absolute block w-1 h-1 rounded-full bg-yellow-300/70 animate-sparkle"
              style={{
                top: `${Math.random() * 80 + 5}%`,
                left: `${Math.random() * 80 + 5}%`,
                animationDelay: `${(i * 173) % 1200}ms`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes sweep {
          0% { background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%); transform: translateX(-100%); }
          100% { background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%); transform: translateX(100%); }
        }
        .animate-sweep { animation: sweep 5s linear infinite; }

        @keyframes bob { 0% { transform: translateY(0); } 100% { transform: translateY(-10px); } }
        .animate-bob { animation: bob 2.4s ease-in-out infinite alternate; }

        @keyframes sparkle {
          0% { opacity: 0; transform: translateY(0) scale(0.8); }
          25% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-10px) scale(1.05); }
        }
        .animate-sparkle { animation: sparkle 2.6s ease-in-out infinite; }
      `}</style>
    </section>
  );
}



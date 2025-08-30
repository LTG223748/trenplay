// components/DivisionFlanks.js
import Image from "next/image";

export default function DivisionFlanks() {
  const TIERS = [
    { key: "rookie", title: "Rookie", range: "500 – 700 pts (starts at 500)", emoji: "🪙",
      ring: "ring-yellow-400/50", glow: "shadow-[0_0_32px_rgba(250,204,21,0.25)]",
      grad: "from-[#1b0e2d] to-[#2a1350]", badgeBg: "bg-yellow-400/15", badgeLabel: "Division: Fresh Start" },
    { key: "pro", title: "Pro", range: "701 – 900 pts", emoji: "⚔️",
      ring: "ring-purple-400/50", glow: "shadow-[0_0_34px_rgba(168,85,247,0.28)]",
      grad: "from-[#231238] to-[#3b1766]", badgeBg: "bg-purple-400/15", badgeLabel: "Division: On the Rise" },
    { key: "elite", title: "Elite", range: "901 – 1200 pts", emoji: "👑",
      ring: "ring-cyan-400/50", glow: "shadow-[0_0_36px_rgba(56,189,248,0.28)]",
      grad: "from-[#11233f] to-[#153a66]", badgeBg: "bg-cyan-400/15", badgeLabel: "Division: Top 5%" },
    { key: "legend", title: "Legend", range: "1201 – 1500 pts", emoji: "🐉",
      ring: "ring-emerald-400/60", glow: "shadow-[0_0_40px_rgba(16,185,129,0.33)]",
      grad: "from-[#12281f] to-[#134132]", badgeBg: "bg-emerald-400/15", badgeLabel: "Division: GOAT Status" },
  ];

  function Card({ title, range, emoji, ring, glow, grad, badgeBg, badgeLabel, size = "md" }) {
    const titleSize = size === "lg" ? "text-xl md:text-3xl" : "text-lg md:text-2xl";
    const emojiSize = size === "lg" ? "text-3xl md:text-5xl" : "text-2xl md:text-4xl";

    return (
      <div
        className={[
          "cursor-default rounded-2xl p-3 md:p-6 text-white backdrop-blur-sm",
          "bg-gradient-to-br", grad,
          "ring-1", ring,
          "transition-transform duration-200 hover:-translate-y-0.5",
          glow,
          "shadow-[0_12px_30px_rgba(0,0,0,.35)]",
        ].join(" ")}
      >
        <div className="flex items-center gap-2 md:gap-3 mb-1">
          <span className={["leading-none", emojiSize].join(" ")} aria-hidden>
            {emoji}
          </span>
          <h4
            className={[
              titleSize,
              "font-extrabold tracking-wide",
              "text-yellow-300",
              "font-['Orbitron',_ui-sans-serif]",
              "[text-shadow:0_0_14px_rgba(250,204,21,.65)]",
            ].join(" ")}
          >
            {title}
          </h4>
        </div>

        <p className="text-xs md:text-base text-gray-200/90">{range}</p>

        <div
          className={[
            "mt-3 md:mt-4 inline-flex items-center gap-2 rounded-full",
            "px-2.5 py-0.5 md:px-3 md:py-1",
            "text-[10px] md:text-sm ring-1 ring-white/10",
            "text-white/90", badgeBg,
          ].join(" ")}
        >
          {badgeLabel}
        </div>
      </div>
    );
  }

  return (
    <section className="relative mx-auto mt-4 md:mt-8 px-3 md:px-6 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-8 items-start">
        {/* Left stack */}
        <div className="flex flex-col gap-3 md:gap-4 w-full md:max-w-sm mx-auto">
          <Card {...TIERS[0]} />
          <Card {...TIERS[1]} />
        </div>

        {/* Center mascot – smaller on mobile */}
        <div className="flex items-center justify-center">
          <div className="relative w-[120px] h-[180px] sm:w-[160px] sm:h-[220px] md:w-[260px] md:h-[360px] lg:w-[300px] lg:h-[420px]">
            <div
              className="absolute inset-0 rounded-[40%] blur-xl opacity-60 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(250,204,21,.25) 0%, rgba(168,85,247,.18) 45%, transparent 75%)",
              }}
            />
            <div className="absolute inset-x-4 bottom-2 md:bottom-6 h-3 md:h-6 rounded-[50%] bg-black/40 blur-[6px] md:blur-[10px] opacity-25 md:opacity-30 animate-shadowPulse" />
            <div className="absolute inset-0 z-10 flex items-center justify-center will-change-transform">
              <div className="relative w-full h-full animate-floatSlow">
                <Image
                  src="/images/x.png"
                  alt="TrenPlay Mascot"
                  fill
                  priority
                  className="object-contain select-none pointer-events-none animate-breatheGlow"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right stack */}
        <div className="flex flex-col gap-3 md:gap-4 w-full md:max-w-sm mx-auto">
          <Card {...TIERS[2]} size="lg" />
          <Card {...TIERS[3]} size="lg" />
        </div>
      </div>

      <style jsx>{`
        @keyframes floatSlow {
          0%   { transform: translateY(0) rotate(0deg); }
          50%  { transform: translateY(-6px) rotate(-0.3deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        .animate-floatSlow {
          animation: floatSlow 3.3s ease-in-out infinite;
        }
        @keyframes breatheGlow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(250,204,21,.3)) drop-shadow(0 0 20px rgba(168,85,247,.25)); }
          50%      { filter: drop-shadow(0 0 18px rgba(250,204,21,.45)) drop-shadow(0 0 28px rgba(168,85,247,.35)); }
        }
        .animate-breatheGlow {
          animation: breatheGlow 2.8s ease-in-out infinite;
        }
        @keyframes shadowPulse {
          0%, 100% { transform: scaleX(1); opacity: .25; }
          50%      { transform: scaleX(1.1); opacity: .35; }
        }
        .animate-shadowPulse {
          animation: shadowPulse 3.3s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-floatSlow,
          .animate-breatheGlow,
          .animate-shadowPulse {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}

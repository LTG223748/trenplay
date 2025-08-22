// components/DivisionFlanks.js
import Image from "next/image";

export default function DivisionFlanks() {
  // If Orbitron isn't loaded yet, add this in your app layout or _document:
  // <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800&display=swap" rel="stylesheet" />

  const TIERS = [
    {
      key: "rookie",
      title: "Rookie",
      range: "500 – 700 pts (starts at 500)",
      emoji: "🪙",
      ring: "ring-yellow-400/50",
      glow: "shadow-[0_0_32px_rgba(250,204,21,0.25)]",
      grad: "from-[#1b0e2d] to-[#2a1350]",
      badgeBg: "bg-yellow-400/15",
      badgeLabel: "Division: Fresh Start",
    },
    {
      key: "pro",
      title: "Pro",
      range: "701 – 900 pts",
      emoji: "⚔️",
      ring: "ring-purple-400/50",
      glow: "shadow-[0_0_34px_rgba(168,85,247,0.28)]",
      grad: "from-[#231238] to-[#3b1766]",
      badgeBg: "bg-purple-400/15",
      badgeLabel: "Division: On the Rise",
    },
    {
      key: "elite",
      title: "Elite",
      range: "901 – 1200 pts",
      emoji: "👑",
      ring: "ring-cyan-400/50",
      glow: "shadow-[0_0_36px_rgba(56,189,248,0.28)]",
      grad: "from-[#11233f] to-[#153a66]",
      badgeBg: "bg-cyan-400/15",
      badgeLabel: "Division: Top 5%",
    },
    {
      key: "legend",
      title: "Legend",
      range: "1201 – 1500 pts", // adjust cap if needed
      emoji: "🐉",
      ring: "ring-emerald-400/60",
      glow: "shadow-[0_0_40px_rgba(16,185,129,0.33)]",
      grad: "from-[#12281f] to-[#134132]",
      badgeBg: "bg-emerald-400/15",
      badgeLabel: "Division: GOAT Status",
    },
  ];

  function Card({ title, range, emoji, ring, glow, grad, badgeBg, badgeLabel, size = "md" }) {
    const titleSize = size === "lg" ? "text-2xl md:text-3xl" : "text-xl md:text-2xl";
    const emojiSize = size === "lg" ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl";

    return (
      <div
        className={[
          "cursor-default rounded-2xl p-5 md:p-6 text-white backdrop-blur-sm",
          "bg-gradient-to-br", grad,
          "ring-1", ring,
          "transition-transform duration-200 hover:-translate-y-0.5",
          glow,
          "shadow-[0_12px_30px_rgba(0,0,0,.35)]",
        ].join(" ")}
      >
        <div className="flex items-center gap-3 mb-1">
          <span className={["leading-none", emojiSize].join(" ")} aria-hidden>
            {emoji}
          </span>
          <h4
            className={[
              titleSize,
              "font-extrabold tracking-wide",
              "text-yellow-300",
              "font-[\'Orbitron\',_ui-sans-serif]",
            ].join(" ")}
          >
            {title}
          </h4>
        </div>

        <p className="text-sm md:text-base text-gray-200/90">{range}</p>

        {/* Prestige badge */}
        <div
          className={[
            "mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1",
            "text-xs md:text-sm ring-1 ring-white/10",
            "text-white/90", badgeBg,
          ].join(" ")}
        >
          {badgeLabel}
        </div>
      </div>
    );
  }

  return (
    <section className="relative mx-auto mt-6 md:mt-8 px-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-center">
        {/* Left stack */}
        <div className="flex flex-col gap-4 max-w-sm w-full mx-auto">
          <Card {...TIERS[0]} />
          <Card {...TIERS[1]} />
        </div>

        {/* Center mascot */}
        <div className="flex items-center justify-center">
          <div className="relative w-[260px] h-[360px] sm:w-[300px] sm:h-[420px]">
            {/* soft aura */}
            <div
              className="absolute inset-0 rounded-[40%] blur-2xl opacity-70 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(250,204,21,.35) 0%, rgba(168,85,247,.22) 45%, transparent 75%)",
              }}
            />
            <Image
              src="/images/Tbet-mascot.png"
              alt="TrenPlay Mascot"
              fill
              priority
              className="object-contain drop-shadow-2xl select-none pointer-events-none"
            />
          </div>
        </div>

        {/* Right stack */}
        <div className="flex flex-col gap-4 max-w-sm w-full mx-auto">
          <Card {...TIERS[2]} size="lg" />
          <Card {...TIERS[3]} size="lg" />
        </div>
      </div>

      <style jsx>{`
        .drop-shadow-2xl {
          filter: drop-shadow(0 18px 36px rgba(0, 0, 0, 0.35));
        }
      `}</style>
    </section>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const HERO_LOGO = '/images/l.png';
const NBA_IMG   = '/images/nba.png';
const FIFA_IMG  = '/images/fifa.png';
const COIN_IMG  = '/images/coin.png';

// Tournament slide assets
const MASCOT_TOURNEY_IMG = '/images/mascot-tournament.png';
const RL_TOURNEY_IMG     = '/images/rocketleague-tournament.png';

type LogoSlide = {
  kind: 'logo';
  alt: string;
  headline: string;
  subline?: string;
  ctaHref?: string | null;
  ctaLabel?: string | null;
};

type PhotoSlide = {
  kind: 'photo';
  image: string;
  alt: string;
  headline: string;
  subline?: string;
  ctaHref?: string | null;
  ctaLabel?: string | null;
  foregroundMascot?: string | null;
  mascotOffsetY?: number;
};

type Slide = LogoSlide | PhotoSlide;

const slides: Slide[] = [
  {
    kind: 'logo',
    alt: 'TrenPlay',
    headline: '💥 TrenPlay — Your Arena Awaits!',
    subline: 'Where skill decides it all. Match. Play. Win.',
    ctaHref: '/create-match',
    ctaLabel: '🚀 Start Playing',
  },
  {
    kind: 'photo',
    image: NBA_IMG,
    alt: 'NBA',
    headline: '🏀 NBA — Climb the Leaderboard',
    subline: 'Create a match and challenge anyone.',
    ctaHref: '/create-match',
    ctaLabel: 'Create Match',
  },
  {
    kind: 'photo',
    image: FIFA_IMG,
    alt: 'FIFA',
    headline: '⚽ FIFA — Rise to the Top',
    subline: 'Head-to-head wagers in seconds.',
    ctaHref: '/create-match',
    ctaLabel: 'Create Match',
  },
  {
    kind: 'photo',
    image: RL_TOURNEY_IMG,
    alt: 'Tournaments',
    headline: '🏆 Show Off Your Skill in Tournaments!',
    subline:
      'Multiple 4, 8, and 16-player brackets across every division. Win big — up to 15× your money in TrenCoin.',
    ctaHref: '/tournaments',
    ctaLabel: 'Enter a Tournament',
    foregroundMascot: MASCOT_TOURNEY_IMG,
    mascotOffsetY: 16,
  },
];

const coinPos = [
  { top: '14%', left: '17%' }, { top: '22%', left: '31%' }, { top: '16%', left: '55%' },
  { top: '11%', left: '73%' }, { top: '38%', left: '14%' }, { top: '62%', left: '19%' },
  { top: '74%', left: '30%' }, { top: '78%', left: '52%' }, { top: '73%', left: '71%' },
  { top: '59%', left: '81%' }, { top: '38%', left: '84%' }, { top: '27%', left: '70%' },
  { top: '66%', left: '61%' }, { top: '60%', left: '38%' }, { top: '36%', left: '58%' },
  { top: '32%', left: '44%' },
] as const;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const coinAnim = useMemo(() => coinPos.map(() => (Math.random() * 2).toFixed(2)), []);

  useEffect(() => {
    const id = setInterval(() => setCurrent((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, []);

  const slide = slides[current];

  // Hide mascot on mobile ONLY for the tournaments (Rocket League) slide
  const hideMascotOnMobile = slide.kind === 'photo' && slide.alt === 'Tournaments';

  return (
    <div className="relative w-full">
      <div className="rounded-xl overflow-hidden mb-6 md:mb-8 shadow-lg ring-[2px] md:ring-[3px] ring-purple-500/50 animate-glow">
        {/* Height scales by viewport (desktop back to ~h-96) */}
        <div className="relative w-full h-[260px] sm:h-[300px] md:h-[320px] lg:h-[384px] xl:h-[384px]">

          {slide.kind === 'photo' ? (
            <>
              <Image
                src={(slide as PhotoSlide).image}
                alt={slide.alt}
                fill
                priority
                className="object-cover z-0"
              />
              <div className="absolute inset-0 bg-black/45 z-10" />

              {(slide as PhotoSlide).foregroundMascot && (
                <>
                  {/* Shadow puck (keep on all sizes; hide on mobile for tournaments) */}
                  <div
                    className={[
                      "absolute z-10 pointer-events-none select-none right-2 sm:right-6 md:right-20",
                      "top-1 md:top-auto md:bottom-3",
                      hideMascotOnMobile ? "hidden md:block" : "",
                    ].join(" ")}
                    style={{
                      width: '64px',
                      height: '18px',
                      borderRadius: '9999px',
                      background: 'radial-gradient(ellipse at center, #000 55%, transparent 100%)',
                      filter: 'blur(8px)',
                      opacity: 0.22,
                    }}
                  />
                  {/* Glow basin (MOBILE ONLY) */}
                  {!hideMascotOnMobile && (
                    <div
                      className={[
                        "absolute z-20 pointer-events-none select-none right-2 sm:right-6",
                        "top-0.5",
                        "block md:hidden", // <-- keep glow on mobile, remove on desktop
                      ].join(" ")}
                      style={{
                        width: '130px',
                        height: '140px',
                        borderRadius: '38% 38% 46% 46%',
                        background:
                          'radial-gradient(ellipse at center, #fff9c4aa 50%, #ffe06644 72%, transparent 100%)',
                        filter: 'blur(14px)',
                        opacity: 0.42,
                      }}
                    />
                  )}
                  {/* Mascot: top-right on mobile, bottom-right on md+ */}
                  <div
                    className={[
                      "absolute z-30 flex items-start md:items-end justify-center",
                      "right-2 sm:right-6 md:right-8",
                      "top-1 md:top-auto md:bottom-0",
                      "w-[100px] h-[120px] sm:w-[140px] sm:h-[160px] md:w-[280px] md:h-[320px]",
                      "overflow-hidden opacity-90 md:opacity-100",
                      hideMascotOnMobile ? "hidden md:flex" : "",
                    ].join(" ")}
                  >
                    <Image
                      src={(slide as PhotoSlide).foregroundMascot!}
                      alt="Mascot"
                      fill
                      className="object-contain object-top md:object-bottom pointer-events-none select-none"
                      priority
                      style={{
                        transform: `translateY(${(slide as PhotoSlide).mascotOffsetY ?? 0}px)`,
                        willChange: 'transform',
                      }}
                    />
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-r from-[#32104b] via-[#1a0030] to-[#32104b] opacity-95" />

              {/* Coins */}
              <div className="absolute inset-0">
                {coinPos.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'absolute',
                      top: p.top,
                      left: p.left,
                      zIndex: 15,
                      pointerEvents: 'none',
                      opacity: 0,
                      animation: `coinTwinkle 2.2s linear infinite`,
                      animationDelay: `${coinAnim[idx]}s`,
                    }}
                    className="coin-twinkle scale-75 md:scale-100 origin-center"
                  >
                    <Image
                      src={COIN_IMG}
                      alt="Coin"
                      width={22}
                      height={22}
                      priority={idx < 4}
                    />
                  </div>
                ))}
              </div>

              {/* Logo: puck on all sizes, glow ONLY on mobile, logo image */}
              <div
                className="absolute right-2 sm:right-6 md:right-20 top-1 md:top-auto md:bottom-3 z-10 pointer-events-none select-none"
                style={{
                  width: '64px',
                  height: '18px',
                  borderRadius: '9999px',
                  background: 'radial-gradient(ellipse at center, #000 55%, transparent 100%)',
                  filter: 'blur(8px)',
                  opacity: 0.22,
                }}
              />
              <div
                className="absolute right-2 sm:right-6 top-0.5 z-10 pointer-events-none select-none block md:hidden"
                style={{
                  width: '130px',
                  height: '140px',
                  borderRadius: '38% 38% 46% 46%',
                  background:
                    'radial-gradient(ellipse at center, #fff9c4aa 50%, #ffe06644 72%, transparent 100%)',
                  filter: 'blur(14px)',
                  opacity: 0.42,
                }}
              />
              <div className="absolute right-2 sm:right-6 md:right-8 top-1 md:top-auto md:bottom-0 z-20 flex items-start md:items-end justify-center w-[100px] h-[120px] sm:w-[140px] sm:h-[160px] md:w-[280px] md:h-[320px] overflow-hidden opacity-90 md:opacity-100">
                <Image
                  src={HERO_LOGO}
                  alt={slide.alt}
                  fill
                  className="object-contain object-top md:object-bottom pointer-events-none select-none"
                  priority
                  style={{ transform: 'translateY(0px)' }}
                />
              </div>
            </div>
          )}

          {/* Text overlay */}
          <div className="relative z-40 h-full flex flex-col justify-center p-4 sm:p-6 md:p-8 max-w-[88%] sm:max-w-xl">
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-yellow-300 mb-1 sm:mb-2 [text-shadow:0_0_16px_rgba(250,204,21,.7)]">
              {slide.headline}
            </h2>
            {slide.subline && (
              <p className="text-sm sm:text-base md:text-2xl text-purple-200 font-bold mb-3 sm:mb-4">
                {slide.subline}
              </p>
            )}
            {slide.ctaHref && slide.ctaLabel && (
              <Link
                href={slide.ctaHref}
                className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-full transition shadow-[0_0_18px_rgba(250,204,21,.55)] px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm md:text-base"
              >
                {slide.ctaLabel}
              </Link>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px 4px rgba(168, 85, 247, 0.5); }
          50%      { box-shadow: 0 0 40px 8px rgba(168, 85, 247, 0.8); }
        }
        .animate-glow { animation: pulseGlow 3s ease-in-out infinite; }
        @keyframes coinTwinkle {
          0% { opacity: 0; }
          12% { opacity: 1; }
          65% { opacity: 1; }
          80% { opacity: 0; }
          100% { opacity: 0; }
        }
        .coin-twinkle { will-change: opacity; }
        @keyframes mascotFloat {
          0% { transform: translateY(0); }
          100% { transform: translateY(-12px); }
        }
        .mascot-float { animation: mascotFloat 2.3s ease-in-out infinite alternate; }
      `}</style>
    </div>
  );
}

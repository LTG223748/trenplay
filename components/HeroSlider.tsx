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
const RL_TOURNEY_IMG     = '/images/rocketleague-tournament.png'; // new 1920×1080 version

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

// coin sparkle positions (logo slide only)
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

  return (
    <div className="relative w-full">
      <div className="rounded-xl overflow-hidden mb-8 shadow-lg ring-[3px] ring-purple-500/50 animate-glow">
        <div className="relative w-full h-72 sm:h-80 lg:h-96">

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
                  <div
                    className="absolute right-20 bottom-3 z-10 pointer-events-none select-none"
                    style={{
                      width: '110px',
                      height: '30px',
                      borderRadius: '50%',
                      background: 'radial-gradient(ellipse at center, #000 55%, transparent 100%)',
                      filter: 'blur(8px)',
                      opacity: 0.3,
                    }}
                  />
                  <div
                    className="absolute right-8 bottom-0 z-20 pointer-events-none select-none"
                    style={{
                      width: '320px',
                      height: '360px',
                      borderRadius: '38% 38% 46% 46%',
                      background:
                        'radial-gradient(ellipse at center, #fff9c4aa 50%, #ffe06644 72%, transparent 100%)',
                      filter: 'blur(16px)',
                      opacity: 0.55,
                    }}
                  />
                  <div className="absolute right-8 bottom-0 z-30 flex items-end justify-center w-[320px] h-[360px] overflow-hidden">
                    <Image
                      src={(slide as PhotoSlide).foregroundMascot!}
                      alt="Mascot"
                      fill
                      className="object-contain object-bottom pointer-events-none select-none mascot-float mascot-glow"
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
              {coinPos.map((p, idx) => (
                <Image
                  key={idx}
                  src={COIN_IMG}
                  alt="Coin"
                  width={22}
                  height={22}
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
                  className="coin-twinkle"
                  priority={idx < 4}
                />
              ))}
              <div
                className="absolute right-20 bottom-3 z-10 pointer-events-none select-none"
                style={{
                  width: '110px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse at center, #000 55%, transparent 100%)',
                  filter: 'blur(8px)',
                  opacity: 0.3,
                }}
              />
              <div
                className="absolute right-8 bottom-0 z-10 pointer-events-none select-none"
                style={{
                  width: '320px',
                  height: '360px',
                  borderRadius: '38% 38% 46% 46%',
                  background:
                    'radial-gradient(ellipse at center, #fff9c4aa 50%, #ffe06644 72%, transparent 100%)',
                  filter: 'blur(16px)',
                  opacity: 0.6,
                }}
              />
              <div className="absolute right-8 bottom-0 z-20 flex items-end justify-center w-[320px] h-[360px] overflow-hidden">
                <Image
                  src={HERO_LOGO}
                  alt={slide.alt}
                  fill
                  className="object-contain object-bottom pointer-events-none select-none mascot-float mascot-glow"
                  priority
                  style={{ transform: 'translateY(0px)' }}
                />
              </div>
            </div>
          )}

          <div className="relative z-40 p-8 flex flex-col justify-center h-full max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-yellow-300 mb-2 [text-shadow:0_0_16px_rgba(250,204,21,.7)]">
              {slide.headline}
            </h2>
            {slide.subline && (
              <p className="text-xl sm:text-2xl text-purple-200 font-bold mb-4">
                {slide.subline}
              </p>
            )}
            {slide.ctaHref && slide.ctaLabel && (
              <Link
                href={slide.ctaHref}
                className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-6 py-2 rounded-full transition shadow-[0_0_18px_rgba(250,204,21,.55)]"
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
        .mascot-glow {
          filter: drop-shadow(0 0 12px #fffde466) drop-shadow(0 0 32px #ffe06644) drop-shadow(0 3px 10px #000a);
        }
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

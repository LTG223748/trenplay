import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const slides = [
  {
    image: '/images/t-playmascot.png',
    alt: 'Tren Mascot',
    text: `💥 Welcome to TrenPlay — Your Arena Awaits!\nWhere skill decides it all. Match. Play. Win.`,
    cta: null,
    isMascot: true,
  },
  {
    image: '/images/fifa25.png',
    alt: 'FIFA 25 Promo',
    text: '⚽ Play FIFA 25 Head-to-Head. Rise to the Top!',
    cta: '/create-match',
    isMascot: false,
  },
  {
    image: '/images/nba2k25.png',
    alt: 'NBA 2K25 Slide',
    text: '🏀 Play NBA 2K25 Head-to-Head. Climb the Leaderboard!',
    cta: '/create-match',
    isMascot: false,
  }
];

// Coin and mascot assets
const coinImg = '/images/coin.png';

// Non-overlapping, hand-picked coin positions
const coinConfig = [
  { top: '14%', left: '17%' },
  { top: '22%', left: '31%' },
  { top: '16%', left: '55%' },
  { top: '11%', left: '73%' },
  { top: '38%', left: '14%' },
  { top: '62%', left: '19%' },
  { top: '74%', left: '30%' },
  { top: '78%', left: '52%' },
  { top: '73%', left: '71%' },
  { top: '59%', left: '81%' },
  { top: '38%', left: '84%' },
  { top: '27%', left: '70%' },
  { top: '66%', left: '61%' },
  { top: '60%', left: '38%' },
  { top: '36%', left: '58%' },
  { top: '32%', left: '44%' },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const slide = slides[current];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Random delay for each coin for twinkle effect
  const [coinAnim] = useState(() =>
    coinConfig.map(() => (Math.random() * 2).toFixed(2))
  );

  // Split text on "\n" for line breaks
  const slideTextLines = slide.text.split('\n');

  return (
    <div className="relative w-full">
      {/* Glowing Wrapper */}
      <div className="rounded-xl overflow-hidden mb-8 shadow-lg ring-[3px] ring-purple-500 ring-opacity-50 animate-glow">
        <div className="relative w-full h-72 sm:h-80 lg:h-96">

          {/* Background image (full hero for non-mascot) */}
          {!slide.isMascot && (
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              className="object-cover z-0"
              priority
            />
          )}

          {/* Mascot slide: mascot, twinkle coins, glow, shadow */}
          {slide.isMascot && (
            <div className="absolute inset-0 z-0">
              {/* Purple gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#32104b] via-[#1a0030] to-[#32104b] opacity-95" />

              {/* Coins - hand placed, non-overlapping */}
              {coinConfig.map((pos, idx) => (
                <img
                  key={idx}
                  src={coinImg}
                  alt="Coin"
                  style={{
                    ...pos,
                    position: 'absolute',
                    width: '22px',
                    height: '22px',
                    zIndex: 15,
                    pointerEvents: 'none',
                    opacity: 0,
                    animation: `coinTwinkle 2.2s linear infinite`,
                    animationDelay: `${coinAnim[idx]}s`
                  }}
                  className="coin-twinkle"
                />
              ))}

              {/* Mascot shadow (ellipse on ground) */}
              <div
                className="absolute right-20 bottom-3 z-10 pointer-events-none select-none"
                style={{
                  width: "110px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse at center, #000 55%, transparent 100%)",
                  filter: "blur(8px)",
                  opacity: 0.30,
                }}
              />

              {/* Mascot soft golden/white aura glow */}
              <div
                className="absolute right-8 bottom-0 z-10 pointer-events-none select-none mascot-aura"
                style={{
                  width: "220px",
                  height: "320px",
                  borderRadius: "38% 38% 46% 46%",
                  background: "radial-gradient(ellipse at center, #fff9c4aa 50%, #ffe06644 72%, transparent 100%)",
                  filter: "blur(16px)",
                  opacity: 0.6,
                }}
              />

              {/* Mascot image (with subtle glow) */}
              <Image
                src="/images/t-playmascot.png"
                alt={slide.alt}
                width={220}
                height={320}
                className="absolute right-8 bottom-0 z-20 drop-shadow-2xl pointer-events-none select-none mascot-float mascot-glow"
                priority
              />
            </div>
          )}

          {/* Dark overlay for background slides only */}
          {!slide.isMascot && (
            <div className="absolute inset-0 bg-black bg-opacity-40 z-10" />
          )}

          {/* Slide Content */}
          <div className="relative z-20 p-8 flex flex-col justify-center h-full max-w-xl">
            {slideTextLines.map((line, i) => (
              <h2
                key={i}
                className={`${
                  i === 0
                    ? 'text-3xl sm:text-4xl font-extrabold text-yellow-300 drop-shadow-lg mb-2'
                    : 'text-xl sm:text-2xl text-purple-200 font-bold mb-1'
                }`}
              >
                {line}
              </h2>
            ))}
            {slide.cta && (
              <Link
                href={slide.cta}
                className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-6 py-2 rounded-full shadow transition"
              >
                🚀 Start Playing
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 20px 4px rgba(168, 85, 247, 0.5);
          }
          50% {
            box-shadow: 0 0 40px 8px rgba(168, 85, 247, 0.8);
          }
        }
        .animate-glow {
          animation: pulseGlow 3s ease-in-out infinite;
        }
        .drop-shadow-2xl {
          filter: drop-shadow(0 16px 36px rgba(0,0,0,0.37)) drop-shadow(0 1.5px 0px #ffe06699);
        }
        /* Mascot soft glow outline */
        .mascot-glow {
          filter:
            drop-shadow(0 0 12px #fffde466)
            drop-shadow(0 0 32px #ffe06644)
            drop-shadow(0 3px 10px #000a);
        }
        /* Coin twinkle (fade in/out, like sparkles) */
        @keyframes coinTwinkle {
          0%   { opacity: 0; }
          12%  { opacity: 1; }
          65%  { opacity: 1; }
          80%  { opacity: 0; }
          100% { opacity: 0; }
        }
        .coin-twinkle {
          will-change: opacity;
        }
        /* Mascot idle float */
        @keyframes mascotFloat {
          0% { transform: translateY(0);}
          100% { transform: translateY(-12px);}
        }
        .mascot-float {
          animation: mascotFloat 2.3s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
}



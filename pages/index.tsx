// pages/index.tsx
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Landing() {
  const [stars, setStars] = useState<
    { id: number; x: number; y: number; size: number; delay: number }[]
  >([]);

  useEffect(() => {
    const createStars = () => {
      const newStars = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 5,
      }));
      setStars(newStars);
    };

    createStars();
    window.addEventListener("resize", createStars);
    return () => window.removeEventListener("resize", createStars);
  }, []);

  return (
    <>
      <Head>
        <title>TrenPlay — The Future of Console Competition</title>
        <meta
          name="description"
          content="Skill decides it all. Stake TrenCoin, compete, and win real rewards."
        />
      </Head>

      <main className="relative min-h-screen bg-[#0b0720] text-white font-[Orbitron] overflow-hidden">
        {/* ⭐ Starfield anchored */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          {stars.map((s) => (
            <div
              key={s.id}
              className="absolute rounded-full bg-white opacity-0 animate-twinkle"
              style={{
                left: `${s.x}px`,
                top: `${s.y}px`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            {/* ✅ Logo with purple border + glow */}
            <div className="flex items-center">
              <Image
                src="/images/trenplay-logo.png"
                alt="TrenPlay Logo"
                width={200}
                height={60}
                priority
                className="rounded-xl border-2 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.7)]"
              />
            </div>

            {/* 🔥 Futuristic Button Box */}
            <div className="flex items-center gap-4 rounded-2xl border-2 border-purple-500 bg-purple-900/30 backdrop-blur-md px-6 py-3 shadow-[0_0_25px_rgba(168,85,247,0.6)]">
              {/* Log in */}
              <Link
                href="/login"
                className="px-6 py-3 text-base font-semibold rounded-xl border-2 border-purple-400 text-purple-300 bg-purple-800/30 hover:bg-purple-700/40 hover:text-white shadow-[0_0_12px_rgba(168,85,247,0.6)] hover:shadow-[0_0_20px_rgba(168,85,247,0.9)] transition-all duration-300"
              >
                Log in
              </Link>

              {/* Sign up */}
              <Link
                href="/signup"
                className="relative overflow-hidden rounded-xl px-7 py-3 text-base font-bold text-black bg-gradient-to-r from-yellow-400 to-yellow-300 hover:from-yellow-300 hover:to-yellow-200 shadow-[0_0_25px_rgba(250,204,21,0.7)] hover:shadow-[0_0_35px_rgba(250,204,21,0.9)] transition-all duration-300"
              >
                <span className="relative z-10">Sign up</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 ease-in-out" />
              </Link>
            </div>
          </header>

          {/* Hero */}
          <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-20 pt-12 md:grid-cols-2">
            <div>
              <h1 className="text-4xl font-extrabold leading-tight md:text-5xl text-purple-400">
                TrenPlay — The Future of Console Competition
              </h1>
              <p className="mt-4 max-w-xl text-purple-200">
                Where skill decides it all. Stake TrenCoin, play your favorite
                games, and win rewards. Fair, secure, and built for players.
              </p>
              <div className="mt-6 flex gap-3">
                <Link
                  href="/signup"
                  className="rounded-xl bg-yellow-400 px-6 py-3 text-black font-semibold hover:bg-yellow-300"
                >
                  Start Playing
                </Link>
                <Link
                  href="#how-it-works"
                  className="rounded-xl px-6 py-3 ring-1 ring-purple-700/40 hover:bg-purple-700/20"
                >
                  How it works
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-700/30 bg-purple-700/10 p-3">
              <div className="aspect-video w-full rounded-xl bg-gradient-to-r from-purple-700 to-yellow-400 flex items-center justify-center text-2xl font-bold text-white">
                TrenPlay Preview
              </div>
              <p className="mt-3 text-center text-xs text-purple-300">
                Your arena for console competition.
              </p>
            </div>
          </section>

          {/* Why TrenPlay */}
          <section className="mx-auto max-w-7xl px-6 pb-24">
            <h2 className="text-2xl font-bold mb-6 text-purple-400">
              Why TrenPlay?
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-purple-700/30 bg-purple-700/10 p-6">
                <h3 className="font-semibold mb-2 text-yellow-400">
                  Powered by TrenCoin
                </h3>
                <p className="text-purple-200">
                  All matches use TrenCoin on Solana — fast, secure, and transparent.
                </p>
              </div>
              <div className="rounded-xl border border-purple-700/30 bg-purple-700/10 p-6">
                <h3 className="font-semibold mb-2 text-yellow-400">Fair Play</h3>
                <p className="text-purple-200">
                  Secure escrow and dispute resolution keep matches honest.
                </p>
              </div>
              <div className="rounded-xl border border-purple-700/30 bg-purple-700/10 p-6">
                <h3 className="font-semibold mb-2 text-yellow-400">
                  Skill-Based Competition
                </h3>
                <p className="text-purple-200">
                  No luck, no gimmicks. Just pure competition in your favorite titles.
                </p>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section id="how-it-works" className="mx-auto max-w-7xl px-6 pb-24">
            <h2 className="text-2xl font-bold mb-6 text-purple-400">
              How it works
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                ["Find a Match", "Choose your game and stake TrenCoin."],
                ["Compete", "Play your opponent in a skill-based match."],
                ["Win & Get Paid", "Winners are instantly rewarded in TrenCoin."],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="rounded-xl border border-purple-700/30 bg-purple-700/10 p-6"
                >
                  <h3 className="font-semibold mb-2 text-yellow-400">{title}</h3>
                  <p className="text-purple-200">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Security & Fair Play */}
          <section className="mx-auto max-w-7xl px-6 pb-24 text-center">
            <h2 className="text-3xl font-extrabold text-yellow-400 mb-12">
              Security & Fair Play
            </h2>
            <div className="grid gap-8 md:grid-cols-4">
              <div>
                <div className="text-5xl mb-4">🛡️</div>
                <h3 className="font-bold mb-2">Anti-Cheat Measures</h3>
                <p className="text-purple-200">
                  Detection, verification, and pattern checks keep every match fair.
                </p>
              </div>
              <div>
                <div className="text-5xl mb-4">📸</div>
                <h3 className="font-bold mb-2">Match Proof System</h3>
                <p className="text-purple-200">
                  Upload a screenshot or clip of the final score for instant verification.
                </p>
              </div>
              <div>
                <div className="text-5xl mb-4">🔒</div>
                <h3 className="font-bold mb-2">Secure Escrow</h3>
                <p className="text-purple-200">
                  Your coins are held safely while you play and released on confirmed results.
                </p>
              </div>
              <div>
                <div className="text-5xl mb-4">⚖️</div>
                <h3 className="font-bold mb-2">Dispute Resolution</h3>
                <p className="text-purple-200">
                  Transparent reviews for conflicts — evidence-based, fast, and fair.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mx-auto max-w-4xl px-6 pb-24">
            <h2 className="text-2xl font-bold mb-6 text-center text-purple-400">
              FAQ
            </h2>
            <ul className="space-y-4">
              {[
                "What is TrenCoin?",
                "How do I join a match?",
                "How do payouts work?",
                "How do divisions work?",
              ].map((q) => (
                <li
                  key={q}
                  className="rounded-lg border border-purple-700/30 bg-purple-700/10 p-4 text-purple-200"
                >
                  {q}
                </li>
              ))}
            </ul>
          </section>

          {/* Footer */}
          <footer className="border-t border-purple-700/30 py-10 text-center text-xs text-purple-300">
            © {new Date().getFullYear()} TrenPlay •{" "}
            <Link href="/terms" className="underline hover:text-yellow-400">
              Terms
            </Link>{" "}
            •{" "}
            <Link href="/privacy" className="underline hover:text-yellow-400">
              Privacy
            </Link>
          </footer>
        </div>
      </main>

      {/* ⭐ Twinkle animation */}
      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .animate-twinkle {
          animation: twinkle 4s infinite ease-in-out;
        }
      `}</style>
    </>
  );
}

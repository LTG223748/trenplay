// pages/index.tsx
import Head from "next/head";
import Link from "next/link";

export default function Landing() {
  return (
    <>
      <Head>
        <title>TrenPlay — The Future of Console Competition</title>
        <meta
          name="description"
          content="Skill decides it all. Stake TrenCoin, compete, and win real rewards."
        />
      </Head>

      <main className="min-h-screen bg-[#0b0720] text-white font-[Orbitron]">
        {/* Header */}
        <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-500/30 backdrop-blur" />
            <span className="font-extrabold tracking-wide text-xl">
              TREN<span className="text-yellow-400">PLAY</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm ring-1 ring-white/15 hover:bg-white/5"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-yellow-400 px-5 py-2 text-black font-semibold hover:bg-yellow-300"
            >
              Sign up
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-20 pt-12 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
              TrenPlay — The Future of Console Competition
            </h1>
            <p className="mt-4 max-w-xl text-white/70">
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
                className="rounded-xl px-6 py-3 ring-1 ring-white/15 hover:bg-white/5"
              >
                How it works
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            {/* Placeholder for mascot/preview image */}
            <div className="aspect-video w-full rounded-xl bg-gradient-to-r from-purple-600 to-yellow-400 flex items-center justify-center text-2xl font-bold">
              TrenPlay Preview
            </div>
            <p className="mt-3 text-center text-xs text-white/50">
              Your arena for console competition.
            </p>
          </div>
        </section>

        {/* Why TrenPlay */}
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <h2 className="text-2xl font-bold mb-6">Why TrenPlay?</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-semibold mb-2">Powered by TrenCoin</h3>
              <p className="text-white/70">
                All matches use TrenCoin on Solana — fast, secure, and transparent.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-semibold mb-2">Fair Play</h3>
              <p className="text-white/70">
                Secure escrow and dispute resolution keep matches honest.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-semibold mb-2">Skill-Based Competition</h3>
              <p className="text-white/70">
                No luck, no gimmicks. Just pure competition in your favorite titles.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-7xl px-6 pb-24">
          <h2 className="text-2xl font-bold mb-6">How it works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              ["Find a Match", "Choose your game and stake TrenCoin."],
              ["Compete", "Play your opponent in a skill-based match."],
              ["Win & Get Paid", "Winners are instantly rewarded in TrenCoin."],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="rounded-xl border border-white/10 bg-white/5 p-6"
              >
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-white/70">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-4xl px-6 pb-24">
          <h2 className="text-2xl font-bold mb-6 text-center">FAQ</h2>
          <ul className="space-y-4">
            {[
              "What is TrenCoin?",
              "How do I join a match?",
              "How do payouts work?",
              "How do divisions work?",
            ].map((q) => (
              <li
                key={q}
                className="rounded-lg border border-white/10 bg-white/5 p-4"
              >
                {q}
              </li>
            ))}
          </ul>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-10 text-center text-xs text-white/50">
          © {new Date().getFullYear()} TrenPlay •{" "}
          <Link href="/terms" className="underline">
            Terms
          </Link>{" "}
          •{" "}
          <Link href="/privacy" className="underline">
            Privacy
          </Link>
        </footer>
      </main>
    </>
  );
}


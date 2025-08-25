import Link from 'next/link';

export default function BottomContent() {
  return (
    <section className="mt-20 px-6 text-white text-center max-w-4xl mx-auto">
      {/* Main heading */}
      <h2 className="text-4xl font-extrabold text-yellow-400 mb-6 [text-shadow:0_0_16px_rgba(250,204,21,.65)]">
        Step into TrenPlay — the ultimate skill-based gaming arena.
      </h2>

      <p className="text-lg mb-4 leading-relaxed max-w-3xl mx-auto drop-shadow-md">
        Compete head-to-head in popular console titles like NBA 2K, FIFA, Madden, UFC, and College Football.
        Every match is a battle of skill where the winner takes the prize — no luck, no gimmicks, just pure competition.
      </p>

      {/* Sub headers */}
      <h3 className="text-2xl font-bold text-yellow-300 mb-3 [text-shadow:0_0_14px_rgba(250,204,21,.6)]">
        How it works:
      </h3>
      <ol className="text-lg mb-6 leading-relaxed max-w-3xl mx-auto drop-shadow-md text-left list-decimal list-inside">
        <li>
          <strong>Choose Your Game</strong> –{' '}
          <Link href="/create-match" className="text-yellow-300 underline hover:text-yellow-400 font-semibold">
            Go to Create Match
          </Link>{' '}
          to select your game from our supported titles, or jump straight into the action by joining an existing match if one’s open.
        </li>
        <li>
          <strong>Set Your Stakes</strong> – Decide how many Tren Coins (TC) you’re putting on the line.
        </li>
        <li>
          <strong>Play & Prove Yourself</strong> – Connect with your opponent, play on your console, and show your skill.
        </li>
        <li>
          <strong>Get Winnings Instantly</strong> – The winner’s TC is released instantly and securely.
        </li>
      </ol>

      <h3 className="text-2xl font-bold text-yellow-300 mb-3 [text-shadow:0_0_14px_rgba(250,204,21,.6)]">
        What is Tren Coin (TC)?
      </h3>
      <p className="text-lg mb-4 leading-relaxed max-w-3xl mx-auto drop-shadow-md">
        TC is our integrated digital token that powers the TrenPlay economy. Earn it by winning matches, then use it to enter higher-stakes games — 
        it stays securely in your wallet at all times except when the chosen amount is in play for a match.
      </p>

      <h3 className="text-2xl font-bold text-yellow-300 mb-3 [text-shadow:0_0_14px_rgba(250,204,21,.6)]">
        Why TrenPlay?
      </h3>
      <ul className="text-lg mb-6 leading-relaxed max-w-3xl mx-auto drop-shadow-md text-left list-disc list-inside">
        <li><strong>Skill-Based Rewards</strong> – Win because you’re better, not luckier.</li>
        <li><strong>Fast, Secure Transfers</strong> – Blockchain-powered for instant transactions.</li>
        <li><strong>Your Wallet, Your Winnings</strong> – You own your coins, always.</li>
      </ul>

      <p className="text-lg mb-10 max-w-3xl mx-auto text-yellow-300 font-bold [text-shadow:0_0_14px_rgba(250,204,21,.6)]">
        Before you start, make sure to read and understand the{' '}
        <a href="/howto" className="underline text-yellow-200 hover:text-yellow-400">
          How To Use
        </a>{' '}
        section in the sidebar for match rules, setup instructions, and tips for winning your first game.
      </p>
    </section>
  );
}

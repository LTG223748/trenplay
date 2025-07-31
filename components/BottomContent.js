// components/BottomContent.js
export default function BottomContent() {
  return (
    <section className="mt-20 px-6 text-white text-center max-w-4xl mx-auto">
      <h2 className="text-4xl font-extrabold text-yellow-400 mb-6 drop-shadow-lg">
        Step Into the Future of Skill-Based Console Competition
      </h2>
      <p className="text-lg mb-4 leading-relaxed max-w-3xl mx-auto drop-shadow-md">
        Welcome to TrenPlay — the ultimate arena where your skill drives your success.
        Compete head-to-head in popular console games like NBA 2K, FIFA, UFC, Madden, and College Football.  
      </p>
      <p className="text-lg mb-4 leading-relaxed max-w-3xl mx-auto drop-shadow-md">
        Tren Coin (TC) is our integrated digital token that powers the in-game economy.
        Earn TC by winning matches and proving your talent — no luck, just skill.
        These tokens stay securely in your crypto wallet, giving you full control over your winnings.
      </p>
      <p className="text-lg mb-8 leading-relaxed max-w-3xl mx-auto drop-shadow-md">
        Use TC to enter more competitive matches and showcase your abilities on the leaderboard.
        Our transparent blockchain integration ensures every transaction is fast, secure, and recorded.
      </p>
      <img
        src="/images/Tbet-mascot.png"
        alt="Tbet Mascot"
        className="mx-auto w-48 sm:w-56 md:w-64 lg:w-72 drop-shadow-xl"
      />
    </section>
  );
}

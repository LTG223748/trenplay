// pages/earn-tc.js

export default function EarnTC() {
  return (
    <div className="min-h-screen px-6 py-12 bg-gradient-to-br from-[#10001a] via-[#2d0140] to-black text-white flex justify-center">
      <div className="max-w-2xl w-full bg-[#1a0030]/90 rounded-2xl shadow-2xl border border-yellow-400 p-10 flex flex-col">
        <h1 className="text-3xl font-extrabold text-yellow-300 mb-6 text-center">
          Earn Tren Coins
        </h1>

        <p className="text-lg mb-8 text-center">
          Tren Coins (TC) are a true badge of skill. Earn them by outplaying others and showing your talent on the sticks. Every TC you earn represents your ability to compete—and win—on TrenPlay.
        </p>

        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-2">How to Earn TC</h2>
        <ul className="list-disc ml-8 mb-6 text-base space-y-2">
          <li>
            <span className="font-semibold text-yellow-200">Win Skill Matches:</span> Compete in head-to-head and tournament matches. Only the best take home TC.
          </li>
          <li>
            <span className="font-semibold text-yellow-200">Refer a Friend:</span> Share the TrenPlay experience—when your friend signs up and competes, you both earn TC.
          </li>
        </ul>

        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-2">Skill Wins, Every Time</h2>
        <ul className="list-disc ml-8 mb-6 text-base space-y-2">
          <li>TC is earned only through skill-based competition—no random chance, no luck.</li>
          <li>Climb the leaderboard and prove your skill to the community.</li>
          <li>Every Tren Coin you earn is proof you’ve outplayed the competition.</li>
        </ul>

        <div className="mt-8 text-center text-yellow-400 font-bold text-lg">
          Step up, challenge the best, and let your skill earn your TC.
        </div>
      </div>
    </div>
  );
}

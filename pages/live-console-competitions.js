// pages/live-console-competitions.js
import Head from 'next/head';

export default function LiveConsoleCompetitions() {
  return (
    <>
      <Head>
        <title>Live Console Competitions | TrenPlay</title>
        <meta name="description" content="Skill-based, real-time console gaming competitions on TrenPlay. Compete, win, and climb the leaderboard." />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-[#10001a] via-[#2d0140] to-black py-16 px-4 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-[#1a0030]/90 rounded-2xl shadow-2xl border border-yellow-400 p-10 flex flex-col items-center">
          <h1 className="text-4xl font-extrabold text-yellow-300 mb-6 tracking-tight text-center">
            Live Console Competitions
          </h1>
          <p className="text-lg text-gray-100 mb-8 text-center">
            <span className="block mb-2 font-bold">Experience Skill-Based Console Gaming Like Never Before</span>
            TrenPlay’s Live Console Competitions provide a secure, real-time platform for players to engage in fair and competitive matches across today’s leading console titles.
          </p>

          <ul className="text-base text-white space-y-4 mb-8 w-full">
            <li>
              <span className="font-bold text-yellow-400">• Real-Time Matchmaking:</span>
              <span> Instantly connect with other verified players and compete head-to-head in your favorite games.</span>
            </li>
            <li>
              <span className="font-bold text-yellow-400">• Skill-Driven Outcomes:</span>
              <span> Every match is decided solely by player skill and strategy—no random outcomes, no chance-based mechanics.</span>
            </li>
            <li>
              <span className="font-bold text-yellow-400">• TrenCoin Rewards:</span>
              <span> Earn TrenCoin for each victory and climb our competitive leaderboard. Rewards are based exclusively on performance.</span>
            </li>
            <li>
              <span className="font-bold text-yellow-400">• Fair Play & Security:</span>
              <span> All competitions are monitored for integrity, and our platform is designed to ensure fair and transparent gameplay at every stage.</span>
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-6">
            <a
              href="/create-match"
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8 py-3 rounded-xl shadow-lg transition text-lg text-center"
            >
              Create a Competition
            </a>
            <a
              href="/matches"
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition text-lg text-center"
            >
              View Live Matches
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

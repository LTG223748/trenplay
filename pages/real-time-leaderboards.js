// pages/real-time-leaderboards.js

export default function RealTimeLeaderboards() {
  return (
    <div className="min-h-screen px-6 py-12 bg-gradient-to-br from-[#10001a] via-[#2d0140] to-black text-white flex justify-center">
      <div className="max-w-2xl w-full bg-[#1a0030]/90 rounded-2xl shadow-2xl border border-yellow-400 p-10 flex flex-col">
        <h1 className="text-3xl font-extrabold text-yellow-300 mb-6 text-center">
          Real-Time Leaderboards
        </h1>

        <p className="text-lg mb-8 text-center">
          TrenPlay’s leaderboards are where the best players rise to the top. Track your progress, challenge the top dogs, and see where your skills stack up—live and in real time.
        </p>

        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-2">How Leaderboards Work</h2>
        <ul className="list-disc ml-8 mb-6 text-base space-y-2">
          <li>
            <span className="font-semibold text-yellow-200">Updated Instantly:</span> As soon as matches finish, stats and rankings are refreshed.
          </li>
          <li>
            <span className="font-semibold text-yellow-200">Track Multiple Games:</span> Climb the ranks in your favorite titles—NBA, FIFA, UFC, Madden, and more.
          </li>
          <li>
            <span className="font-semibold text-yellow-200">Top Performers Highlighted:</span> The best players and biggest win streaks are showcased for everyone to see.
          </li>
          <li>
            <span className="font-semibold text-yellow-200">Skill-Based Rankings:</span> Your spot reflects your wins, your activity, and your consistency—no luck, no shortcuts.
          </li>
        </ul>

        <div className="mt-8 text-center text-yellow-400 font-bold text-lg">
          Ready to see your name on top? Play, win, and claim your spot on the leaderboard.
        </div>
      </div>
    </div>
  );
}

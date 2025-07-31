// pages/fair-matches.js

export default function FairMatches() {
  return (
    <div className="min-h-screen px-6 py-12 bg-gradient-to-br from-[#10001a] via-[#2d0140] to-black text-white flex justify-center">
      <div className="max-w-2xl w-full bg-[#1a0030]/95 rounded-2xl shadow-2xl border border-yellow-400 p-10 flex flex-col">
        <h1 className="text-3xl font-extrabold text-yellow-300 mb-6 text-center drop-shadow-md">
          Safe &amp; Fair Matches
        </h1>

        <p className="text-lg mb-10 text-center max-w-prose mx-auto leading-relaxed">
          At TrenPlay, we believe skill should be the only deciding factor. Every match is designed to be transparent, fair, and safe for all players—no randomness, no hidden mechanics, no unfair advantages.
        </p>

        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-4 drop-shadow-sm">How We Keep Matches Fair</h2>
        <ul className="list-disc ml-8 mb-10 text-base space-y-4">
          {[
            {
              label: 'Skill-Based Competition:',
              text: 'All matches are determined by your gameplay—there’s no luck, only your talent on the sticks.',
            },
            {
              label: 'Transparent Results:',
              text: 'Match outcomes are visible and verifiable. Every result is reviewed for accuracy.',
            },
            {
              label: 'Dispute Resolution:',
              text: 'In the rare case of a dispute, our support team steps in to ensure the right outcome.',
            },
            {
              label: 'Community Guidelines:',
              text: 'We enforce fair play, respect, and good sportsmanship at all times.',
            },
          ].map(({ label, text }) => (
            <li
              key={label}
              className="hover:text-yellow-300 transition-colors cursor-default"
              title={text}
            >
              <span className="font-semibold text-yellow-200">{label}</span> {text}
            </li>
          ))}
        </ul>

        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-4 drop-shadow-sm">Player Safety First</h2>
        <ul className="list-disc ml-8 mb-6 text-base space-y-3">
          <li className="hover:text-yellow-300 transition-colors cursor-default">
            Personal data is protected with industry-standard security and never sold.
          </li>
          <li className="hover:text-yellow-300 transition-colors cursor-default">
            We support responsible gaming—play for fun, skill, and community.
          </li>
          <li className="hover:text-yellow-300 transition-colors cursor-default">
            Report unsportsmanlike behavior or suspicious activity at any time.
          </li>
        </ul>

        <div className="mt-12 text-center text-yellow-400 font-bold text-lg drop-shadow-md">
          Compete with confidence—TrenPlay is built for fair, skill-first console gaming.
        </div>
      </div>
    </div>
  );
}

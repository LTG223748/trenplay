// pages/tournaments/how-it-works.tsx
import React from "react";
import Layout from "@/components/Layout";

export default function HowItWorksPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12 text-white">
        <h1 className="text-4xl font-extrabold text-yellow-300 mb-6">
          ❓ How TrenPlay Tournaments Work
        </h1>
        <p className="text-lg text-gray-300 mb-10">
          New to TrenPlay tournaments? Here’s everything you need to know about
          brackets, no-shows, fees, and payouts. Only the best climb to the top.
        </p>

        {/* Formats */}
        <section id="formats" className="mb-12">
          <h2 className="text-2xl font-bold text-purple-300 mb-3">
            🎮 Formats & Seeding
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Brackets come in 4, 8, or 16-player sizes.</li>
            <li>Single-elimination format: lose once and you’re out.</li>
            <li>Seeding is randomized when the bracket is generated.</li>
          </ul>
        </section>

        {/* No-shows */}
        <section id="no-shows" className="mb-12">
          <h2 className="text-2xl font-bold text-purple-300 mb-3">
            ⏱ No-Show Policy
          </h2>
          <p className="text-gray-300 mb-3">
            Matches are scheduled with specific start times. If your opponent
            doesn’t show:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>
              After <strong>10 minutes</strong>, a{" "}
              <span className="text-yellow-300 font-semibold">
                Claim No-Show Win
              </span>{" "}
              button will appear for participants.
            </li>
            <li>
              Click it to advance automatically. The system verifies time and
              participants server-side.
            </li>
            <li>
              If both players are absent, the bracket auto-advances one player
              at random or flags for admin review.
            </li>
          </ul>
        </section>

        {/* Fees */}
        <section id="fees" className="mb-12">
          <h2 className="text-2xl font-bold text-purple-300 mb-3">
            💰 Fees & Payouts
          </h2>
          <p className="text-gray-300 mb-3">
            TrenPlay takes a <strong>7% platform fee</strong> from each
            tournament prize pool. The rest is distributed to winners.
          </p>
          <div className="bg-purple-900/40 border border-purple-700 rounded-xl p-4 text-sm text-gray-200">
            <p className="mb-2 font-semibold">Example: 8-player bracket</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Entry fee: 10 TC per player</li>
              <li>Total pool: 8 × 10 TC = 80 TC</li>
              <li>Platform cut (7%): 5.6 TC</li>
              <li>Net prize pool: 74.4 TC</li>
              <li>Distribution: Winner 70% (52.1 TC), Runner-up 30% (22.3 TC)</li>
            </ul>
          </div>
        </section>

        {/* Divisions */}
        <section id="divisions" className="mb-12">
          <h2 className="text-2xl font-bold text-purple-300 mb-3">
            🏆 Divisions
          </h2>
          <p className="text-gray-300 mb-3">
            Tournaments are split into divisions based on skill/points.
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>
              <span className="font-bold text-yellow-300">Rookie</span> — entry
              level, low stakes
            </li>
            <li>
              <span className="font-bold text-purple-300">Pro</span> — for
              intermediate players
            </li>
            <li>
              <span className="font-bold text-emerald-300">Elite</span> — high
              competition, bigger prizes
            </li>
            <li>
              <span className="font-bold text-pink-300">Legend</span> — the
              ultimate challenge
            </li>
          </ul>
        </section>

        {/* Fair Play */}
        <section id="fairplay" className="mb-12">
          <h2 className="text-2xl font-bold text-purple-300 mb-3">
            🛡 Fair Play & Disputes
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>All matches must be played in good faith.</li>
            <li>
              If both players report conflicting results, the match is flagged
              for admin review.
            </li>
            <li>
              Submitting false results may result in suspension or ban.
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section id="faq" className="mb-12">
          <h2 className="text-2xl font-bold text-purple-300 mb-3">📜 FAQ</h2>
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-yellow-300">
                When do I get my prize?
              </p>
              <p className="text-gray-300">
                Winnings are paid out in TrenCoin (TC) and arrive in your wallet
                within minutes of bracket completion.
              </p>
            </div>
            <div>
              <p className="font-semibold text-yellow-300">
                What if my opponent disconnects?
              </p>
              <p className="text-gray-300">
                If they don’t return within the 10-minute grace period, you can
                claim a no-show win. For mid-game disconnects, report the result
                with screenshots for admin review.
              </p>
            </div>
            <div>
              <p className="font-semibold text-yellow-300">
                Can I join multiple tournaments?
              </p>
              <p className="text-gray-300">
                Yes — but you’re responsible for showing up to each match on
                time. Missing one may lead to disqualification.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

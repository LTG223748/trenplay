// pages/refer.js
import Layout from '../components/Layout';

export default function ReferPage() {
  const referralLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/signup?ref=yourUsername` // Replace with real referral data later
      : '';

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-12 text-white">
        <h1 className="text-4xl font-bold text-yellow-400 mb-6">👬 Refer a Friend</h1>

        <p className="mb-4 text-lg">
          Help grow the TrenBet community and get rewarded while you’re at it. When someone signs up using your referral link and completes their first match, you both earn bonus Tren Coins!
        </p>

        <h2 className="text-2xl text-yellow-300 mt-8 mb-2">📎 Your Referral Link</h2>
        <div className="bg-[#1a0033] text-sm p-4 rounded-lg border border-yellow-400 shadow-inner mb-4">
          {referralLink || 'https://trenbet.com/signup?ref=yourUsername'}
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(
              referralLink || 'https://trenbet.com/signup?ref=yourUsername'
            );
          }}
          className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold hover:bg-yellow-300 transition"
        >
          📋 Copy Link
        </button>

        <h2 className="text-2xl text-yellow-300 mt-10 mb-2">🎁 Referral Rewards</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            You get <span className="text-yellow-400 font-bold">10 TC</span> per friend who joins & plays their first match
          </li>
          <li>
            Your friend gets <span className="text-green-400 font-bold">5 bonus TC</span> to get started
          </li>
          <li>Top referrers are featured on our leaderboard 🔥</li>
        </ul>

        <h2 className="text-2xl text-yellow-300 mt-10 mb-2">📣 Tips for Sharing</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Send it in your group chat or Discord server</li>
          <li>Post it in your social bios</li>
          <li>Use it on your stream overlay or TikTok description</li>
        </ul>

        <p className="text-sm mt-10 text-gray-400">
          We’re working on letting you track your invites and see who’s joined from your link.
        </p>
      </div>
    </Layout>
  );
}

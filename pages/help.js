// pages/help.js
import Layout from '../components/Layout';

export default function HelpPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12 text-white">
        <h1 className="text-4xl font-bold text-yellow-400 mb-6">❓ Help Center</h1>

        {/* What is TrenBet */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-300 mb-2">What is TrenBet?</h2>
          <p className="text-sm text-gray-300">
            TrenBet is a competitive gaming platform for console players who want to showcase their skills in top titles like NBA 2K, FIFA, Madden, and UFC. We use Tren Coins (TC), a digital token, to provide fair entry fees and prize pools for every match or tournament. TrenBet focuses on skill-based competition, transparent match results, and a fun, safe community.
          </p>
        </section>

        {/* How Do I Join and Play Matches? */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-300 mb-2">How Do I Join and Play Matches?</h2>
          <ul className="list-disc pl-6 text-sm text-gray-300">
            <li>Log in or sign up for a free TrenBet account.</li>
            <li>Connect your crypto wallet (such as Phantom or Solflare) to manage your Tren Coin balance.</li>
            <li>Browse the “Matches” or “Tournaments” page and filter by your favorite game and platform.</li>
            <li>Click “Join Match” or “Join Tournament” on an available listing. You’ll be prompted to confirm your entry and submit your gamer tag or username for in-game identification.</li>
            <li>After joining, communicate with your opponent using the provided gamertags and play your match head-to-head.</li>
            <li>Once the game is over, both players submit the result. Tren Coins stay securely in escrow until a winner is confirmed, then the full prize pool is released to the winner’s wallet.</li>
          </ul>
        </section>

        {/* How Does Tren Coin Work? */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-300 mb-2">How Does Tren Coin Work?</h2>
          <p className="text-sm text-gray-300">
            Tren Coins (TC) are the in-platform digital token used to pay entry fees for matches and tournaments. Your TC is stored in your connected wallet and never leaves your control until a match or tournament is completed. All entry fees are held safely in escrow during the match. When a winner is confirmed, the prize pool is automatically released to the winner’s wallet. Tren Coins cannot be cashed out on TrenBet; they are strictly for gameplay and rewards within the platform.
          </p>
        </section>

        {/* How do Divisions and Points Work? */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-300 mb-2">How Do Divisions and Points Work?</h2>
          <p className="text-sm text-gray-300">
            TrenBet is all about skill-based competition. To ensure fair matchups, all players are placed into one of four divisions based on their current points (ELO):
            <ul className="list-disc pl-6 mt-2">
              <li><span className="text-yellow-400 font-bold">Rookie:</span> 700 points and below (start here at 500 points)</li>
              <li><span className="text-yellow-400 font-bold">Pro:</span> 701 - 900 points</li>
              <li><span className="text-yellow-400 font-bold">Elite:</span> 901 - 1200 points</li>
              <li><span className="text-yellow-400 font-bold">Legend:</span> 1201 points and above</li>
            </ul>
            <span className="block mt-2">
              <span className="font-semibold text-green-300">Each win</span> adds <span className="font-bold text-yellow-400">+25 points</span>; <span className="font-semibold text-red-400">each loss</span> subtracts <span className="font-bold text-yellow-400">-20 points</span>. As you win, you move up to tougher divisions; if you lose, you may move down to keep your matches competitive and fun.
            </span>
          </p>
        </section>

        {/* What if I Dispute a Match? */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-300 mb-2">What if I Dispute a Match?</h2>
          <p className="text-sm text-gray-300">
            If there’s ever a disagreement, both players can submit a dispute with screenshots or video proof. Our support team will review all evidence and decide the outcome, usually within 24–48 hours. Your Tren Coins will remain in escrow until the issue is resolved.
          </p>
        </section>

        {/* Need Help? */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-300 mb-2">Need Help?</h2>
          <p className="text-sm text-gray-300">
            You can reach out to our support team at <span className="text-yellow-400">support@trenbet.gg</span> or via the live chat bubble in the bottom-right corner. We’re here to help!
          </p>
        </section>
      </div>
    </Layout>
  );
}

// pages/about.js
import Layout from '../components/Layout';

export default function AboutPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12 text-white">
        <h1 className="text-4xl font-bold text-yellow-400 mb-6">ℹ️ About TrenBet</h1>

        <p className="mb-4 text-lg">
          TrenBet is the ultimate platform for console gamers to compete, wager, and win real rewards using our in-app currency — <span className="text-yellow-400 font-semibold">Tren Coins (TC)</span>.
        </p>

        <p className="mb-4">
          Whether you’re grinding in FIFA, NBA 2K, UFC, or Madden, our mission is to give every player a fair shot at greatness. We’re building a competitive arena where gamers can showcase their skills, rise on leaderboards, and earn digital clout with every win.
        </p>

        <p className="mb-4">
          💡 Born out of passion for esports and Web3 innovation, TrenBet blends the thrill of online gaming with the excitement of wagering — safely, responsibly, and transparently.
        </p>

        <p className="mb-4">
          🎮 Join the community, rise through the ranks, and get rewarded for what you do best: <strong>playing to win</strong>.
        </p>

        <p className="text-sm mt-8 text-gray-400">
          🚀 Built for gamers. Powered by Tren Coins. Changing the game, one match at a time.
        </p>
      </div>
    </Layout>
  );
}
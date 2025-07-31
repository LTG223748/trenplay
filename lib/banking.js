// pages/banking.js
import Layout from '../components/Layout';

export default function BankingPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12 text-white">
        <h1 className="text-4xl font-bold text-yellow-400 mb-6">💼 Banking & Transactions</h1>

        <p className="mb-4 text-lg">
          TrenBet is built with security, transparency, and reward accessibility in mind.
        </p>

        <h2 className="text-2xl text-yellow-300 mt-8 mb-2">🔐 Transaction Security</h2>
        <p className="mb-4">
          All transactions involving Tren Coins (TC) are protected by advanced encryption and handled securely in our backend system. We do not store payment information on our servers.
        </p>

        <h2 className="text-2xl text-yellow-300 mt-8 mb-2">📜 TC Wagering History (Coming Soon)</h2>
        <p className="mb-4">
          Soon you’ll be able to view all wagers, earnings, and Tren Coin movement right from your profile dashboard.
        </p>

        <h2 className="text-2xl text-yellow-300 mt-8 mb-2">💸 TC Policies</h2>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>TC can be used to enter matches and tournaments.</li>
          <li>TC is non-refundable and does not hold real-world cash value.</li>
          <li>You can exchange TC for rewards in the Rewards Store.</li>
        </ul>

        <h2 className="text-2xl text-yellow-300 mt-8 mb-2">🌐 Supported Exchange Options</h2>
        <p className="mb-4">
          You can use your Tren Coins to redeem:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>Gift Cards (Amazon, PlayStation, Xbox, etc.)</li>
          <li>Crypto (Coming Soon)</li>
          <li>Exclusive in-game rewards</li>
        </ul>

        <h2 className="text-2xl text-yellow-300 mt-8 mb-2">🛡 Responsible Wagering</h2>
        <p className="mb-4">
          TrenBet promotes responsible gameplay. Never wager more than you’re comfortable with, and take breaks when needed. We’re here to make gaming fun — not stressful.
        </p>

        <p className="text-sm mt-8 text-gray-400">
          Have questions? Contact support through our Help page.
        </p>
      </div>
    </Layout>
  );
}

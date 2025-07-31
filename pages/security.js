// pages/security.js
export default function SecurityPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">🔐 Security Practices</h1>

      <p className="mb-4">
        At TrenBet, your safety and trust are our top priorities. We’ve implemented strict security practices to ensure a secure experience for all gamers.
      </p>

      <h2 className="text-xl font-semibold text-yellow-300 mt-6 mb-2">🔒 Account Protection</h2>
      <p className="mb-4">
        All accounts are secured with encrypted credentials. We recommend enabling 2FA (two-factor authentication) to add an extra layer of protection.
      </p>

      <h2 className="text-xl font-semibold text-yellow-300 mt-6 mb-2">💳 Payment Security</h2>
      <p className="mb-4">
        All transactions, including Tren Coin purchases and withdrawals, are processed through trusted third-party providers using industry-standard encryption.
      </p>

      <h2 className="text-xl font-semibold text-yellow-300 mt-6 mb-2">📄 Fair Matchmaking</h2>
      <p className="mb-4">
        Our backend checks for suspicious activity in real time, and matches are reviewed to ensure fairness, honesty, and zero cheating.
      </p>

      <h2 className="text-xl font-semibold text-yellow-300 mt-6 mb-2">📊 Data Privacy</h2>
      <p className="mb-4">
        TrenBet will never sell or misuse your personal data. All user data is stored securely and only accessed to enhance your gameplay experience.
      </p>

      <h2 className="text-xl font-semibold text-yellow-300 mt-6 mb-2">🧠 Player Responsibility</h2>
      <p className="mb-4">
        We encourage healthy competition. Please report any suspicious users or unfair behavior immediately through our contact page.
      </p>

      <p className="mt-6">
        Have security concerns? <span className="text-yellow-300 font-medium">Reach out to our support team</span> and we’ll be on it.
      </p>
    </div>
  );
}
// pages/privacy.js

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen px-6 py-12 bg-gradient-to-br from-[#10001a] via-[#2d0140] to-black text-white flex justify-center">
      <div className="max-w-3xl w-full bg-[#1a0030]/90 rounded-2xl shadow-2xl border border-yellow-400 p-10 flex flex-col">
        <h1 className="text-3xl font-extrabold text-yellow-300 mb-6 text-center">
          Privacy Policy
        </h1>
        <p className="mb-4">
          At TrenPlay, your privacy is our top priority. This policy explains what information we collect, how we use it, how we protect it, and your rights as a user.
        </p>
        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-2">1. Data We Collect</h2>
        <ul className="list-disc ml-8 mb-4 text-base space-y-1">
          <li>Email address, username, and password (hashed/encrypted).</li>
          <li>Date of birth or age confirmation (to confirm eligibility).</li>
          <li>Avatar and profile info (if provided).</li>
          <li>Crypto wallet public addresses for deposits and withdrawals.</li>
          <li>Gameplay and platform activity (matches, stats, leaderboards).</li>
          <li>Device, browser, and log data for site security and analytics.</li>
          <li>Referral data (when you refer or are referred by another user).</li>
        </ul>
        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-2">2. How We Use Your Data</h2>
        <ul className="list-disc ml-8 mb-4 text-base space-y-1">
          <li>To create, verify, and manage your account.</li>
          <li>To confirm eligibility and prevent fraud or abuse.</li>
          <li>To provide platform features such as matchmaking, stats, and leaderboards.</li>
          <li>To process Tren Coin (TC) transactions to your connected wallet (public address only).</li>
          <li>To send service emails (match updates, security notifications, customer support).</li>
          <li>To comply with legal obligations and ensure platform integrity.</li>
        </ul>
        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-2">3. What We Don’t Collect</h2>
        <ul className="list-disc ml-8 mb-4 text-base space-y-1">
          <li>We <span className="font-bold text-red-400">never</span> collect, access, or store your crypto wallet’s private key or seed phrase.</li>
          <li>We <span className="font-bold text-red-400">never</span> sell, trade, or share your personal data with advertisers or other third parties, except as required by law or necessary to operate our platform (like authentication providers or analytics).</li>
        </ul>
        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-2">4. Your Rights</h2>
        <ul className="list-disc ml-8 mb-4 text-base space-y-1">
          <li>You may view, update, or request deletion of your account and data at any time by contacting <span className="underline">support@trenplay.com</span>.</li>
          <li>You may opt out of non-essential communications at any time. (We may still send important service emails.)</li>
        </ul>
        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-2">5. Cookies & Analytics</h2>
        <ul className="list-disc ml-8 mb-4 text-base space-y-1">
          <li>We use cookies for secure login sessions and basic analytics to improve site performance and security.</li>
          <li>We may use analytics tools (such as Google Analytics) to help us understand site usage. These tools may set cookies or collect anonymized data.</li>
        </ul>
        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-2">6. Security</h2>
        <ul className="list-disc ml-8 mb-4 text-base space-y-1">
          <li>Your data is encrypted in transit and at rest wherever possible.</li>
          <li>Strict access controls and security measures are in place to protect your data.</li>
          <li>Despite our best efforts, no online service can be 100% secure. Please protect your own account and wallet information.</li>
        </ul>
        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-2">7. Age Restrictions</h2>
        <p className="mb-4">
          You must be at least 18 years old to use TrenPlay. We do not knowingly collect information from anyone under 18.
        </p>
        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-2">8. Changes to This Policy</h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. We will notify users of any significant changes by posting a notice on the website or by email.
        </p>
        <div className="mt-6 text-center text-yellow-400 font-bold text-lg">
          Questions or requests? Contact us at <span className="underline">support@trenplay.com</span>
        </div>
      </div>
    </div>
  );
}

export default function Terms() {
  return (
    <div className="min-h-screen px-6 py-12 bg-gradient-to-br from-[#10001a] via-[#2d0140] to-black text-white flex justify-center">
      <div className="max-w-3xl w-full bg-[#1a0030]/90 rounded-2xl shadow-2xl border border-yellow-400 p-10 flex flex-col">
        <h1 className="text-3xl font-extrabold text-yellow-300 mb-6 text-center">
          Terms &amp; Conditions
        </h1>

        <p className="text-lg mb-8 text-center">
          Welcome to TrenPlay! By accessing or using this website and our services, you agree to these Terms & Conditions. Please read them carefully before playing.
        </p>

        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-2">1. Eligibility</h2>
        <ul className="list-disc ml-8 mb-6 text-base space-y-2">
          <li>You must be at least 18 years old to create an account and participate in matches.</li>
          <li>By signing up, you confirm that your use of TrenPlay does not violate any laws in your local jurisdiction.</li>
        </ul>

        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-2">2. Skill-Based Competition</h2>
        <ul className="list-disc ml-8 mb-6 text-base space-y-2">
          <li>All matches on TrenPlay are skill-based competitions. Success is determined solely by your performance and ability in each game.</li>
          <li>There is no element of chance, luck, or random outcome that determines match results or rewards.</li>
        </ul>

        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-2">3. Responsible Gaming</h2>
        <ul className="list-disc ml-8 mb-6 text-base space-y-2">
          <li>We encourage fair play and responsible gaming at all times.</li>
          <li>Any cheating, collusion, or unsportsmanlike behavior will result in suspension or ban of your account.</li>
        </ul>

        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-2">4. Account & Security</h2>
        <ul className="list-disc ml-8 mb-6 text-base space-y-2">
          <li>You are responsible for keeping your account credentials secure.</li>
          <li>Do not share your account, password, or wallet seed phrase with anyone.</li>
          <li>We never request your private key or seed phrase.</li>
        </ul>

        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-2">5. Digital Assets & Tren Coins</h2>
        <ul className="list-disc ml-8 mb-6 text-base space-y-2">
          <li>Tren Coins (TC) are digital tokens earned through skill-based play or referral promotions.</li>
          <li>
            TC may be withdrawn to an external crypto wallet at the user's request, but cannot be redeemed for cash, cryptocurrency, or any real-world value directly on TrenPlay.
          </li>
          <li>
            TrenPlay does not offer, support, or guarantee any exchange or sale of TC for real-world value. Any such activity occurs entirely outside of TrenPlay and at the user’s own risk.
          </li>
          <li>
            TC may have no real-world value. The existence or availability of any secondary market is outside TrenPlay's control.
          </li>
          <li>
            You may lose TC through match play, failed matches, or platform rule violations. TrenPlay is not liable for any lost, forfeited, or spent TC due to gameplay, technical issues, or rule violations.
          </li>
        </ul>

        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-2">6. Changes & Updates</h2>
        <ul className="list-disc ml-8 mb-6 text-base space-y-2">
          <li>We reserve the right to update these terms at any time. Continued use of the site means you accept any changes.</li>
        </ul>

        <div className="mt-8 text-center text-yellow-400 font-bold text-lg">
          If you have questions, contact us at <span className="underline">support@trenplay.com</span>.
        </div>
      </div>
    </div>
  );
}

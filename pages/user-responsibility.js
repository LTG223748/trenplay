// pages/user-responsibility-risks.js

export default function UserResponsibilityRisks() {
  return (
    <div className="min-h-screen px-6 py-12 bg-gradient-to-br from-[#10001a] via-[#2d0140] to-black text-white flex justify-center">
      <div className="max-w-3xl w-full bg-[#1a0030]/90 rounded-2xl shadow-2xl border border-yellow-400 p-10">
        <h1 className="text-3xl font-extrabold text-yellow-300 mb-6 text-center">
          User Responsibility & Risks
        </h1>

        <p className="mb-6 text-lg">
          TrenPlay is designed to provide a fair and enjoyable experience for all users, but participation in skill-based matches and use of Tren Coin (TC) involves inherent risks. It is important to understand your responsibilities and the potential risks involved.
        </p>

        <h2 className="text-xl font-bold text-yellow-400 mb-3">User Responsibilities</h2>
        <ul className="list-disc ml-6 mb-6 text-base">
          <li>Ensure you meet the minimum age requirement and comply with all applicable laws in your jurisdiction.</li>
          <li>Maintain the security of your account, wallet, and private keys; TrenPlay is not responsible for lost or stolen credentials.</li>
          <li>Use TrenPlay and Tren Coin in accordance with the platform’s terms, policies, and guidelines.</li>
          <li>Engage responsibly and avoid any behavior that could harm other users or the integrity of the platform.</li>
        </ul>

        <h2 className="text-xl font-bold text-yellow-400 mb-3">Risks Involved</h2>
        <ul className="list-disc ml-6 mb-6 text-base">
          <li>Tren Coin (TC) is a digital asset with fluctuating value; its value can increase or decrease based on market conditions.</li>
          <li>Skill-based competition outcomes depend on player ability, and losses of TC are possible.</li>
          <li>Digital assets stored in wallets are subject to security risks such as hacking, phishing, or loss of access.</li>
          <li>Participation is voluntary, and TrenPlay does not guarantee any financial return or prize.</li>
        </ul>

        <h2 className="text-xl font-bold text-yellow-400 mb-3">No Liability</h2>
        <p className="mb-6 text-base">
          TrenPlay disclaims all liability for losses, damages, or other negative consequences resulting from use of the platform, digital assets, or participation in competitions.
        </p>

        <h2 className="text-xl font-bold text-yellow-400 mb-3">Stay Informed</h2>
        <p className="mb-6 text-base">
          Users are encouraged to educate themselves about digital assets, wallet security, and responsible gaming practices.
        </p>

        <p className="text-sm text-gray-400 text-center">
          By using TrenPlay, you acknowledge and accept these responsibilities and risks.
        </p>
      </div>
    </div>
  );
}

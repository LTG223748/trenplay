// pages/no-financial-advice.js

export default function NoFinancialAdvice() {
  return (
    <div className="min-h-screen px-6 py-12 bg-gradient-to-br from-[#10001a] via-[#2d0140] to-black text-white flex justify-center">
      <div className="max-w-3xl w-full bg-[#1a0030]/90 rounded-2xl shadow-2xl border border-yellow-400 p-10">
        <h1 className="text-3xl font-extrabold text-yellow-300 mb-6 text-center">
          No Financial Advice Disclaimer
        </h1>

        <p className="mb-6 text-lg">
          The information provided on TrenPlay, including content related to Tren Coin (TC) and any other digital assets, is for general informational purposes only and should not be construed as financial, investment, legal, or tax advice.
        </p>

        <h2 className="text-xl font-bold text-yellow-400 mb-3">Risks and Considerations</h2>
        <ul className="list-disc ml-6 mb-6 text-base">
          <li>Digital assets, cryptocurrencies, and in-game tokens like Tren Coin are highly volatile and their value may fluctuate dramatically.</li>
          <li>Participation in skill-based gaming or competitions involves inherent risks, including potential loss of any tokens or assets used.</li>
          <li>Past performance is not indicative of future results; no guarantees are made regarding earnings or token appreciation.</li>
          <li>Always conduct your own research and consider your personal financial situation before engaging with digital assets.</li>
          <li>TrenPlay does not provide financial, investment, or legal advice, and users are responsible for their own decisions and outcomes.</li>
        </ul>

        <h2 className="text-xl font-bold text-yellow-400 mb-3">No Liability</h2>
        <p className="mb-6 text-base">
          TrenPlay, its affiliates, employees, and partners disclaim any liability for any losses or damages arising from the use or misuse of Tren Coin or participation in competitions and gaming on the platform.
        </p>

        <h2 className="text-xl font-bold text-yellow-400 mb-3">Consult a Professional</h2>
        <p className="mb-6 text-base">
          If you are uncertain about any financial or legal implications of using TrenPlay or handling digital assets, we strongly recommend consulting with a qualified financial advisor, attorney, or tax professional.
        </p>

        <p className="text-sm text-gray-400 text-center">
          By using TrenPlay, you acknowledge that you have read, understood, and accepted this disclaimer.
        </p>
      </div>
    </div>
  );
}

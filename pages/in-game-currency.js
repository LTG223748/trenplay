// pages/in-game-currency.js

export default function InGameCurrency() {
  return (
    <div className="min-h-screen px-6 py-12 bg-gradient-to-br from-[#10001a] via-[#2d0140] to-black text-white flex justify-center">
      <div className="max-w-3xl w-full bg-[#1a0030]/90 rounded-2xl shadow-2xl border border-yellow-400 p-10 flex flex-col space-y-6">
        <h1 className="text-3xl font-extrabold text-yellow-300 mb-4 text-center">
          In-Game Currency: Tren Coin (“TC”)
        </h1>

        <p className="text-lg leading-relaxed">
          Tren Coin (“TC”) is a digital token used exclusively within the TrenPlay platform for skill-based competitions. TC is transferred directly between users based on match outcomes — when a player wins, TC moves from the losing player’s account to the winner’s account.
        </p>

        <p className="text-lg leading-relaxed">
          TrenPlay <strong>does not</strong> hold, redeem, buy back, or guarantee any monetary value for TC. TC is <strong>not</strong> redeemable for cash, cryptocurrency, or any real-world currency on TrenPlay.
        </p>

        <p className="text-lg leading-relaxed">
          Users may transfer TC to supported external wallets, such as Phantom, where TC may be traded or exchanged on third-party marketplaces. Such external transactions are <strong>not</strong> controlled, endorsed, or guaranteed by TrenPlay. Any risks associated with trading or transferring TC outside of TrenPlay are the sole responsibility of the user.
        </p>

        <p className="text-lg leading-relaxed">
          By using TrenPlay, you acknowledge and accept that TC has no guaranteed monetary value and that you can lose TC as part of skill-based competitive play. TrenPlay is not liable for any losses incurred during gameplay or through external TC transactions.
        </p>
      </div>
    </div>
  );
}


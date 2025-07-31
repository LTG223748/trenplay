// pages/crypto-integration.js

export default function CryptoIntegration() {
  return (
    <div className="min-h-screen px-6 py-12 bg-gradient-to-br from-[#10001a] via-[#2d0140] to-black text-white flex justify-center">
      <div className="max-w-2xl w-full bg-[#1a0030]/90 rounded-2xl shadow-2xl border border-yellow-400 p-10 flex flex-col">
        <h1 className="text-3xl font-extrabold text-yellow-300 mb-6 text-center">
          Crypto Integration
        </h1>

        <p className="text-lg mb-6 text-center">
          Seamlessly connect your crypto wallet to TrenPlay for secure deposits, withdrawals, and on-chain Tren Coin transactions.
          Enjoy fast, transparent, and blockchain-powered gaming with full control over your digital assets.
        </p>

        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-2">Supported Wallets</h2>
        <ul className="list-disc ml-8 mb-4 text-base">
          <li>Phantom Wallet</li>
          <li>Solflare Wallet</li>
          <li>Soon: More Solana-compatible wallets</li>
        </ul>

        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-2">How Crypto Integration Works</h2>
        <ul className="list-disc ml-8 mb-4 text-base">
          <li>Deposit Tren Coins instantly from your wallet.</li>
          <li>Withdraw winnings securely, with transactions recorded on the Solana blockchain.</li>
          <li>Full ownership—your crypto always stays in your control.</li>
        </ul>

        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-2">Benefits</h2>
        <ul className="list-disc ml-8 mb-4 text-base">
          <li>True asset ownership: your crypto stays in your wallet.</li>
          <li>Fast, low-fee Solana transactions.</li>
          <li>Fully transparent & secure—every transaction is on-chain.</li>
        </ul>

        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-2">How to Connect</h2>
        <ol className="list-decimal ml-8 mb-4 text-base">
          <li>Click “Connect Wallet” in the header or wallet page.</li>
          <li>Select Phantom or your preferred wallet.</li>
          <li>Approve the connection.</li>
          <li>Start using Tren Coin on TrenPlay!</li>
        </ol>

        <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-2">Stay Safe</h2>
        <ul className="list-disc ml-8 text-base">
          <li>Never share your private key or seed phrase.</li>
          <li>Use strong passwords and enable 2FA where possible.</li>
          <li>Always check you are on <span className="underline">https://trenplay.com</span>.</li>
        </ul>
      </div>
    </div>
  );
}

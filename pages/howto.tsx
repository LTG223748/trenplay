// pages/howto.tsx
import React from 'react';
import Link from 'next/link';

const HowToUsePage = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#0e0020] via-[#1a0030] to-[#0a001a] text-white px-6 py-10 font-futuristic">
    <h1 className="text-4xl font-bold text-yellow-400 mb-8">📖 How To Use TrenPlay</h1>
    <div className="space-y-12 max-w-3xl mx-auto">

      {/* Section: Buying Tren Coin */}
      <section>
        <h2 className="text-2xl font-bold text-yellow-300 mb-4">1. Getting Started: Buying Tren Coin</h2>
        <ol className="list-decimal ml-5 space-y-4 text-lg">
          <li>
            <span className="font-bold text-yellow-200">Get a Solana wallet:</span>  
            Download and set up a <span className="text-yellow-300">Phantom Wallet</span> (browser or mobile).
          </li>
          <li>
            <span className="font-bold text-yellow-200">Buy Solana (SOL):</span>  
            Use a crypto exchange (like Coinbase, Kraken, or Binance) to purchase SOL and send it to your Phantom Wallet address.
          </li>
          <li>
            <span className="font-bold text-yellow-200">Buy Tren Coin:</span>  
            Inside your Phantom wallet, go to the swap feature.  
            <ul className="list-disc ml-6 mt-1">
              <li>Choose SOL as your “from” token.</li>
              <li>Search for and select <span className="font-bold">Tren Coin</span> (double-check the official token address!)</li>
              <li>Enter the amount and confirm the swap.</li>
            </ul>
            <span className="block mt-2 text-sm text-yellow-400">Tip: Always leave a little SOL for transaction fees!</span>
          </li>
        </ol>
      </section>

      {/* Section: Supported Games & Requirements */}
      <section>
        <h2 className="text-2xl font-bold text-yellow-300 mb-4">2. What You Need</h2>
        <ul className="list-disc ml-6 space-y-2 text-lg">
          <li>A Phantom Wallet with SOL and Tren Coin</li>
          <li>An Xbox or PlayStation console</li>
          <li>Supported games: NBA 2K, Madden, FIFA, UFC, College Football, MLB The Show, etc.</li>
          <li>Internet connection and your gamertag/PSN ID</li>
        </ul>
      </section>

      {/* Section: Creating or Joining a Match */}
      <section>
        <h2 className="text-2xl font-bold text-yellow-300 mb-4">3. How To Join or Create a Game</h2>
        <ol className="list-decimal ml-5 space-y-4 text-lg">
          <li>
            <span className="font-bold text-yellow-200">Create or Join:</span>  
            On the home page, pick your game and select <span className="text-yellow-300">Create Match</span> or join a listed match.
          </li>
          <li>
            <span className="font-bold text-yellow-200">Enter Details:</span>  
            Enter your username/gamertag and wager amount. Use the chat to talk with your opponent.
          </li>
          <li>
            <span className="font-bold text-yellow-200">Connect on Console:</span>  
            Add your opponent’s gamertag/PSN ID on your Xbox or PlayStation.  
            <span className="block ml-6 text-sm text-yellow-300">You must send the game invite yourself—TrenPlay does not automate this part.</span>
          </li>
          <li>
            <span className="font-bold text-yellow-200">Team Selection:</span>  
            Both users must clearly state (in the site chat) what team they will use. You <span className="text-yellow-300 font-bold">must play as that team</span> or the match may be voided.
          </li>
        </ol>
      </section>

      {/* Section: During the Game */}
      <section>
        <h2 className="text-2xl font-bold text-yellow-300 mb-4">4. Playing Your Match</h2>
        <ul className="list-disc ml-6 space-y-2 text-lg">
          <li>Coordinate game settings and start time with your opponent in the chat.</li>
          <li>Play the game as agreed, using the teams selected in chat.</li>
          <li>If you encounter issues, communicate with your opponent and use the chat for documentation.</li>
        </ul>
      </section>

      {/* Section: Reporting Results */}
      <section>
        <h2 className="text-2xl font-bold text-yellow-300 mb-4">5. Reporting and Verifying Results</h2>
        <ol className="list-decimal ml-5 space-y-4 text-lg">
          <li>
            <span className="font-bold text-yellow-200">Winning?</span>  
            If you win, you <span className="font-bold">must upload a clear photo</span> of your victory screen or final score on the match page.
          </li>
          <li>
            <span className="font-bold text-yellow-200">Both users confirm:</span>  
            If both players confirm the result, <span className="text-green-400">the winner is paid automatically from escrow.</span>
          </li>
          <li>
            <span className="font-bold text-yellow-200">Disputes:</span>  
            If there’s any disagreement, an admin will review the match.  
            <span className="block ml-6 text-sm text-yellow-300">Always provide as much proof as possible to resolve disputes quickly.</span>
          </li>
        </ol>
      </section>

      {/* Section: Coin Security & Platform Fees */}
      <section>
        <h2 className="text-2xl font-bold text-yellow-300 mb-4">6. How We Keep Your Tren Coin Safe</h2>
        <ul className="list-disc ml-6 space-y-2 text-lg">
          <li>All wagers are held in a smart contract escrow. Nobody can touch the coins until the match is resolved.</li>
          <li>
            As soon as both users confirm the winner, coins are released <span className="text-green-400">automatically to the winner</span>.
          </li>
          <li>
            A <span className="text-yellow-400">7% fee</span> is taken from the winner’s prize to support the platform.
          </li>
        </ul>
      </section>

      {/* Section: Cheating, Fair Play, & Bans */}
      <section>
        <h2 className="text-2xl font-bold text-yellow-300 mb-4">7. Fair Play, Cheating, and Bans</h2>
        <ul className="list-disc ml-6 space-y-2 text-lg">
          <li>
            <span className="text-red-400 font-bold">No cheating allowed!</span> Anyone caught submitting fake results, lying about match outcomes, or trying to scam the system <span className="font-bold">will be banned.</span>
          </li>
          <li>
            Users must play as the teams agreed upon in chat. Playing as a different team can void your match and forfeit your wager.
          </li>
          <li>
            Abusive or inappropriate chat/messages will result in penalties or bans.
          </li>
        </ul>
      </section>

      {/* Section: Dispute Resolution */}
      <section>
        <h2 className="text-2xl font-bold text-yellow-300 mb-4">8. Disputes & Admin Review</h2>
        <ul className="list-disc ml-6 space-y-2 text-lg">
          <li>If both users agree on the winner, coins are paid instantly.</li>
          <li>If there is a dispute, our admin team will review all chat logs and proof provided.</li>
          <li>Users who repeatedly dispute or try to abuse the system may be suspended or banned.</li>
          <li>For the fastest resolutions, always upload clear screenshots and communicate respectfully.</li>
        </ul>
      </section>

      {/* Section: Support */}
      <section>
        <h2 className="text-2xl font-bold text-yellow-300 mb-4">9. Need Help?</h2>
        <p className="text-lg">
          Still have questions or need assistance?
          <br />
          Check out our <Link href="/help" className="underline text-yellow-400">Help</Link> page or email us at <a href="mailto:support@trenplay.net" className="underline text-yellow-300">support@trenplay.net</a>.
        </p>
      </section>
    </div>
  </div>
);

export default HowToUsePage;

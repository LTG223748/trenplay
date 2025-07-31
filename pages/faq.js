import { useState } from 'react';

const faqs = [
  {
    question: 'What is TrenPlay?',
    answer: `TrenPlay is a next-generation skill-based gaming platform for console players. Our mission is to create a transparent and competitive environment where you can put your abilities to the test in popular titles like NBA 2K, FIFA, UFC, Madden, and more. Players use Tren Coins (TC) to enter matches and tournaments, with every contest based on skill—not chance.`,
  },
  {
    question: 'How do I start competing on TrenPlay?',
    answer: `To compete, simply browse the available matches or tournaments in your division. When you join a match, you'll enter your gamertag, allowing your opponent to easily connect with you for gameplay. The agreed Tren Coin (TC) entry fees are securely held in a decentralized wallet by the platform until the match result is confirmed.

Once your match is complete, both players submit their results on TrenPlay. If you both agree on the winner, the TC prize is instantly released to the victor's wallet. If there is a dispute, our admin team reviews and resolves the case to maintain fairness and integrity. This system ensures funds are protected and payouts only go to confirmed winners.`,
  },
  {
    question: 'What are Tren Coins?',
    answer: `Tren Coins (TC) are a digital token native to TrenPlay. Stored in your connected crypto wallet, TC is used exclusively on our platform to enter matches, tournaments, and unlock rewards. Tren Coins have value only within the TrenPlay ecosystem and cannot be directly exchanged for cash through our service.`,
  },
  {
    question: 'Can I cash out Tren Coins?',
    answer: `TrenPlay does not offer direct cash-out or exchange services for Tren Coins. While TC can be transferred between compatible wallets, we do not facilitate or support converting TC to traditional currencies. Please use TC for in-platform competition and rewards, and exercise caution if transferring tokens externally.`,
  },
  {
    question: 'How do I connect my crypto wallet?',
    answer: `Connecting your wallet is simple and secure. TrenPlay supports popular Solana-compatible wallets, such as Phantom and Solflare. To connect, click the "Connect Wallet" button in the header or wallet page and follow the prompts from your wallet provider. Your tokens remain under your control at all times; the platform never has access to your private keys.`,
  },
  {
    question: 'Is TrenPlay legal?',
    answer: `TrenPlay is a skill-based competition platform, not gambling. Our games are based entirely on player ability and not chance. However, regulations regarding digital tokens and online competition can vary by region. Please check your local laws before participating. TrenPlay is committed to compliance and responsible gaming.`,
  },
  {
    question: 'What if I have issues or need support?',
    answer: `Our support team is ready to help with any questions, issues, or disputes. Use the Contact Us page to submit a request or browse our Help section for detailed guides on gameplay, wallet connection, account management, and more. We’re committed to quick, effective assistance to ensure your TrenPlay experience is always positive.`,
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleIndex = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10001a] via-[#2d0140] to-black p-8 text-white max-w-4xl mx-auto rounded-xl shadow-xl">
      <h1 className="text-4xl font-extrabold text-yellow-400 mb-8 text-center drop-shadow-lg">
        Frequently Asked Questions
      </h1>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-[#1a0030] rounded-lg shadow-lg p-4 cursor-pointer select-none"
            onClick={() => toggleIndex(index)}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{faq.question}</h2>
              <span className="text-yellow-400 text-2xl">
                {openIndex === index ? '−' : '+'}
              </span>
            </div>
            {openIndex === index && (
              <p className="mt-3 text-gray-300 leading-relaxed whitespace-pre-line">
                {faq.answer}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="text-gray-400 text-xs mt-8 text-center">
        Still have questions? <a href="/contact" className="underline text-yellow-400">Contact our support team</a>.
      </div>
    </div>
  );
}

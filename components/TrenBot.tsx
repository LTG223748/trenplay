import { useState } from "react";
import { FaRobot, FaTimes } from "react-icons/fa";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import Link from "next/link";

interface Message {
  from: "user" | "bot";
  text: string;
}

// ✅ FAQ keyword bank (expand anytime)
const faqBank: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["forgot password", "reset password"],
    answer: "🔑 To reset your password, click here: /reset-password",
  },
  {
    keywords: ["support", "email", "help"],
    answer: "📧 You can always reach us at support@trenplay.com.",
  },
  {
    keywords: ["add tc", "deposit", "buy coins"],
    answer: "💰 To add TrenCoin, click Wallet → Add TC and choose your payment method.",
  },
  {
    keywords: ["withdraw", "cash out", "payout"],
    answer: "💵 Go to Wallet → Withdraw to cash out your TrenCoin safely.",
  },
  {
    keywords: ["divisions", "ranks", "elo"],
    answer: "🏆 Divisions are based on ELO: Rookie → Pro → Elite → Legend. Win matches to rank up.",
  },
  {
    keywords: ["rematch"],
    answer: "🔄 After a match ends, click Rematch to instantly challenge the same player again.",
  },
  {
    keywords: ["quick join", "auto join", "find match"],
    answer: "⚡ Quick Join lets you pick game, price, and console, then we auto-find you a match.",
  },
  {
    keywords: ["friends", "add friend", "invite"],
    answer: "👥 Add players to your friends list to challenge them if you’re in the same division.",
  },
  {
    keywords: ["trenbot", "what is this", "who are you"],
    answer: "🤖 I’m TrenBot, your AI assistant. I can answer basic TrenPlay questions or send you to support@trenplay.com.",
  },
];

function checkFAQ(input: string): string | null {
  const lower = input.toLowerCase();
  for (const item of faqBank) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.answer;
    }
  }
  return null;
}

export default function TrenBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user] = useAuthState(auth);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { from: "user", text: input };
    setMessages((prev: Message[]) => [...prev, userMsg]);
    setInput("");

    // ✅ Step 1: Check FAQ (free, no API)
    const faqAnswer = checkFAQ(userMsg.text);
    if (faqAnswer) {
      setMessages((prev: Message[]) => [...prev, { from: "bot", text: faqAnswer }]);
      return;
    }

    // ✅ Step 2: Call AI API (only if no FAQ match)
    setLoading(true);
    try {
      const res = await fetch("/api/trenbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid || "guest",
          message: userMsg.text,
        }),
      });

      const data = await res.json();
      const botMsg: Message = { from: "bot", text: data.reply || "⚠️ TrenBot is offline." };
      setMessages((prev: Message[]) => [...prev, botMsg]);
    } catch (err) {
      console.error("TrenBot error:", err);
      const botMsg: Message = {
        from: "bot",
        text: "⚠️ TrenBot is offline. Email support@trenplay.com.",
      };
      setMessages((prev: Message[]) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-yellow-400 text-black p-4 rounded-full shadow-lg hover:bg-yellow-300 transition"
        >
          <FaRobot size={24} />
        </button>
      )}

      {open && (
        <div className="w-80 h-96 bg-[#1a1028] border border-white/20 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-[#2d0140] px-4 py-2 border-b border-white/10">
            <span className="font-bold text-yellow-400">TrenBot</span>
            <button onClick={() => setOpen(false)} className="text-white hover:text-yellow-400">
              <FaTimes />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[80%] break-words ${
                  m.from === "user"
                    ? "bg-yellow-400 text-black self-end ml-auto"
                    : "bg-white/10 text-white self-start"
                }`}
              >
                {/* Make reset-password link clickable */}
                {m.text.includes("/reset-password") ? (
                  <Link href="/reset-password" className="underline text-yellow-400">
                    Reset Password
                  </Link>
                ) : (
                  m.text
                )}
              </div>
            ))}
            {loading && (
              <div className="p-2 rounded-lg bg-white/10 text-white text-sm self-start">
                TrenBot is thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 flex gap-2">
            <input
              className="flex-1 px-3 py-2 rounded bg-[#2a2a40] text-white text-sm focus:outline-none"
              placeholder="Ask me something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-yellow-400 text-black px-3 py-2 rounded hover:bg-yellow-300 transition text-sm font-semibold disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}





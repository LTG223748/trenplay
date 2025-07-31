import { useState } from "react";
import { notify } from "../lib/notify"; // update path if needed

export default function SubscriptionButton({ user }) {
  const [loading, setLoading] = useState(false);
  const [subActive, setSubActive] = useState(user?.subscriptionActive);
  const [expires, setExpires] = useState(user?.subscriptionExpires);

  const handleBuySubscription = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/purchaseSubscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setSubActive(true);
        setExpires(data.expires);
        notify("✅ Subscription activated! You’re now fee-free for 30 days.", "success");
      } else {
        notify(data.error || "Subscription purchase failed.", "error");
      }
    } catch (err) {
      setLoading(false);
      notify("Something went wrong. Please try again.", "error");
    }
  };

  // Subscription is active and not expired
  const activeAndValid =
    subActive && expires && new Date(expires) > new Date();

  if (activeAndValid) {
    return (
      <div className="text-green-400 font-bold text-center">
        Fee-Free Subscription Active ✅<br />
        Expires: {new Date(expires).toLocaleDateString()}
      </div>
    );
  }

  return (
    <button
      className="bg-yellow-400 px-5 py-2 rounded font-bold text-black shadow hover:bg-yellow-300 transition disabled:opacity-60"
      onClick={handleBuySubscription}
      disabled={loading}
    >
      {loading ? "Processing..." : "Go Fee-Free: 15,000 TC/month"}
    </button>
  );
}


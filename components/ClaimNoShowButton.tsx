import { useEffect, useMemo, useState } from "react";

type Props = {
  matchId: string;
  scheduledAt: number | Date | string; // parent can pass Firestore TS converted to ms
  claimantUid: string;                  // current user uid
  disabledReason?: string;              // optional extra guard from parent if you want
};

const GRACE_MS = 10 * 60 * 1000;

export default function ClaimNoShowButton({ matchId, scheduledAt, claimantUid, disabledReason }: Props) {
  const schedMs = useMemo(() => {
    if (scheduledAt instanceof Date) return scheduledAt.getTime();
    if (typeof scheduledAt === "number") return scheduledAt;
    // string/Firestore Timestamp-like
    // @ts-ignore
    if (scheduledAt?.toMillis) return scheduledAt.toMillis();
    return new Date(scheduledAt as string).getTime();
  }, [scheduledAt]);

  const [now, setNow] = useState<number>(Date.now());
  const [loading, setLoading] = useState(false);
  const canClaimAt = useMemo(() => (Number.isFinite(schedMs) ? schedMs + GRACE_MS : Infinity), [schedMs]);
  const msRemaining = Math.max(0, canClaimAt - now);
  const ready = msRemaining === 0 && !disabledReason;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, "0")}`;
    };

  const handleClaim = async () => {
    if (!ready || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/matches/claim-no-show", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, claimantUid }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to claim");
      alert("No-show win claimed ✅");
    } catch (e: any) {
      alert(e?.message || "Failed to claim");
    } finally {
      setLoading(false);
    }
  };

  const label = ready ? (loading ? "Claiming…" : "Claim No-Show Win") : `Available in ${fmt(msRemaining)}`;

  return (
    <button
      onClick={handleClaim}
      disabled={!ready || loading}
      className={`px-4 py-2 rounded-lg font-bold transition
        ${ready ? "bg-yellow-400 text-purple-900 hover:brightness-110 hover:scale-[1.02]" : "bg-gray-700 text-gray-300 cursor-not-allowed"}
      `}
      title={disabledReason || (ready ? "Claim the win if your opponent didn't show" : "Wait until 10 minutes after the scheduled time")}
    >
      {label}
    </button>
  );
}

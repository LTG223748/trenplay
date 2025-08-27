// components/TournamentClaimNoShowButton.tsx
import { useEffect, useMemo, useState } from "react";

type FireTime = Date | number | string | { toMillis?: () => number };

type Props = {
  tournamentId: string;
  roundIdx: number;
  matchIdx: number;
  scheduledAt: FireTime;                   // match.scheduledAt OR round.date
  claimantUid: string;                     // current user uid
  participantUids?: (string | undefined)[]; // [p1Uid, p2Uid] for client-side guard
  onSuccess?: (winnerUid: string) => void; // optional optimistic callback
};

const GRACE_MS = 10 * 60 * 1000;

function toMs(v: FireTime): number {
  if (!v) return NaN as unknown as number;
  if (v instanceof Date) return v.getTime();
  if (typeof v === "number") return v;
  if (typeof v === "string") return new Date(v).getTime();
  // Firestore Timestamp-like
  // @ts-ignore
  if (typeof v === "object" && typeof v.toMillis === "function") return v.toMillis();
  return NaN as unknown as number;
}

export default function TournamentClaimNoShowButton({
  tournamentId,
  roundIdx,
  matchIdx,
  scheduledAt,
  claimantUid,
  participantUids = [],
  onSuccess,
}: Props) {
  const schedMs = useMemo(() => toMs(scheduledAt), [scheduledAt]);

  const [now, setNow] = useState<number>(Date.now());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const canClaimAt = Number.isFinite(schedMs) ? (schedMs as number) + GRACE_MS : Infinity;
  const msRemaining = Math.max(0, canClaimAt - now);
  const isParticipant = !!claimantUid && participantUids?.includes(claimantUid);
  const ready = msRemaining === 0 && isParticipant && !!tournamentId;

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
      const res = await fetch("/api/tournaments/claim-no-show", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId, roundIdx, matchIdx, claimantUid }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to claim");
      onSuccess?.(claimantUid);
      alert("No-show win claimed ✅");
    } catch (e: any) {
      alert(e?.message || "Failed to claim");
    } finally {
      setLoading(false);
    }
  };

  const label = !isParticipant
    ? "Participants only"
    : msRemaining > 0
    ? `Available in ${fmt(msRemaining)}`
    : loading
    ? "Claiming…"
    : "Claim No-Show Win";

  return (
    <button
      onClick={handleClaim}
      disabled={!ready || loading}
      className={`px-3 py-1.5 rounded-lg font-bold text-sm transition
        ${ready ? "bg-yellow-400 text-purple-900 hover:brightness-110 hover:scale-[1.02]" : "bg-gray-700 text-gray-300 cursor-not-allowed"}
      `}
      title={
        !isParticipant
          ? "Only players in this matchup can claim"
          : msRemaining > 0
          ? "Button unlocks 10 minutes after scheduled time"
          : "Claim the no-show win"
      }
    >
      {label}
    </button>
  );
}


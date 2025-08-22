// components/ConfirmInGameButton.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

type MatchDoc = {
  creatorUserId?: string | null;
  joinerUserId?: string | null;
  confirmedInGameByCreator?: boolean;
  confirmedInGameByJoiner?: boolean;
};

type PlayerDoc = {
  team?: string;
  gamertag?: string;
  confirmed?: boolean; // green button in chat
};

function isReady(d?: PlayerDoc | null) {
  if (!d) return false;
  const teamOk = !!(d.team || "").trim();
  const tagOk = !!(d.gamertag || "").trim();
  return teamOk && tagOk && d.confirmed === true;
}

export default function ConfirmInGameButton({
  matchId,
  match,
  disabled = false,
}: {
  matchId: string;
  match: MatchDoc | null;
  disabled?: boolean;
}) {
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // live readiness
  const [meReady, setMeReady] = useState(false);
  const [oppReady, setOppReady] = useState(false);
  const [bothReady, setBothReady] = useState(false);
  const meReadyRef = useRef(false);
  const oppReadyRef = useRef(false);

  const user = auth.currentUser;

  // whose in-game flag do we set
  const fieldToSet = useMemo(() => {
    if (!user || !match) return null;
    const isCreator = user.uid === match.creatorUserId;
    return isCreator ? "confirmedInGameByCreator" : "confirmedInGameByJoiner";
  }, [user, match]);

  const opponentUid = useMemo(() => {
    if (!user || !match) return null;
    return user.uid === match.creatorUserId ? match.joinerUserId : match.creatorUserId;
  }, [user, match]);

  // 🔄 Subscribe to both players; keep the button visually disabled until both are ready
  useEffect(() => {
    setMeReady(false);
    setOppReady(false);
    setBothReady(false);
    meReadyRef.current = false;
    oppReadyRef.current = false;

    if (!user || !match || !matchId || !opponentUid) return;

    const meRef = doc(db, "matches", matchId, "players", user.uid);
    const oppRef = doc(db, "matches", matchId, "players", opponentUid);

    const unsubMe = onSnapshot(meRef, (snap) => {
      const r = isReady(snap.exists() ? (snap.data() as PlayerDoc) : null);
      meReadyRef.current = r;
      setMeReady(r);
      setBothReady(r && oppReadyRef.current);
    });

    const unsubOpp = onSnapshot(oppRef, (snap) => {
      const r = isReady(snap.exists() ? (snap.data() as PlayerDoc) : null);
      oppReadyRef.current = r;
      setOppReady(r);
      setBothReady(meReadyRef.current && r);
    });

    return () => {
      unsubMe();
      unsubOpp();
    };
  }, [user, match, matchId, opponentUid]);

  const handleClick = async () => {
    setErr(null);
    if (!user || !match || !fieldToSet || !opponentUid) return;

    try {
      setSending(true);

      // 🔐 Re-check on click (server-trust)
      const meRef = doc(db, "matches", matchId, "players", user.uid);
      const oppRef = doc(db, "matches", matchId, "players", opponentUid);
      const [meSnap, oppSnap] = await Promise.all([getDoc(meRef), getDoc(oppRef)]);

      const me = meSnap.exists() ? (meSnap.data() as PlayerDoc) : null;
      const opp = oppSnap.exists() ? (oppSnap.data() as PlayerDoc) : null;

      const meOk = isReady(me);
      const oppOk = isReady(opp);

      if (!meOk || !oppOk) {
        setErr(
          !meOk && !oppOk
            ? "Both players must confirm team & gamertag first."
            : !meOk
            ? "You must confirm your team & gamertag first."
            : "Opponent must confirm their team & gamertag first."
        );
        return;
      }

      await updateDoc(doc(db, "matches", matchId), { [fieldToSet]: true });
    } catch (e: any) {
      setErr(e?.message || "Failed to confirm in-game.");
    } finally {
      setSending(false);
    }
  };

  const coreReady =
    !!user && !!match && !!fieldToSet && !!opponentUid && !sending;
  const isClickable = coreReady && bothReady && !disabled;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        disabled={!isClickable}
        className={`px-5 py-3 rounded-xl font-semibold transition ${
          isClickable
            ? "bg-yellow-400 text-black hover:bg-yellow-300"
            : "bg-gray-600 text-gray-300 cursor-not-allowed"
        }`}
        title={
          !isClickable
            ? !bothReady
              ? "Both players must confirm team & gamertag in chat first."
              : "Please wait…"
            : undefined
        }
      >
        {sending ? "Confirming…" : "Confirm In-Game"}
      </button>

      {!bothReady && (
        <p className="text-xs text-gray-300">
          Waiting for confirmations — You: {meReady ? "✅" : "❌"} | Opponent: {oppReady ? "✅" : "❌"}
        </p>
      )}
      {err && <p className="text-sm text-red-300">{err}</p>}
    </div>
  );
}

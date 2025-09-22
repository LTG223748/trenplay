// components/ConfirmInGameButton.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

type MatchDoc = {
  creatorUserId?: string | null;
  joinerUserId?: string | null; // may be stale/unset; we derive opponent live
  confirmedInGameByCreator?: boolean;
  confirmedInGameByJoiner?: boolean;
  status?: string | null;
};

type PlayerDoc = {
  team?: string;
  gamertag?: string;
  confirmed?: boolean | string | number; // chat "green button"
  lockedIn?: boolean | string | number;  // alternate flag some UIs use
  ready?: boolean | string | number;     // alternate flag some UIs use
  status?: string;                       // e.g., 'ready' | 'confirmed'
  confirmedAt?: unknown;                 // presence implies confirmed
};

const truthy = (v: unknown) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return /^(true|1|yes|y)$/i.test(v.trim());
  return !!v;
};

function isReady(d?: PlayerDoc | null) {
  if (!d) return false;
  const teamOk = String(d.team ?? "").trim().length > 0;
  const tagOk = String(d.gamertag ?? "").trim().length > 0;
  const anyReady = [
    d.confirmed,
    d.lockedIn,
    d.ready,
    d.status && /^(ready|confirmed)$/i.test(String(d.status)),
    d.confirmedAt,
  ].some(truthy);
  return teamOk && tagOk && anyReady;
}

export default function ConfirmInGameButton({
  matchId,
  match, // can be stale; we subscribe below
  // accept `disabled` for backward compat but intentionally ignore it
  disabled = false,
}: {
  matchId: string;
  match: MatchDoc | null;
  disabled?: boolean;
}) {
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // live readiness + opponent derivation from players/
  const [meReady, setMeReady] = useState(false);
  const [oppReady, setOppReady] = useState(false);
  const [bothReady, setBothReady] = useState(false);
  const [userInPlayers, setUserInPlayers] = useState(false);

  // live "confirmed in game" flags from match doc
  const [myConfirmed, setMyConfirmed] = useState(false);
  const [oppConfirmed, setOppConfirmed] = useState(false);
  const [bothConfirmed, setBothConfirmed] = useState(false);

  const meReadyRef = useRef(false);
  const oppReadyRef = useRef(false);
  const oppUidRef = useRef<string | null>(null);

  const user = auth.currentUser || null;

  // Subscribe to players/ so both readiness flags come from the same tick
  useEffect(() => {
    setErr(null);
    setMeReady(false);
    setOppReady(false);
    setBothReady(false);
    setUserInPlayers(false);
    meReadyRef.current = false;
    oppReadyRef.current = false;
    oppUidRef.current = null;

    if (!user || !matchId) return;

    const colRef = collection(db, "matches", matchId, "players");
    const unsub = onSnapshot(colRef, (snap) => {
      const byId: Record<string, PlayerDoc> = {};
      const ids: string[] = [];
      snap.forEach((d) => {
        ids.push(d.id);
        byId[d.id] = d.data() as PlayerDoc;
      });

      const userHasDoc = ids.includes(user.uid);
      setUserInPlayers(userHasDoc);

      const derivedOppUid = ids.find((id) => id !== user.uid) || null;
      oppUidRef.current = derivedOppUid;

      const meDoc = byId[user.uid];
      const oppDoc = derivedOppUid ? byId[derivedOppUid] : undefined;

      const meOk = isReady(meDoc);
      const oppOk = isReady(oppDoc);

      meReadyRef.current = meOk;
      oppReadyRef.current = oppOk;

      setMeReady(meOk);
      setOppReady(oppOk);
      setBothReady(meOk && oppOk);
    });

    return () => unsub();
  }, [user, matchId]);

  // Subscribe to match doc to track who has clicked "Confirm In-Game"
  useEffect(() => {
    if (!user || !matchId) return;
    const mref = doc(db, "matches", matchId);
    const unsub = onSnapshot(mref, (snap) => {
      const m = (snap.data() as MatchDoc | undefined) || null;
      if (!m) {
        setMyConfirmed(false);
        setOppConfirmed(false);
        setBothConfirmed(false);
        return;
      }
      const isCreator = user.uid === m.creatorUserId;
      const mine = isCreator ? !!m.confirmedInGameByCreator : !!m.confirmedInGameByJoiner;
      const opp  = isCreator ? !!m.confirmedInGameByJoiner : !!m.confirmedInGameByCreator;
      setMyConfirmed(mine);
      setOppConfirmed(opp);
      setBothConfirmed(mine && opp);
    });
    return () => unsub();
  }, [user, matchId]);

  // Resolve role/field WITHOUT relying on possibly-stale match.joinerUserId
  const fieldToSet = useMemo<
    "confirmedInGameByCreator" | "confirmedInGameByJoiner" | null
  >(() => {
    if (!user) return null;
    const creatorUid = match?.creatorUserId || null;
    if (creatorUid && user.uid === creatorUid) return "confirmedInGameByCreator";
    // If you're not the creator but you exist in players/, treat you as joiner.
    if (userInPlayers) return "confirmedInGameByJoiner";
    return null;
  }, [user, match?.creatorUserId, userInPlayers]);

  const handleClick = async () => {
    setErr(null);
    if (!user) {
      setErr("You must be signed in.");
      return;
    }
    const opponentUid = oppUidRef.current;
    if (!opponentUid) {
      setErr("Opponent not detected yet. Try again in a moment.");
      return;
    }
    if (!fieldToSet) {
      setErr("Cannot determine your role in this match.");
      return;
    }

    try {
      setSending(true);
      // Re-check on click (server-trust)
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
      // After this write, the match onSnapshot above will flip `myConfirmed` to true
      // and the UI will show "Waiting for other player…" until `oppConfirmed` is true.
    } catch (e: any) {
      setErr(e?.message || "Failed to confirm in-game.");
    } finally {
      setSending(false);
    }
  };

  // Gating (IGNORE parent `disabled`)
  const hasUser = !!user;
  const hasOpp = !!oppUidRef.current;
  const hasField = !!fieldToSet;
  const notSending = !sending;

  // Clickable when both are ready, we know opponent & role, and you haven't already confirmed.
  const coreReady = hasUser && hasOpp && hasField && notSending;
  const isClickable = coreReady && bothReady && !myConfirmed;

  // Button label reflects state
  const label = sending
    ? "Confirming…"
    : myConfirmed && !bothConfirmed
    ? "Waiting for other player…"
    : "Confirm In-Game";

  // Small helper text showing readiness + confirmations
  const showStatusLine = !bothConfirmed;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={!isClickable}
        aria-disabled={!isClickable}
        aria-busy={sending}
        className={`px-5 py-3 rounded-xl font-semibold transition ${
          isClickable
            ? "bg-yellow-400 text-black hover:bg-yellow-300"
            : "bg-gray-600 text-gray-300 cursor-not-allowed"
        }`}
      >
        {label}
      </button>

      {showStatusLine && (
        <p className="text-xs text-gray-300">
          Ready — You: {meReady ? "✅" : "❌"} · Opponent: {oppReady ? "✅" : "❌"}{" "}
          | Confirmed — You: {myConfirmed ? "✅" : "⏳"} · Opponent: {oppConfirmed ? "✅" : "⏳"}
        </p>
      )}

      {err && <p className="text-sm text-red-300">{err}</p>}
    </div>
  );
}

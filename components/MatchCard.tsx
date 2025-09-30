'use client';

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatTCWithUSD } from "../utils/formatCurrency";
import { GAMES, TrenGameId } from "../lib/games";
import MatchClaimNoShowButton from "./MatchClaimNoShowButton";
import notify from "../lib/notify";
import TrustBadge from "./TrustBadge";

import {
  doc,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

type FireTime = Date | number | string | { toMillis?: () => number };

type Match = {
  id: string;
  gameId?: TrenGameId;
  game?: string;
  platform: "Console-Green" | "Console-Blue" | string;
  entryFee: number;
  status: string;
  completed?: boolean;
  winnerUid?: string | null;
  creatorUserId: string;
  joinerUserId?: string | null;
  creatorDisputes?: number;
  scheduledAt?: FireTime;
  division: string;
};

interface MatchCardProps {
  match: Match;
  currentUser: { uid?: string } | null;
}

function getPlatformIcon(platform: string) {
  if (platform === "Console-Green") {
    return <span role="img" aria-label="Console-Green" className="text-green-400 text-lg mr-1">🎮</span>;
  }
  if (platform === "Console-Blue") {
    return <span role="img" aria-label="Console-Blue" className="text-blue-400 text-lg mr-1">🎮</span>;
  }
  return <span role="img" aria-label="Game" className="text-purple-400 text-lg mr-1">🕹️</span>;
}

function getBorder(platform: string) {
  if (platform === "Console-Green") return "border-green-500 shadow-green-400/50";
  if (platform === "Console-Blue") return "border-blue-500 shadow-blue-400/50";
  return "border-purple-500 shadow-purple-400/50";
}

function toMs(v?: FireTime): number {
  if (!v) return NaN as unknown as number;
  if (v instanceof Date) return v.getTime();
  if (typeof v === "number") return v;
  if (typeof v === "string") return new Date(v).getTime();
  if (typeof v === "object" && typeof (v as any).toMillis === "function") return (v as any).toMillis();
  return NaN as unknown as number;
}

const MIN = 60_000;
const tsPlus = (ms: number) => Timestamp.fromDate(new Date(Date.now() + ms));
function toMillisAny(t: any): number | null {
  if (!t) return null;
  if (typeof t === "number") return t;
  if (typeof t === "string") {
    const v = Date.parse(t);
    return Number.isNaN(v) ? null : v;
  }
  if (typeof t?.toMillis === "function") return t.toMillis();
  return null;
}

export default function MatchCard({ match, currentUser }: MatchCardProps) {
  const [local, setLocal] = useState<Match>(match);
  const [joining, setJoining] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const router = useRouter();

  const isFull = Boolean(local.joinerUserId) || local.status === "full";
  const isCreator = !!currentUser?.uid && currentUser.uid === local.creatorUserId;
  const youUid = currentUser?.uid ?? "";
  const youAreParticipant = !!youUid && (youUid === local.creatorUserId || youUid === local.joinerUserId);

  const gameMeta = local.gameId ? GAMES[local.gameId] : undefined;
  const gameLabel = gameMeta?.label ?? local.game ?? "Unknown Game";
  const gameIcon = gameMeta?.icon ?? "🎮";
  const isCrossplay = !!gameMeta?.crossplay;

  const completed = !!local.completed || !!local.winnerUid || local.status?.startsWith("completed");
  const winnerUid = local.winnerUid ?? undefined;

  const schedMs = useMemo(() => toMs(local.scheduledAt), [local.scheduledAt]);

  async function handleJoin() {
    if (!currentUser?.uid) {
      notify("Please log in to join.", "error");
      return;
    }
    if (isCreator) {
      notify("You cannot join your own match.", "error");
      return;
    }
    setJoining(true);
    try {
      await runTransaction(db, async (tx) => {
        const ref = doc(db, "matches", local.id);
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error("Match not found");

        const m = snap.data() as any;
        const expMs = toMillisAny(m?.expireAt);
        const now = Date.now();

        if ((m.status ?? "").toLowerCase() !== "open") throw new Error("Match is no longer open.");
        if (m.joinerUserId) throw new Error("Someone already joined.");
        if (expMs && expMs <= now) throw new Error("This match has expired.");
        if (m.creatorUserId === currentUser.uid) throw new Error("You cannot join your own match.");

        tx.update(ref, {
          status: "pending",
          joinerUserId: currentUser.uid,
          joinerJoinedAt: serverTimestamp(),
          expireAt: tsPlus(5 * MIN),
          updatedAt: serverTimestamp(),
        });
      });

      setLocal((prev) => ({
        ...prev,
        status: "pending",
        joinerUserId: currentUser!.uid,
      }));

      notify("Joined match — taking you to chat…", "success");
      router.push(`/match/${local.id}/chat`);
    } catch (e: any) {
      console.error(e);
      notify(e?.message || "Failed to join. Try refreshing.", "error");
    } finally {
      setJoining(false);
    }
  }

  async function handleCancel() {
    if (!isCreator) return;
    if (local.status !== "open") {
      notify("You can only cancel before anyone joins.", "error");
      return;
    }
    if (!window.confirm("Cancel this match?")) return;

    setCancelling(true);
    try {
      await runTransaction(db, async (tx) => {
        const ref = doc(db, "matches", local.id);
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error("Match not found");

        const m = snap.data() as any;
        if ((m.status ?? "").toLowerCase() !== "open" || m.joinerUserId) {
          throw new Error("Match is no longer open.");
        }

        tx.update(ref, {
          status: "closed",
          expireAt: tsPlus(60_000),
          updatedAt: serverTimestamp(),
        });
      });

      setLocal((prev) => ({ ...prev, status: "closed" }));
      notify("Match cancelled.", "success");
    } catch (e: any) {
      console.error(e);
      notify(e?.message || "Failed to cancel.", "error");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div
      className={`bg-[#1a1a2e] text-white p-4 rounded-2xl shadow-lg relative border-2 ${getBorder(
        local.platform
      )} transition-all`}
    >
      {/* Header row: Game + Console pill */}
      <div className="flex items-center mb-2 gap-3">
        <div className="flex items-center gap-2 text-sm text-violet-200">
          <span className="text-lg">{gameIcon}</span>
          <h2 className="text-xl font-extrabold">{gameLabel}</h2>
          {isCrossplay && (
            <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-600/20 border border-emerald-400/30">
              Crossplay
            </span>
          )}
          {/* ✅ Trust Badge wrapped for onboarding tour */}
          {local.creatorDisputes !== undefined && (
            <div id="trust-badge">
              <TrustBadge disputeCount={local.creatorDisputes} />
            </div>
          )}
        </div>

        <span
          className={`ml-auto px-3 py-1 rounded-full font-bold flex items-center text-xs uppercase ${
            local.platform === "Console-Green"
              ? "bg-green-900 text-green-300"
              : local.platform === "Console-Blue"
              ? "bg-blue-900 text-blue-300"
              : "bg-purple-900 text-purple-300"
          }`}
        >
          {getPlatformIcon(local.platform)}
          Console
        </span>
      </div>

      {/* Status chip */}
      <div className="mb-2">
        {completed ? (
          <span className="inline-flex items-center rounded bg-green-500/15 px-2 py-0.5 font-semibold text-green-300 text-xs">
            ✓ Completed — Winner: {winnerUid === youUid ? "You" : winnerUid ?? "—"}
          </span>
        ) : isFull ? (
          <span className="inline-flex items-center rounded bg-red-500/15 px-2 py-0.5 font-semibold text-red-300 text-xs">
            Full
          </span>
        ) : local.status === "pending" ? (
          <span className="inline-flex items-center rounded bg-amber-500/15 px-2 py-0.5 font-semibold text-amber-300 text-xs">
            Pending
          </span>
        ) : local.status === "closed" ? (
          <span className="inline-flex items-center rounded bg-gray-500/15 px-2 py-0.5 font-semibold text-gray-300 text-xs">
            Closed
          </span>
        ) : (
          <span className="inline-flex items-center rounded bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-300 text-xs">
            Open
          </span>
        )}
      </div>

      {/* Details */}
      <p>
        <strong>Entry Fee:</strong> {formatTCWithUSD(local.entryFee)}
      </p>

      {Number.isFinite(schedMs) && (
        <p className="text-sm text-blue-300/90 mt-1">
          <strong>Scheduled:</strong>{" "}
          {new Date(schedMs as number).toLocaleString()}
        </p>
      )}

      {/* Actions */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {!isCreator && !isFull && !completed && local.status === "open" && (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="px-4 py-2 rounded-xl font-bold bg-yellow-400 text-black hover:bg-yellow-500 disabled:opacity-50"
          >
            {joining ? "Joining…" : "Join"}
          </button>
        )}

        {isCreator && !completed && local.status === "open" && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="px-4 py-2 rounded-xl font-bold bg-red-500 text-white hover:bg-red-400 disabled:opacity-50"
            title="Cancel this match"
          >
            {cancelling ? "Cancelling…" : "Cancel"}
          </button>
        )}

        {isCreator && !!local.joinerUserId && !completed && (
          <div className="p-2 bg-green-800 text-yellow-300 text-xs rounded shadow">
            ✅ A player has joined!
            <Link href={`/match/${local.id}/chat`} className="ml-2 underline text-yellow-400">
              Go to Chat
            </Link>
          </div>
        )}

        {!completed && youAreParticipant && Number.isFinite(schedMs) && (
          <MatchClaimNoShowButton
            matchId={local.id}
            scheduledAt={schedMs}
            claimantUid={youUid}
            participantUids={[local.creatorUserId, local.joinerUserId ?? undefined]}
            onSuccess={(winner) => {
              setLocal((prev) => ({
                ...prev,
                completed: true,
                winnerUid: winner,
                status: "completed_no_show",
              }));
            }}
          />
        )}
      </div>

      <p className="text-xs text-gray-400 mt-4 italic">
        *TC value shown in USD for reference only. All wagers are placed in TrenCoin (TC).
      </p>
    </div>
  );
}




// components/MatchCard.tsx
import React, { useMemo, useState } from "react";
import Link from "next/link";
import JoinButton from "./JoinButton";
import { formatTCWithUSD } from "../utils/formatCurrency";
import { GAMES, TrenGameId } from "../lib/games";
import MatchClaimNoShowButton from "./MatchClaimNoShowButton";

type FireTime = Date | number | string | { toMillis?: () => number };

type Match = {
  id: string;

  /** NEW (preferred) */
  gameId?: TrenGameId;
  /** BACKWARD COMPAT */
  game?: string;

  platform: "Console-Green" | "Console-Blue" | string;
  entryFee: number;

  // status fields
  status: string;                // "open" | "full" | "completed_*" | etc.
  completed?: boolean;
  winnerUid?: string | null;

  // participants
  creatorUserId: string;
  joinerUserId?: string | null;

  // scheduling (for no-show logic)
  scheduledAt?: FireTime;

  division: string;
};

interface MatchCardProps {
  match: Match;
  currentUser: { uid?: string } | null;
}

function getPlatformIcon(platform: string) {
  if (platform === "Console-Green") {
    return (
      <span role="img" aria-label="Console-Green" className="text-green-400 text-lg mr-1">
        🎮
      </span>
    );
  }
  if (platform === "Console-Blue") {
    return (
      <span role="img" aria-label="Console-Blue" className="text-blue-400 text-lg mr-1">
        🎮
      </span>
    );
  }
  return (
    <span role="img" aria-label="Game" className="text-purple-400 text-lg mr-1">
      🕹️
    </span>
  );
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
  // Firestore Timestamp-like
  // @ts-ignore
  if (typeof v === "object" && typeof v.toMillis === "function") return v.toMillis();
  return NaN as unknown as number;
}

export default function MatchCard({ match, currentUser }: MatchCardProps) {
  const [local, setLocal] = useState<Match>(match);

  const isFull = Boolean(local.joinerUserId) || local.status === "full";
  const isCreator = !!currentUser?.uid && currentUser.uid === local.creatorUserId;
  const youUid = currentUser?.uid ?? "";
  const youAreParticipant = !!youUid && (youUid === local.creatorUserId || youUid === local.joinerUserId);

  // Resolve game label/icon from single source of truth (lib/games.ts).
  // Falls back to `match.game` if you haven’t migrated older docs yet.
  const gameMeta = local.gameId ? GAMES[local.gameId] : undefined;
  const gameLabel = gameMeta?.label ?? local.game ?? "Unknown Game";
  const gameIcon = gameMeta?.icon ?? "🎮";
  const isCrossplay = !!gameMeta?.crossplay;

  const completed = !!local.completed || !!local.winnerUid || local.status?.startsWith("completed");
  const winnerUid = local.winnerUid ?? undefined;

  const schedMs = useMemo(() => toMs(local.scheduledAt), [local.scheduledAt]);

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

      {/* Status chip (Completed / Open / Full) */}
      <div className="mb-2">
        {completed ? (
          <span className="inline-flex items-center rounded bg-green-500/15 px-2 py-0.5 font-semibold text-green-300 text-xs">
            ✓ Completed — Winner: {winnerUid === youUid ? "You" : winnerUid ?? "—"}
          </span>
        ) : isFull ? (
          <span className="inline-flex items-center rounded bg-red-500/15 px-2 py-0.5 font-semibold text-red-300 text-xs">
            Full
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

      {/* Scheduled time (if available) */}
      {Number.isFinite(schedMs) && (
        <p className="text-sm text-blue-300/90 mt-1">
          <strong>Scheduled:</strong> {new Date(schedMs as number).toLocaleString()}
        </p>
      )}

      {/* Actions */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {/* Join (non-creator, not full, not completed) */}
        {!isCreator && !isFull && !completed && <JoinButton match={local as any} />}

        {/* Creator notice when someone joins */}
        {isCreator && !!local.joinerUserId && !completed && (
          <div className="p-2 bg-green-800 text-yellow-300 text-xs rounded shadow">
            ✅ A player has joined!
            <Link href={`/match/${local.id}/chat`} className="ml-2 underline text-yellow-400">
              Go to Chat
            </Link>
          </div>
        )}

        {/* Claim No-Show (participant-only, 10-min lock, not completed) */}
        {!completed && youAreParticipant && Number.isFinite(schedMs) && (
          <MatchClaimNoShowButton
            matchId={local.id}
            scheduledAt={schedMs}
            claimantUid={youUid}
            participantUids={[local.creatorUserId, local.joinerUserId ?? undefined]}
            onSuccess={(winner) => {
              // Optimistically flip this card to completed
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












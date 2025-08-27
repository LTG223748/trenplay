// components/BracketDisplay.tsx
import { useEffect, useState } from "react";
import TournamentClaimNoShowButton from "./TournamentClaimNoShowButton";

type FireTime = Date | number | string | { toMillis?: () => number };

type Matchup = {
  matchNum?: number;
  player1?: string;
  player2?: string;
  player1Uid?: string;
  player2Uid?: string;
  p1?: string;
  p2?: string;
  p1Uid?: string;
  p2Uid?: string;
  scheduledAt?: FireTime;
  completed?: boolean;
  winner?: string;
  winnerUid?: string;
  status?: string;
  reports?: Record<string, any>;
};

type Round = {
  round?: number | string;
  date?: FireTime; // fallback time for matches in this round
  matchups: Matchup[];
};

interface BracketDisplayProps {
  tournament: {
    id?: string;
    matchSchedule?: Round[];
    players: string[];
  };
  tournamentId?: string; // optional explicit id override
  userId?: string; // highlight the current user's matches
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

function fmtDate(v?: FireTime): string {
  const ms = toMs(v);
  if (!Number.isFinite(ms)) return "—";
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return "—";
  }
}

export default function BracketDisplay({
  tournament,
  tournamentId,
  userId,
}: BracketDisplayProps) {
  const tid = tournamentId ?? tournament.id;

  // Local copy for optimistic updates
  const [schedule, setSchedule] = useState<Round[]>(tournament.matchSchedule ?? []);

  // keep in sync if parent prop changes
  useEffect(() => {
    setSchedule(tournament.matchSchedule ?? []);
  }, [tournament.matchSchedule]);

  if (!schedule || schedule.length === 0) {
    return <div className="text-gray-400">Bracket not yet generated.</div>;
  }

  return (
    <div className="mt-4">
      <h3 className="text-white font-bold mb-3">Bracket &amp; Schedule</h3>

      <div className="space-y-5">
        {schedule.map((round, roundIdx) => {
          const roundLabel =
            typeof round.round !== "undefined" ? `Round ${round.round}` : `Round ${roundIdx + 1}`;
          const roundTime = fmtDate(round.date);

          return (
            <div key={roundIdx} className="rounded-xl border border-purple-800/50 bg-[#17042b]/50 shadow-lg">
              <div className="flex items-center justify-between px-4 py-3 border-b border-purple-800/40">
                <div className="text-yellow-300 font-semibold">{roundLabel}</div>
                <div className="text-xs text-gray-300">Starts: {roundTime}</div>
              </div>

              <div className="divide-y divide-purple-900/50">
                {round.matchups?.map((match, matchIdx) => {
                  const p1 =
                    match.player1Uid ??
                    match.player1 ??
                    match.p1Uid ??
                    match.p1 ??
                    undefined;
                  const p2 =
                    match.player2Uid ??
                    match.player2 ??
                    match.p2Uid ??
                    match.p2 ??
                    undefined;

                  const youAreP1 = !!userId && p1 === userId;
                  const youAreP2 = !!userId && p2 === userId;
                  const youAreInThis = youAreP1 || youAreP2;

                  const scheduledMs = Number.isFinite(toMs(match.scheduledAt))
                    ? toMs(match.scheduledAt)
                    : toMs(round.date);

                  const statusCompleted = !!match.completed || !!match.winner || !!match.winnerUid;
                  const winner =
                    (match.winnerUid as string | undefined) ??
                    (match.winner as string | undefined);

                  return (
                    <div
                      key={matchIdx}
                      className={`px-4 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between ${
                        youAreInThis ? "bg-[#241545]" : ""
                      }`}
                    >
                      {/* Left: Match label + players */}
                      <div className="min-w-0">
                        <div className="text-sm text-yellow-200/90 font-semibold">
                          Match {match.matchNum ?? matchIdx + 1}
                        </div>
                        <div className="text-white text-sm md:text-base">
                          <span className={`${youAreP1 ? "font-extrabold underline" : "font-semibold"}`}>
                            {p1 ?? "TBD"} {youAreP1 && <span className="ml-1 rounded bg-yellow-400 px-1.5 py-0.5 text-xs font-bold text-purple-900">You</span>}
                          </span>
                          <span className="mx-2 text-gray-400">vs</span>
                          <span className={`${youAreP2 ? "font-extrabold underline" : "font-semibold"}`}>
                            {p2 ?? "TBD"} {youAreP2 && <span className="ml-1 rounded bg-yellow-400 px-1.5 py-0.5 text-xs font-bold text-purple-900">You</span>}
                          </span>
                        </div>

                        {/* Winner / status line */}
                        <div className="mt-1 text-xs">
                          {statusCompleted ? (
                            <span className="inline-flex items-center rounded bg-green-500/15 px-2 py-0.5 font-semibold text-green-300">
                              ✓ Completed — Winner: {winner ?? "—"}
                            </span>
                          ) : p1 && p2 ? (
                            <span className="inline-flex items-center rounded bg-blue-500/15 px-2 py-0.5 font-semibold text-blue-300">
                              Scheduled: {fmtDate(scheduledMs)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded bg-gray-500/15 px-2 py-0.5 font-semibold text-gray-300">
                              TBD — waiting for players
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions (Claim No-Show) */}
                      <div className="mt-1 md:mt-0 flex items-center gap-3">
                        {!statusCompleted && p1 && p2 && tid && Number.isFinite(scheduledMs) ? (
                          <TournamentClaimNoShowButton
                            tournamentId={tid}
                            roundIdx={roundIdx}
                            matchIdx={matchIdx}
                            scheduledAt={scheduledMs}
                            claimantUid={userId ?? ""}
                            participantUids={[p1, p2]}
                            onSuccess={(winnerUid) => {
                              // Optimistically mark this matchup as completed with the winner
                              setSchedule((prev) =>
                                prev.map((r, rIdx) =>
                                  rIdx === roundIdx
                                    ? {
                                        ...r,
                                        matchups: r.matchups.map((m, mIdx) =>
                                          mIdx === matchIdx
                                            ? {
                                                ...m,
                                                completed: true,
                                                winnerUid,
                                                winner: winnerUid,
                                                status: "completed_no_show",
                                              }
                                            : m
                                        ),
                                      }
                                    : r
                                )
                              );
                            }}
                          />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}




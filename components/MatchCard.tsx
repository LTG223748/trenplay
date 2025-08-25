// components/MatchCard.tsx
import React from 'react';
import Link from 'next/link';
import JoinButton from './JoinButton';
import { formatTCWithUSD } from '../utils/formatCurrency';
import { GAMES, TrenGameId } from '../lib/games';

type Match = {
  id: string;
  /** NEW (preferred): gameId from lib/games.ts, e.g. "fortnite_build" */
  gameId?: TrenGameId;
  /** BACKWARD COMPAT: old string label you were storing, e.g. "NBA 2K" */
  game?: string;

  platform: 'Console-Green' | 'Console-Blue' | string;
  entryFee: number;
  status: string;
  creatorUserId: string;
  joinerUserId?: string | null;
  division: string;
};

interface MatchCardProps {
  match: Match;
  currentUser: { uid?: string } | null;
}

function getPlatformIcon(platform: string) {
  if (platform === 'Console-Green') {
    return (
      <span role="img" aria-label="Console-Green" className="text-green-400 text-lg mr-1">
        🎮
      </span>
    );
  }
  if (platform === 'Console-Blue') {
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
  if (platform === 'Console-Green') return 'border-green-500 shadow-green-400/50';
  if (platform === 'Console-Blue') return 'border-blue-500 shadow-blue-400/50';
  return 'border-purple-500 shadow-purple-400/50';
}

export default function MatchCard({ match, currentUser }: MatchCardProps) {
  const isFull = Boolean(match.joinerUserId) || match.status === 'full';
  const isCreator = !!currentUser?.uid && currentUser.uid === match.creatorUserId;
  const someoneJoined = isCreator && !!match.joinerUserId;

  // Resolve game label/icon from single source of truth (lib/games.ts).
  // Falls back to `match.game` if you haven’t migrated older docs yet.
  const gameMeta = match.gameId ? GAMES[match.gameId] : undefined;
  const gameLabel = gameMeta?.label ?? match.game ?? 'Unknown Game';
  const gameIcon = gameMeta?.icon ?? '🎮';
  const isCrossplay = !!gameMeta?.crossplay;

  return (
    <div
      className={`bg-[#1a1a2e] text-white p-4 rounded-2xl shadow-lg relative border-2 ${getBorder(
        match.platform
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
            match.platform === 'Console-Green'
              ? 'bg-green-900 text-green-300'
              : match.platform === 'Console-Blue'
              ? 'bg-blue-900 text-blue-300'
              : 'bg-purple-900 text-purple-300'
          }`}
        >
          {getPlatformIcon(match.platform)}
          Console
        </span>
      </div>

      {/* Details */}
      <p>
        <strong>Entry Fee:</strong> {formatTCWithUSD(match.entryFee)}
      </p>
      <p>
        <strong>Status:</strong>{' '}
        {isFull ? (
          <span className="text-red-400 font-bold">Full</span>
        ) : (
          <span className="text-green-400">Open</span>
        )}
      </p>

      {/* Action */}
      {!isCreator && !isFull && <JoinButton match={match as any} />}

      {/* Creator notice when someone joins */}
      {someoneJoined && (
        <div className="mt-2 p-2 bg-green-800 text-yellow-300 text-xs rounded shadow">
          ✅ A player has joined!
          <Link href={`/match/${match.id}/chat`} className="ml-2 underline text-yellow-400">
            Go to Chat
          </Link>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4 italic">
        *TC value shown in USD for reference only. All wagers are placed in TrenCoin (TC).
      </p>
    </div>
  );
}











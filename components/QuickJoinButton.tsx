"use client";

import { useState } from "react";
import { quickJoin } from "../lib/quickJoin";
import { TrenGameId } from "../lib/games";
import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import AddTCModal from "./AddTCModal";

type Props = {
  gameId: TrenGameId;
  platform: string;
  stake: number;
};

export default function QuickJoinButton({ gameId, platform, stake }: Props) {
  const [loading, setLoading] = useState(false);
  const [showAddTC, setShowAddTC] = useState(false);
  const [neededTC, setNeededTC] = useState(0);

  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();

  const handleClick = async () => {
    setLoading(true);
    try {
      const matchId = await quickJoin(gameId, platform, stake, anchorWallet, publicKey);
      if (matchId) {
        window.location.href = `/matches/${matchId}`;
      }
    } catch (err: any) {
      if (err.code === "INSUFFICIENT_FUNDS") {
        setNeededTC(err.neededTC);
        setShowAddTC(true);
      } else {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? "Finding Match..." : "Quick Join"}
      </button>

      {showAddTC && (
        <AddTCModal
          neededTC={neededTC}
          onClose={() => setShowAddTC(false)}
          onConfirm={() => {
            setShowAddTC(false);
            // TODO: hook into Add TC flow
            alert("Redirecting to Add TC flow…");
          }}
        />
      )}
    </>
  );
}



"use client";

import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

type TrustBadgeProps = {
  disputeCount: number | undefined;
};

export default function TrustBadge({ disputeCount }: TrustBadgeProps) {
  if (disputeCount === undefined) return null;

  if (disputeCount === 0) {
    return (
      <span
        className="
          inline-flex items-center gap-1
          px-2 py-1 rounded-full
          text-xs font-orbitron font-bold uppercase
          bg-green-500/20 text-green-300 border border-green-400/40
        "
      >
        <FaCheckCircle className="text-green-400" />
        Trusted Player
      </span>
    );
  }

  return (
    <span
      className="
        inline-flex items-center gap-1
        px-2 py-1 rounded-full
        text-xs font-orbitron font-bold uppercase
        bg-yellow-500/20 text-yellow-300 border border-yellow-400/40
      "
    >
      <FaExclamationTriangle className="text-yellow-400" />
      {disputeCount} Dispute{disputeCount > 1 ? "s" : ""}
    </span>
  );
}

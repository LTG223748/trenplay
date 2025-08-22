import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export type U64Like = BN | number | string | bigint;

/** Convert any u64-like value to 8-byte little-endian Buffer */
export function u64LeBytes(n: U64Like): Buffer {
  const bn = BN.isBN(n) ? (n as BN) : new BN(n.toString());
  return bn.toArrayLike(Buffer, "le", 8);
}

/**
 * MatchState PDA
 * seeds = ["match_v3", player1, mint, matchId_le_u64]
 */
export function deriveMatchStatePda(args: {
  programId: PublicKey;
  player1: PublicKey;
  mint: PublicKey;
  matchId: U64Like; // anchor.BN | BN | number | string | bigint
}): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("match_v3"),
      args.player1.toBuffer(),
      args.mint.toBuffer(),
      u64LeBytes(args.matchId),
    ],
    args.programId
  );
  return pda;
}

/**
 * Escrow authority PDA (no data account, just signer authority)
 * seeds = ["escrow_auth_v1", match_state]
 */
export function deriveEscrowAuthorityPda(args: {
  programId: PublicKey;
  matchState: PublicKey;
}): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow_auth_v1"), args.matchState.toBuffer()],
    args.programId
  );
  return pda;
}

/**
 * Subscription account PDA
 * seeds = ["sub", payer]
 * (Keep in sync with your on-chain program)
 */
export function deriveSubPda(args: {
  programId: PublicKey;
  payer: PublicKey;
}): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("sub"), args.payer.toBuffer()],
    args.programId
  );
  return pda;
}


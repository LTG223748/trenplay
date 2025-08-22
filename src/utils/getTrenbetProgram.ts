// src/utils/getTrenbetProgram.ts
import { Connection, PublicKey } from '@solana/web3.js';
import {
  AnchorProvider,
  Program,
  type Idl,
} from '@coral-xyz/anchor';
import type { AnchorWallet } from '@solana/wallet-adapter-react';

import idlJson from '../idl/trenbet_escrow_v2.json';
import { RPC_URL, ESCROW_PROGRAM_ID } from '../../lib/network';

/**
 * Returns an Anchor Program client for the TrenBet escrow program.
 *
 * @param connection - Solana connection (default: new Connection(RPC_URL))
 * @param wallet - Anchor-compatible wallet (from useAnchorWallet())
 */
export function getTrenbetProgram(
  connection?: Connection,
  wallet?: AnchorWallet
) {
  if (!connection) {
    connection = new Connection(RPC_URL, 'confirmed');
  }
  if (!wallet) {
    throw new Error('Wallet is required to initialize TrenBet program');
  }

  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  });

  const idl = idlJson as Idl;
  const programId = new PublicKey(ESCROW_PROGRAM_ID);

  return new Program(idl, programId, provider);
}







import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import idl from "../idl/trenbet_subscription.json";
import { RPC_URL, SUBSCRIPTION_PROGRAM_ID } from "../../lib/network";

export function getSubscriptionProgram(wallet: any) {
  const connection = new Connection(RPC_URL, "confirmed");
  const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
  const programId = new PublicKey(SUBSCRIPTION_PROGRAM_ID); // 🔒 pin it
  return new Program(idl as Idl, programId, provider);
}


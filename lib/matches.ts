import { db } from "../lib/firebase";
import {
  doc,
  runTransaction,
  serverTimestamp,
  addDoc,
  collection,
  getDoc,
} from "firebase/firestore";
import { sendNotification } from "../lib/notifications";

import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { RPC_URL, TREN_MINT } from "../lib/network";

type Outcome = "win" | "loss" | "draw" | "backed_out";

/**
 * Archive a match if both players have reported results.
 */
export async function maybeArchiveMatch(matchId: string) {
  const mref = doc(db, "matches", matchId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(mref);
    if (!snap.exists()) return;
    const m = snap.data() as any;

    const c: Outcome | undefined = m?.reports?.creator?.outcome;
    const j: Outcome | undefined = m?.reports?.joiner?.outcome;

    if (!c || !j) return;

    if (c === "backed_out" && j === "backed_out") {
      tx.update(mref, {
        status: "cancelled",
        active: false,
        archivedAt: serverTimestamp(),
      });
      return;
    }

    const consistentWinLoss =
      (c === "win" && j === "loss") || (c === "loss" && j === "win");
    const bothDraw = c === "draw" && j === "draw";

    if (consistentWinLoss || bothDraw) {
      tx.update(mref, {
        status: "completed",
        active: false,
        archivedAt: serverTimestamp(),
      });
      return;
    }

    const oneBackedOtherWin =
      (c === "backed_out" && j === "win") || (j === "backed_out" && c === "win");
    if (oneBackedOtherWin) {
      tx.update(mref, {
        status: "completed",
        active: false,
        archivedAt: serverTimestamp(),
      });
      return;
    }

    tx.update(mref, {
      status: "disputed",
      active: false,
      disputedAt: serverTimestamp(),
    });
  });
}

/**
 * Fetch user profile from users/{uid}.
 */
async function getUserProfile(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as any) : null;
}

/**
 * Create a new match when inviting a friend.
 * Now includes creatorDisputes AND a balance check.
 * Throws { code: "INSUFFICIENT_FUNDS", neededTC } if creator is short.
 */
export async function createFriendMatch({
  creatorId,
  joinerId,
  game,
  platform,
  entryFee,
  requireSameDivision = false,
  publicKey,
}: {
  creatorId: string;
  joinerId: string;
  game: string;
  platform: string;
  entryFee: number;
  requireSameDivision?: boolean;
  publicKey: PublicKey; // ✅ pass creator’s wallet pubkey
}) {
  try {
    const [creator, joiner] = await Promise.all([
      getUserProfile(creatorId),
      getUserProfile(joinerId),
    ]);
    if (!creator || !joiner) throw new Error("Missing user profiles");

    // Optional: enforce same division
    if (requireSameDivision && creator.division && joiner.division) {
      if (creator.division !== joiner.division) {
        return { success: false, error: "different_divisions" as const };
      }
    }

    // ✅ Balance check on creator’s wallet
    const connection = new Connection(RPC_URL, "confirmed");
    const mint = new PublicKey(TREN_MINT);
    const ata = await getAssociatedTokenAddress(mint, publicKey);
    const parsed = await connection.getParsedAccountInfo(ata);
    const uiAmt =
      (parsed.value as any)?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0;
    if (uiAmt < entryFee) {
      throw { code: "INSUFFICIENT_FUNDS", neededTC: entryFee - uiAmt };
    }

    const creatorDisputes = creator.disputeCount || 0;

    const matchRef = await addDoc(collection(db, "matches"), {
      creatorUserId: creatorId,
      creatorGamertag: creator.username || creator.gamertag || "Player",
      creatorWallet: creator.wallet || "",
      creatorDisputes,

      joinerUserId: joinerId,
      joinerGamertag: joiner.username || joiner.gamertag || "Player",
      joinerWallet: joiner.wallet || "",

      division: creator.division || "Rookie",
      game,
      platform,
      entryFee,

      status: "pending",
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await sendNotification({
      userId: joinerId,
      type: "match",
      message: `${
        creator.username || creator.gamertag || "A friend"
      } invited you to a ${game} match`,
      link: `/matches/${matchRef.id}`,
    });

    return { success: true, id: matchRef.id };
  } catch (err) {
    if ((err as any)?.code === "INSUFFICIENT_FUNDS") {
      throw err; // ✅ bubble up to UI
    }
    console.error("❌ createFriendMatch error:", err);
    return { success: false, error: err };
  }
}





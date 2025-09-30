// lib/quickJoin.ts
import { db, auth } from "./firebase";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  addDoc,
  doc,
  runTransaction,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import notify from "./notify";
import { TrenGameId } from "./games";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { RPC_URL, TREN_MINT } from "./network";
import { getTrenbetProgram } from "../src/utils/getTrenbetProgram";

/**
 * Quick Join flow:
 * 1. Look for an open match with same game, console, stake.
 * 2. If found → join it.
 * 3. If not → auto create a new match.
 * Throws { code: "INSUFFICIENT_FUNDS", neededTC } if balance too low.
 */
export async function quickJoin(
  gameId: TrenGameId,
  platform: string,
  stake: number,
  anchorWallet: any,
  publicKey: PublicKey | null
) {
  const user = auth.currentUser;
  if (!user) {
    notify("Login Required", "You must sign in to join a match.", "error");
    return null;
  }

  try {
    // 🔑 Balance check via Solana ATA
    if (!publicKey || !anchorWallet) {
      throw new Error("Wallet not connected.");
    }
    const connection = new Connection(RPC_URL, "confirmed");
    const mintPk = new PublicKey(TREN_MINT);
    const ata = await getAssociatedTokenAddress(mintPk, publicKey);
    const parsed = await connection.getParsedAccountInfo(ata);
    const uiAmt =
      (parsed.value as any)?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0;
    if (uiAmt < stake) {
      throw { code: "INSUFFICIENT_FUNDS", neededTC: stake - uiAmt };
    }

    // 1. Look for an open match
    const q = query(
      collection(db, "matches"),
      where("gameId", "==", gameId),
      where("platform", "==", platform),
      where("stake", "==", stake),
      where("status", "==", "open"),
      limit(1)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      // 2. Join existing match
      const matchDoc = snap.docs[0];
      const matchId = matchDoc.id;

      await runTransaction(db, async (transaction) => {
        const matchRef = doc(db, "matches", matchId);
        const matchSnap = await transaction.get(matchRef);
        if (!matchSnap.exists()) throw new Error("Match disappeared.");

        const data = matchSnap.data();
        if (data.players?.length >= 2) {
          throw new Error("Match is already full.");
        }

        transaction.update(matchRef, {
          players: [...(data.players || []), user.uid],
          status: "in-progress",
          updatedAt: serverTimestamp(),
        });
      });

      notify("Match Found", "You’ve been joined into a match!", "success");
      return matchId;
    } else {
      // 3. Auto create match if none found
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const creatorDisputes = userSnap.exists()
        ? userSnap.data().disputeCount || 0
        : 0;

      const matchRef = await addDoc(collection(db, "matches"), {
        gameId,
        platform,
        stake,
        creator: user.uid,
        players: [user.uid],
        creatorDisputes,
        status: "open",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      notify("Match Created", "No open match found — we created one for you.", "info");
      return matchRef.id;
    }
  } catch (err: any) {
    if (err?.code === "INSUFFICIENT_FUNDS") {
      throw err; // ✅ bubble up to UI so modal can show
    }
    console.error("Quick Join failed:", err);
    notify("Quick Join Error", err.message || "Something went wrong", "error");
    return null;
  }
}



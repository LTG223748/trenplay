import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export const updateBalanceAndLog = async ({ userId, amount, type, matchId = null }) => {
  try {
    // 1. Update user balance
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      balance: increment(amount),
    });

    // 2. Write to coin_ledger
    const ledgerRef = collection(db, "coin_ledger");
    await addDoc(ledgerRef, {
      userId,
      amount,
      type, // "deposit", "wager", "win", "redeem"
      matchId: matchId || null,
      timestamp: serverTimestamp(),
      status: "complete",
    });

    console.log("✅ Ledger entry and balance updated.");
  } catch (error) {
    console.error("❌ updateBalanceAndLog failed:", error.message);
    throw error;
  }
};
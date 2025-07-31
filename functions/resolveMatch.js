// resolveMatch.js

import {
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase"; // adjust path as needed
import { updateBalanceAndLog } from "./updateBalance"; // adjust path as needed

// CONFIG
const MATCH_FEE_PERCENT = 0.07; // 7%
const FEE_WALLET_USER_ID = "fee_wallet_user"; // Set to your fee wallet UID
const REFERRAL_BONUS = 1000; // Amount of TC awarded for successful referral

// Helper: Check if user is subscribed (and sub not expired)
function isUserSubscribed(user) {
  if (!user.subscriptionActive || !user.subscriptionExpires) return false;
  const expires = new Date(user.subscriptionExpires);
  return user.subscriptionActive && expires > new Date();
}

// --- REFERRAL REWARD SYSTEM ---
async function handleReferralAfterFirstMatch(userId) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();

  // Only after first match, only once, and only if referred
  if (
    userData &&
    userData.referredBy &&
    !userData.referralRewarded &&
    (userData.matchesPlayed === 1 || userData.matchesPlayed === 0)
  ) {
    // Mark as rewarded
    await updateDoc(userRef, { referralRewarded: true });

    // Find referrer by their referralCode
    const referrerQuery = query(
      collection(db, "users"),
      where("referralCode", "==", userData.referredBy)
    );
    const referrerSnap = await getDocs(referrerQuery);

    // Reward referrer
    if (!referrerSnap.empty) {
      const referrerUser = referrerSnap.docs[0];
      await updateDoc(referrerUser.ref, {
        trenCoins: increment(REFERRAL_BONUS),
      });

      // Noti for referrer
      await addDoc(collection(db, "notifications"), {
        userId: referrerUser.id,
        message: `You earned ${REFERRAL_BONUS} TC for referring a player who just played their first match! 🎉`,
        type: "success",
        timestamp: serverTimestamp(),
      });
    }

    // Reward referred user
    await updateDoc(userRef, {
      trenCoins: increment(REFERRAL_BONUS),
    });

    // Noti for referred user
    await addDoc(collection(db, "notifications"), {
      userId,
      message: `You and your referrer each earned ${REFERRAL_BONUS} TC for your first match! 🔥`,
      type: "success",
      timestamp: serverTimestamp(),
    });

    console.log(`✅ Referral bonus paid to user ${userId} and their referrer!`);
  }
}

// --- MAIN MATCH RESOLUTION ---
/**
 * Resolves a match, calculates payout/fee, updates balances and handles referral bonus.
 * @param {string} matchId - Firestore match doc ID
 * @param {string} winnerUserId - UID of winner
 * @param {string} loserUserId - UID of loser
 */
export const resolveMatch = async ({ matchId, winnerUserId, loserUserId }) => {
  try {
    // 1. Fetch match and user docs
    const matchRef = doc(db, "matches", matchId);
    const matchSnap = await getDoc(matchRef);
    if (!matchSnap.exists()) throw new Error("Match not found");
    const match = matchSnap.data();

    const winnerRef = doc(db, "users", winnerUserId);
    const loserRef = doc(db, "users", loserUserId);

    const [winnerSnap, loserSnap] = await Promise.all([
      getDoc(winnerRef),
      getDoc(loserRef),
    ]);
    if (!winnerSnap.exists()) throw new Error("Winner user not found");
    if (!loserSnap.exists()) throw new Error("Loser user not found");

    const winner = winnerSnap.data();
    const loser = loserSnap.data();

    // 2. Calculate payout and fee
    const entryFee = Number(match.entryFee);
    const totalPot = entryFee * 2;
    const isSubscribed = isUserSubscribed(winner);
    const feePercent = isSubscribed ? 0 : MATCH_FEE_PERCENT;
    const fee = Math.floor(totalPot * feePercent);
    const payout = totalPot - fee;

    // 3. Pay winner
    await updateBalanceAndLog({
      userId: winnerUserId,
      amount: payout,
      type: "win",
      matchId,
    });

    // 4. Pay fee wallet (if any fee)
    if (fee > 0) {
      await updateBalanceAndLog({
        userId: FEE_WALLET_USER_ID,
        amount: fee,
        type: "fee",
        matchId,
      });
    }

    // 5. Increment matches played for both users
    await Promise.all([
      updateDoc(winnerRef, { matchesPlayed: increment(1) }),
      updateDoc(loserRef, { matchesPlayed: increment(1) }),
    ]);

    // 6. Handle referral bonuses (winner & loser, triggers only if first match and never again)
    await Promise.all([
      handleReferralAfterFirstMatch(winnerUserId),
      handleReferralAfterFirstMatch(loserUserId),
    ]);

    // 7. Notis for match outcome
    await addDoc(collection(db, "notifications"), {
      userId: winnerUserId,
      message: `You won your match against ${loser.username || "your opponent"}! 🏆 ${payout} TC paid out.`,
      type: "success",
      timestamp: serverTimestamp(),
    });

    await addDoc(collection(db, "notifications"), {
      userId: loserUserId,
      message: `Your match against ${winner.username || "your opponent"} has completed. Try again to earn more TrenCoin!`,
      type: "info",
      timestamp: serverTimestamp(),
    });

    // 8. Mark match as completed
    await updateDoc(matchRef, {
      status: "completed",
      feeTaken: fee,
      payoutGiven: payout,
      winnerUserId,
      resolvedAt: new Date().toISOString(),
    });

    console.log(
      `✅ Match ${matchId} resolved: winner ${winnerUserId}, loser ${loserUserId}, fee ${fee}, payout ${payout}`
    );
    return { success: true, fee, payout };
  } catch (err) {
    console.error("❌ resolveMatch failed:", err.message);
    return { success: false, error: err.message };
  }
};




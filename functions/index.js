'use strict';

/**
 * Cloud Functions (Gen 1) – Resolve match outcome automatically.
 * - If only one side voted → status: 'awaiting-results'
 * - Both backed out        → status: 'cancelled', active:false
 * - Both agree on winner   → payout + status: 'completed', active:false
 * - Tie or any disagreement→ status: 'disputed', active:false
 *
 * Accepts votes in any ONE of these shapes:
 *   A) winnerSubmitted.creator|joiner  ∈ 'creator' | 'joiner' | 'tie' | 'backed_out'
 *   B) reports.creator.outcome|reports.joiner.outcome ∈ 'win' | 'loss' | 'draw' | 'backed_out'
 *   C) creatorResult|joinerResult ∈ 'won' | 'lost' | 'tie'
 */

const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

/** -------- Platform fee config (edit as needed) -------- */
const FEE_PERCENT = 0.07;                 // 7% fee for non-subscribed users
const FEE_WALLET_ID = 'fee_wallet_user';  // <-- REPLACE with your actual fee wallet userId

/** Map legacy vote shapes to the canonical values the resolver understands. */
function mapVote(value, role /* 'creator' | 'joiner' */) {
  if (!value) return undefined;
  const s = String(value).toLowerCase();

  // Already canonical
  if (['creator', 'joiner', 'tie', 'backed_out'].includes(s)) return s;

  // Legacy shapes interpreted from the reporting user's perspective
  if (s === 'win' || s === 'won') return role; // "I won"
  if (s === 'loss' || s === 'lost') return role === 'creator' ? 'joiner' : 'creator'; // "I lost"
  if (s === 'draw' || s === 'tie') return 'tie';

  return undefined;
}

/**
 * Payout winner with optional platform fee.
 * - Credits winner's `trenCoins`
 * - Credits fee wallet (when fee > 0)
 * - Writes ledger docs in `coin_ledger`
 */
async function payoutUserWithFee(userId, pot, matchId) {
  if (!userId || !Number.isFinite(pot) || pot <= 0) return;

  const userRef = db.doc(`users/${userId}`);
  const feeWalletRef = db.doc(`users/${FEE_WALLET_ID}`);

  await db.runTransaction(async (t) => {
    const userSnap = await t.get(userRef);
    if (!userSnap.exists) throw new Error('User not found for payout');

    const user = userSnap.data() || {};

    // Determine subscription (active & not expired)
    let isSubscribed = false;
    if (user.subscriptionActive && user.subscriptionExpires) {
      const exp =
        typeof user.subscriptionExpires?.toDate === 'function'
          ? user.subscriptionExpires.toDate()
          : new Date(user.subscriptionExpires);
      isSubscribed = exp > new Date();
    }

    const fee = isSubscribed ? 0 : Math.floor(pot * FEE_PERCENT);
    const payout = pot - fee;

    // Credit winner
    const currBal = Number(user.trenCoins || 0);
    t.update(userRef, { trenCoins: currBal + payout });

    // Winner ledger
    const winLedgerRef = db.collection('coin_ledger').doc();
    t.set(winLedgerRef, {
      userId,
      matchId,
      type: 'payout',
      amount: payout,
      fee,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'complete',
    });

    // Platform fee
    if (fee > 0) {
      const feeSnap = await t.get(feeWalletRef);
      if (!feeSnap.exists) throw new Error('Fee wallet user not found');
      const feeBal = Number((feeSnap.data() || {}).trenCoins || 0);
      t.update(feeWalletRef, { trenCoins: feeBal + fee });

      const feeLedgerRef = db.collection('coin_ledger').doc();
      t.set(feeLedgerRef, {
        userId: FEE_WALLET_ID,
        matchId,
        type: 'platform_fee',
        amount: fee,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'complete',
      });
    }
  });
}

/** -------- Main resolver (Gen 1) -------- */
exports.resolveMatch = functions
  .region('us-central1')
  .firestore
  .document('matches/{matchId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data() || {};
    const after  = change.after.data();
    if (!after) return;

    // Idempotency: bail if already terminal/archived
    const status = String(after.status || '').toLowerCase();
    if (
      after.active === false ||
      ['completed', 'cancelled', 'expired', 'disputed', 'void'].includes(status)
    ) {
      return;
    }

    // ---- read votes (primary: winnerSubmitted; with fallbacks) ----
    const ws = after.winnerSubmitted || {};
    let c = ws.creator; // creator's vote
    let j = ws.joiner;  // joiner's vote

    // Accept legacy shapes too: reports.*.outcome or creatorResult/joinerResult
    if (!c) c = mapVote(after?.reports?.creator?.outcome || after.creatorResult, 'creator');
    if (!j) j = mapVote(after?.reports?.joiner?.outcome  || after.joinerResult,  'joiner');

    // If one side hasn't voted yet → mark awaiting and bail
    if (!c || !j || c === 'null' || j === 'null') {
      if (status !== 'awaiting-results') {
        await change.after.ref.update({ status: 'awaiting-results' });
      }
      return;
    }

    // ---- decide outcome ----
    const creatorId = after.creatorUserId || null;
    const joinerId  = after.joinerUserId  || null;
    const wager     = Number(after.entryFee) || 0;

    const bothBacked   = c === 'backed_out' && j === 'backed_out';
    const bothTie      = c === 'tie'        && j === 'tie';
    const agreeCreator = c === 'creator'    && j === 'creator';
    const agreeJoiner  = c === 'joiner'     && j === 'joiner';

    // Always archive terminal states so cards disappear in the grid
    const archiveBase = {
      active: false,
      archivedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Both backed out → cancelled
    if (bothBacked) {
      await change.after.ref.update({
        ...archiveBase,
        status: 'cancelled',
      });
      return;
    }

    // Both agree on a winner → payout + complete (guard double-run)
    if (agreeCreator || agreeJoiner) {
      if (String(before.status || '').toLowerCase() === 'completed' && before.winnerUserId) {
        return; // already paid/completed
      }

      const winnerRole = agreeCreator ? 'creator' : 'joiner';
      const winnerId   = winnerRole === 'creator' ? creatorId : joinerId;

      if (winnerId && wager > 0) {
        await payoutUserWithFee(winnerId, wager * 2, context.params.matchId);
      }

      await change.after.ref.update({
        ...archiveBase,
        status: 'completed',
        winner: winnerRole,
        winnerUserId: winnerId || null,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return;
    }

    // Tie or any disagreement → disputed (still archived so it vanishes)
    const updates = { ...archiveBase, status: 'disputed' };
    if (bothTie) updates.result = 'draw';
    await change.after.ref.update(updates);
  });

/** -------- (Optional) re-export other functions defined in separate files --------
 * If you have ./purchaseSubscription.js exporting a function,
 * this will expose it alongside resolveMatch without changing that file.
 */
try {
  const ps = require('./purchaseSubscription');
  exports.purchaseSubscription = ps.purchaseSubscription || ps;
} catch (e) {
  // no-op if file not present
}

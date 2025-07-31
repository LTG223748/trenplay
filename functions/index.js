const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

const FEE_PERCENT = 0.07; // 7% fee for non-subscribed
const FEE_WALLET_ID = 'fee_wallet_user'; // Set this to your actual fee wallet userId

exports.resolveMatch = onDocumentUpdated('matches/{matchId}', async (event) => {
  const match = event.data.after.data();
  const matchId = event.params.matchId;

  if (!match || !match.winnerSubmitted) return;

  const creatorResult = match.winnerSubmitted.creator;
  const joinerResult = match.winnerSubmitted.joiner;

  if (!creatorResult || !joinerResult) return;

  const creatorId = match.creatorUserId;
  const joinerId = match.joinerUserId;
  const wager = Number(match.entryFee);

  let winnerId = null;

  if (creatorResult === 'win' && joinerResult === 'loss') winnerId = creatorId;
  if (creatorResult === 'loss' && joinerResult === 'win') winnerId = joinerId;

  if (winnerId) {
    await payoutUserWithFee(winnerId, wager * 2, matchId);

    await db.doc(`matches/${matchId}`).update({
      status: 'completed',
      winnerUserId: winnerId,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return;
  }

  // Handle disputes or both lose
  if (creatorResult === 'win' && joinerResult === 'win') {
    return db.doc(`matches/${matchId}`).update({ status: 'disputed' });
  }

  return db.doc(`matches/${matchId}`).update({ status: 'void' });
});

// NEW payout logic with subscription and fee
async function payoutUserWithFee(userId, pot, matchId) {
  const userRef = db.doc(`users/${userId}`);
  const userDoc = await userRef.get();
  const user = userDoc.data();

  // Determine subscription (active and not expired)
  let isSubscribed = false;
  if (user.subscriptionActive && user.subscriptionExpires) {
    isSubscribed = new Date(user.subscriptionExpires.toDate ? user.subscriptionExpires.toDate() : user.subscriptionExpires) > new Date();
  }

  const fee = isSubscribed ? 0 : Math.floor(pot * FEE_PERCENT);
  const payout = pot - fee;

  // Credit winner and fee wallet in a transaction
  await db.runTransaction(async (t) => {
    // Winner payout
    const currBal = (await t.get(userRef)).data()?.trenCoins || 0;
    t.update(userRef, {
      trenCoins: currBal + payout,
    });

    // Winner ledger
    const ledgerRef = db.collection('coin_ledger').doc();
    t.set(ledgerRef, {
      userId,
      matchId,
      type: 'payout',
      amount: payout,
      fee,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'complete',
    });

    // Fee wallet (if fee > 0)
    if (fee > 0) {
      const feeWalletRef = db.doc(`users/${FEE_WALLET_ID}`);
      const feeWalletBal = (await t.get(feeWalletRef)).data()?.trenCoins || 0;
      t.update(feeWalletRef, {
        trenCoins: feeWalletBal + fee,
      });
      // Fee ledger
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


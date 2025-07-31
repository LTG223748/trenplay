const admin = require('firebase-admin');
const db = admin.firestore();

const SUBSCRIPTION_COST = 15000; // 15,000 TC = $15, adjust if needed

// Main function for HTTP/Callable use:
exports.purchaseSubscription = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "No userId provided." });

    const userRef = db.doc(`users/${userId}`);
    const userDoc = await userRef.get();
    const user = userDoc.data();

    if (!user) return res.status(404).json({ error: "User not found." });
    if ((user.trenCoins || 0) < SUBSCRIPTION_COST) {
      return res.status(400).json({ error: "Not enough TrenCoin." });
    }

    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days out

    await db.runTransaction(async (t) => {
      const docSnap = await t.get(userRef);
      const balance = docSnap.data()?.trenCoins || 0;
      if (balance < SUBSCRIPTION_COST) throw new Error("Insufficient TrenCoin.");

      t.update(userRef, {
        trenCoins: balance - SUBSCRIPTION_COST,
        subscriptionActive: true,
        subscriptionExpires: expires.toISOString(),
      });

      // Ledger entry
      const ledgerRef = db.collection('coin_ledger').doc();
      t.set(ledgerRef, {
        userId,
        type: 'subscription_purchase',
        amount: SUBSCRIPTION_COST,
        expiresAt: expires.toISOString(),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'complete',
      });
    });

    res.json({ success: true, expires: expires.toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

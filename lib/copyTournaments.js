const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function copyTournaments() {
  const source = 'tournaments';
  const target = 'tournament_templates';
  const snapshot = await db.collection(source).get();

  for (const doc of snapshot.docs) {
    await db.collection(target).doc(doc.id).set(doc.data());
    console.log(`Copied: ${doc.id}`);
  }
  console.log("All docs copied!");
}

copyTournaments().catch(console.error);

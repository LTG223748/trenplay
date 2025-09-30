import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

  // 🔑 Ensure private_key has proper newlines
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });

  console.log("✅ Firebase initialized");
}

export const db = admin.firestore();
export const authAdmin = admin.auth();





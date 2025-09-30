import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Save a persistent notification in Firestore for a specific user.
 */
export async function sendNotification({
  userId,
  type,
  message,
  link,
}: {
  userId: string;
  type: "match" | "friend" | "system";
  message: string;
  link?: string;
}) {
  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      type,
      message,
      link: link || null,
      createdAt: serverTimestamp(),
      read: false,
    });
    return { success: true };
  } catch (err) {
    console.error("❌ sendNotification error:", err);
    return { success: false, error: err };
  }
}

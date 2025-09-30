import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export type FriendStatus = "none" | "outgoing" | "incoming" | "accepted";

export type FriendEdge = {
  id: string;
  requesterId: string;
  receiverId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt?: any;
};

// ---------- internals ----------
async function findFriendEdge(
  userA: string,
  userB: string
): Promise<FriendEdge | null> {
  const q1 = query(
    collection(db, "friends"),
    where("requesterId", "==", userA),
    where("receiverId", "==", userB)
  );
  const q2 = query(
    collection(db, "friends"),
    where("requesterId", "==", userB),
    where("receiverId", "==", userA)
  );
  const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  const doc1 = s1.docs[0];
  const doc2 = s2.docs[0];
  if (doc1) return { id: doc1.id, ...(doc1.data() as any) };
  if (doc2) return { id: doc2.id, ...(doc2.data() as any) };
  return null;
}

// ---------- public API ----------
export async function sendFriendRequest(requesterId: string, receiverId: string) {
  if (requesterId === receiverId)
    return { success: false, error: "cannot_add_self" };
  const existing = await findFriendEdge(requesterId, receiverId);
  if (existing) {
    if (existing.status === "accepted")
      return { success: false, error: "already_friends" };
    if (existing.status === "pending")
      return { success: false, error: "already_pending" };
  }
  try {
    await addDoc(collection(db, "friends"), {
      requesterId,
      receiverId,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err) {
    console.error("sendFriendRequest error:", err);
    return { success: false, error: "unknown" };
  }
}

export async function acceptFriendRequest(requestId: string) {
  try {
    await updateDoc(doc(db, "friends", requestId), { status: "accepted" });
    return { success: true };
  } catch (err) {
    console.error("acceptFriendRequest error:", err);
    return { success: false };
  }
}

export async function rejectFriendRequest(requestId: string) {
  try {
    await deleteDoc(doc(db, "friends", requestId));
    return { success: true };
  } catch (err) {
    console.error("rejectFriendRequest error:", err);
    return { success: false };
  }
}

export async function cancelOutgoingRequest(
  requesterId: string,
  receiverId: string
) {
  const existing = await findFriendEdge(requesterId, receiverId);
  if (
    existing &&
    existing.status === "pending" &&
    existing.requesterId === requesterId
  ) {
    await deleteDoc(doc(db, "friends", existing.id));
    return { success: true };
  }
  return { success: false };
}

// All accepted friendships where userId is involved
export function subscribeToFriends(
  userId: string,
  cb: (edges: FriendEdge[]) => void
) {
  const q = query(collection(db, "friends"), where("status", "==", "accepted"));
  return onSnapshot(q, (snap) => {
    const list: FriendEdge[] = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as any) }))
      .filter(
        (e: any) => e.requesterId === userId || e.receiverId === userId
      );
    cb(list);
  });
}

// Incoming requests to me (pending)
export function subscribeToIncoming(
  userId: string,
  cb: (edges: FriendEdge[]) => void
) {
  const q = query(
    collection(db, "friends"),
    where("receiverId", "==", userId),
    where("status", "==", "pending")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  });
}

// Outgoing requests from me (pending)
export function subscribeToOutgoing(
  userId: string,
  cb: (edges: FriendEdge[]) => void
) {
  const q = query(
    collection(db, "friends"),
    where("requesterId", "==", userId),
    where("status", "==", "pending")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  });
}

// Real-time status vs one other user
export function subscribeFriendStatus(
  me: string,
  other: string,
  cb: (status: FriendStatus, edge?: FriendEdge) => void
) {
  const unsub1 = onSnapshot(
    query(
      collection(db, "friends"),
      where("requesterId", "==", me),
      where("receiverId", "==", other)
    ),
    (s1) => {
      const a = s1.docs[0]
        ? ({ id: s1.docs[0].id, ...(s1.docs[0].data() as any) } as FriendEdge)
        : null;
      const unsub2 = onSnapshot(
        query(
          collection(db, "friends"),
          where("requesterId", "==", other),
          where("receiverId", "==", me)
        ),
        (s2) => {
          const b = s2.docs[0]
            ? ({ id: s2.docs[0].id, ...(s2.docs[0].data() as any) } as FriendEdge)
            : null;
          const edge = a || b || undefined;
          let status: FriendStatus = "none";
          if (edge) {
            if (edge.status === "accepted") status = "accepted";
            else if (edge.status === "pending") {
              status = edge.requesterId === me ? "outgoing" : "incoming";
            }
          }
          cb(status, edge);
        }
      );
      return () => unsub2();
    }
  );
  return () => unsub1();
}

// Batch fetch user profiles for display
export async function fetchUsersMap(
  userIds: string[]
): Promise<Record<string, any>> {
  const unique = Array.from(new Set(userIds)).filter(Boolean);
  const entries = await Promise.all(
    unique.map(async (uid) => {
      const snap = await getDoc(doc(db, "users", uid));
      return [uid, snap.exists() ? snap.data() : null] as const;
    })
  );
  return Object.fromEntries(entries);
}

// ✅ NEW: Search users by username
export async function searchUserByUsername(username: string): Promise<any[]> {
  if (!username.trim()) return [];

  const lowered = username.toLowerCase();
  const q = query(
    collection(db, "users"),
    where("username_lower", ">=", lowered),
    where("username_lower", "<=", lowered + "\uf8ff")
  );

  const snap = await getDocs(q);
  const results: any[] = [];
  snap.forEach((docSnap) => {
    results.push({ id: docSnap.id, ...(docSnap.data() as any) });
  });
  return results;
}



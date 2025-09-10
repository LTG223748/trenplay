// /lib/matchActions.ts
import { db } from './firebase';
import { doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

const MIN = 60_000;
const tsPlus = (ms: number) => Timestamp.fromDate(new Date(Date.now() + ms));

// When a second player joins, give a 5-minute pending window
export async function joinMatchFirestore(matchDocId: string, joinerUserId: string) {
  const ref = doc(db, 'matches', matchDocId);
  await updateDoc(ref, {
    status: 'pending',
    joinerUserId,
    joinerJoinedAt: serverTimestamp(),
    expireAt: tsPlus(5 * MIN),
  });
}

// When both confirm “start”, disable expiry
export async function startMatchFirestore(matchDocId: string) {
  const ref = doc(db, 'matches', matchDocId);
  await updateDoc(ref, { status: 'active', expireAt: null });
}

// If a joiner backs out before start, hide in ~5 minutes
export async function backOutMatchFirestore(matchDocId: string) {
  const ref = doc(db, 'matches', matchDocId);
  await updateDoc(ref, {
    status: 'backed_out',
    joinerUserId: null,
    // (optional) reset any joiner-confirm flags you use:
    confirmedInGameByJoiner: false,
    expireAt: tsPlus(5 * MIN),
  });
}

// Keep pending room alive while the screen is open
export async function bumpPendingTTL(matchDocId: string) {
  const ref = doc(db, 'matches', matchDocId);
  await updateDoc(ref, { expireAt: tsPlus(5 * MIN) });
}

// Helpers if you need them elsewhere
export const toMillis = (t: any): number | null => {
  if (t == null) return null;
  if (typeof t === 'number') return t;
  if (typeof t === 'string') {
    const v = Date.parse(t);
    return Number.isNaN(v) ? null : v;
  }
  if (typeof t?.toMillis === 'function') return t.toMillis();
  return null;
};
export const isAlive = (m: any) => {
  const ms = toMillis(m?.expireAt);
  return ms == null || ms > Date.now();
};

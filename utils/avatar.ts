// utils/avatar.ts
// Deterministic starter avatars + helper to persist a default once per user.

import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export const STARTER_AVATARS = [
  "/avatars/Starter-1.png",
  "/avatars/Starter-2.png",
  "/avatars/Starter-3.png",
  "/avatars/Starter-4.png",
  "/avatars/Starter-5.png",
  "/avatars/Starter-6.png",
  "/avatars/Starter-7.png",
  "/avatars/Starter-8.png",
  "/avatars/Starter-9.png",
  "/avatars/Starter-10.png",
] as const;

export type StarterAvatarPath = (typeof STARTER_AVATARS)[number];

/** Fast, deterministic hash (FNV-1a-ish) -> uint32 */
export function hash32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    // h *= 16777619 (without bigint)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}

/** Pick a deterministic starter avatar from a seed (uid/email). */
export function pickStarterAvatar(seed?: string | null): StarterAvatarPath {
  if (!seed) return STARTER_AVATARS[0]; // stable fallback, no randomness
  const idx = hash32(seed) % STARTER_AVATARS.length;
  return STARTER_AVATARS[idx];
}

/** Treat any non-empty string as a valid saved avatar (starter path or URL). */
export function normalizeAvatar(v: unknown): string | null {
  if (typeof v !== "string" || v.trim() === "") return null;
  return v;
}

/**
 * Ensure the user has a saved avatar in Firestore.
 * - If `users/{uid}.avatar` exists, return it.
 * - Otherwise, compute a deterministic starter avatar from UID, save it once, and return it.
 */
export async function persistAvatarIfMissing(uid: string): Promise<string> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const data = snap.data() || {};
  const existing = normalizeAvatar(data?.avatar);

  if (existing) return existing;

  const chosen = pickStarterAvatar(uid);
  try {
    await updateDoc(ref, { avatar: chosen });
  } catch {
    // In case the doc doesn't exist yet
    await setDoc(ref, { avatar: chosen }, { merge: true });
  }
  return chosen;
}

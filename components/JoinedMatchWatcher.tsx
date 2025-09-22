'use client';

import { useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import notify from '@/lib/notify'; // or use alert

// Singleton flag to avoid React 18 dev double-mount spam
const WATCHER_FLAG = '__JP_JOINED_WATCHER_ACTIVE__';
// Persist one-time notifications so reloads don’t re-alert
const NOTIFIED_KEY = '__jp_notified_join_events__';

export default function JoinedMatchWatcher() {
  const prevJoiner = useRef<Map<string, string | null>>(new Map());
  const notified = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTIFIED_KEY);
      if (raw) notified.current = new Set(JSON.parse(raw));
    } catch {}

    if (typeof window !== 'undefined' && (window as any)[WATCHER_FLAG]) return;
    if (typeof window !== 'undefined') (window as any)[WATCHER_FLAG] = true;

    let unsubAuth: undefined | (() => void);
    let unsubSnap: undefined | (() => void);

    unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      // Only matches that should actually trigger a join notification
      const q = query(
        collection(db, 'matches'),
        where('creatorUserId', '==', user.uid),
        where('active', '==', true),
        where('status', '==', 'joined')
      );

      let seeded = false;

      unsubSnap = onSnapshot(q, (snap) => {
        // If there are no docs, nothing to do.
        if (snap.empty && !seeded) { seeded = true; return; }

        // Seed cache on first snapshot so we don't alert for historical docs
        if (!seeded) {
          snap.docs.forEach((d) => {
            const j = (d.data() as any).joinerUserId ?? null;
            prevJoiner.current.set(d.id, j);
          });
          seeded = true;
          return;
        }

        snap.docChanges().forEach((chg) => {
          const data = chg.doc.data() as any;
          const id = chg.doc.id;

          // If results already started, skip (not a "waiting to start" join)
          if (data?.winnerSubmitted?.creator || data?.winnerSubmitted?.joiner) return;

          const prev = prevJoiner.current.get(id) ?? null;
          const curr = data.joinerUserId ?? null;
          prevJoiner.current.set(id, curr);

          // Only fire on transition: null/undefined -> set
          if (prev == null && curr != null) {
            if (notified.current.has(id)) return;
            notified.current.add(id);
            try {
              localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...notified.current].slice(-100)));
            } catch {}

            const label = data.game ?? data.gameId ?? 'your match';
            try { notify(`A player joined your match: ${label}`, 'success'); }
            catch { alert(`A player joined your match: ${label}`); }
          }
        });
      });
    });

    return () => {
      try { unsubSnap && unsubSnap(); } catch {}
      try { unsubAuth && unsubAuth(); } catch {}
    };
  }, []);

  return null;
}

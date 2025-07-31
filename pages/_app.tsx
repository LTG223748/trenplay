// /pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect, useRef } from 'react';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import AdminBanner from '../components/admin/AdminBanner';
import { NotificationProvider } from '../context/NotificationContext';
import notify from '../lib/notify';

// Global notification when someone joins your match
function GlobalJoinListener() {
  const [user] = useAuthState(auth);
  const lastAlertedMatchRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'matches'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const match = change.doc.data();
        const matchId = change.doc.id;

        if (
          match.creatorUserId === user.uid &&
          match.joinerUserId &&
          lastAlertedMatchRef.current !== matchId
        ) {
          notify(
            `A player joined your match: ${match.game || 'Game'}`,
            'success'
          );
          lastAlertedMatchRef.current = matchId;
        }
      });
    });
    return () => unsub();
  }, [user]);
  return null;
}

// Listen for new notifications in /notifications/{userId}
function FirestoreNotificationListener() {
  const [user] = useAuthState(auth);
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notif = change.doc.data();
          notify(notif.message || "You have a new notification!", notif.type || "info");
          // Optionally, mark as read or delete after show:
          // deleteDoc(change.doc.ref);
        }
      });
    });
    return () => unsub();
  }, [user]);
  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NotificationProvider>
      <AdminBanner />
      <GlobalJoinListener />
      <FirestoreNotificationListener />
      <Component {...pageProps} />
    </NotificationProvider>
  );
}








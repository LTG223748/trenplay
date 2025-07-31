// components/MatchJoinListener.tsx
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import Link from 'next/link';

export default function MatchJoinListener() {
  const [user] = useAuthState(auth);
  const [joinedMatchId, setJoinedMatchId] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'matches'),
      where('creatorUserId', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const joined = snapshot.docs.find(doc => !!doc.data().joinerUserId);
      if (joined) {
        setJoinedMatchId(joined.id);
        setShowPopup(true); // Show popup!
      }
    });

    return () => unsub();
  }, [user]);

  // Auto-hide popup after 60 seconds (reset timer if new joinedMatchId)
  useEffect(() => {
    if (!showPopup) return;
    const timer = setTimeout(() => setShowPopup(false), 60000); // 60 seconds
    return () => clearTimeout(timer);
  }, [joinedMatchId, showPopup]);

  if (!showPopup || !joinedMatchId) return null;

  return (
    <div className="fixed bottom-6 left-6 bg-green-700 text-yellow-200 px-6 py-4 rounded-lg shadow-lg z-50 font-bold">
      A player joined your match!{" "}
      <Link href={`/match/${joinedMatchId}/chat`} className="underline ml-2">
        Go to Chat
      </Link>
    </div>
  );
}


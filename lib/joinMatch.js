import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function joinMatch(matchId, user) {
  const matchRef = doc(db, 'matches', matchId);
  const matchSnap = await getDoc(matchRef);
  const matchData = matchSnap.data();

  // Bail if already joined or full
  if (matchData.opponent || matchData.creator.uid === user.uid) {
    throw new Error('You cannot join this match.');
  }

  // Optional: Deduct TC from opponent
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();

  if (userData.tc < matchData.wager) {
    throw new Error('Not enough TC to join match.');
  }

  await updateDoc(userRef, {
    tc: userData.tc - matchData.wager,
  });

  // Add opponent to match
  await setDoc(
    matchRef,
    {
      opponent: {
        name: user.email,
        uid: user.uid,
      },
      status: 'full',
    },
    { merge: true }
  );
}

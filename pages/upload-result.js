// pages/upload-result.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db, storage } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function UploadResultPage() {
  const router = useRouter();
  const { matchId } = router.query;
  const [user] = useAuthState(auth);
  const [match, setMatch] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [expired, setExpired] = useState(false);
  const [proofUrl, setProofUrl] = useState(null);

  useEffect(() => {
    if (!user || !matchId) return;

    const fetchMatch = async () => {
      const snap = await getDoc(doc(db, 'matches', matchId));
      if (!snap.exists()) return;

      const matchData = snap.data();
      setMatch(matchData);

      // Has this user already submitted proof?
      const proof = matchData.proofs?.[user.uid];
      if (proof) {
        setAlreadySubmitted(true);
        setProofUrl(proof);
      }

      // Check time lock (30 min after createdAt)
      const createdAt = matchData.createdAt?.toDate?.() || new Date(matchData.createdAt);
      const now = new Date();
      const diffMinutes = (now - createdAt) / 60000;
      if (diffMinutes > 30) setExpired(true);
    };

    fetchMatch();
  }, [user, matchId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user || !matchId) return;

    setUploading(true);
    const storageRef = ref(storage, `matchProofs/${matchId}/${user.uid}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    // Update Firestore with proof + timestamp
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, {
      [`proofs.${user.uid}`]: url,
      [`proofTimestamps.${user.uid}`]: serverTimestamp(),
    });

    setProofUrl(url);
    setAlreadySubmitted(true);
    setUploading(false);
  };

  if (!user || !match) return <p className="text-white">Loading...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto text-white bg-[#1a0029] rounded-lg shadow-lg mt-6">
      <h2 className="text-xl font-bold mb-4">📸 Upload Match Proof</h2>

      {expired && (
        <p className="text-red-400 font-bold mb-4">
          ⏱ Upload window expired. You had 30 minutes after match creation.
        </p>
      )}

      {alreadySubmitted && proofUrl && (
        <div className="mb-4">
          <p className="text-green-400 font-bold mb-2">✅ Proof submitted!</p>
          <img
            src={proofUrl}
            alt="Your submission"
            className="rounded border border-yellow-400 max-h-64"
          />
        </div>
      )}

      {!alreadySubmitted && !expired && (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="mb-4 text-sm"
          />
          {uploading && <p className="text-yellow-300">Uploading...</p>}
        </>
      )}
    </div>
  );
}
import { useWallet } from '@solana/wallet-adapter-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

const DEV_MODE = true;
const TEST_WALLET = { toBase58: () => "TestWalletPublicKey" };

interface Match {
  id: string;
  entryFee: number;
  creatorUserId: string;
  joinerUserId?: string | null;
  division: string;
}

interface JoinButtonProps {
  match: Match;
}

export default function JoinButton({ match }: JoinButtonProps) {
  const [loading, setLoading] = useState(false);
  const [user] = useAuthState(auth);

  const { publicKey: realKey, connected: realConnected } = useWallet();
  const publicKey = DEV_MODE ? TEST_WALLET : realKey;
  const connected = DEV_MODE ? true : realConnected;

  const isCreator = user?.uid === match.creatorUserId;
  const isFull = !!match.joinerUserId;

  if (!user || !connected || isCreator || isFull) {
    return null;
  }

  const handleJoin = async () => {
    if (!publicKey) {
      alert('⚠️ Please connect your wallet first.');
      return;
    }

    setLoading(true);
    try {
      const matchRef = doc(db, 'matches', match.id);
      const snap = await getDoc(matchRef);
      const matchData = snap.data();

      if (!matchData) {
        throw new Error('Match not found.');
      }
      if (matchData.status !== 'open') {
        throw new Error('Match is no longer open.');
      }
      if (matchData.joinerUserId) {
        throw new Error('Match already joined.');
      }

      await updateDoc(matchRef, {
        joinerUserId: user.uid,
        status: 'pending'
      });

      alert('✅ Successfully joined! Go to chat.');
      window.location.href = `/match/${match.id}/chat`;
    } catch (err: any) {
      console.error('Join error:', err);
      alert(`❌ ${err.message || 'Failed to join match.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleJoin}
      disabled={loading}
      className="mt-4 bg-green-500 text-white font-bold px-5 py-2 rounded-xl shadow-lg hover:bg-green-400 transition disabled:opacity-50"
    >
      {loading ? 'Joining...' : 'Join Match'}
    </button>
  );
}
















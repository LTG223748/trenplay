import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface Props {
  matchId: string;
  match: any;
  disabled?: boolean;
}

export default function ConfirmInGameButton({ matchId, match, disabled }: Props) {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const isCreator = user.uid === match.creatorUserId;
  const isJoiner = user.uid === match.joinerUserId;

  if (
    (isCreator && match.confirmedInGameByCreator) ||
    (isJoiner && match.confirmedInGameByJoiner)
  ) {
    return (
      <div className="flex justify-center w-full my-4">
        <span className="text-green-400 font-bold text-lg">Confirmed ✅</span>
      </div>
    );
  }
  if (!isCreator && !isJoiner) return null;

  async function handleConfirm() {
    setLoading(true);
    const matchRef = doc(db, 'matches', matchId);
    try {
      if (isCreator) {
        await updateDoc(matchRef, {
          confirmedInGameByCreator: true,
        });
      }
      if (isJoiner) {
        await updateDoc(matchRef, {
          confirmedInGameByJoiner: true,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center w-full my-6">
      <button
        onClick={handleConfirm}
        disabled={loading || disabled}
        className={
          // BIG, important, futuristic look
          "flex items-center justify-center px-10 py-4 rounded-2xl font-black text-xl shadow-lg border-4 transition-all duration-150 " +
          "border-yellow-400 bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-300 text-[#201a37] " +
          "tracking-widest ring-2 ring-yellow-400/60 " +
          (loading || disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:scale-105 hover:from-orange-400 hover:to-yellow-200 hover:shadow-2xl")
        }
        style={{ letterSpacing: "0.07em" }}
      >
        {loading ? "Confirming..." : "CONFIRM"}
      </button>
    </div>
  );
}

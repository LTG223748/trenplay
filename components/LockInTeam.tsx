import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

interface Props {
  matchId: string;
  match: any;
  onLocked: () => void;
}

export default function LockInTeam({ matchId, match, onLocked }: Props) {
  const [user] = useAuthState(auth);
  const [team, setTeam] = useState("");
  const [gamertag, setGamertag] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  // Determine if already locked
  const isCreator = user.uid === match.creatorUserId;
  const alreadyLocked = isCreator
    ? !!match.creatorTeam && !!match.creatorGamertag
    : !!match.joinerTeam && !!match.joinerGamertag;

  const handleLock = async () => {
    if (!team || !gamertag) return alert("Enter your team and gamertag!");
    setLoading(true);
    const matchRef = doc(db, "matches", matchId);
    const update = isCreator
      ? { creatorTeam: team, creatorGamertag: gamertag }
      : { joinerTeam: team, joinerGamertag: gamertag };
    await updateDoc(matchRef, update);
    setLoading(false);
    onLocked();
  };

  if (alreadyLocked) {
    return (
      <div className="my-6 p-4 bg-green-900 text-green-300 rounded">
        ✅ Team and Gamertag locked in!
      </div>
    );
  }

  return (
    <div className="my-6 bg-[#251a3c] p-6 rounded-xl text-white shadow-xl flex flex-col gap-3">
      <h2 className="text-xl font-bold mb-2">Lock In Your Team</h2>
      <input
        type="text"
        placeholder="Enter your team (e.g. Real Madrid, Lakers)"
        value={team}
        onChange={e => setTeam(e.target.value)}
        className="p-2 rounded bg-[#18182f] mb-2 text-white"
      />
      <input
        type="text"
        placeholder="Enter your gamertag"
        value={gamertag}
        onChange={e => setGamertag(e.target.value)}
        className="p-2 rounded bg-[#18182f] mb-2 text-white"
      />
      <button
        className="bg-yellow-400 text-black font-bold px-4 py-2 rounded hover:bg-yellow-300 disabled:opacity-60"
        onClick={handleLock}
        disabled={loading}
      >
        {loading ? "Locking in..." : "Lock In Team"}
      </button>
    </div>
  );
}

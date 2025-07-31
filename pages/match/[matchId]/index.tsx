import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../lib/firebase";
import Link from "next/link";

export default function MatchDetailPage() {
  const router = useRouter();
  const { matchId } = router.query;
  const [user, userLoading] = useAuthState(auth); // 👈 include loading state
  const [showJoinAlert, setShowJoinAlert] = useState(false);
  const [match, setMatch] = useState<any>(null);
  const alertShown = useRef(false);

  useEffect(() => {
    if (!matchId || userLoading || !user) return; // 👈 wait until user is ready

    const unsub = onSnapshot(doc(db, "matches", matchId as string), (snap) => {
      const data = snap.data();
      setMatch(data);

      // 🧠 Debug logs
      console.log("Live match snapshot:", data);
      console.log("Current user:", user?.uid);

      // ✅ Check if the viewer is the creator and someone joined
      if (
        data &&
        data.creatorUserId === user.uid &&
        data.joinerUserId &&
        !alertShown.current
      ) {
        setShowJoinAlert(true);
        alertShown.current = true;
        console.log("✅ Triggering join alert");
      }
    });

    return () => unsub();
  }, [matchId, user, userLoading]);

  if (!match) return <div className="text-white p-6">Loading match...</div>;

  return (
    <div className="min-h-screen bg-[#18182f] text-white p-6">
      <h1 className="text-2xl font-bold mb-4">{match.game} Match</h1>
      <p>
        <strong>Status:</strong> {match.joinerUserId ? "Full" : "Open"}
      </p>
      {showJoinAlert && (
        <div className="bg-green-800 text-yellow-300 p-4 mb-4 rounded font-bold">
          A player has joined your match!{" "}
          <Link
            href={`/match/${matchId}/chat`}
            className="underline text-yellow-300 ml-2"
          >
            Go to Chat
          </Link>
        </div>
      )}
    </div>
  );
}


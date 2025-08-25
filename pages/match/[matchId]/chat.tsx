// pages/match/[matchId]/index.tsx
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import MatchChat from "../../../components/MatchChat";
import ConfirmInGameButton from "../../../components/ConfirmInGameButton";
// import LockInTeam from "../../../components/LockInTeam"; // ❌ removed

// Sparkle overlay, MORE sparkles on left side for cosmic effect
const SparkleOverlay = ({ count = 28, leftCount = 18 }) => {
  const leftSparkles = [...Array(leftCount)].map((_, i) => (
    <span
      key={`left-${i}`}
      className="absolute bg-white rounded-full opacity-70 animate-sparkle"
      style={{
        width: "3px",
        height: "3px",
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 30}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${2 + Math.random() * 3}s`,
      }}
    />
  ));

  const regularSparkles = [...Array(count)].map((_, i) => (
    <span
      key={`main-${i}`}
      className="absolute bg-white rounded-full opacity-70 animate-sparkle"
      style={{
        width: "3px",
        height: "3px", // ✅ fixed
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${2 + Math.random() * 3}s`,
      }}
    />
  ));

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        {leftSparkles}
        {regularSparkles}
      </div>
      <style jsx global>{`
        @keyframes sparkle {
          0%,
          100% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 0;
            transform: scale(0.5);
          }
        }
        .animate-sparkle {
          animation-name: sparkle;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
      `}</style>
    </>
  );
};

export default function MatchChatPage() {
  const router = useRouter();
  const { matchId } = router.query;
  const [user, loading] = useAuthState(auth);
  const [match, setMatch] = useState<any>(null);
  const [lockedIn, setLockedIn] = useState(false);

  // Fetch match in realtime
  useEffect(() => {
    if (!matchId || typeof matchId !== "string") return;
    const matchRef = doc(db, "matches", matchId);
    const unsub = onSnapshot(matchRef, (snap) => {
      const data = snap.data();
      setMatch(data);

      // Redirect to head-to-head if both confirmed
      if (data?.confirmedInGameByCreator && data?.confirmedInGameByJoiner) {
        router.push(`/match/${matchId}/headtohead`);
      }
    });
    return () => unsub();
  }, [matchId, router]);

  // Determine if this user has locked in their team
  useEffect(() => {
    if (!match || !user) return setLockedIn(false);
    const isCreator = user.uid === match.creatorUserId;
    if (isCreator && match.creatorTeam && match.creatorGamertag) setLockedIn(true);
    else if (!isCreator && match.joinerTeam && match.joinerGamertag) setLockedIn(true);
    else setLockedIn(false);
  }, [match, user]);

  // UI error/loading states
  if (!matchId || typeof matchId !== "string")
    return <div className="text-white p-6">Loading chat...</div>;
  if (loading) return <div className="text-white p-6">Loading user...</div>;
  if (!user) return <div className="text-red-400 p-6">Please log in to chat.</div>;
  if (!match) return <div className="text-white p-6">Loading match info...</div>;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#191926] via-[#29184b] to-[#12001f] py-10 px-2 relative overflow-hidden">
      <SparkleOverlay count={28} leftCount={22} />
      <div className="w-full max-w-2xl rounded-3xl bg-[#201a37] shadow-2xl px-6 py-8 flex flex-col items-center relative z-10">
        <h1
          className="text-3xl sm:text-4xl font-extrabold mb-5 text-yellow-300 tracking-tight drop-shadow-[0_0_8px_rgba(255,230,100,0.8)]"
          style={{ fontFamily: "'Orbitron', 'Montserrat', 'Arial', sans-serif" }}
        >
          💬 Match Chat
        </h1>

        <div className="w-full flex flex-col gap-5">
          <div className="w-full text-white">
            <MatchChat matchId={matchId as string} />
          </div>

          {/* Removed <LockInTeam /> to avoid duplicate section */}

          <ConfirmInGameButton
            matchId={matchId as string}
            match={match}
            disabled={!lockedIn}
          />
        </div>
      </div>
    </div>
  );
}









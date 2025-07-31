import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

// Sparkle Overlay for cosmic effect
const SparkleOverlay = ({ count = 28, leftCount = 18 }) => {
  const leftSparkles = [...Array(leftCount)].map((_, i) => (
    <span
      key={`left-${i}`}
      className="absolute bg-white rounded-full opacity-70 animate-sparkle"
      style={{
        width: '3px',
        height: '3px',
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
        width: '3px',
        height: '3px',
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
          0%, 100% { opacity: 0.7; transform: scale(1);}
          50% { opacity: 0; transform: scale(0.5);}
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

// Confetti Animation (shows if user won)
function ConfettiWin() {
  // A simple animated SVG confetti burst for quick feedback
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <svg width="340" height="160" viewBox="0 0 340 160" fill="none">
        <g>
          <circle cx="40" cy="40" r="8" fill="#FFD600">
            <animate attributeName="cy" from="40" to="10" dur="0.9s" repeatCount="indefinite" />
          </circle>
          <circle cx="70" cy="70" r="6" fill="#FF4081">
            <animate attributeName="cy" from="70" to="100" dur="1.1s" repeatCount="indefinite" />
          </circle>
          <circle cx="120" cy="30" r="7" fill="#40C4FF">
            <animate attributeName="cy" from="30" to="70" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx="250" cy="60" r="8" fill="#FFC107">
            <animate attributeName="cy" from="60" to="10" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="200" cy="40" r="6" fill="#00E676">
            <animate attributeName="cy" from="40" to="90" dur="0.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="300" cy="90" r="7" fill="#FF1744">
            <animate attributeName="cy" from="90" to="50" dur="0.7s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
      <span className="absolute text-4xl sm:text-6xl font-black text-yellow-300 drop-shadow-xl animate-bounce" style={{ top: "55%", left: "50%", transform: "translate(-50%,-50%)" }}>
        YOU WON!
      </span>
    </div>
  );
}

// --- Custom Submit Result component with animation/redirect logic ---
function CustomSubmitResult({ matchId, match }: { matchId: string; match: any }) {
  const [user] = useAuthState(auth);
  const [selectedResult, setSelectedResult] = useState<"won" | "lost" | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  if (!user) return null;

  const isCreator = user.uid === match.creatorUserId;
  const isJoiner = user.uid === match.joinerUserId;
  const alreadySubmitted =
    (isCreator && match.creatorResult) || (isJoiner && match.joinerResult);

  const handleSubmit = async () => {
    if (!selectedResult) {
      alert("Select 'I Won' or 'I Lost'!");
      return;
    }
    if (selectedResult === "won" && !file) {
      alert("Proof file is required if you claim a win!");
      return;
    }
    setSubmitting(true);

    // Prepare update fields
    const update: any = {};
    if (isCreator) update.creatorResult = selectedResult;
    if (isJoiner) update.joinerResult = selectedResult;

    await updateDoc(doc(db, "matches", matchId), update);

    setSubmitting(false);

    if (selectedResult === "won") {
      setShowWin(true);
      setTimeout(() => {
        router.push("/");
      }, 1850); // Show confetti 1.85s before redirecting
    } else {
      router.push("/");
    }
  };

  if (alreadySubmitted) {
    return (
      <div className="my-4 text-green-400 font-bold">
        ✅ Result Submitted!
      </div>
    );
  }

  return (
    <>
      {showWin && <ConfettiWin />}
      <div className="w-full flex flex-col items-center gap-3 mt-4 z-10">
        <div className="flex gap-3 w-full justify-center">
          <button
            className={
              "px-5 py-2 rounded-xl font-bold border transition text-base shadow " +
              (selectedResult === "won"
                ? "bg-green-500 text-white border-green-700 scale-105"
                : "bg-green-700/20 text-green-200 border-green-600 hover:bg-green-700/40")
            }
            onClick={() => setSelectedResult("won")}
            disabled={submitting}
          >
            I Won
          </button>
          <button
            className={
              "px-5 py-2 rounded-xl font-bold border transition text-base shadow " +
              (selectedResult === "lost"
                ? "bg-red-500 text-white border-red-700 scale-105"
                : "bg-red-700/20 text-red-200 border-red-600 hover:bg-red-700/40")
            }
            onClick={() => setSelectedResult("lost")}
            disabled={submitting}
          >
            I Lost
          </button>
          <label
            htmlFor="proof"
            className={`flex items-center px-3 py-2 rounded-xl border shadow cursor-pointer ml-2 
              ${selectedResult === "won"
                ? file
                  ? "bg-green-50 text-green-900 border-green-400 hover:bg-green-100"
                  : "bg-yellow-50 text-yellow-900 border-yellow-300 hover:bg-yellow-100"
                : "bg-gray-100 text-gray-600 border-gray-300"}`}
          >
            <input
              ref={fileInputRef}
              id="proof"
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={e => setFile(e.target.files?.[0] || null)}
              disabled={submitting || selectedResult === "lost"}
            />
            📸 Proof {selectedResult === "won" && <span className="text-red-500">*</span>} (required if won)
          </label>
          {file && (
            <span className="text-green-500 ml-2 text-xs font-semibold truncate max-w-[120px]">{file.name}</span>
          )}
        </div>
        <button
          className={`mt-2 px-8 py-2 font-bold rounded-xl shadow transition
            ${submitting || !selectedResult || (selectedResult === "won" && !file)
              ? "bg-gray-500 text-white cursor-not-allowed"
              : "bg-purple-700 hover:bg-purple-800 text-white"
            }`}
          onClick={handleSubmit}
          disabled={submitting || !selectedResult || (selectedResult === "won" && !file)}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </>
  );
}

export default function HeadToHeadPage() {
  const router = useRouter();
  const { matchId } = router.query;
  const [user, loadingUser] = useAuthState(auth);
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- Live usernames ---
  const [creatorUsername, setCreatorUsername] = useState<string>("...");
  const [joinerUsername, setJoinerUsername] = useState<string>("...");

  // Fetch match data
  useEffect(() => {
    if (!matchId || typeof matchId !== "string") return;
    const loadMatch = async () => {
      const snap = await getDoc(doc(db, "matches", matchId));
      setMatch(snap.data());
      setLoading(false);
    };
    loadMatch();
  }, [matchId]);

  // Fetch both usernames from Firestore users collection
  useEffect(() => {
    const fetchUsernames = async () => {
      if (!match) return;

      // Creator
      if (match.creatorUserId) {
        try {
          const creatorSnap = await getDoc(doc(db, "users", match.creatorUserId));
          setCreatorUsername(
            creatorSnap.exists() && creatorSnap.data()?.username
              ? creatorSnap.data().username
              : match.creatorEmail
                ? match.creatorEmail.split("@")[0]
                : "Creator"
          );
        } catch {
          setCreatorUsername(match.creatorEmail ? match.creatorEmail.split("@")[0] : "Creator");
        }
      }

      // Joiner
      if (match.joinerUserId) {
        try {
          const joinerSnap = await getDoc(doc(db, "users", match.joinerUserId));
          setJoinerUsername(
            joinerSnap.exists() && joinerSnap.data()?.username
              ? joinerSnap.data().username
              : match.joinerEmail
                ? match.joinerEmail.split("@")[0]
                : "Joiner"
          );
        } catch {
          setJoinerUsername(match.joinerEmail ? match.joinerEmail.split("@")[0] : "Joiner");
        }
      }
    };

    fetchUsernames();
  }, [match]);

  if (loading || loadingUser)
    return <div className="flex min-h-screen items-center justify-center bg-[#191926]">
      <span className="text-yellow-300 text-xl font-bold animate-pulse">Loading...</span>
    </div>;
  if (!user)
    return <div className="flex min-h-screen items-center justify-center bg-[#191926]">
      <span className="text-red-400 text-lg font-bold">Please log in to continue.</span>
    </div>;
  if (!match)
    return <div className="flex min-h-screen items-center justify-center bg-[#191926]">
      <span className="text-white text-xl font-bold">Loading match info...</span>
    </div>;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#191926] via-[#29184b] to-[#12001f] py-10 px-2 relative overflow-hidden">
      {/* Sparkle effect across the whole page */}
      <SparkleOverlay count={28} leftCount={22} />

      {/* --- Futuristic Live Header --- */}
      <div className="w-full flex flex-col items-center mb-7 z-10">
        <h1
          className="font-extrabold text-transparent text-4xl sm:text-5xl tracking-tight mb-1
          bg-clip-text bg-gradient-to-br from-yellow-300 via-white to-purple-500 drop-shadow-[0_0_16px_rgba(255,230,100,0.8)]"
          style={{ fontFamily: "'Orbitron', 'Montserrat', 'Arial', sans-serif" }}
        >
          Live Head to Head
        </h1>
        <h2
          className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent
          bg-gradient-to-r from-yellow-200 via-purple-300 to-pink-400 tracking-wide
          drop-shadow-[0_0_8px_rgba(160,120,255,0.8)]"
          style={{ fontFamily: "'Orbitron', 'Montserrat', 'Arial', sans-serif" }}
        >
          {match.game}
        </h2>
      </div>

      {/* --- Main Card --- */}
      <div className="max-w-xl w-full rounded-3xl bg-[#201a37] shadow-2xl px-6 py-8 flex flex-col items-center relative z-10">
        {/* Usernames and entry */}
        <div className="flex w-full justify-between items-center mb-4">
          <div className="flex flex-col items-start">
            <span className="text-white font-semibold text-lg">{creatorUsername}</span>
            <span className="text-xs text-gray-400">{user.uid === match.creatorUserId ? "You" : "Opponent"}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="bg-yellow-300 text-black font-black px-5 py-1 rounded-xl shadow text-lg border-2 border-yellow-400">
              {match.entryFee ? `${match.entryFee} TC` : "--"}
            </span>
            <span className="text-xs text-gray-400 font-semibold mt-1">Prize Pool</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-white font-semibold text-lg">{joinerUsername}</span>
            <span className="text-xs text-gray-400">{user.uid === match.joinerUserId ? "You" : "Opponent"}</span>
          </div>
        </div>
        {/* Game info */}
        <div className="w-full flex flex-col items-center mb-2">
          <span className="text-yellow-300 text-xl font-bold">{match.game}</span>
          <span className="text-gray-300 text-sm">Platform: <span className="font-semibold">{match.platform}</span></span>
        </div>
        {/* Submit Result */}
        <CustomSubmitResult matchId={matchId as string} match={match} />
      </div>
    </div>
  );
}


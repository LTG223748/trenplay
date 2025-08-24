// components/SubmitResult.tsx
import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import notify from "../lib/notify";
import { fetchUserProfile } from "../lib/useUserProfile";
import ProofUploader from "./ProofUploader";

interface SubmitResultProps {
  matchId: string;
  match: any; // keep as any to avoid TS noise for now
}

type Step = "idle" | "won" | "lost" | "submitted";

export default function SubmitResult({ matchId, match }: SubmitResultProps) {
  const [step, setStep] = useState<Step>("idle");
  const [score, setScore] = useState("");
  const [team, setTeam] = useState("");
  const [gamertag, setGamertag] = useState(""); // optional but useful

  // proof image is now handled by ProofUploader; we just keep the URL
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [user] = useAuthState(auth);

  // Guard: only show to participants
  if (!user) return null;
  const isCreator = user.uid === match?.creatorUserId;
  const isJoiner = user.uid === match?.joinerUserId;
  if (!isCreator && !isJoiner) return null;

  // Prefill from profile (only if fields are empty)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!user?.uid) return;
        if (team && gamertag) return; // don't overwrite if user typed already
        const prof = await fetchUserProfile(user.uid);
        if (cancelled) return;
        if (!team && prof.team) setTeam(prof.team);
        if (!gamertag && prof.gamertag) setGamertag(prof.gamertag);
      } catch (e) {
        notify("Profile", "Could not auto-fill from your profile.", "error");
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // Submit handler
  const handleSubmit = async () => {
    if (step !== "won" && step !== "lost") return;

    // Require proof when claiming a win
    if (step === "won" && !proofUrl) {
      notify("Proof Required", "Please add a result photo before submitting a win.", "error");
      return;
    }

    if (!team || !score) {
      notify("Missing Info", "Please enter your team and the final score.", "error");
      return;
    }

    setLoading(true);

    try {
      const resultField = isCreator ? "creatorResult" : "joinerResult";
      const updateData: Record<string, any> = {};
      updateData[resultField] = {
        result: step,              // "won" or "lost"
        team,
        gamertag: gamertag || null,
        score,
        proofUrl: proofUrl || null,
        userId: user.uid,
        submittedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, "matches", matchId), updateData);

      notify("Submit Result", "✅ Result submitted! Waiting for opponent or admin review.", "success");
      setStep("submitted");
    } catch (err: any) {
      notify(
        "Submit Result",
        "❌ Failed to submit result: " + (err?.message || "Unknown error"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Step: choose won/lost
  if (step === "idle") {
    return (
      <div className="bg-[#242441] mt-6 rounded-xl p-6 shadow-lg flex flex-col items-center">
        <h2 className="font-bold text-yellow-400 text-xl mb-4">Submit Match Result</h2>
        <div className="flex gap-4">
          <button
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-xl text-lg"
            onClick={() => {
              setProofUrl(null); // reset previous proof if any
              setStep("won");
            }}
          >
            I Won
          </button>
          <button
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-xl text-lg"
            onClick={() => {
              setProofUrl(null);
              setStep("lost");
            }}
          >
            I Lost
          </button>
        </div>
      </div>
    );
  }

  // Step: details (+ proof uploader when claiming win)
  if (step === "won" || step === "lost") {
    const needsPhoto = step === "won";
    const canSubmit = !loading && !!team && !!score && (!needsPhoto || !!proofUrl);

    return (
      <div className="bg-[#242441] mt-6 rounded-xl p-6 shadow-lg w-full flex flex-col items-center">
        <h2 className="font-bold text-yellow-400 text-lg mb-2">
          {step === "won" ? "Claim Your Win" : "Confirm Your Loss"}
        </h2>

        {/* Proof uploader appears only for wins. On mobile it opens the camera immediately */}
        {needsPhoto && (
          <div className="w-full mb-4">
            <ProofUploader
              matchId={matchId}
              userId={user.uid}
              autoLaunchCamera={true}
              onUploaded={(url) => {
                setProofUrl(url);
                notify("Photo Uploaded", "Your proof image is attached.", "success");
              }}
              onCancel={() => {
                // optional: allow backing out of taking a photo
              }}
            />
          </div>
        )}

        {/* Gamertag (auto-filled; editable) */}
        <label className="block text-white mb-2 w-full max-w-md">
          Your Gamertag:
          <input
            value={gamertag}
            onChange={(e) => setGamertag(e.target.value)}
            className="ml-2 p-2 rounded bg-[#292947] text-white w-full"
            placeholder="Enter gamertag..."
          />
        </label>

        {/* Team (auto-filled; editable) */}
        <label className="block text-white mb-2 w-full max-w-md">
          Your Team Name:
          <input
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="ml-2 p-2 rounded bg-[#292947] text-white w-full"
            placeholder="Enter team..."
          />
        </label>

        {/* Score */}
        <label className="block text-white mb-2 w-full max-w-md">
          Final Score (ex: 21-10):
          <input
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="ml-2 p-2 rounded bg-[#292947] text-white w-full"
            placeholder="Enter score..."
          />
        </label>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="mt-3 bg-yellow-400 text-black font-bold px-6 py-2 rounded-xl hover:bg-yellow-300 transition disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    );
  }

  // Step: submitted
  return (
    <div className="bg-green-900 text-yellow-300 p-6 rounded-xl text-center mt-6 font-bold shadow">
      Thanks! Your result was submitted. Awaiting opponent or admin review.
    </div>
  );
}





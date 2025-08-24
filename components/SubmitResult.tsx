// components/SubmitResult.tsx
import { useEffect, useState } from "react";
import Image from "next/image";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import notify from "../lib/notify";
import { fetchUserProfile } from "../lib/useUserProfile";

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
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
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

  // File preview
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setPhoto(f);
      setPhotoUrl(URL.createObjectURL(f));
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    if (step !== "won" && step !== "lost") return;

    setLoading(true);
    let photoDownloadUrl: string | null = null;

    try {
      // 1) Upload photo if provided (required for win)
      if (step === "won" && photo) {
        const storage = getStorage();
        const fileRef = ref(storage, `proof/${matchId}/${user.uid}-${Date.now()}`);
        await uploadBytes(fileRef, photo);
        photoDownloadUrl = await getDownloadURL(fileRef);
      }

      // 2) Save result to Firestore
      const resultField = isCreator ? "creatorResult" : "joinerResult";
      const updateData: Record<string, any> = {};
      updateData[resultField] = {
        result: step, // "won" or "lost"
        team,
        gamertag: gamertag || null, // helpful for audits
        score,
        proofUrl: photoDownloadUrl || null,
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
            onClick={() => setStep("won")}
          >
            I Won
          </button>
          <button
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-xl text-lg"
            onClick={() => setStep("lost")}
          >
            I Lost
          </button>
        </div>
      </div>
    );
  }

  // Step: details + (optional) photo
  if (step === "won" || step === "lost") {
    const needsPhoto = step === "won";
    const canSubmit =
      !loading &&
      !!team &&
      !!score &&
      (needsPhoto ? !!photo : true);

    return (
      <div className="bg-[#242441] mt-6 rounded-xl p-6 shadow-lg w-full flex flex-col items-center">
        <h2 className="font-bold text-yellow-400 text-lg mb-2">
          {step === "won" ? "Claim Your Win" : "Confirm Your Loss"}
        </h2>

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

        {/* Photo only required when claiming win */}
        {needsPhoto && (
          <label className="block text-white mb-2 w-full max-w-md">
            Upload Photo of Result:
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="ml-2"
            />
          </label>
        )}

        {photoUrl && (
          <div className="my-3">
            <Image
              src={photoUrl}
              alt="Proof"
              width={320}
              height={180}
              className="rounded-xl"
            />
          </div>
        )}

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




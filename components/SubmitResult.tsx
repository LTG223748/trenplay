import { useState } from "react";
import Image from "next/image";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { notify } from "../lib/notify"; // Make sure this path is correct!

interface SubmitResultProps {
  matchId: string;
  match: any;
}

export default function SubmitResult({ matchId, match }: SubmitResultProps) {
  const [step, setStep] = useState<"idle" | "won" | "lost" | "submitted">("idle");
  const [score, setScore] = useState("");
  const [team, setTeam] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user] = useAuthState(auth);

  if (!user) return null;
  const isCreator = user.uid === match.creatorUserId;
  const isJoiner = user.uid === match.joinerUserId;
  if (!isCreator && !isJoiner) return null;

  // File preview
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
      setPhotoUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    setLoading(true);
    let photoDownloadUrl: string | null = null;

    try {
      // 1. Upload photo if provided (for win only)
      if (step === "won" && photo) {
        const storage = getStorage();
        const fileRef = ref(storage, `proof/${matchId}/${user.uid}-${Date.now()}`);
        await uploadBytes(fileRef, photo);
        photoDownloadUrl = await getDownloadURL(fileRef);
      }

      // 2. Save result to Firestore
      const resultField = isCreator ? "creatorResult" : "joinerResult";
      const updateData: any = {};
      updateData[resultField] = {
        result: step, // "won" or "lost"
        team,
        score,
        proofUrl: photoDownloadUrl || null,
        userId: user.uid,
        submittedAt: new Date().toISOString(),
      };
      await updateDoc(doc(db, "matches", matchId), updateData);

      notify("✅ Result submitted! Waiting for opponent or admin review.", "success");
      setStep("submitted");
    } catch (err: any) {
      notify("❌ Failed to submit result: " + (err?.message || "Unknown error"), "error");
    } finally {
      setLoading(false);
    }
  };

  // UI — step selector
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

  // UI — enter score, team, photo
  if (step === "won" || step === "lost") {
    return (
      <div className="bg-[#242441] mt-6 rounded-xl p-6 shadow-lg w-full flex flex-col items-center">
        <h2 className="font-bold text-yellow-400 text-lg mb-2">
          {step === "won" ? "Claim Your Win" : "Confirm Your Loss"}
        </h2>
        <label className="block text-white mb-2">
          Your Team Name:
          <input
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="ml-2 p-1 rounded bg-[#292947] text-white"
            placeholder="Enter team..."
          />
        </label>
        <label className="block text-white mb-2">
          Final Score (ex: 21-10):
          <input
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="ml-2 p-1 rounded bg-[#292947] text-white"
            placeholder="Enter score..."
          />
        </label>
        {step === "won" && (
          <label className="block text-white mb-2">
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
          <Image
            src={photoUrl}
            alt="Proof"
            width={240}
            height={140}
            className="rounded-xl my-3"
          />
        )}
        <button
          onClick={handleSubmit}
          disabled={loading || !team || !score || (step === "won" && !photo)}
          className="mt-3 bg-yellow-400 text-black font-bold px-6 py-2 rounded-xl hover:bg-yellow-300 transition disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    );
  }

  // Done
  return (
    <div className="bg-green-900 text-yellow-300 p-6 rounded-xl text-center mt-6 font-bold shadow">
      Thanks! Your result was submitted. Awaiting opponent or admin review.
    </div>
  );
}



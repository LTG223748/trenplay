import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import SubscriptionButton from "../components/SubscriptionButton";
import Image from "next/image";

const AVATAR_OPTIONS = [
  { src: "/avatars/Starter-1.png", label: "Starter 1", unlock: () => true },
  { src: "/avatars/Starter-2.png", label: "Starter 2", unlock: () => true },
  { src: "/avatars/Starter-3.png", label: "Starter 3", unlock: () => true },
  { src: "/avatars/Starter-4.png", label: "Starter 4", unlock: () => true },
  { src: "/avatars/Starter-5.png", label: "Starter 5", unlock: () => true },
  { src: "/avatars/Starter-6.png", label: "Starter 6", unlock: () => true },
  { src: "/avatars/Starter-7.png", label: "Starter 7", unlock: () => true },
  { src: "/avatars/Starter-8.png", label: "Starter 8", unlock: () => true },
  { src: "/avatars/Starter-9.png", label: "Starter 9", unlock: () => true },
  { src: "/avatars/Starter-10.png", label: "Starter 10", unlock: () => true },
  {
    src: "/avatars/Match-wins.png",
    label: "Win 50 Matches",
    unlock: (stats) => (stats.wins || 0) >= 50,
  },
  {
    src: "/avatars/Match-played.png",
    label: "Play 100 Matches",
    unlock: (stats) => (stats.matchesPlayed || 0) >= 100,
  },
  {
    src: "/avatars/Tournaments-won.png",
    label: "Win 5 Tournaments",
    unlock: (stats) => (stats.tournamentsWon || 0) >= 5,
  },
];

export default function ProfilePage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [linkedAccount, setLinkedAccount] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        setAvatar(data.avatar || AVATAR_OPTIONS[0].src);
        setUsername(data.username || "");
        setLinkedAccount(data.linkedAccount || "");
      }
      setLoading(false);
    })();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      avatar,
      username,
      linkedAccount,
    });
    setSaving(false);
    alert("Profile updated!");
  };

  if (loadingAuth || loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-2xl text-yellow-400">
        Loading Profile…
      </div>
    );
  }

  const stats = {
    wins: profile.wins || 0,
    matchesPlayed: profile.matchesPlayed || 0,
    tournamentsWon: profile.tournamentsWon || 0,
  };

  return (
    <div className="min-h-screen bg-[#0d0d1f] px-4 py-10 flex flex-col items-center">
      {/* Title + Avatar */}
      <div className="w-full max-w-3xl bg-[#191933] rounded-3xl shadow-2xl p-8 mb-12 border-2 border-purple-800">
        <h1 className="text-4xl font-extrabold text-purple-200 mb-6 flex items-center gap-3">
          <span role="img" aria-label="profile">👤</span> Profile
        </h1>
        <div className="flex gap-10 items-center flex-wrap">
          <div>
            {/* Avatar picker */}
            <div className="mb-2 text-lg font-semibold text-white">Avatar:</div>
            <div className="flex gap-3 flex-wrap">
              {AVATAR_OPTIONS.map((opt) => {
                const unlocked = opt.unlock(stats);
                return (
                  <div
                    key={opt.src}
                    className={`relative rounded-full border-4 ${avatar === opt.src
                      ? "border-yellow-400 scale-110"
                      : unlocked
                        ? "border-purple-400 opacity-100"
                        : "border-gray-500 opacity-50"
                      } transition-transform cursor-pointer`}
                    onClick={() => unlocked && setAvatar(opt.src)}
                    title={opt.label}
                    style={{ width: 74, height: 74, overflow: "hidden", background: "#221a40" }}
                  >
                    <Image src={opt.src} width={70} height={70} alt={opt.label} className="rounded-full" />
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 text-white font-bold text-xs rounded-full">
                        🔒
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Profile settings */}
          <div className="flex-1">
            <div className="mb-3">
              <label className="text-white font-bold block mb-1">Username</label>
              <input
                className="bg-[#292947] rounded px-4 py-2 text-white w-full"
                value={username}
                onChange={e => setUsername(e.target.value)}
                maxLength={16}
              />
            </div>
            <div className="mb-3">
              <label className="text-white font-bold block mb-1">Linked Account</label>
              <input
                className="bg-[#292947] rounded px-4 py-2 text-white w-full"
                value={linkedAccount}
                onChange={e => setLinkedAccount(e.target.value)}
                placeholder="Console Gamertag, PSN, etc."
                maxLength={32}
              />
            </div>
            <button
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-7 py-2 mt-2 rounded shadow-lg transition disabled:opacity-60"
              onClick={saveProfile}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>

          {/* Subscription Button */}
          <div>
            <SubscriptionButton user={user} />
            {profile.subscriptionActive && (
              <div className="mt-2 text-green-400 text-xs font-bold">
                ✅ Subscription Active <br />
                Expires: {profile.subscriptionExpires ? new Date(profile.subscriptionExpires).toLocaleDateString() : "N/A"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Referral Code Card */}
      <div className="w-full max-w-3xl mb-7">
        <div className="bg-[#221a40] rounded-2xl border border-purple-700 px-7 py-5 text-white flex items-center gap-2">
          <span>Your Referral Code:</span>
          <strong className="text-yellow-300 text-lg">{profile.referralCode || "N/A"}</strong>
        </div>
      </div>

      {/* Stats Card */}
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-7">
        <div className="rounded-3xl bg-gradient-to-br from-[#31204d] to-[#201032] border-2 border-purple-700 shadow-xl p-8">
          <h2 className="text-2xl font-extrabold text-yellow-400 mb-5">🔥 Your Stats</h2>
          <ul className="text-white text-lg space-y-2">
            <li>Total Matches Played: <span className="text-yellow-300 font-bold">{profile.matchesPlayed || 0}</span></li>
            <li>Wins / Losses: <span className="text-yellow-300 font-bold">{profile.wins || 0} / {profile.losses || 0}</span></li>
            <li>Win Rate %: <span className="text-yellow-300 font-bold">
              {profile.matchesPlayed ? ((profile.wins / profile.matchesPlayed) * 100).toFixed(1) : "0"}%
            </span></li>
            <li>Longest Win Streak: <span className="text-yellow-300 font-bold">{profile.winStreak || 0}</span></li>
            <li>Favorite Game: <span className="text-yellow-300 font-bold">{profile.favoriteGame || "N/A"}</span></li>
            <li>Current Rank: <span className="text-yellow-300 font-bold">{profile.division || "Unranked"}</span></li>
            <li>Tournaments Won: <span className="text-yellow-300 font-bold">{profile.tournamentsWon || 0}</span></li>
          </ul>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-[#1c1130] to-[#160f25] border-2 border-purple-700 shadow-xl p-8 flex flex-col">
          <h2 className="text-2xl font-extrabold text-yellow-400 mb-5">🎉 Recent Matches</h2>
          <div className="text-gray-400 italic">
            {/* You can map through recent matches here if you want */}
            No recent matches played yet.
          </div>
        </div>
      </div>
    </div>
  );
}





import { useState, FormEvent } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/router";
import Link from "next/link";
import AuthLayout from "../components/AuthLayout";

export default function SignupPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [referralInput, setReferralInput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const router = useRouter();

  function generateReferralCode(username: string): string {
    const base = username.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return (base + rand).slice(0, 8);
  }

  const bannedWords = [
    "admin", "mod", "staff", "support", "trenplay",
    "fuck", "shit", "bitch", "cunt", "dick", "pussy",
    "nigger", "fag", "rape", "hitler", "nazis",
    "gay", "lesbian", "homo", "tranny",
  ];

  const isCleanUsername = (name: string): boolean => {
    const lowered = name.toLowerCase();
    return !bannedWords.some((word) => lowered.includes(word));
  };

  const isValidUsername = (name: string): boolean => {
    const validLength = name.length >= 3 && name.length <= 15;
    const validChars = /^[a-zA-Z0-9_]+$/.test(name);
    return validLength && validChars && isCleanUsername(name);
  };

  const isValidEmail = (email: string): boolean => /\S+@\S+\.\S+/.test(email);
  const isStrongPassword = (pw: string): boolean =>
    pw.length >= 7 && /[^a-zA-Z0-9]/.test(pw);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isValidUsername(username)) {
      setError(
        "Invalid username. Use 3–15 characters with letters, numbers, or underscores. Offensive or restricted names are not allowed."
      );
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isStrongPassword(password)) {
      setError("Password must be at least 7 characters and include a special character.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

      const referralCode = generateReferralCode(username);

      // ✅ Create Firestore user doc with default fields
      await setDoc(doc(db, "users", user.uid), {
        email,
        username,
        createdAt: serverTimestamp(),
        division: "Rookie",
        elo: 500,
        trenCoins: 0,
        isAdmin: false,
        role: "user",
        wins: 0,
        losses: 0,

        // ✅ Trust system
        disputeCount: 0,

        referralCode,
        referredBy: referralInput || null,
        referralRewarded: false,
        subscriptionActive: false,
        subscriptionExpires: null,
      });

      setSuccess("Account created! Redirecting…");

      const redirect = (router.query.redirect as string) || "/app";
      setTimeout(() => {
        router.replace(redirect);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="🚀 Create Your TrenPlay Account"
      subtitle="Sign up to start competing, earning, and climbing the ranks!"
    >
      <form onSubmit={handleSignup} className="space-y-5">
        <h2 className="text-white text-2xl font-bold mb-4">Sign Up</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full px-4 py-2 rounded bg-[#2a2a40] text-white focus:outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 rounded bg-[#2a2a40] text-white focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full px-4 py-2 rounded bg-[#2a2a40] text-white focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-sm text-gray-400 hover:text-yellow-400"
          >
            {showPassword ? "Hide" : "View"}
          </button>
        </div>

        <input
          type="text"
          placeholder="Referral Code (optional)"
          value={referralInput}
          onChange={(e) => setReferralInput(e.target.value)}
          className="w-full px-4 py-2 rounded bg-[#2a2a40] text-white focus:outline-none"
        />

        {error && <p className="text-red-400">{error}</p>}
        {success && <p className="text-green-400">{success}</p>}

        <button
          type="submit"
          className="w-full bg-yellow-400 text-black font-semibold py-2 rounded hover:bg-yellow-500 transition"
        >
          Sign Up
        </button>
      </form>

      {/* Switch to Login */}
      <p className="text-sm text-gray-400 mt-6 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-yellow-400 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}




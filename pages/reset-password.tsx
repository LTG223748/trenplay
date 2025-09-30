import { useState, FormEvent } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";
import Link from "next/link";
import AuthLayout from "../components/AuthLayout";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("✅ Password reset link sent! Check your email.");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="🔑 Reset Your Password"
      subtitle="Enter your account email and we’ll send you a reset link."
    >
      <form onSubmit={handleReset} className="space-y-5">
        <h2 className="text-white text-2xl font-bold mb-4">Forgot Password</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 rounded bg-[#2a2a40] text-white focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error && <p className="text-red-400">{error}</p>}
        {message && <p className="text-green-400">{message}</p>}

        <button
          type="submit"
          className="w-full bg-yellow-400 text-black font-semibold py-2 rounded hover:bg-yellow-500 transition"
        >
          Send Reset Link
        </button>
      </form>

      {/* Back to Login */}
      <p className="text-sm text-gray-400 mt-6 text-center">
        Remember your password?{" "}
        <Link href="/login" className="text-yellow-400 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}

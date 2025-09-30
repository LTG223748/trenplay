import { useState, FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/router";
import Link from "next/link";
import AuthLayout from "../components/AuthLayout";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        throw new Error("Please verify your email before logging in.");
      }

      // ✅ Redirect logic
      const redirect = (router.query.redirect as string) || "/app";
      router.replace(redirect);
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="🔥 Ready to Compete Again?"
      subtitle="Sign in to join tournaments, track wins, and earn rewards."
    >
      <form onSubmit={handleLogin} className="space-y-5">
        <h2 className="text-white text-2xl font-bold mb-4">Welcome Back</h2>

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

        {error && <p className="text-red-400">{error}</p>}

        <button
          type="submit"
          className="w-full bg-yellow-400 text-black font-semibold py-2 rounded hover:bg-yellow-500 transition"
        >
          Log In
        </button>
      </form>

      {/* Forgot Password */}
      <p className="text-sm text-gray-400 mt-4 text-center">
        <Link href="/reset-password" className="text-yellow-400 hover:underline">
          Forgot your password?
        </Link>
      </p>

      {/* Switch to Signup */}
      <p className="text-sm text-gray-400 mt-6 text-center">
        Don’t have an account?{" "}
        <Link href="/signup" className="text-yellow-400 hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}



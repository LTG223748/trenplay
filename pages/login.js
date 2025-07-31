// pages/login.js
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/router';
import AuthLayout from '../components/AuthLayout';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 🔐 Check if the email is verified
      if (!user.emailVerified) {
        throw new Error('Please verify your email before logging in.');
      }

      // ✅ Continue if verified
      router.push('/');
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
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
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 rounded bg-[#2a2a40] text-white focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-400">{error}</p>}

        <button
          type="submit"
          className="w-full bg-yellow-400 text-black font-semibold py-2 rounded hover:bg-yellow-500 transition"
        >
          Log In
        </button>
      </form>
    </AuthLayout>
  );
}

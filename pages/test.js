
import { useState } from 'react';
import { updateBalanceAndLog } from '../lib/wallet/updateBalance';
import { auth } from '../lib/firebase';

export default function TestPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleAddCoins = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not logged in");
      }

      await updateBalanceAndLog({
        userId: user.uid,
        amount: 10,
        type: 'deposit',
      });

      setMessage('✅ 10 Coins added successfully!');
      setError('');
    } catch (err) {
      console.error("❌ Firebase error:", err);
      setError(`❌ ${err.message}`);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-2xl font-bold mb-4">Test Wallet Function</h1>
      <button
        onClick={handleAddCoins}
        className="bg-yellow-400 text-black font-bold py-2 px-6 rounded hover:bg-yellow-500"
      >
        Add 10 Coins
      </button>
      {message && <p className="mt-4 text-green-400">{message}</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
}
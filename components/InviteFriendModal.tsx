'use client';

import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import { createFriendMatch } from '../lib/matches';
import { useWallet } from '@solana/wallet-adapter-react';
import AddTCModal from './AddTCModal'; // ✅ for insufficient funds

interface InviteFriendModalProps {
  friendId: string;
  onClose: () => void;
}

export default function InviteFriendModal({ friendId, onClose }: InviteFriendModalProps) {
  const [user] = useAuthState(auth);
  const { publicKey } = useWallet(); // ✅ NEW
  const [game, setGame] = useState('');
  const [platform, setPlatform] = useState('');
  const [entryFee, setEntryFee] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  // modal for Add TC
  const [showAddTC, setShowAddTC] = useState(false);
  const [neededTC, setNeededTC] = useState(0);

  const handleInvite = async () => {
    if (!user) return alert('You must be logged in.');
    if (!publicKey) return alert('Connect your wallet first.');
    if (!game || !platform || !entryFee) {
      return alert('Please fill out all fields.');
    }

    setLoading(true);
    try {
      const res = await createFriendMatch({
        creatorId: user.uid,
        joinerId: friendId,
        game,
        platform,
        entryFee,
        publicKey, // ✅ pass creator’s wallet pubkey
      });

      if ((res as any)?.code === 'INSUFFICIENT_FUNDS') {
        setNeededTC((res as any).neededTC);
        setShowAddTC(true);
        return;
      }

      if (res.success) {
        alert('✅ Invite sent!');
        onClose();
      } else {
        alert(`❌ Failed to create invite: ${res.error}`);
      }
    } catch (err: any) {
      if (err?.code === 'INSUFFICIENT_FUNDS') {
        setNeededTC(err.neededTC);
        setShowAddTC(true);
      } else {
        console.error('Invite error:', err);
        alert('❌ Failed to send invite.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-[#1a1a2e] p-6 rounded-xl border border-purple-500 w-[90%] max-w-md">
        <h2 className="text-lg font-bold mb-4 text-white">Invite Friend to Match</h2>

        <label className="block text-sm text-gray-300 mb-1">Game</label>
        <input
          type="text"
          value={game}
          onChange={(e) => setGame(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded-lg bg-[#292947] text-white"
          placeholder="Enter game"
        />

        <label className="block text-sm text-gray-300 mb-1">Platform</label>
        <input
          type="text"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded-lg bg-[#292947] text-white"
          placeholder="Enter console"
        />

        <label className="block text-sm text-gray-300 mb-1">Entry Fee (TC)</label>
        <input
          type="number"
          value={entryFee}
          onChange={(e) => setEntryFee(Number(e.target.value))}
          className="w-full mb-3 px-3 py-2 rounded-lg bg-[#292947] text-white"
          min={0.01}
          step={0.01}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-bold"
          >
            Cancel
          </button>
          <button
            onClick={handleInvite}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
          >
            {loading ? 'Sending...' : 'Send Invite'}
          </button>
        </div>
      </div>

      {showAddTC && (
        <AddTCModal
          neededTC={neededTC}
          onClose={() => setShowAddTC(false)}
          onConfirm={() => {
            setShowAddTC(false);
            alert('Redirecting to Add TC flow…');
          }}
        />
      )}
    </div>
  );
}


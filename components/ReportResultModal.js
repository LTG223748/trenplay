// components/ReportResultModal.js
import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../lib/firebase';

export default function ReportResultModal({ isOpen, onClose, matchId, player1, player2 }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [winner, setWinner] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!selectedFile || !winner) {
        setError('Please select a winner and upload a screenshot.');
        setLoading(false);
        return;
      }

      const fileRef = ref(storage, `matchProofs/${matchId}/${Date.now()}.jpg`);
      await uploadBytes(fileRef, selectedFile);
      const imageUrl = await getDownloadURL(fileRef);

      const matchRef = doc(db, 'matches', matchId);

      await updateDoc(matchRef, {
        result: winner,
        proof: imageUrl,
        reportedAt: new Date().toISOString(),
      });

      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to upload. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
      <div className="bg-[#1a002f] p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">📸 Report Match Result</h2>

        <label className="text-white block mb-2">Winner</label>
        <select
          className="w-full p-2 rounded bg-gray-800 text-white mb-4"
          value={winner}
          onChange={(e) => setWinner(e.target.value)}
        >
          <option value="">Select winner</option>
          <option value={player1}>{player1}</option>
          <option value={player2}>{player2}</option>
        </select>

        <label className="text-white block mb-2">Screenshot</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="mb-4 w-full text-white"
        />

        {error && <p className="text-red-400 mb-3">{error}</p>}

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-300"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
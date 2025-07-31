import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { addDoc, collection, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useWallet } from '@solana/wallet-adapter-react';
import { notify } from '../lib/notify'; // <--- Use this for notifications!

const TREN_MINT = process.env.NEXT_PUBLIC_TRENC_MINT_ADDRESS;
const TREN_DECIMALS = Number(process.env.NEXT_PUBLIC_TRENC_DECIMALS);
const SOL_CLUSTER = process.env.NEXT_PUBLIC_SOLANA_CLUSTER;

const DEV_MODE = true;
const TEST_WALLET = { toBase58: () => "TestWalletPublicKey" };

// Platform options (green/blue console)
const consoles = [
  { label: 'Console', value: 'Console-Green', color: 'green' },
  { label: 'Console', value: 'Console-Blue', color: 'blue' }
];

const games = [
  'NBA 2K 25', 'NBA 2K 26', 'FIFA 25', 'FIFA 26', 'UFC 5', 'Madden 25', 'Madden 26', 'College Football 25', 'College Football 26', 'MLB The Show 25', 'MLB The Show 26'
];

const ENTRY_OPTIONS = [
  { label: "5.00 USD (~5000 TC)", value: 5000 },
  { label: "10.00 USD (~10000 TC)", value: 10000 },
  { label: "25.00 USD (~25000 TC)", value: 25000 },
  { label: "50.00 USD (~50000 TC)", value: 50000 },
  { label: "100.00 USD (~100000 TC)", value: 100000 },
];

export default function CreateMatchPage() {
  const { publicKey: realKey, connected: realConnected } = useWallet();
  const publicKey = DEV_MODE ? TEST_WALLET : realKey;
  const connected = DEV_MODE ? true : realConnected;

  const [user] = useAuthState(auth);
  const [userDivision, setUserDivision] = useState<string>('Rookie');
  const [game, setGame] = useState('');
  const [platform, setPlatform] = useState('');
  const [entryFee, setEntryFee] = useState(ENTRY_OPTIONS[0].value);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch user's division from Firestore
  useEffect(() => {
    if (!user) return;
    const fetchDivision = async () => {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      setUserDivision(snap.data()?.division || 'Rookie');
    };
    fetchDivision();
  }, [user]);

  const handleCreateMatch = async () => {
    if (!user) {
      notify('Please log in to create a match.', 'error');
      return;
    }
    if (!connected || !publicKey) {
      notify('Please connect your wallet.', 'error');
      return;
    }
    if (!game || !platform || !entryFee) {
      setError('All fields are required.');
      notify('All fields are required.', 'error');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const matchData = {
        game,
        platform, // <--- USE SELECTED VALUE!
        entryFee,
        creatorWallet: publicKey.toBase58(),
        creatorUserId: user.uid,
        division: userDivision,
        createdAt: serverTimestamp(),
        status: 'open',
        joinerUserId: null,
        confirmedInGameByCreator: false,
        confirmedInGameByJoiner: false,
        creatorGamertag: '',
        joinerGamertag: ''
      };

      await addDoc(collection(db, 'matches'), matchData);

      notify('✅ Match created!', 'success');
      setTimeout(() => router.push('/matches'), 500); // Small delay for noti to show

    } catch (err: any) {
      console.error(err);
      setError('Failed to create match: ' + err.message);
      notify('❌ Failed to create match: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d1f] text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-6">🎮 Create a Match</h1>
      <div className="w-full max-w-md bg-[#1a1a2e] p-6 rounded-lg shadow-xl">
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        {/* Select Game */}
        <label className="block mb-2 text-sm font-medium">Select Game</label>
        <select
          value={game}
          onChange={(e) => setGame(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-[#292947] text-white"
        >
          <option value="">-- Choose Game --</option>
          {games.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        {/* Select Console */}
        <label className="block mb-2 text-sm font-medium">Select Console</label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-[#292947] text-white"
        >
          <option value="">-- Choose Console --</option>
          {consoles.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label} {c.color === 'green' ? '🟩' : '🟦'}
            </option>
          ))}
        </select>

        {/* Entry Fee */}
        <label className="block mb-2 text-sm font-medium">Entry Fee (USD ~ TC)</label>
        <select
          value={entryFee}
          onChange={(e) => setEntryFee(Number(e.target.value))}
          className="w-full p-2 mb-2 rounded bg-[#292947] text-white"
        >
          {ENTRY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {/* Disclaimer */}
        <p className="text-xs text-gray-400 italic mt-2 mb-6">
          Disclaimer: All wagers are conducted exclusively in TrenCoin (TC). Any USD values shown are estimates provided for user reference only and do not constitute an offer or transaction in U.S. dollars.
        </p>

        <button
          onClick={handleCreateMatch}
          disabled={loading}
          className="w-full bg-yellow-400 text-black font-bold py-2 rounded hover:bg-yellow-500 transition disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Match'}
        </button>
      </div>
    </div>
  );
}















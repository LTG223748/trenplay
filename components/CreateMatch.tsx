'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addDoc, collection, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';

import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';

import * as anchor from '@coral-xyz/anchor';
import type { AnchorProvider } from '@coral-xyz/anchor';

import { getTrenbetProgram } from '../src/utils/getTrenbetProgram';
import { deriveMatchStatePda, deriveEscrowAuthorityPda } from '../src/utils/pdas';
import { RPC_URL, TREN_MINT } from '../lib/network';
import notify from '../lib/notify';

const ENTRY_OPTIONS = [
  { label: '0.01 TC (test)', value: 0.01 },
  { label: '0.05 TC (test)', value: 0.05 },
  { label: '0.1 TC (test)', value: 0.1 },
  { label: '0.5 TC (test)', value: 0.5 },
  { label: '1 TC (test)', value: 1 },
];

const consoles = [
  { label: 'Console', value: 'Console-Green', color: 'green' },
  { label: 'Console', value: 'Console-Blue', color: 'blue' },
];

const games = [
  'NBA 2K25', 'NBA 2K26',
  'FIFA 25', 'FIFA 26',
  'UFC 5',
  'Madden 25', 'Madden 26',
  'College Football 25', 'College Football 26',
  'MLB The Show 25', 'MLB The Show 26',
  'NHL 25', 'NHL 26', 'Rocket League', 'Fortnite 1v1'
];

// === HARD WIRES (devnet) ===
const HARDCODED_PLAYER1_ATA = new PublicKey('CRFQewYNA3DVyFqEEH1kUtyiZhEi2RTtC8enSw5T48VG');

function CreateMatchPage() {
  const { publicKey, connected } = useWallet();
  const anchorWallet = useAnchorWallet(); // Anchor-friendly wallet
  const [user] = useAuthState(auth);

  const [userDivision, setUserDivision] = useState<string>('Rookie');
  const [game, setGame] = useState('');
  const [platform, setPlatform] = useState('');
  const [entryFee, setEntryFee] = useState<number>(ENTRY_OPTIONS[0].value);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const connection = new Connection(RPC_URL, 'confirmed');
  const mint = new PublicKey(TREN_MINT);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        setUserDivision(snap.data()?.division || 'Rookie');
      } catch (err) {
        console.error('Error fetching user division:', err);
      }
    })();
  }, [user]);

  const handleCreateMatch = async () => {
    if (!user) return notify('Please log in to create a match.', 'error');
    if (!connected || !publicKey || !anchorWallet) {
      return notify('Please connect your wallet.', 'error');
    }
    if (!game || !platform) {
      setError('All fields are required.');
      return notify('All fields are required.', 'error');
    }
    if (typeof entryFee !== 'number' || isNaN(entryFee)) {
      setError('Entry fee is required.');
      return notify('Entry fee is required.', 'error');
    }

    setError('');
    setLoading(true);

    try {
      // Build program with the Anchor-friendly wallet
      const program = getTrenbetProgram(connection, anchorWallet);
      console.log('Program ID (frontend):', program.programId.toBase58());

      // a) unique id for this match (u64)
      const matchId = new anchor.BN(Date.now().toString());
      console.log('MATCH ID   :', matchId.toString());

      // b) match_state PDA (seeds = ["match_v3", player1, mint, matchId])
      const matchState = deriveMatchStatePda({
        programId: program.programId,
        player1: publicKey,
        mint,
        matchId,
      });

      // c) escrow_authority PDA (seeds = ["escrow_auth_v1", match_state])
      const escrowAuthority = deriveEscrowAuthorityPda({
        programId: program.programId,
        matchState,
      });

      // d) escrow_token ATA for PDA (allowOwnerOffCurve = true)
      const escrowToken = await getAssociatedTokenAddress(
        mint,
        escrowAuthority,
        true,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      // Ensure escrow ATA exists; create if missing
      const ataInfo = await connection.getAccountInfo(escrowToken);
      if (!ataInfo) {
        const ix = createAssociatedTokenAccountInstruction(
          publicKey,        // payer
          escrowToken,      // ATA to create
          escrowAuthority,  // owner (PDA)
          mint,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );
        const tx = new Transaction().add(ix);
        const provider = program.provider as AnchorProvider;
        await provider.sendAndConfirm(tx, []);
        console.log('✅ Created escrow ATA for PDA:', escrowToken.toBase58());
      }

      // Player1 token (hardcoded for now)
      const player1Token = HARDCODED_PLAYER1_ATA;

      // amount -> u64 base units (decimals = 9)
      const decimals = 9;
      const rawAmount = Math.round(entryFee * Math.pow(10, decimals));
      const amountBn = new anchor.BN(rawAmount);

      // create_match(match_id, amount)
      await program.methods
        .createMatch(matchId, amountBn)
        .accounts({
          player1: publicKey,
          mint,
          matchState,
          escrowAuthority,
          player1Token,
          escrowToken,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      await addDoc(collection(db, 'matches'), {
        game,
        platform,
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
        joinerGamertag: '',
        matchId: matchId.toString(),
        matchState: matchState.toBase58(),
        escrowAuthority: escrowAuthority.toBase58(),
        escrowToken: escrowToken.toBase58(),
      });

      notify('✅ Match created on-chain and saved!', 'success');

      // Router-free navigation (works everywhere)
      setTimeout(() => {
        if (typeof window !== 'undefined') window.location.assign('/matches');
      }, 500);
    } catch (err: any) {
      console.error('CREATE MATCH ERROR:', err);
      const msg = err?.message || String(err);
      setError(`Failed to create match: ${msg}`);
      notify(`❌ Failed to create match: ${msg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d1f] text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-6">🎮 Create a Match</h1>
      <div className="w-full max-w-md bg-[#1a1a2e] p-6 rounded-lg shadow-xl">
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

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

        <label className="block mb-2 text-sm font-medium">Entry Fee (TC)</label>
        <select
          value={entryFee}
          onChange={(e) => setEntryFee(Number(e.target.value))}
          className="w-full p-2 mb-2 rounded bg-[#292947] text-white"
        >
          {ENTRY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <p className="text-xs text-gray-400 italic mt-2 mb-6">
          Disclaimer: All wagers are conducted exclusively in TrenCoin (TC) on devnet. These are test tokens for development purposes only.
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

export default CreateMatchPage;






























'use client';

import { useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

import {
  useWallet,
  useAnchorWallet,
  type AnchorWallet,
} from '@solana/wallet-adapter-react';

import {
  Connection,
  PublicKey,
  Transaction,
} from '@solana/web3.js';

import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';

import * as anchor from '@coral-xyz/anchor';
import { getTrenbetProgram } from '../src/utils/getTrenbetProgram';
import { RPC_URL, TREN_MINT } from '../lib/network';

import AddTCModal from './AddTCModal'; // ✅ NEW

interface Match {
  id: string;
  entryFee: number;
  creatorUserId: string;
  joinerUserId?: string | null;
  division: string;
  status?: 'open' | 'pending' | 'closed' | string;
  matchState?: string | null;
  escrowAuthority?: string | null;
  escrowToken?: string | null;
}

interface JoinButtonProps {
  match: Match;
}

function safePk(
  input: string | null | undefined,
  label: string
): { ok: boolean; pk?: PublicKey; err?: string } {
  if (!input || !input.trim()) return { ok: false, err: `${label} is missing.` };
  try {
    const pk = new PublicKey(input.trim());
    return { ok: true, pk };
  } catch {
    return { ok: false, err: `${label} is not a valid PublicKey.` };
  }
}

const MIN = 60_000;
const tsPlus = (ms: number) => Timestamp.fromDate(new Date(Date.now() + ms));
const toMillis = (t: any): number | null => {
  if (t == null) return null;
  if (typeof t === 'number') return t;
  if (typeof t === 'string') {
    const v = Date.parse(t);
    return Number.isNaN(v) ? null : v;
  }
  if (typeof t?.toMillis === 'function') return t.toMillis();
  return null;
};

export default function JoinButton({ match }: JoinButtonProps) {
  const [loading, setLoading] = useState(false);
  const [user] = useAuthState(auth);
  const { publicKey, connected } = useWallet();
  const anchorWallet = useAnchorWallet();

  const [showAddTC, setShowAddTC] = useState(false); // ✅ NEW
  const [neededTC, setNeededTC] = useState(0);       // ✅ NEW

  const isCreator = user?.uid === match.creatorUserId;
  const isFull = !!match.joinerUserId;
  const isOpen = (match.status ?? 'open') === 'open';

  const mintPk = new PublicKey(TREN_MINT);
  const matchStateCheck = safePk(match.matchState, 'Match state PDA');
  const escrowAuthCheck = safePk(match.escrowAuthority, 'Escrow authority PDA');
  const escrowTokCheck = safePk(match.escrowToken, 'Escrow token account');

  const disabledReason = useMemo(() => {
    if (!user) return 'Sign in to join this match.';
    if (isCreator) return 'You created this match.';
    if (isFull) return 'This match already has an opponent.';
    if (!isOpen) return 'This match is not open.';
    if (!connected || !publicKey || !anchorWallet) return 'Connect your wallet to join.';
    if (!matchStateCheck.ok) return matchStateCheck.err!;
    if (!escrowAuthCheck.ok) return escrowAuthCheck.err!;
    if (!escrowTokCheck.ok) return escrowTokCheck.err!;
    return null;
  }, [
    user,
    isCreator,
    isFull,
    isOpen,
    connected,
    publicKey,
    anchorWallet,
    matchStateCheck.ok,
    matchStateCheck.err,
    escrowAuthCheck.ok,
    escrowAuthCheck.err,
    escrowTokCheck.ok,
    escrowTokCheck.err,
  ]);

  const handleJoin = async () => {
    if (disabledReason) {
      alert(`⚠️ ${disabledReason}`);
      return;
    }
    if (!publicKey || !anchorWallet) {
      alert('⚠️ Please connect your wallet first.');
      return;
    }

    setLoading(true);
    const connection = new Connection(RPC_URL, 'confirmed');

    try {
      // Firestore re-check
      const matchRef = doc(db, 'matches', match.id);
      const snap = await getDoc(matchRef);
      const fresh = snap.data() as any;
      if (!fresh) throw new Error('Match not found.');
      if ((fresh.status ?? 'open').toLowerCase() !== 'open') throw new Error('Match is no longer open.');
      if (fresh.joinerUserId) throw new Error('Match already joined.');
      const expMs = toMillis(fresh?.expireAt);
      if (expMs && expMs <= Date.now()) throw new Error('This match has expired.');

      // On-chain join setup
      const program = getTrenbetProgram(connection, anchorWallet);
      const matchStatePk = matchStateCheck.pk!;
      const escrowAuthorityPk = escrowAuthCheck.pk!;
      const escrowTokenPk = escrowTokCheck.pk!;

      // Ensure ATA exists
      const player2Ata = await getAssociatedTokenAddress(
        mintPk,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      const info = await connection.getAccountInfo(player2Ata);
      if (!info) {
        const ix = createAssociatedTokenAccountInstruction(
          publicKey,
          player2Ata,
          publicKey,
          mintPk,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );
        const tx = new Transaction().add(ix);
        await program.provider.sendAndConfirm!(tx, []);
      }

      // ✅ Balance check
      const parsed = await connection.getParsedAccountInfo(player2Ata);
      const uiAmt =
        (parsed.value as any)?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0;
      if (uiAmt < match.entryFee) {
        setNeededTC(match.entryFee - uiAmt);
        setShowAddTC(true); // ✅ trigger modal
        setLoading(false);
        return;
      }

      // Call on-chain join
      await program.methods
        .joinMatch()
        .accounts({
          player2: publicKey,
          mint: mintPk,
          matchState: matchStatePk,
          escrowAuthority: escrowAuthorityPk,
          player2Token: player2Ata,
          escrowToken: escrowTokenPk,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      // Firestore update
      await runTransaction(db, async (tx) => {
        const ref = doc(db, 'matches', match.id);
        const snap2 = await tx.get(ref);
        if (!snap2.exists()) throw new Error('Match not found (post-chain).');

        const m = snap2.data() as any;
        const now = Date.now();
        const exp2 = toMillis(m?.expireAt);

        if ((m.status ?? 'open').toLowerCase() !== 'open') throw new Error('Match is no longer open.');
        if (m.joinerUserId) throw new Error('Someone already joined.');
        if (exp2 && exp2 <= now) throw new Error('This match has expired.');

        tx.update(ref, {
          status: 'pending',
          joinerUserId: user!.uid,
          joinerJoinedAt: serverTimestamp(),
          expireAt: tsPlus(5 * MIN),
          updatedAt: serverTimestamp(),
        });
      });

      alert('✅ Joined match and deposited coins!');
      window.location.href = `/match/${match.id}/chat`;
    } catch (err: any) {
      console.error('JOIN ERROR:', err);
      const msg = err?.message ?? 'Failed to join match. See console for details.';
      alert(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleJoin}
        disabled={Boolean(disabledReason) || loading}
        className="bg-green-500 text-white font-bold px-5 py-2 rounded-xl shadow-lg hover:bg-green-400 transition disabled:opacity-50"
        title={disabledReason ?? 'Join this match'}
      >
        {loading
          ? 'Joining...'
          : disabledReason
          ? disabledReason
          : 'Join Match'}
      </button>

      {showAddTC && (
        <AddTCModal
          neededTC={neededTC}
          onClose={() => setShowAddTC(false)}
          onConfirm={() => {
            setShowAddTC(false);
            // TODO: hook into your Add TC / wallet top-up flow here
            alert('Redirecting to Add TC flow…');
          }}
        />
      )}

      <details className="mt-2 text-xs text-gray-300">
        <summary>Debug</summary>
        <ul className="list-disc ml-5 mt-1">
          <li>Signed in: {Boolean(user).toString()}</li>
          <li>Wallet connected: {connected.toString()}</li>
          <li>Has publicKey: {Boolean(publicKey).toString()}</li>
          <li>Is creator: {isCreator.toString()}</li>
          <li>Already has joiner: {isFull.toString()}</li>
          <li>Status is open: {isOpen.toString()}</li>
          <li>Match state valid: {matchStateCheck.ok.toString()}</li>
          <li>Escrow authority valid: {escrowAuthCheck.ok.toString()}</li>
          <li>Escrow token valid: {escrowTokCheck.ok.toString()}</li>
        </ul>
      </details>
    </div>
  );
}





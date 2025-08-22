'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import notify from '../../lib/notify';
import { RPC_URL, TREN_MINT } from '../../lib/network';
import { getSubscriptionProgram } from '../utils/getSubscriptionProgram';
import { deriveSubPda } from '../utils/pdas';

/* ---------- types ---------- */
type FirestoreTs =
  | { seconds: number; nanoseconds?: number }
  | string
  | number
  | Date
  | null
  | undefined;

type User = {
  uid: string;
  subscriptionActive?: boolean;
  subscriptionExpires?: FirestoreTs;
};

type Props = {
  user: User;
  months?: number;            // default 1
  vaultToken: string;         // platform TrenCoin ATA (string)
  mascotSrc?: string;         // default '/images/sub-tplay.png' (under /public)
  priceUsd?: number;          // default 14.99 (display only; payment is TC)
};

/* ---------- consts ---------- */
const USD_DEFAULT = 14.99;

/* ---------- helpers ---------- */
function toDateSafe(input: FirestoreTs): Date | null {
  if (!input) return null;
  try {
    if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
    if (typeof input === 'number') {
      const ms = input > 1e12 ? input : input * 1000; // seconds vs ms heuristic
      const d = new Date(ms);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof input === 'string') {
      const d = new Date(input);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof input === 'object' && 'seconds' in input) {
      const ms = (input.seconds ?? 0) * 1000;
      const d = new Date(ms);
      return isNaN(d.getTime()) ? null : d;
    }
  } catch {}
  return null;
}

function formatRenewal(expires: Date | null) {
  if (!expires) return { dateText: 'N/A', relText: '' };
  const dateText = expires.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const diffMs = expires.getTime() - Date.now();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const relText =
    days > 1 ? `in ${days} days` : days === 1 ? 'tomorrow' : days === 0 ? 'today' : 'expired';
  return { dateText, relText };
}

/* ---------- component ---------- */
export default function SubscriptionButton({
  user,
  months = 1,
  vaultToken,
  mascotSrc = '/images/sub-tplay.png',
  priceUsd = USD_DEFAULT,
}: Props) {
  const { publicKey, connected, wallet } = useWallet();

  const [loading, setLoading] = useState(false);
  const [subActive, setSubActive] = useState<boolean>(Boolean(user?.subscriptionActive));
  const [expires, setExpires] = useState<Date | null>(toDateSafe(user?.subscriptionExpires));

  const connection = useMemo(() => new Connection(RPC_URL, 'confirmed'), []);
  const mint = useMemo(() => new PublicKey(TREN_MINT), []);

  const activeAndValid = useMemo(
    () => subActive && !!expires && expires.getTime() > Date.now(),
    [subActive, expires]
  );

  const { dateText, relText } = formatRenewal(expires);

  const onSubscribe = async () => {
    if (!user?.uid) return notify('Please log in.', 'error');
    if (!connected || !publicKey || !wallet) return notify('Please connect your wallet.', 'error');
    if (!vaultToken) return notify('Missing platform vault token account.', 'error');

    setLoading(true);
    try {
      const program = getSubscriptionProgram(wallet.adapter);
      const vaultTokenPk = new PublicKey(vaultToken);

      // ensure payer ATA exists
      const payerToken = await getAssociatedTokenAddress(
        mint,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      const info = await connection.getAccountInfo(payerToken);
      if (!info) {
        const ix = createAssociatedTokenAccountInstruction(
          publicKey,
          payerToken,
          publicKey,
          mint,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );
        const tx = new anchor.web3.Transaction().add(ix);
        await program.provider.sendAndConfirm!(tx, []);
      }

      // derive subscription PDA — seeds = ["sub", payer]
      const subPda = deriveSubPda({ programId: program.programId, payer: publicKey });

      await program.methods
        .subscribe(months)
        .accounts({
          payer: publicKey,
          subscription: subPda,
          payerToken,
          vaultToken: vaultTokenPk,
          mint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      // UI convenience: extend +30 days per month
      const extendMs = months * 30 * 24 * 60 * 60 * 1000;
      const base = activeAndValid && expires ? expires.getTime() : Date.now();
      const newExpiry = new Date(base + extendMs);

      await updateDoc(doc(db, 'users', user.uid), {
        subscriptionActive: true,
        subscriptionExpires: newExpiry,
      });

      setSubActive(true);
      setExpires(newExpiry);
      notify('✅ Subscription active!', 'success');
    } catch (e: any) {
      console.error('SUBSCRIBE ERROR:', e);
      notify(`❌ ${e?.message || String(e)}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative z-10 w-full max-w-xl rounded-3xl border border-white/10 bg-gradient-to-b from-[#1a1429] to-[#0f0b1a] p-6 shadow-[0_0_60px_-20px_rgba(255,215,0,0.25)]">
      {/* Header + Status */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Go Fee-Free</h2>
        <div className="flex items-center gap-3">
          {activeAndValid && (
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
              Active
            </span>
          )}
          {/* Mascot: only when active, bigger size */}
          {activeAndValid && (
            <span className="relative inline-flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full ring-2 ring-yellow-400/70 shadow-[0_0_24px_rgba(255,215,0,0.35)]">
              <Image
                src={mascotSrc}
                alt="Tren Mascot"
                fill
                sizes="80px"
                className="object-cover rounded-full"
                priority
              />
            </span>
          )}
        </div>
      </div>

      {/* CTA / Active button */}
      <button
        onClick={activeAndValid ? undefined : onSubscribe}
        disabled={loading || activeAndValid}
        className={[
          'group flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-center font-bold transition-all',
          activeAndValid
            ? 'cursor-not-allowed bg-neutral-700 text-neutral-300'
            : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg hover:shadow-xl hover:brightness-110 hover:scale-[1.02] active:scale-[0.99] disabled:opacity-60',
        ].join(' ')}
        aria-label={activeAndValid ? 'Subscription active' : 'Start subscription'}
      >
        {activeAndValid ? (
          <>✅ Subscription Active</>
        ) : loading ? (
          <>Processing…</>
        ) : (
          // NOTE: star icon removed permanently per request
          <>
            {priceUsd.toFixed(2)} USD
            <span className="opacity-70">
              &nbsp;(~TC / month{months > 1 ? ` × ${months}` : ''})
            </span>
          </>
        )}
      </button>

      {/* Benefits / Status */}
      <div className="mt-4 space-y-2 text-sm">
        {activeAndValid ? (
          <>
            <p className="text-emerald-300">You’re fee-free on wins while subscribed.</p>
            <p className="text-gray-300">
              Renews on <span className="font-semibold text-white">{dateText}</span>
              {relText ? <span className="text-gray-400"> ({relText})</span> : null}
            </p>
          </>
        ) : (
          <ul className="grid list-disc gap-1 pl-5 text-gray-300 marker:text-yellow-400">
            <li>0% platform fee on wins while active</li>
            <li>Priority match review & support</li>
            <li>Exclusive tournaments & early features</li>
          </ul>
        )}
      </div>

      {/* Fine print */}
      <p className="mt-4 text-xs text-gray-400">
        <span className="font-semibold">USD price is an estimate</span> based on current TrenCoin
        market rates. <span className="font-semibold">Payment is in TrenCoin (TC).</span>{' '}
        Subscription renews automatically until canceled.
      </p>
    </section>
  );
}









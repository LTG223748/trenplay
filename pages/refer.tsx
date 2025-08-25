// pages/refer.js
import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ReferPage() {
  const [user] = useAuthState(auth);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch the user's referralCode from Firestore
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (!ignore) {
          setReferralCode((snap.data()?.referralCode || '').trim());
          setLoading(false);
        }
      } catch (e) {
        console.error('Failed to load referralCode', e);
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [user]);

  // Build the referral link safely on client
  const referralLink = useMemo(() => {
    if (!referralCode) return '';
    const origin =
      typeof window !== 'undefined' && window?.location?.origin
        ? window.location.origin
        : 'https://trenbet.com';
    return `${origin}/signup?ref=${encodeURIComponent(referralCode)}`;
  }, [referralCode]);

  const copy = async () => {
    const text = referralLink || 'https://trenbet.com/signup';
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-12 text-white">
        <h1 className="text-4xl font-bold text-yellow-400 mb-6">👬 Refer a Friend</h1>

        <p className="mb-4 text-lg">
          Invite friends to TrenBet and get rewarded together. When someone signs up with your link
          and completes their <span className="font-semibold">first match</span>, you both get a bonus.
        </p>

        <h2 className="text-2xl text-yellow-300 mt-8 mb-2">📎 Your Referral Link</h2>

        {!user && (
          <div className="bg-[#1a0033] p-4 rounded-lg border border-yellow-400 shadow-inner mb-3">
            Log in to see your referral link.
          </div>
        )}

        {user && loading && (
          <div className="bg-[#1a0033] p-4 rounded-lg border border-yellow-400 shadow-inner mb-3">
            Loading your referral link…
          </div>
        )}

        {user && !loading && (
          <>
            <div className="bg-[#1a0033] text-sm p-4 rounded-lg border border-yellow-400 shadow-inner mb-4 break-all">
              {referralLink || 'Your account doesn’t have a referral code yet.'}
            </div>
            <button
              onClick={copy}
              disabled={!referralLink}
              className={`px-4 py-2 rounded-full font-bold transition
                ${referralLink ? 'bg-yellow-400 text-black hover:bg-yellow-300' : 'bg-gray-600 cursor-not-allowed'}
              `}
            >
              📋 Copy Link
            </button>
          </>
        )}

        <h2 className="text-2xl text-yellow-300 mt-10 mb-2">🎁 Referral Rewards</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            You (referrer) get <span className="text-yellow-400 font-bold">5 TC</span> after your friend’s
            first <span className="font-semibold">completed</span> match.
          </li>
          <li>
            Your friend gets <span className="text-green-400 font-bold">5 TC</span> as a welcome bonus
            after that first completed match.
          </li>
          <li>One-time bonus per referred friend. Anti-spam checks apply.</li>
        </ul>

        <h2 className="text-2xl text-yellow-300 mt-10 mb-2">📣 Tips for Sharing</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Drop it in your group chat or Discord</li>
          <li>Add it to your social bios</li>
          <li>Use it on your stream overlay or TikTok description</li>
        </ul>

        <p className="text-sm mt-10 text-gray-400">
          Tracking for your invites and bonuses will appear in your profile soon.
        </p>
      </div>
    </Layout>
  );
}


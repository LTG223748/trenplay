// /pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect, useMemo, useRef } from 'react';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import AdminBanner from '../components/admin/AdminBanner';
import { NotificationProvider } from '../context/NotificationContext';
import { SidebarProvider } from '../context/SidebarContext';
import Layout from '../components/Layout';
import notify from '../lib/notify';

// ✅ Wallet adapter providers
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { RPC_URL } from '../lib/network';

// --- your listeners, unchanged ---
function GlobalJoinListener() {
  const [user] = useAuthState(auth);
  const lastAlertedMatchRef = useRef<string | null>(null);
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'matches'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const match = change.doc.data() as any;
        const matchId = change.doc.id;
        if (match.creatorUserId === user.uid && match.joinerUserId && lastAlertedMatchRef.current !== matchId) {
          notify(`A player joined your match: ${match.game || 'Game'}`, 'success');
          lastAlertedMatchRef.current = matchId;
        }
      });
    });
    return () => unsub();
  }, [user]);
  return null;
}

function FirestoreNotificationListener() {
  const [user] = useAuthState(auth);
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'notifications'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notif = change.doc.data() as any;
          notify(notif.message || 'You have a new notification!', notif.type || 'info');
        }
      });
    });
    return () => unsub();
  }, [user]);
  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  const endpoint = RPC_URL;
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SidebarProvider>
            <NotificationProvider>
              <AdminBanner />
              <GlobalJoinListener />
              <FirestoreNotificationListener />
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </NotificationProvider>
          </SidebarProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}











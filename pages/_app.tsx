// pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import React, { useEffect, useMemo } from 'react';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import AdminBanner from '../components/admin/AdminBanner';
import { NotificationProvider } from '../context/NotificationContext';
import { SidebarProvider } from '../context/SidebarContext';
import Layout from '../components/Layout';
import notify from '../lib/notify';

// Wallet adapter providers
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { RPC_URL } from '../lib/network';

// 🔔 Firestore notifications (ignores initial snapshot so old docs don't spam)
function FirestoreNotificationListener() {
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'notifications'), where('userId', '==', user.uid));
    let seeded = false;

    const unsub = onSnapshot(q, (snapshot) => {
      if (!seeded) {
        // first load – don't notify for existing docs
        seeded = true;
        return;
      }
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
              {/* Removed GlobalJoinListener — join popups now handled by JoinedMatchWatcher mounted inside Layout */}
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









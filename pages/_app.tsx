// pages/_app.tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";
import React, { useEffect, useMemo, useState } from "react";
import { onSnapshot, collection, query, where, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import AdminBanner from "../components/admin/AdminBanner";
import { NotificationProvider } from "../context/NotificationContext";
import { SidebarProvider } from "../context/SidebarContext";
import Layout from "../components/Layout";
import notify from "../lib/notify";
import OnboardingTour from "../components/OnboardingTour";

// Wallet adapter providers
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { RPC_URL } from "../lib/network";

// 🔔 Firestore notifications
function FirestoreNotificationListener() {
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "notifications"), where("userId", "==", user.uid));
    let seeded = false;

    const unsub = onSnapshot(q, (snapshot) => {
      if (!seeded) {
        seeded = true;
        return;
      }
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const notif = change.doc.data() as any;
          notify(notif.message || "You have a new notification!", notif.type || "info");
        }
      });
    });

    return () => unsub();
  }, [user]);

  return null;
}

export default function App({ Component, pageProps, router }: AppProps & { router: any }) {
  const endpoint = RPC_URL;
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  const [user] = useAuthState(auth);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (!user) return;

    // 👀 Listen to user doc for hasSeenTour
    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.hasSeenTour === false) {
          setShowTour(true);
        }
      }
    });

    return () => unsub();
  }, [user]);

  const handleTourFinish = async () => {
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), { hasSeenTour: true });
      } catch (err) {
        console.error("Failed to update hasSeenTour:", err);
      }
    }
    setShowTour(false);
  };

  const noLayoutRoutes = ["/", "/login", "/signup"];
  const useLayout = !noLayoutRoutes.includes(router.pathname);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SidebarProvider>
            <NotificationProvider>
              <AdminBanner />
              <FirestoreNotificationListener />

              {/* 🎉 Onboarding tour (always overlay on top) */}
              {showTour && (
                <div className="fixed inset-0 z-[9999] pointer-events-none">
                  <OnboardingTour onFinish={handleTourFinish} />
                </div>
              )}

              {useLayout ? (
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              ) : (
                <Component {...pageProps} />
              )}
            </NotificationProvider>
          </SidebarProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}













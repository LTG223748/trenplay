// components/AuthGuard.tsx
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { auth } from "../lib/firebase";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login with redirect param
      const redirect = encodeURIComponent(router.asPath);
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null; // Redirecting
  }

  return <>{children}</>;
}

// hooks/useAdminCheck.tsx
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function useAdminCheck() {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;

    const checkAdmin = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const data = userDoc.data();
      if (data?.isAdmin) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        router.replace('/'); // redirect non-admins
      }
    };
    checkAdmin();
  }, [user, loading, router]);

  return { isAdmin, loading: loading || isAdmin === null };
}

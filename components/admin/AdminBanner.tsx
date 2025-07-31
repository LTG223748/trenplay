import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../lib/firebase';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';

export default function AdminBanner() {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid)).then(docSnap => {
      setIsAdmin(!!docSnap.data()?.isAdmin);
    });
  }, [user]);

  if (!isAdmin) return null;

  return (
    <div className="bg-yellow-400 text-black p-2 text-center font-bold">
      🛡️ You are logged in as <span className="underline">Admin</span>
    </div>
  );
}

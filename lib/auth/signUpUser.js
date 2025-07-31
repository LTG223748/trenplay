import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase'; // Make sure this path is correct

// List your custom avatar paths here:
const STARTER_AVATARS = [
  '/avatars/Starter-1.png',
  '/avatars/Starter-2.png',
  '/avatars/Starter-3.png',
  '/avatars/Starter-4.png',
  '/avatars/Starter-5.png',
  '/avatars/Starter-6.png',
  '/avatars/Starter-7.png',
  '/avatars/Starter-8.png',
  '/avatars/Starter-9.png',
  '/avatars/Starter-10.png',
];

// Randomly select a starter avatar
function pickRandomAvatar() {
  return STARTER_AVATARS[Math.floor(Math.random() * STARTER_AVATARS.length)];
}
export async function signUpUser(email, password, username, referralInput) {
  // ...existing signup logic

  const referralCode = generateReferralCode(username);
function generateReferralCode(username) {
  const base = username.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return (base + rand).slice(0, 8);
}
  await setDoc(doc(db, 'users', user.uid), {
    email,
    username,
    referralCode,               // << Your user's code
    referredBy: referralInput || null,  // << The code they used (if any)
    referralRewarded: false,    // << Has this user triggered a referral reward yet?
    // ...other fields (avatar, sub, etc)
  });

  return user;
}
export async function signUpUser(email, password, username) {
  // 1. Register with Firebase Auth
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCred.user;

  // 2. Set displayName in Auth profile
  await updateProfile(user, { displayName: username });

  // 3. Create user doc in Firestore at /users/{uid} with all starter fields
  await setDoc(doc(db, 'users', user.uid), {
    email,
    username,
    createdAt: serverTimestamp(),
    division: 'Rookie',
    elo: 500,
    trenCoins: 0,
    isAdmin: false,
    role: 'user',
    wins: 0,
    losses: 0,
    avatar: pickRandomAvatar(),  // 🔥 Set a random starter avatar
    // Subscription fields
    subscriptionActive: false,
    subscriptionExpires: null,
    // add more fields if needed
  });

  return user;
}




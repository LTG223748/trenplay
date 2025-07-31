// /lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBfWJdrQ1Yp6ybsXmfZxWtMq7QwziMgVpY",
  authDomain: "trenbet.firebaseapp.com",
  projectId: "trenbet",
  storageBucket: "trenbet.appspot.com", // 🔥 FIXED HERE
  messagingSenderId: "1093546818674",
  appId: "1:1093546818674:web:7c03ff53cbe8cdaab816eb",
  measurementId: "G-JKB02XBKBL"
};

// Make sure the app is only initialized once (for Next.js/dev hot reload)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);


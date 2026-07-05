// 🔧 PLACEHOLDER — Replace with your actual Firebase config from:
// https://console.firebase.google.com → Project Settings → Your apps → Web app
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCbTvkQUw9tAK9uEF6or4R_UgPFZxv2Mhg",
  authDomain: "magadige-1fce9.firebaseapp.com",
  projectId: "magadige-1fce9",
  storageBucket: "magadige-1fce9.firebasestorage.app",
  messagingSenderId: "725250757631",
  appId: "1:725250757631:web:71f0b9720804c9ef8b8dca"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

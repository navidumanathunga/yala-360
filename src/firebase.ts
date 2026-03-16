import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "yala-360",
  appId: "1:330576963431:web:3bf0e8d51ffea865c3b1c2",
  storageBucket: "yala-360.firebasestorage.app",
  apiKey: "AIzaSyDx3SBGyoB2gZC3qhUL46E0UIjIoTNTpRE",
  authDomain: "yala-360.firebaseapp.com",
  messagingSenderId: "330576963431",
  measurementId: "G-TDTVRX8D76"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

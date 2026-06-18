import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBomyikLgZpw75qMiNZU-vJtWbLhiQ6ZoM",
  authDomain: "nazabet-cfad6.firebaseapp.com",
  projectId: "nazabet-cfad6",
  storageBucket: "nazabet-cfad6.firebasestorage.app",
  messagingSenderId: "477509587354",
  appId: "1:477509587354:web:284481971d4de2f246aa23"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

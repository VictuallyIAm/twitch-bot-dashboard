import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQSA43wri1tHGIvlnbjTJ1wVajQIXkYSY",
  authDomain: "ttv-bot-dashboard.firebaseapp.com",
  projectId: "ttv-bot-dashboard",
  storageBucket: "ttv-bot-dashboard.firebasestorage.app",
  messagingSenderId: "193511610358",
  appId: "1:193511610358:web:79af1d387f684b5a1399d7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;

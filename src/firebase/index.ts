import { initializeApp } from 'firebase/app'
import { getFirestore, collection } from 'firebase/firestore'
// ... other firebase imports

const firebaseConfig = {
  apiKey: "AIzaSyBQSA43wri1tHGIvlnbjTJ1wVajQIXkYSY",
  authDomain: "ttv-bot-dashboard.firebaseapp.com",
  projectId: "ttv-bot-dashboard",
  storageBucket: "ttv-bot-dashboard.firebasestorage.app",
  messagingSenderId: "193511610358",
  appId: "1:193511610358:web:79af1d387f684b5a1399d7",
  measurementId: "G-0GL9BK9SCW"
};
export const firebaseApp = initializeApp(firebaseConfig);

// used for the firestore refs
const db = getFirestore(firebaseApp)

// here we can export reusable database references
export const todosRef = collection(db, 'todos')
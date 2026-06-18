import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCTBoB3PsPsikcZJCijmZI23J_kiSCLqhY",
  authDomain: "nexstock-9353e.firebaseapp.com",
  projectId: "nexstock-9353e",
  storageBucket: "nexstock-9353e.firebasestorage.app",
  messagingSenderId: "638318795536",
  appId: "1:638318795536:web:8650d6399987fd3772e395",
  measurementId: "G-69C4YW4N78"
};

// Prevent duplicate app initialization during HMR
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);

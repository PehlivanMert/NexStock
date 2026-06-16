import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Replace with actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDummyKey-xxxxxxxxxxxxxxxx",
  authDomain: "envanter-app.firebaseapp.com",
  projectId: "envanter-app",
  storageBucket: "envanter-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:xxxxxxxxxxxxxxx"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

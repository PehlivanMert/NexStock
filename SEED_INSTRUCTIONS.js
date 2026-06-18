/**
 * NexStock Admin Seed Utility
 *
 * Firebase Console > Authentication'da test@test.com / test123 kullanıcısı
 * oluşturduktan sonra, bu dosyayı tarayıcı konsolunda çalıştırın:
 *
 * 1. Uygulamayı açın (http://localhost:5173)
 * 2. Tarayıcı geliştirici konsolunu açın (F12)
 * 3. Aşağıdaki kodu konsola yapıştırın ve çalıştırın
 */

// ============================================================
// TARAYICI KONSOLUNA YAPIŞTIRILACAK KOD:
// ============================================================

/*
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyCTBoB3PsPsikcZJCijmZI23J_kiSCLqhY",
  authDomain: "nexstock-9353e.firebaseapp.com",
  projectId: "nexstock-9353e",
  storageBucket: "nexstock-9353e.firebasestorage.app",
  messagingSenderId: "638318795536",
  appId: "1:638318795536:web:8650d6399987fd3772e395"
};

const app = initializeApp(firebaseConfig, 'seed');
const db = getFirestore(app);
const auth = getAuth(app);

const cred = await signInWithEmailAndPassword(auth, 'test@test.com', 'test123');
const uid = cred.user.uid;

await setDoc(doc(db, 'users', uid), {
  name: 'Admin',
  email: 'test@test.com',
  role: 'admin',
  location: 'Tüm Lokasyonlar',
  status: 'Aktif',
  phone: '',
  notifications: { lowStock: true, transfer: true, count: false },
  createdAt: new Date().toISOString(),
});

await setDoc(doc(db, 'appdata', 'locations'), {
  list: [
    { id: 'loc-1', name: 'Merkez Depo', type: 'warehouse', address: 'İstanbul', status: 'active' },
    { id: 'loc-2', name: 'Şube Mağaza', type: 'store', address: 'İstanbul', status: 'active' },
  ]
});

await setDoc(doc(db, 'appdata', 'products'), { list: [] });
await setDoc(doc(db, 'appdata', 'inventory'), { list: [] });

console.log('✅ Admin seed tamamlandı! UID:', uid);
*/

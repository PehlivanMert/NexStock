/**
 * Firestore Service Layer - Cost-optimized for Spark plan
 *
 * Strategy to minimize reads/writes:
 * 1. All lists (products, inventory, locations) are stored as sub-documents
 *    or use batched writes to minimize round-trips.
 * 2. User profile data is stored in Firestore under /users/{uid}.
 * 3. Activity log uses addDoc (single write per action).
 * 4. onSnapshot listeners are used only for real-time collections that need it.
 * 5. Data is cached in Zustand - Firestore read happens once on login.
 */

import {
  doc, getDoc, setDoc, updateDoc, collection,
  addDoc, query, orderBy, limit, getDocs,
  serverTimestamp, writeBatch, deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';

// ─── USER PROFILE ────────────────────────────────────────────────────────────

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (snap.exists()) return { uid, ...snap.data() };
  return null;
}

export async function setUserProfile(uid, data) {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
}

export async function updateUserProfile(uid, updates) {
  await updateDoc(doc(db, 'users', uid), updates);
}

// ─── APP DATA (single document per collection for cost efficiency) ────────────

// Collections stored as single doc to minimize reads (1 read = all data)
const APP_DOC = 'nexstock'; // single document ID

export async function loadAppData() {
  const [productsSnap, inventorySnap, locationsSnap] = await Promise.all([
    getDoc(doc(db, 'appdata', 'products')),
    getDoc(doc(db, 'appdata', 'inventory')),
    getDoc(doc(db, 'appdata', 'locations')),
  ]);

  return {
    products: productsSnap.exists() ? (productsSnap.data().list || []) : [],
    inventory: inventorySnap.exists() ? (inventorySnap.data().list || []) : [],
    locations: locationsSnap.exists() ? (locationsSnap.data().list || []) : [],
    lastUpdated: {
      products: productsSnap.exists() && productsSnap.data().updatedAt ? productsSnap.data().updatedAt.toDate().toISOString() : null,
      inventory: inventorySnap.exists() && inventorySnap.data().updatedAt ? inventorySnap.data().updatedAt.toDate().toISOString() : null,
      locations: locationsSnap.exists() && locationsSnap.data().updatedAt ? locationsSnap.data().updatedAt.toDate().toISOString() : null,
    }
  };
}

export async function saveProducts(productsList) {
  await setDoc(doc(db, 'appdata', 'products'), { list: productsList, updatedAt: serverTimestamp() });
}

export async function saveInventory(inventoryList) {
  await setDoc(doc(db, 'appdata', 'inventory'), { list: inventoryList, updatedAt: serverTimestamp() });
}

export async function saveLocations(locationsList) {
  await setDoc(doc(db, 'appdata', 'locations'), { list: locationsList, updatedAt: serverTimestamp() });
}

// ─── TRANSFER LOG ─────────────────────────────────────────────────────────────
// Each transfer = 1 addDoc write. Read last 50 on demand.

export async function addTransferLog(transferData) {
  await addDoc(collection(db, 'transferLog'), {
    ...transferData,
    createdAt: serverTimestamp(),
  });
}

export async function loadTransferLog(limitCount = 50) {
  const q = query(collection(db, 'transferLog'), orderBy('createdAt', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
}

// ─── COUNT LOGS ───────────────────────────────────────────────────────────────

export async function addCountLog(countData) {
  await addDoc(collection(db, 'countLogs'), {
    ...countData,
    createdAt: serverTimestamp(),
  });
}

export async function loadCountLogs(limitCount = 30) {
  const q = query(collection(db, 'countLogs'), orderBy('createdAt', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
}

// ─── ACTIVITY LOG ─────────────────────────────────────────────────────────────
// Tracks all important user actions for admin audit trail.
// 1 write per action. Read last 100 on demand (admin only).

export async function logActivity({ action, userId, userName, userRole, details = {} }) {
  try {
    await addDoc(collection(db, 'activityLog'), {
      action,        // e.g. 'ADD_PRODUCT', 'DELETE_PRODUCT', 'TRANSFER', 'COUNT', 'ADD_USER', 'DELETE_USER', 'EDIT_PRODUCT'
      userId,
      userName,
      userRole,
      details,       // action-specific data (productName, quantity, etc.)
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    // Activity log failure should never break the main operation
    console.error('Activity log write failed:', e);
  }
}

export async function loadActivityLog(limitCount = 100) {
  const q = query(collection(db, 'activityLog'), orderBy('timestamp', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── USER MANAGEMENT (admin operations) ──────────────────────────────────────
// List all users from Firestore /users collection

export async function loadAllUsers() {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}

export async function deleteUserDoc(uid) {
  await deleteDoc(doc(db, 'users', uid));
}

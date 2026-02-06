import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function getApp(): FirebaseApp {
  if (!firebaseConfig.apiKey) {
    throw new Error('Firebase API key is not configured. Set NEXT_PUBLIC_FIREBASE_API_KEY.');
  }
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
}

// Lazy initialization — Firebase is only initialized when first accessed at runtime,
// not at module import time. This allows the build to succeed without Firebase env vars.
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

function ensureInitialized() {
  if (!_app) {
    _app = getApp();
    _auth = getAuth(_app);
    _db = getFirestore(_app);
    _storage = getStorage(_app);
  }
}

export const auth: Auth = new Proxy({} as Auth, {
  get(_, prop) { ensureInitialized(); return (_auth as never)[prop]; },
});

export const db: Firestore = new Proxy({} as Firestore, {
  get(_, prop) { ensureInitialized(); return (_db as never)[prop]; },
});

export const storage: FirebaseStorage = new Proxy({} as FirebaseStorage, {
  get(_, prop) { ensureInitialized(); return (_storage as never)[prop]; },
});

const app = new Proxy({} as FirebaseApp, {
  get(_, prop) { ensureInitialized(); return (_app as never)[prop]; },
});

export default app;

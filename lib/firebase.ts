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

// Conditionally initialize Firebase.
// When env vars exist (runtime, Vercel): creates real instances eagerly.
// When env vars are missing (CI build): exports are null (cast to typed).
// This avoids Proxy pitfalls with Firebase's internal instanceof/assertion checks.
const hasConfig = !!firebaseConfig.apiKey;

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

if (hasConfig) {
  _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  _auth = getAuth(_app);
  _db = getFirestore(_app);
  _storage = getStorage(_app);
}

// Cast to non-optional types. At runtime with env vars these are real instances.
// During CI builds they're null, but build doesn't execute runtime code paths.
export const auth = _auth as unknown as Auth;
export const db = _db as unknown as Firestore;
export const storage = _storage as unknown as FirebaseStorage;
export default (_app as unknown as FirebaseApp);

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';

interface UserData {
  userId: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: 'user' | 'creator' | 'admin';
  creatorProfileId: string | null;
  subscription: {
    plan: 'free' | 'premium';
    status: string;
  };
  following: string[];
  followingCount: number;
  saved?: string[]; // Made optional to prevent errors with old data, but initialized as []
  createdAt?: any;
  updatedAt?: any;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (firebaseUser: User) => {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) {
      setUserData(userDoc.data() as UserData);
    }
    return userDoc.exists();
  };

  const createUserDocument = async (firebaseUser: User, displayName?: string) => {
    const newUserData = {
      userId: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: displayName || firebaseUser.displayName || 'User',
      photoURL: firebaseUser.photoURL,
      role: 'user',
      creatorProfileId: null,
      subscription: {
        plan: 'free',
        status: 'active',
      },
      following: [],
      followingCount: 0,
      saved: [],
      preferences: {
        languages: ['English'],
        regions: [],
        topics: [],
        theme: 'system',
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);
    setUserData(newUserData as UserData);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const exists = await fetchUserData(firebaseUser);
        if (!exists) {
          await createUserDocument(firebaseUser);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(firebaseUser, { displayName });
    await createUserDocument(firebaseUser, displayName);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const { user: firebaseUser } = await signInWithPopup(auth, provider);
    const exists = await fetchUserData(firebaseUser);
    if (!exists) {
      await createUserDocument(firebaseUser);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserData(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      logout,
      resetPassword,
      refreshUserData,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import { useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export function useSaved() {
  const { user, userData, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);

  const isSaved = (itemId: string) => {
    return userData?.saved?.includes(itemId) || false;
  };

  const saveItem = async (itemId: string) => {
    if (!user) {
      throw new Error('Must be logged in to save');
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        saved: arrayUnion(itemId),
        updatedAt: new Date(),
      });

      await refreshUserData();
    } finally {
      setLoading(false);
    }
  };

  const unsaveItem = async (itemId: string) => {
    if (!user) {
      throw new Error('Must be logged in to unsave');
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        saved: arrayRemove(itemId),
        updatedAt: new Date(),
      });

      await refreshUserData();
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (itemId: string) => {
    if (isSaved(itemId)) {
      await unsaveItem(itemId);
    } else {
      await saveItem(itemId);
    }
  };

  return {
    isSaved,
    saveItem,
    unsaveItem,
    toggleSave,
    loading,
    savedCount: userData?.saved?.length || 0,
  };
}

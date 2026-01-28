import { useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/contexts/AuthContext';

export function useFollow() {
  const { user, userData, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);

  const isFollowing = (creatorId: string) => {
    return userData?.following?.includes(creatorId) || false;
  };

  const followCreator = async (creatorId: string) => {
    if (!user || !userData) {
      throw new Error('Must be logged in to follow');
    }

    // Check follow limit for free users
    if (userData.subscription.plan === 'free' && userData.followingCount >= 5) {
      throw new Error('Free plan limited to 5 follows. Upgrade to Premium!');
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        following: arrayUnion(creatorId),
        followingCount: increment(1),
        updatedAt: new Date(),
      });

      await updateDoc(doc(db, 'creators', creatorId), {
        'stats.followerCount': increment(1),
      });

      await refreshUserData();
    } finally {
      setLoading(false);
    }
  };

  const unfollowCreator = async (creatorId: string) => {
    if (!user) {
      throw new Error('Must be logged in to unfollow');
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        following: arrayRemove(creatorId),
        followingCount: increment(-1),
        updatedAt: new Date(),
      });

      await updateDoc(doc(db, 'creators', creatorId), {
        'stats.followerCount': increment(-1),
      });

      await refreshUserData();
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async (creatorId: string) => {
    if (isFollowing(creatorId)) {
      await unfollowCreator(creatorId);
    } else {
      await followCreator(creatorId);
    }
  };

  return {
    isFollowing,
    followCreator,
    unfollowCreator,
    toggleFollow,
    loading,
    followingCount: userData?.followingCount || 0,
    followLimit: userData?.subscription.plan === 'free' ? 5 : Infinity,
  };
}

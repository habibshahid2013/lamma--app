import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Creator as BaseCreator } from '@/lib/types/creator';

interface Creator extends BaseCreator {
  creatorId: string;
  stats?: {
    followerCount: number;
  };
}

export function useCreators(filters?: {
  category?: string;
  region?: string;
  language?: string;
  tier?: string;
  featured?: boolean;
  trending?: boolean;
  isHistorical?: boolean;
  gender?: string;
  limitCount?: number;
}) {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use a ref to track if the effect has run to prevent infinite loops if filters change rapidly or obj identity issues
  // But strictly following user code request, I should use useMemo or stringify for dependency.
  // The user provided code uses JSON.stringify(filters) in dependency array.
  
  useEffect(() => {
    const fetchCreators = async () => {
      try {
        setLoading(true);
        let q = query(collection(db, 'creators'));
        
        const constraints: any[] = [];
        
        if (filters?.category) {
          constraints.push(where('category', '==', filters.category));
        }
        if (filters?.region) {
          constraints.push(where('region', '==', filters.region));
        }
        if (filters?.language) {
          constraints.push(where('languages', 'array-contains', filters.language));
        }
        if (filters?.featured !== undefined) {
          constraints.push(where('featured', '==', filters.featured));
        }
        if (filters?.isHistorical !== undefined) {
          constraints.push(where('isHistorical', '==', filters.isHistorical));
        }
        if (filters?.gender) {
          constraints.push(where('gender', '==', filters.gender));
        }
        if (filters?.limitCount) {
          constraints.push(limit(filters.limitCount));
        }

        if (constraints.length > 0) {
          q = query(collection(db, 'creators'), ...constraints);
        }

        const snapshot = await getDocs(q);
        const creatorsData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          creatorId: doc.id,
        })) as Creator[];
        
        setCreators(creatorsData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, [JSON.stringify(filters)]);

  return { creators, loading, error };
}

export function useCreatorBySlug(slug: string) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const slugDoc = await getDoc(doc(db, 'slugs', slug));
        
        if (!slugDoc.exists()) {
          setCreator(null);
          setLoading(false);
          return;
        }
        
        const creatorId = slugDoc.data().creatorId;
        const creatorDoc = await getDoc(doc(db, 'creators', creatorId));
        
        if (creatorDoc.exists()) {
          setCreator({ ...creatorDoc.data(), creatorId: creatorDoc.id } as Creator);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchCreator();
  }, [slug]);

  return { creator, loading };
}

// Convenience hooks
export const useFeaturedCreators = (limitCount = 10) => 
  useCreators({ featured: true, limitCount });

export const useWomenScholars = (limitCount = 10) => 
  useCreators({ gender: 'female', limitCount });

export const useHistoricalScholars = (limitCount = 10) => 
  useCreators({ isHistorical: true, limitCount });

export const useCreatorsByLanguage = (language: string, limitCount = 10) => 
  useCreators({ language, limitCount });

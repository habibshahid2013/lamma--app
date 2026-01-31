/**
 * Simple Firestore-based Cache
 * Caches API responses to reduce redundant calls
 */

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

const CACHE_COLLECTION = 'api_cache';
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry<T> {
  data: T;
  cachedAt: Timestamp;
  ttl: number;
}

/**
 * Get cached data
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const docRef = doc(db, CACHE_COLLECTION, key);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) return null;

    const entry = snapshot.data() as CacheEntry<T>;
    const age = Date.now() - entry.cachedAt.toMillis();

    // Check if expired
    if (age > entry.ttl) {
      return null; // Expired
    }

    return entry.data;
  } catch (error) {
    console.warn('Cache get error:', error);
    return null;
  }
}

/**
 * Set cached data
 */
export async function setCached<T>(key: string, data: T, ttl = DEFAULT_TTL): Promise<void> {
  try {
    const docRef = doc(db, CACHE_COLLECTION, key);
    await setDoc(docRef, {
      data,
      cachedAt: Timestamp.now(),
      ttl,
    });
  } catch (error) {
    console.warn('Cache set error:', error);
  }
}

/**
 * Helper: Get or fetch with cache
 */
export async function getOrFetch<T>(
  key: string, 
  fetcher: () => Promise<T>, 
  ttl = DEFAULT_TTL
): Promise<T | null> {
  // Try cache first
  const cached = await getCached<T>(key);
  if (cached) {
    console.log(`📦 Cache hit: ${key}`);
    return cached;
  }

  // Fetch fresh
  console.log(`🌐 Cache miss, fetching: ${key}`);
  const fresh = await fetcher();
  
  if (fresh) {
    await setCached(key, fresh, ttl);
  }

  return fresh;
}

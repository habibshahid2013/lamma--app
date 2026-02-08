import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  Timestamp
} from 'firebase/firestore';

export type QueueStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface QueueItem {
  id: string;
  name: string;
  status: QueueStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  logs: string[];
  result?: any;
  error?: string;
  stage?: 'discovery' | 'verification' | 'enrichment';
}

const QUEUE_COLLECTION = 'creator_queue';

/**
 * Add a new creator to the processing queue
 */
export async function addToQueue(name: string) {
  try {
    const docRef = await addDoc(collection(db, QUEUE_COLLECTION), {
      name,
      status: 'pending',
      logs: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding to queue:', error);
    throw error;
  }
}

/**
 * Get the next pending item from the queue
 */
export async function getNextQueueItem(): Promise<QueueItem | null> {
  const q = query(
    collection(db, QUEUE_COLLECTION),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'asc'),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const docData = snapshot.docs[0];
  return {
    id: docData.id,
    ...docData.data()
  } as QueueItem;
}

/**
 * Update the status of a queue item
 */
export async function updateQueueStatus(id: string, updates: Partial<QueueItem>) {
  const docRef = doc(db, QUEUE_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Log a message to the queue item
 */
export async function logQueueMessage(id: string, message: string) {
  const docRef = doc(db, QUEUE_COLLECTION, id);
  await updateDoc(docRef, {
    logs: arrayUnion(`[${new Date().toISOString()}] ${message}`),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get all queue items (for Admin UI)
 */
export async function getQueueItems(): Promise<QueueItem[]> {
  const q = query(
    collection(db, QUEUE_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  } as QueueItem));
}

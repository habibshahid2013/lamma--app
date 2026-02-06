/**
 * GET /api/data-quality/audit
 * Runs a data quality audit on all creators (seed data + Firestore)
 * Returns a detailed report with scores, issues, and fix suggestions
 */

import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Creator } from '@/lib/types/creator';
import { auditAllCreators } from '@/lib/data-quality';
import { CREATORS as SEED_CREATORS } from '@/lib/data/creators';

export async function GET() {
  try {
    // Try Firestore first, fall back to seed data
    let creators: Creator[] = [];
    let source = 'seed';

    try {
      const snapshot = await getDocs(collection(db, 'creators'));
      if (snapshot.size > 0) {
        creators = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Creator[];
        source = 'firestore';
      }
    } catch {
      // Firestore unavailable, use seed data
    }

    if (creators.length === 0) {
      creators = SEED_CREATORS;
      source = 'seed';
    }

    const report = auditAllCreators(creators);

    return NextResponse.json({
      source,
      ...report,
    });
  } catch (error) {
    console.error('Audit error:', error);
    return NextResponse.json(
      { error: 'Failed to run audit', details: String(error) },
      { status: 500 }
    );
  }
}

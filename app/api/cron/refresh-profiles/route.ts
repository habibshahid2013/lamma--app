// src/app/api/cron/refresh-profiles/route.ts
// Cron job for auto-refreshing stale profiles
// Run daily via Vercel Cron: 0 2 * * * (2 AM UTC)

import { NextRequest, NextResponse } from 'next/server';
import { AutoPipeline } from '@/lib/profile-pipeline';

// Vercel cron authorization
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret in production
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    console.log('\n🕐 Cron: Starting profile refresh job');
    const startTime = Date.now();

    const pipeline = new AutoPipeline();
    const { refreshed, results } = await pipeline.refreshStaleProfiles(10);

    const processingTime = Date.now() - startTime;
    console.log(`✅ Cron complete: ${refreshed} profiles refreshed in ${(processingTime / 1000).toFixed(1)}s`);

    return NextResponse.json({
      success: true,
      refreshed,
      total: results.length,
      processingTimeMs: processingTime,
      results: results.map(r => ({
        creatorId: r.creatorId,
        success: r.success,
        action: r.action,
        confidence: r.confidence,
      })),
    });

  } catch (error) {
    console.error('❌ Cron Error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

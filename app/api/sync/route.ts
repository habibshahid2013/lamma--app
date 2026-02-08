// src/app/api/sync/route.ts
// Sync API - Enriches existing profiles with API data
// Includes timeout handling to prevent hung requests

import { NextRequest, NextResponse } from 'next/server';
import { ProfileSyncService } from '@/lib/profile-pipeline/sync-service';
import { withTimeout, TimeoutError } from '@/lib/utils/fetch-with-timeout';
import { verifyAdmin } from '@/lib/admin-auth';

// Timeout for single profile sync (60 seconds)
const SINGLE_SYNC_TIMEOUT_MS = 60000;

// Timeout for batch sync (5 minutes - 20 profiles * ~15 seconds each with buffer)
const BATCH_SYNC_TIMEOUT_MS = 300000;

// Timeout for getting profile list (30 seconds)
const LIST_TIMEOUT_MS = 30000;

export async function POST(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if (!authResult.authorized) return authResult.response;

  const startTime = Date.now();

  try {
    const body = await request.json();
    const { action, creatorId, creatorIds } = body;

    const syncService = new ProfileSyncService();

    // Sync single profile
    if (action === 'single' && creatorId) {
      console.log(`\n🔄 API: Syncing single profile "${creatorId}"`);

      try {
        const result = await withTimeout(
          syncService.syncProfile(creatorId),
          SINGLE_SYNC_TIMEOUT_MS,
          `Sync profile ${creatorId}`
        );

        const duration = Date.now() - startTime;
        console.log(`✅ Single sync completed in ${duration}ms`);

        return NextResponse.json({
          success: result.success,
          result,
          durationMs: duration,
        });
      } catch (error) {
        if (error instanceof TimeoutError) {
          console.error(`⏱️ Single sync timeout for ${creatorId}`);
          return NextResponse.json({
            success: false,
            error: `Sync timed out after ${SINGLE_SYNC_TIMEOUT_MS / 1000} seconds`,
            creatorId,
          }, { status: 504 });
        }
        throw error;
      }
    }

    // Sync batch of profiles
    if (action === 'batch' && Array.isArray(creatorIds)) {
      if (creatorIds.length > 20) {
        return NextResponse.json(
          { error: 'Maximum 20 profiles per batch' },
          { status: 400 }
        );
      }

      console.log(`\n📦 API: Syncing batch of ${creatorIds.length} profiles`);

      try {
        const batchResult = await withTimeout(
          syncService.syncBatch(creatorIds),
          BATCH_SYNC_TIMEOUT_MS,
          `Batch sync of ${creatorIds.length} profiles`
        );

        const duration = Date.now() - startTime;
        console.log(`✅ Batch sync completed in ${duration}ms`);

        return NextResponse.json({
          success: true,
          ...batchResult,
          durationMs: duration,
        });
      } catch (error) {
        if (error instanceof TimeoutError) {
          console.error(`⏱️ Batch sync timeout for ${creatorIds.length} profiles`);
          return NextResponse.json({
            success: false,
            error: `Batch sync timed out after ${BATCH_SYNC_TIMEOUT_MS / 1000} seconds`,
            processed: 0,
            total: creatorIds.length,
          }, { status: 504 });
        }
        throw error;
      }
    }

    // Get all profile IDs
    if (action === 'all') {
      console.log(`\n🔄 API: Getting all profiles for sync`);

      try {
        const allIds = await withTimeout(
          syncService.getAllProfileIds(),
          LIST_TIMEOUT_MS,
          'Get all profile IDs'
        );

        return NextResponse.json({
          success: true,
          total: allIds.length,
          creatorIds: allIds,
          message: `Found ${allIds.length} profiles. Use POST with action:'batch' to sync in batches of 20.`,
        });
      } catch (error) {
        if (error instanceof TimeoutError) {
          console.error(`⏱️ Get all profiles timeout`);
          return NextResponse.json({
            success: false,
            error: `Getting profile list timed out after ${LIST_TIMEOUT_MS / 1000} seconds`,
          }, { status: 504 });
        }
        throw error;
      }
    }

    // Refresh YouTube stats for a profile
    if (action === 'refresh-youtube' && creatorId) {
      console.log(`\n📺 API: Refreshing YouTube stats for "${creatorId}"`);

      try {
        const result = await withTimeout(
          syncService.refreshYouTubeStats(creatorId),
          SINGLE_SYNC_TIMEOUT_MS,
          `Refresh YouTube for ${creatorId}`
        );
        return NextResponse.json(result);
      } catch (error) {
        if (error instanceof TimeoutError) {
          return NextResponse.json({
            success: false,
            error: `YouTube refresh timed out`,
          }, { status: 504 });
        }
        throw error;
      }
    }

    return NextResponse.json({
      message: 'Sync API',
      endpoints: {
        'POST { action: "single", creatorId }': 'Sync single profile',
        'POST { action: "batch", creatorIds: [...] }': 'Sync batch (max 20)',
        'POST { action: "all" }': 'Get all profile IDs',
        'POST { action: "refresh-youtube", creatorId }': 'Refresh YouTube stats',
      },
    });

  } catch (error) {
    console.error('❌ Sync API Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if (!authResult.authorized) return authResult.response;

  try {
    const syncService = new ProfileSyncService();

    const needsSync = await withTimeout(
      syncService.getProfilesToSync(50),
      LIST_TIMEOUT_MS,
      'Get profiles needing sync'
    );

    return NextResponse.json({
      profilesNeedingSync: needsSync.length,
      creatorIds: needsSync,
    });
  } catch (error) {
    if (error instanceof TimeoutError) {
      return NextResponse.json({
        error: 'Request timed out while getting profiles',
      }, { status: 504 });
    }

    console.error('❌ Sync API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

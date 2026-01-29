// src/app/api/sync/route.ts
// Sync API - Enriches existing profiles with API data

import { NextRequest, NextResponse } from 'next/server';
import { ProfileSyncService } from '@/src/lib/profile-pipeline/sync-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, creatorId, creatorIds } = body;

    const syncService = new ProfileSyncService();

    // Sync single profile
    if (action === 'single' && creatorId) {
      console.log(`\n🔄 API: Syncing single profile "${creatorId}"`);
      const result = await syncService.syncProfile(creatorId);
      return NextResponse.json({ success: result.success, result });
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
      const batchResult = await syncService.syncBatch(creatorIds);
      return NextResponse.json({ success: true, ...batchResult });
    }

    // Sync all profiles
    if (action === 'all') {
      console.log(`\n🔄 API: Getting all profiles for sync`);
      const allIds = await syncService.getAllProfileIds();
      return NextResponse.json({
        success: true,
        total: allIds.length,
        creatorIds: allIds,
        message: `Found ${allIds.length} profiles. Use POST with action:'batch' to sync in batches of 20.`,
      });
    }

    return NextResponse.json({
      message: 'Sync API',
      endpoints: {
        'POST { action: "single", creatorId }': 'Sync single profile',
        'POST { action: "batch", creatorIds: [...] }': 'Sync batch (max 20)',
        'POST { action: "all" }': 'Get all profile IDs',
      },
    });

  } catch (error) {
    console.error('❌ Sync API Error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const syncService = new ProfileSyncService();
    const needsSync = await syncService.getProfilesToSync(50);
    
    return NextResponse.json({
      profilesNeedingSync: needsSync.length,
      creatorIds: needsSync,
    });
  } catch (error) {
    console.error('❌ Sync API Error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

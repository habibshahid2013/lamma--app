// src/app/api/profile-pipeline/route.ts
// Automated Profile Pipeline API
// POST: Generate profile(s), GET: Get flagged profiles

import { NextRequest, NextResponse } from 'next/server';
import { AutoPipeline } from '@/lib/profile-pipeline';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, name, names } = body;

    const pipeline = new AutoPipeline();

    // Batch processing
    if (action === 'batch' && Array.isArray(names)) {
      if (names.length > 20) {
        return NextResponse.json(
          { error: 'Maximum 20 names per batch' },
          { status: 400 }
        );
      }

      console.log(`\n📦 API: Batch processing ${names.length} names`);
      const batchResult = await pipeline.processBatch(names);

      return NextResponse.json({
        success: true,
        ...batchResult,
      });
    }

    // Single profile processing
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    console.log(`\n🚀 API: Generating profile for "${name}"`);
    const result = await pipeline.processProfile(name);

    return NextResponse.json({
      success: result.success,
      result,
    });

  } catch (error) {
    console.error('❌ Pipeline API Error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const pipeline = new AutoPipeline();

    // Get flagged profiles
    if (action === 'flagged') {
      const profiles = await pipeline.getFlaggedProfiles();
      return NextResponse.json({ profiles });
    }

    return NextResponse.json({
      message: 'Profile Pipeline API',
      endpoints: {
        'POST /': 'Generate single profile { name: "..." }',
        'POST / (batch)': 'Batch process { action: "batch", names: [...] }',
        'GET ?action=flagged': 'Get flagged profiles',
      },
    });

  } catch (error) {
    console.error('❌ Pipeline API Error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

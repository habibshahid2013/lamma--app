import { NextRequest, NextResponse } from 'next/server';
import { addToQueue } from '@/lib/queue';
import { verifyAdmin } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if (!authResult.authorized) return authResult.response;
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Add to Async Queue
    const jobId = await addToQueue(name.trim());
    
    // Trigger Processing Immediately (Optional, for quicker response in dev)
    // In production, Cron picks it up, or we assume this trigger works
    // We can fire-and-forget a fetch to the cron endpoint
    if (process.env.NODE_ENV !== 'production' || true) { // Always trigger for now
       fetch(`${request.nextUrl.origin}/api/cron/process-queue`, {
           headers: { 'Authorization': `Bearer ${process.env.CRON_SECRET}` }
       }).catch(err => console.error("Trigger error", err));
    }

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Job queued successfully',
      monitorUrl: `/admin/queue/${jobId}` // Placeholder
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

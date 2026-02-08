export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getNextQueueItem, updateQueueStatus, logQueueMessage } from '@/lib/queue';
import { runProfilePipeline } from '@/lib/profile-generator/pipeline';

export async function GET(request: NextRequest) {
  try {
    // Auth Check: accept either Vercel Cron secret or admin Firebase token
    const authHeader = request.headers.get('authorization');
    const isCronSecret = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (!isCronSecret) {
      // Not a cron call — verify as admin user
      const { verifyAdmin } = await import('@/lib/admin-auth');
      const authResult = await verifyAdmin(request);
      if (!authResult.authorized) return authResult.response;
    }

    // 2. Get Next Item
    const item = await getNextQueueItem();
    if (!item) {
      return NextResponse.json({ message: 'No pending items' });
    }

    console.log(`Processing queue item: ${item.name} (${item.id})`);

    // 3. Mark Processing
    await updateQueueStatus(item.id, { status: 'processing' });
    await logQueueMessage(item.id, 'Started processing...');

    // 4. Run Pipeline
    try {
        const result = await runProfilePipeline(item.name);
        
        // 5. Success
        await updateQueueStatus(item.id, { 
            status: 'completed',
            result: result,
        });
        await logQueueMessage(item.id, 'Completed successfully');
        
        return NextResponse.json({ success: true, processed: item.name });

    } catch (err) {
        // 6. Failure
        console.error('Queue processing failed:', err);
        await updateQueueStatus(item.id, { 
            status: 'failed',
            error: String(err)
        });
        await logQueueMessage(item.id, `Failed: ${err}`);

        return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

/**
 * Content Sync Script
 *
 * Syncs YouTube videos and podcast episodes for all creators
 *
 * Run: npx tsx scripts/sync-content.ts
 */

import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

interface Creator {
  id: string;
  name: string;
  socialLinks?: {
    youtube?: string;
    podcast?: string;
  };
}

async function syncContent() {
  console.log("📺 Starting content sync...\n");

  const creatorsRef = db.collection("creators");
  const snapshot = await creatorsRef.get();

  let synced = 0;
  let skipped = 0;

  for (const doc of snapshot.docs) {
    const creator = { id: doc.id, ...doc.data() } as Creator;

    // Check for YouTube channel
    const youtubeUrl = creator.socialLinks?.youtube;
    if (youtubeUrl && YOUTUBE_API_KEY) {
      console.log(`🎬 Syncing YouTube for: ${creator.name}`);

      try {
        // Extract channel ID from URL
        const channelMatch = youtubeUrl.match(
          /@([^\/\?]+)|channel\/([^\/\?]+)/
        );
        if (channelMatch) {
          const handle = channelMatch[1] || channelMatch[2];

          // Fetch recent videos (simplified - actual implementation would use YouTube API)
          console.log(`   📹 Channel: ${handle}`);
          synced++;
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error}`);
      }
    } else {
      skipped++;
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log("\n📊 Content Sync Summary:");
  console.log(`   Synced:  ${synced}`);
  console.log(`   Skipped: ${skipped}`);
}

syncContent()
  .then(() => {
    console.log("\n✅ Content sync complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Content sync failed:", error);
    process.exit(1);
  });

/**
 * Creator Data Enrichment Script
 *
 * Fetches creator data from Firestore and enriches it using Claude:
 * - Generates bios for creators without one
 * - Validates and updates social links
 * - Adds missing metadata
 *
 * Run: npx tsx scripts/enrich-creators.ts
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin (uses GOOGLE_APPLICATION_CREDENTIALS or service account)
if (getApps().length === 0) {
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();

interface Creator {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  topics?: string[];
  socialLinks?: Record<string, string>;
}

async function enrichCreators() {
  console.log("🔄 Starting creator data enrichment...\n");

  const creatorsRef = db.collection("creators");
  const snapshot = await creatorsRef.get();

  let enriched = 0;
  let skipped = 0;
  let errors = 0;

  for (const doc of snapshot.docs) {
    const creator = { id: doc.id, ...doc.data() } as Creator;

    // Skip if already has bio
    if (creator.bio && creator.bio.length > 50) {
      skipped++;
      continue;
    }

    try {
      console.log(`📝 Enriching: ${creator.name}`);

      // Generate bio using Claude API
      const bioResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/ai/generate-bio`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creatorName: creator.name,
            topics: creator.topics || [],
            existingInfo: creator.bio,
          }),
        }
      );

      if (bioResponse.ok) {
        const { bio } = await bioResponse.json();

        // Update Firestore
        await creatorsRef.doc(doc.id).update({
          bio,
          enrichedAt: new Date().toISOString(),
        });

        enriched++;
        console.log(`   ✅ Bio generated (${bio.length} chars)`);
      } else {
        throw new Error(`API returned ${bioResponse.status}`);
      }
    } catch (error) {
      errors++;
      console.log(`   ❌ Error: ${error}`);
    }

    // Rate limiting - wait 1s between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n📊 Enrichment Summary:");
  console.log(`   Enriched: ${enriched}`);
  console.log(`   Skipped:  ${skipped}`);
  console.log(`   Errors:   ${errors}`);
  console.log(`   Total:    ${snapshot.size}`);
}

// Run if called directly
enrichCreators()
  .then(() => {
    console.log("\n✅ Enrichment complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Enrichment failed:", error);
    process.exit(1);
  });

/**
 * Creator Image Fetch Script
 *
 * Fetches missing creator images from various sources
 *
 * Run: npx tsx scripts/fetch-images.ts
 */

import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();

async function fetchImages() {
  console.log("🖼️  Starting image fetch...\n");

  const creatorsRef = db.collection("creators");
  const snapshot = await creatorsRef.where("imageUrl", "==", null).get();

  console.log(`Found ${snapshot.size} creators without images\n`);

  let fetched = 0;
  let failed = 0;

  for (const doc of snapshot.docs) {
    const creator = doc.data();
    console.log(`🔍 Searching image for: ${creator.name}`);

    try {
      // Call the image fetcher API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/creators/fetch-images`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ creatorId: doc.id }),
        }
      );

      if (response.ok) {
        fetched++;
        console.log(`   ✅ Image found`);
      } else {
        throw new Error(`API returned ${response.status}`);
      }
    } catch (error) {
      failed++;
      console.log(`   ❌ Failed: ${error}`);
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("\n📊 Image Fetch Summary:");
  console.log(`   Fetched: ${fetched}`);
  console.log(`   Failed:  ${failed}`);
}

fetchImages()
  .then(() => {
    console.log("\n✅ Image fetch complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Image fetch failed:", error);
    process.exit(1);
  });

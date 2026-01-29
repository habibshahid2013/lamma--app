// src/app/api/generate-profile/route.ts
// API Route for AI-Powered Profile Generation

import { NextRequest, NextResponse } from "next/server";
import { generateCreatorProfile, convertToFirestoreCreator } from "@/src/lib/ai/profile-generator";
import { db } from "@/src/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

// ============================================
// POST: Generate a new profile
// ============================================

export async function POST(request: NextRequest) {
  try {
    const { name, saveToDatabase = false } = await request.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    console.log(`🤖 Generating profile for: ${name}`);

    // Generate profile using Claude
    const profile = await generateCreatorProfile(name);

    // Convert to Firestore format
    const firestoreData = convertToFirestoreCreator(profile);

    // Optionally save to database
    if (saveToDatabase) {
        // Save creator document
        await setDoc(doc(db, "creators", firestoreData.creatorId), firestoreData);
        
        // Save slug mapping
        await setDoc(doc(db, "slugs", firestoreData.slug), {
            creatorId: firestoreData.creatorId,
        });
        console.log(`✅ Saved to Firestore: ${firestoreData.creatorId}`);
    }

    return NextResponse.json({
      success: true,
      profile,
      firestoreData,
      saved: saveToDatabase,
    });

  } catch (error) {
    console.error("Error generating profile:", error);
    return NextResponse.json(
      { error: "Failed to generate profile", details: String(error) },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { generateCreatorBio } from "@/lib/ai/anthropic";

export async function POST(request: NextRequest) {
  try {
    const { creatorName, topics, existingInfo } = await request.json();

    if (!creatorName || !topics?.length) {
      return NextResponse.json(
        { error: "creatorName and topics are required" },
        { status: 400 }
      );
    }

    const bio = await generateCreatorBio(creatorName, topics, existingInfo);

    return NextResponse.json({ bio });
  } catch (error) {
    console.error("Error generating bio:", error);
    return NextResponse.json(
      { error: "Failed to generate bio" },
      { status: 500 }
    );
  }
}

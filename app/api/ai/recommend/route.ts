import { NextRequest, NextResponse } from "next/server";
import { getContentRecommendations } from "@/lib/ai/anthropic";

export async function POST(request: NextRequest) {
  try {
    const { userInterests, followedCreators, availableCreators } =
      await request.json();

    if (!userInterests?.length || !availableCreators?.length) {
      return NextResponse.json(
        { error: "userInterests and availableCreators are required" },
        { status: 400 }
      );
    }

    const recommendations = await getContentRecommendations(
      userInterests,
      followedCreators || [],
      availableCreators
    );

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}

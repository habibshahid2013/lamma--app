import { NextRequest, NextResponse } from "next/server";
import { summarizeContent } from "@/lib/ai/anthropic";

export async function POST(request: NextRequest) {
  try {
    const { title, description, contentType } = await request.json();

    if (!title || !contentType) {
      return NextResponse.json(
        { error: "title and contentType are required" },
        { status: 400 }
      );
    }

    const summary = await summarizeContent(
      title,
      description || "",
      contentType
    );

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error summarizing content:", error);
    return NextResponse.json(
      { error: "Failed to summarize content" },
      { status: 500 }
    );
  }
}

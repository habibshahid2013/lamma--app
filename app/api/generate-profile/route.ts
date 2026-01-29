import { NextRequest, NextResponse } from "next/server";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { name, saveToDatabase = false } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!PERPLEXITY_API_KEY) {
      return NextResponse.json({ error: "Perplexity API key not configured" }, { status: 500 });
    }

    // Generate profile using Perplexity
    const profile = await generateWithPerplexity(name);
    const firestoreData = convertToFirestoreFormat(profile, name);

    if (saveToDatabase) {
      await saveToFirestore(firestoreData);
    }

    return NextResponse.json({
      success: true,
      profile,
      firestoreData,
      saved: saveToDatabase,
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

async function generateWithPerplexity(name: string) {
  const prompt = `Research this Islamic scholar/speaker thoroughly: "${name}"

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:

{
  "name": "Full name with title (Dr., Sheikh, Imam, Ustadh, etc.)",
  "displayName": "How they're commonly known",
  "title": "Their title (Dr., Sheikh, Imam, Ustadh, Ustadha) or null",
  "shortBio": "One sentence description, maximum 140 characters",
  "fullBio": "2-3 detailed paragraphs about their background, education, work, and impact",
  
  "category": "scholar OR speaker OR educator OR reciter OR author OR activist OR public_figure",
  "gender": "male OR female",
  
  "region": "americas OR middle_east OR south_asia OR southeast_asia OR east_africa OR west_africa OR north_africa OR europe",
  "country": "Two-letter ISO country code (US, UK, SA, PK, etc.)",
  "countryFlag": "Country flag emoji",
  "location": "City, State/Country where they're based, or null",
  
  "languages": ["Languages they speak/teach in"],
  "topics": ["Topics they cover - Spirituality, Quran, Fiqh, Youth, Family, Social Justice, Seerah, Dawah, etc."],
  "affiliations": ["Organizations, institutes, mosques they're affiliated with"],
  
  "socialLinks": {
    "website": "Official website URL or null",
    "youtube": "YouTube channel URL (official channel only) or null",
    "twitter": "Twitter/X URL or null",
    "instagram": "Instagram URL or null",
    "facebook": "Facebook page URL or null",
    "tiktok": "TikTok URL or null"
  },
  
  "youtube": {
    "channelUrl": "Full YouTube channel URL or null",
    "channelName": "Channel name or null",
    "subscriberCount": "Subscriber count like '1.7M' or '500K' or null",
    "description": "Brief channel description or null"
  },
  
  "podcast": {
    "name": "Podcast name or null",
    "description": "Brief description or null",
    "appleUrl": "Apple Podcasts URL or null",
    "spotifyUrl": "Spotify URL or null",
    "rssUrl": "RSS feed URL if known (try Muslim Central: https://feeds.muslimcentral.com/name-slug) or null"
  },
  
  "books": [
    {
      "title": "Book title",
      "year": 2020,
      "description": "Brief description or null",
      "amazonUrl": "Amazon URL or null"
    }
  ],
  
  "courses": [
    {
      "title": "Course title",
      "platform": "Platform name (Bayyinah, AlMaghrib, SeekersGuidance, etc.)",
      "url": "Course URL or null"
    }
  ],
  
  "isHistorical": false,
  "lifespan": "Only if deceased, format: '1920-2005', otherwise null",
  "note": "Special note if public figure (e.g., 'Academy Award-winning actor') or null",
  
  "imageUrl": "Direct URL to a high-quality profile photo if found, or null",
  "imageSearchQuery": "Best Google Images search query to find their official photo",
  
  "confidence": "high OR medium OR low based on how much verified information you found",
  "confidenceNotes": ["Notes about data quality, e.g., 'YouTube channel verified', 'Could not find podcast']"
}

IMPORTANT RULES:
- Return ONLY the JSON object, no other text
- Include up to 5 most notable books
- Include up to 3 most notable courses
- For YouTube, find their OFFICIAL channel, not fan channels
- For podcasts, check Muslim Central (https://muslimcentral.com) - they host many scholars
- Be accurate - if not sure about something, use null
- If this is a Muslim public figure (actor, athlete, politician), use category "public_figure" and add a note`;

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        {
          role: "system",
          content: "You are an expert researcher specializing in Islamic scholars and content creators. Always return valid JSON only, no markdown or explanation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Perplexity API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content in Perplexity response");
  }

  // Parse JSON from response
  let jsonStr = content.trim();
  
  // Remove markdown code blocks if present
  if (jsonStr.startsWith("```json")) {
    jsonStr = jsonStr.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  } else if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```\n?/, "").replace(/\n?```$/, "");
  }

  return JSON.parse(jsonStr);
}

function convertToFirestoreFormat(profile: any, originalName: string) {
  const displayName = profile.displayName || profile.name || originalName;
  const slug = displayName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  const creatorId = slug;

  return {
    creatorId,
    slug,

    ownership: {
      ownerId: null,
      ownershipStatus: "unclaimed",
      claimedAt: null,
      claimMethod: null,
    },

    verification: {
      level: profile.confidence === "high" ? "community" : "none",
      verifiedAt: null,
      verifiedBy: null,
    },

    profile: {
      name: profile.name || originalName,
      displayName: displayName,
      title: profile.title || null,
      bio: profile.fullBio || null,
      shortBio: profile.shortBio || null,
      avatar: profile.imageUrl || null,
      coverImage: null,
    },

    category: profile.category || "scholar",
    tier: "verified",
    gender: profile.gender || "male",

    region: profile.region || "americas",
    country: profile.country || "US",
    countryFlag: profile.countryFlag || "🌍",
    location: profile.location || null,

    languages: profile.languages || ["English"],
    topics: profile.topics || [],
    affiliations: profile.affiliations || [],

    socialLinks: {
      website: profile.socialLinks?.website || null,
      youtube: profile.youtube?.channelUrl || profile.socialLinks?.youtube || null,
      twitter: profile.socialLinks?.twitter || null,
      instagram: profile.socialLinks?.instagram || null,
      facebook: profile.socialLinks?.facebook || null,
      tiktok: profile.socialLinks?.tiktok || null,
      podcast: profile.podcast?.rssUrl || profile.podcast?.appleUrl || null,
    },

    content: {
      youtube: profile.youtube || null,
      podcast: profile.podcast || null,
      books: profile.books || [],
      courses: profile.courses || [],
    },

    stats: {
      followerCount: 0,
      contentCount: 0,
      viewCount: 0,
    },

    featured: false,
    trending: false,
    isHistorical: profile.isHistorical || false,
    lifespan: profile.lifespan || null,
    note: profile.note || null,

    aiGenerated: {
      generatedAt: new Date().toISOString(),
      model: "perplexity-sonar-pro",
      confidence: profile.confidence || "medium",
      notes: profile.confidenceNotes || [],
      imageSearchQuery: profile.imageSearchQuery || `${originalName} islamic scholar photo`,
    },

    source: "ai_generated",

    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function saveToFirestore(data: any) {
  await setDoc(doc(db, "creators", data.creatorId), data);
  await setDoc(doc(db, "slugs", data.slug), { creatorId: data.creatorId });
  console.log(`✅ Saved: ${data.creatorId}`);
}

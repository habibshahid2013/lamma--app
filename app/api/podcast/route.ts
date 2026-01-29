import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    const parser = new Parser();
    const feed = await parser.parseURL(url);
    
    // Cache for 1 hour
    return NextResponse.json(feed, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
      },
    });
  } catch (error) {
    console.error('Error fetching podcast feed:', error);
    return NextResponse.json({ error: 'Failed to fetch podcast feed' }, { status: 500 });
  }
}

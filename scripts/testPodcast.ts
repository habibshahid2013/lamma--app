
import Parser from 'rss-parser';

async function testPodcast() {
  const url = 'https://muslimcentral.com/audio/omar-suleiman/feed/';
  console.log(`Testing RSS fetch for: ${url}`);
  
  try {
    const parser = new Parser();
    const feed = await parser.parseURL(url);
    console.log('Success! Feed title:', feed.title);
    console.log('Number of items:', feed.items.length);
  } catch (error) {
    console.error('Fetch failed:', error);
  }
}

testPodcast();

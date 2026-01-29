
import fs from 'fs';
import path from 'path';
import { CREATORS, CATEGORIES } from '../lib/data/creators';

const TARGET_FILE = path.join(process.cwd(), 'lib/data/creators.ts');

async function standardizeLocalData() {
  console.log('Standardizing local creator data...');

  const updatedCreators = CREATORS.map(creator => {
    // Ensure socialLinks exists
    const socialLinks = creator.socialLinks || {};
    
    return {
      ...creator,
      socialLinks: {
        ...socialLinks,
        podcast: `https://feeds.muslimcentral.com/${creator.id}`
      }
    };
  });

  // Reconstruct the file content
  // We need to preserve imports and the CATEGORIES export
  const fileHeader = `import { Creator } from "../types/creator";

export const CATEGORIES: Record<string, { label: string; emoji: string }> = ${JSON.stringify(CATEGORIES, null, 2)};

export const CREATORS: Creator[] = ${JSON.stringify(updatedCreators, null, 2)};
`;

  fs.writeFileSync(TARGET_FILE, fileHeader);
  console.log(`Updated ${updatedCreators.length} creators in ${TARGET_FILE} ✅`);
}

standardizeLocalData();

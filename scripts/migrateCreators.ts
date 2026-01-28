
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from '../src/lib/firebase';
import { CREATORS } from '../lib/data/creators';
import { doc, setDoc, writeBatch } from 'firebase/firestore';

async function migrateCreators() {
  console.log(`Starting migration of ${CREATORS.length} creators...`);
  
  const batchSize = 500;
  let batches = 0;
  let batch = writeBatch(db);
  let count = 0;

  for (const creator of CREATORS) {
    const creatorRef = doc(db, 'creators', creator.id);
    const slugRef = doc(db, 'slugs', creator.id);

    // Map data to new structure
    const newCreatorData = {
      slug: creator.id,
      profile: {
        name: creator.name,
        bio: (creator as any).bio || null,
        avatar: `/creators/${creator.id}.jpg`, // Placeholder assumption
      },
      category: creator.category,
      tier: creator.tier,
      topics: creator.topics,
      languages: creator.languages,
      region: creator.region,
      country: creator.country,
      countryFlag: creator.countryFlag,
      gender: creator.gender,
      verification: {
        level: creator.verificationLevel,
        verified: creator.verified, // Including for backward compatibility if needed
      },
      stats: {
        followerCount: 0,
      },
      featured: creator.featured,
      trending: creator.trending,
      isHistorical: creator.isHistorical,
      lifespan: (creator as any).lifespan || null,
      note: (creator as any).note || null,
      location: (creator as any).location || null,
    };

    batch.set(creatorRef, newCreatorData);
    batch.set(slugRef, { creatorId: creator.id });

    count++;
    
    if (count % batchSize === 0) {
      await batch.commit();
      console.log(`Committed batch ${++batches}`);
      batch = writeBatch(db);
    }
  }

  if (count % batchSize !== 0) {
    await batch.commit();
    console.log(`Committed final batch ${++batches}`);
  }

  console.log('Migration complete! 🔥');
}

migrateCreators().catch(console.error);

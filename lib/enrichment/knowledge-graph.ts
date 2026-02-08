/**
 * Google Knowledge Graph Enrichment Service
 * Searches for entity data about creators (FREE — 100K requests/day)
 * Returns structured entity data: description, image, website, Wikipedia URL
 */

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const KG_API_BASE = 'https://kgsearch.googleapis.com/v1/entities:search';

export interface KnowledgeGraphEntity {
  name: string;
  description?: string;
  detailedDescription?: string;
  imageUrl?: string;
  url?: string;        // Wikipedia or official URL
  entityTypes?: string[];
}

/**
 * Clean Islamic titles from name for search
 */
function cleanName(name: string): string {
  return name
    .replace(/^(Sheikh|Shaykh|Shaykha|Ustadh|Ustadha|Ustaz|Ustadz|Maulana|Imam|Mufti|Qari|Dr\.|Br\.|Sr\.)\s+/i, '')
    .replace(/\s*\(.*?\)\s*/g, '')
    .trim();
}

/**
 * Validate the KG entity is the right person
 */
function isRelevantEntity(entity: any, targetName: string): boolean {
  const cleanTarget = cleanName(targetName).toLowerCase();
  const targetParts = cleanTarget.split(/\s+/).filter((p: string) => p.length >= 3);

  const entityName = (entity.result?.name || '').toLowerCase();
  const entityDesc = (entity.result?.description || '').toLowerCase();
  const detailedDesc = (entity.result?.detailedDescription?.articleBody || '').toLowerCase();

  const searchText = `${entityName} ${entityDesc} ${detailedDesc}`;

  // Check name match
  const nameMatchCount = targetParts.filter((part: string) => entityName.includes(part)).length;
  if (nameMatchCount < Math.min(2, targetParts.length)) return false;

  // Check for Islamic/religious relevance
  const islamicKeywords = ['islam', 'muslim', 'scholar', 'imam', 'sheikh', 'mufti', 'quran', 'preacher', 'dawah', 'theologian', 'reciter', 'cleric', 'jurist'];
  const isIslamic = islamicKeywords.some(kw => searchText.includes(kw));

  // Check for person type
  const types = entity.result?.['@type'] || [];
  const isPerson = types.includes('Person') || types.includes('Thing');

  return isPerson && (isIslamic || nameMatchCount >= targetParts.length);
}

/**
 * Search Google Knowledge Graph for entity data about a person
 */
export async function searchKnowledgeGraph(name: string): Promise<KnowledgeGraphEntity | null> {
  if (!GOOGLE_API_KEY) return null;

  const cleanedName = cleanName(name);

  // Try with Islamic qualifier first for better matching
  const queries = [`${cleanedName} islamic scholar`, cleanedName];

  for (const query of queries) {
    try {
      const params = new URLSearchParams({
        query,
        key: GOOGLE_API_KEY,
        limit: '5',
        types: 'Person',
        languages: 'en',
      });

      const res = await fetch(`${KG_API_BASE}?${params}`);
      if (!res.ok) continue;

      const data = await res.json();
      const elements = data.itemListElement || [];

      for (const element of elements) {
        if (!isRelevantEntity(element, name)) continue;

        const result = element.result;
        return {
          name: result.name,
          description: result.description,
          detailedDescription: result.detailedDescription?.articleBody?.substring(0, 500),
          imageUrl: result.image?.contentUrl,
          url: result.detailedDescription?.url || result.url,
          entityTypes: result['@type'],
        };
      }
    } catch (err) {
      console.error(`Knowledge Graph search error for "${query}":`, err);
      continue;
    }
  }

  return null;
}

// src/lib/api-providers/knowledge-graph.ts
// Google Knowledge Graph API Provider
// Uses same API key as YouTube - fetches verified entity information

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const KG_API_BASE = 'https://kgsearch.googleapis.com/v1/entities:search';

export interface KnowledgeGraphData {
  found: boolean;
  entityId: string | null;
  name: string | null;
  type: string[];
  description: string | null;
  detailedDescription: string | null;
  url: string | null;
  imageUrl: string | null;
  score: number | null;
}

export class KnowledgeGraphProvider {
  
  // Search for a person in Knowledge Graph
  async searchPerson(name: string): Promise<KnowledgeGraphData | null> {
    if (!GOOGLE_API_KEY) {
      console.warn('Google API key not configured for Knowledge Graph');
      return this.createEmptyResult();
    }

    try {
      const url = `${KG_API_BASE}?query=${encodeURIComponent(name)}&types=Person&limit=5&indent=true&key=${GOOGLE_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.itemListElement || data.itemListElement.length === 0) {
        return this.createEmptyResult();
      }
      
      // Find best match
      const normalizedQuery = name.toLowerCase().replace(/[^a-z\s]/g, '');
      let bestMatch = data.itemListElement[0];
      
      for (const item of data.itemListElement) {
        const entityName = (item.result?.name || '').toLowerCase().replace(/[^a-z\s]/g, '');
        if (entityName === normalizedQuery || entityName.includes(normalizedQuery) || normalizedQuery.includes(entityName)) {
          bestMatch = item;
          break;
        }
      }
      
      const result = bestMatch.result;
      
      return {
        found: true,
        entityId: result['@id'] || result.mid || null,
        name: result.name || null,
        type: result['@type'] || [],
        description: result.description || null,
        detailedDescription: result.detailedDescription?.articleBody || null,
        url: result.detailedDescription?.url || result.url || null,
        imageUrl: result.image?.contentUrl || result.image?.url || null,
        score: bestMatch.resultScore || null,
      };
      
    } catch (error) {
      console.error('Knowledge Graph search error:', error);
      return null;
    }
  }
  
  // Search for any entity (not just Person)
  async searchEntity(name: string, types: string[] = []): Promise<KnowledgeGraphData | null> {
    if (!GOOGLE_API_KEY) {
      console.warn('Google API key not configured for Knowledge Graph');
      return this.createEmptyResult();
    }

    try {
      let url = `${KG_API_BASE}?query=${encodeURIComponent(name)}&limit=5&indent=true&key=${GOOGLE_API_KEY}`;
      
      if (types.length > 0) {
        url += `&types=${types.join(',')}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.itemListElement || data.itemListElement.length === 0) {
        return this.createEmptyResult();
      }
      
      const result = data.itemListElement[0].result;
      
      return {
        found: true,
        entityId: result['@id'] || result.mid || null,
        name: result.name || null,
        type: result['@type'] || [],
        description: result.description || null,
        detailedDescription: result.detailedDescription?.articleBody || null,
        url: result.detailedDescription?.url || result.url || null,
        imageUrl: result.image?.contentUrl || result.image?.url || null,
        score: data.itemListElement[0].resultScore || null,
      };
      
    } catch (error) {
      console.error('Knowledge Graph entity search error:', error);
      return null;
    }
  }
  
  // Create empty result
  private createEmptyResult(): KnowledgeGraphData {
    return {
      found: false,
      entityId: null,
      name: null,
      type: [],
      description: null,
      detailedDescription: null,
      url: null,
      imageUrl: null,
      score: null,
    };
  }
}

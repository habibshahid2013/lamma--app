// src/lib/api-providers/wikipedia.ts
// Wikipedia API Provider
// FREE, NO AUTH REQUIRED - Fetches biographical and educational data

const WIKIPEDIA_API_BASE = 'https://en.wikipedia.org/api/rest_v1';

export interface WikipediaData {
  found: boolean;
  pageId: number | null;
  title: string | null;
  url: string | null;
  extract: string | null;
  fullExtract: string | null;
  imageUrl: string | null;
  description: string | null;
  categories: string[];
  birthDate: string | null;
  birthPlace: string | null;
}

export class WikipediaProvider {
  
  // Search for a person on Wikipedia
  async searchPerson(name: string): Promise<WikipediaData | null> {
    try {
      // Search for the page
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(name)}&limit=5&namespace=0&format=json&origin=*`;
      
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (!searchData[1] || searchData[1].length === 0) {
        return this.createEmptyResult();
      }
      
      // Find best match
      const normalizedQuery = name.toLowerCase().replace(/[^a-z\s]/g, '');
      let bestTitle = searchData[1][0];
      
      for (let i = 0; i < searchData[1].length; i++) {
        const title = (searchData[1][i] || '').toLowerCase().replace(/[^a-z\s]/g, '');
        if (title === normalizedQuery || title.includes(normalizedQuery)) {
          bestTitle = searchData[1][i];
          break;
        }
      }
      
      // Get full page summary
      return await this.getPageSummary(bestTitle);
      
    } catch (error) {
      console.error('Wikipedia search error:', error);
      return null;
    }
  }
  
  // Get detailed page summary
  async getPageSummary(title: string): Promise<WikipediaData | null> {
    try {
      const url = `${WIKIPEDIA_API_BASE}/page/summary/${encodeURIComponent(title)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return this.createEmptyResult();
      }
      
      const data = await response.json();
      
      if (data.type === 'disambiguation' || !data.title) {
        return this.createEmptyResult();
      }
      
      // Get categories for additional info
      const categories = await this.getPageCategories(title);
      
      // Try to extract birth info from categories
      const birthInfo = this.extractBirthInfo(categories, data.extract || '');
      
      return {
        found: true,
        pageId: data.pageid || null,
        title: data.title,
        url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
        extract: data.extract?.substring(0, 300) || null,
        fullExtract: data.extract || null,
        imageUrl: data.thumbnail?.source || data.originalimage?.source || null,
        description: data.description || null,
        categories,
        birthDate: birthInfo.birthDate,
        birthPlace: birthInfo.birthPlace,
      };
      
    } catch (error) {
      console.error('Wikipedia summary error:', error);
      return null;
    }
  }
  
  // Get page categories
  private async getPageCategories(title: string): Promise<string[]> {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=categories&cllimit=20&format=json&origin=*`;
      const response = await fetch(url);
      const data = await response.json();
      
      const pages = data.query?.pages || {};
      const pageId = Object.keys(pages)[0];
      
      if (!pageId || pageId === '-1') return [];
      
      const categories = pages[pageId].categories || [];
      return categories.map((cat: any) => cat.title.replace('Category:', ''));
      
    } catch (error) {
      return [];
    }
  }
  
  // Extract birth information from categories and extract
  private extractBirthInfo(categories: string[], extract: string): { birthDate: string | null; birthPlace: string | null } {
    let birthDate: string | null = null;
    let birthPlace: string | null = null;
    
    // Check categories for birth year
    for (const cat of categories) {
      const birthMatch = cat.match(/(\d{4}) births/);
      if (birthMatch) {
        birthDate = birthMatch[1];
        break;
      }
    }
    
    // Try to find place from extract (common pattern: "born in [Place]")
    const placeMatch = extract.match(/born (?:on [^,]+, )?in ([^,.\)]+)/i);
    if (placeMatch) {
      birthPlace = placeMatch[1].trim();
    }
    
    return { birthDate, birthPlace };
  }
  
  // Create empty result
  private createEmptyResult(): WikipediaData {
    return {
      found: false,
      pageId: null,
      title: null,
      url: null,
      extract: null,
      fullExtract: null,
      imageUrl: null,
      description: null,
      categories: [],
      birthDate: null,
      birthPlace: null,
    };
  }
}

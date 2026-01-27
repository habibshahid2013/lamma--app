export interface Creator {
  id: string;
  name: string;
  category: "scholar" | "educator" | "speaker" | "reciter" | "author" | "activist" | "influencer" | "public_figure";
  tier: "verified" | "rising" | "new";
  gender: "male" | "female";
  region: "americas" | "europe" | "middle_east" | "africa" | "south_asia" | "southeast_asia" | "east_africa";
  country: string;
  countryFlag: string;
  location?: string;
  languages: string[];
  topics: string[];
  verified: boolean;
  verificationLevel: "official" | "community";
  featured: boolean;
  trending: boolean;
  isHistorical: boolean;
  lifespan?: string;
  note?: string;
  avatar?: string; // Optional for now, assuming external or placeholder
}

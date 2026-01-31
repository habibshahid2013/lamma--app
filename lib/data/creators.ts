import { Creator } from "../types/creator";

export const CATEGORIES: Record<string, { label: string; emoji: string }> = {
  "scholar": {
    "label": "Scholar",
    "emoji": "📚"
  },
  "speaker": {
    "label": "Speaker",
    "emoji": "🎤"
  },
  "educator": {
    "label": "Educator",
    "emoji": "👨‍🏫"
  },
  "reciter": {
    "label": "Reciter",
    "emoji": "🎙️"
  },
  "author": {
    "label": "Author",
    "emoji": "📖"
  },
  "activist": {
    "label": "Activist",
    "emoji": "✊"
  },
  "youth_leader": {
    "label": "Youth Leader",
    "emoji": "🌟"
  },
  "podcaster": {
    "label": "Podcaster",
    "emoji": "🎧"
  },
  "influencer": {
    "label": "Influencer",
    "emoji": "📱"
  },
  "public_figure": {
    "label": "Public Figure",
    "emoji": "⭐"
  }
};

export const CREATORS: Creator[] = [
  {
    "id": "omar-suleiman",
    "slug": "omar-suleiman",
    "name": "Omar Suleiman",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English",
      "Arabic"
    ],
    "topics": [
      "Spirituality",
      "Social Justice",
      "Seerah",
      "Community"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": true,
    "trending": true,
    "isHistorical": false,
    "socialLinks": {
      "youtube": "https://www.youtube.com/@yaborhereareany",
      "podcast": "https://feeds.muslimcentral.com/omar-suleiman"
    }
  },
  {
    "id": "nouman-ali-khan",
    "slug": "nouman-ali-khan",
    "name": "Nouman Ali Khan",
    "category": "educator",
    "tier": "verified",
    "gender": "male",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English",
      "Arabic",
      "Urdu"
    ],
    "topics": [
      "Quran",
      "Arabic",
      "Tafsir",
      "Youth"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": true,
    "trending": true,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/nouman-ali-khan"
    }
  },
  {
    "id": "yasir-qadhi",
    "slug": "yasir-qadhi",
    "name": "Yasir Qadhi",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English",
      "Arabic"
    ],
    "topics": [
      "Aqeedah",
      "History",
      "Theology",
      "Seerah"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": true,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/yasir-qadhi"
    }
  },
  {
    "id": "hamza-yusuf",
    "slug": "hamza-yusuf",
    "name": "Hamza Yusuf",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English",
      "Arabic"
    ],
    "topics": [
      "Traditional Islam",
      "Spirituality",
      "Philosophy"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": true,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/hamza-yusuf"
    }
  },
  {
    "id": "zaid-shakir",
    "slug": "zaid-shakir",
    "name": "Zaid Shakir",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English",
      "Arabic"
    ],
    "topics": [
      "Social Justice",
      "Spirituality",
      "Community"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/zaid-shakir"
    }
  },
  {
    "id": "suhaib-webb",
    "slug": "suhaib-webb",
    "name": "Suhaib Webb",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English",
      "Arabic"
    ],
    "topics": [
      "Youth",
      "American Muslim Life",
      "Fiqh"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/suhaib-webb"
    }
  },
  {
    "id": "siraj-wahhaj",
    "slug": "siraj-wahhaj",
    "name": "Siraj Wahhaj",
    "category": "speaker",
    "tier": "verified",
    "gender": "male",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English"
    ],
    "topics": [
      "Community",
      "Dawah",
      "Leadership"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/siraj-wahhaj"
    }
  },
  {
    "id": "abdul-nasir-jangda",
    "slug": "abdul-nasir-jangda",
    "name": "Abdul Nasir Jangda",
    "category": "educator",
    "tier": "verified",
    "gender": "male",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English",
      "Arabic",
      "Urdu"
    ],
    "topics": [
      "Seerah",
      "Quran",
      "Arabic"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/abdul-nasir-jangda"
    }
  },
  {
    "id": "abdelrahman-murphy",
    "slug": "abdelrahman-murphy",
    "name": "AbdelRahman Murphy",
    "category": "speaker",
    "tier": "verified",
    "gender": "male",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English"
    ],
    "topics": [
      "Youth",
      "Mental Health",
      "Community"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": true,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/abdelrahman-murphy"
    }
  },
  {
    "id": "saad-tasleem",
    "slug": "saad-tasleem",
    "name": "Saad Tasleem",
    "category": "speaker",
    "tier": "verified",
    "gender": "male",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English"
    ],
    "topics": [
      "Youth",
      "Modern Issues",
      "Social Media"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/saad-tasleem"
    }
  },
  {
    "id": "wisam-sharieff",
    "slug": "wisam-sharieff",
    "name": "Wisam Sharieff",
    "category": "reciter",
    "tier": "verified",
    "gender": "male",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English",
      "Arabic"
    ],
    "topics": [
      "Quran",
      "Tajweed",
      "Memorization"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/wisam-sharieff"
    }
  },
  {
    "id": "jonathan-brown",
    "slug": "jonathan-brown",
    "name": "Jonathan A.C. Brown",
    "category": "author",
    "tier": "verified",
    "gender": "male",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English",
      "Arabic"
    ],
    "topics": [
      "Hadith",
      "History",
      "Academia"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/jonathan-brown"
    }
  },
  {
    "id": "sherman-jackson",
    "slug": "sherman-jackson",
    "name": "Sherman Jackson",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English",
      "Arabic"
    ],
    "topics": [
      "Fiqh",
      "American Islam",
      "Academia"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/sherman-jackson"
    }
  },
  {
    "id": "yasmin-mogahed",
    "slug": "yasmin-mogahed",
    "name": "Yasmin Mogahed",
    "category": "speaker",
    "tier": "verified",
    "gender": "female",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English"
    ],
    "topics": [
      "Spirituality",
      "Mental Health",
      "Women"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": true,
    "trending": true,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/yasmin-mogahed"
    }
  },
  {
    "id": "dalia-mogahed",
    "slug": "dalia-mogahed",
    "name": "Dalia Mogahed",
    "category": "speaker",
    "tier": "verified",
    "gender": "female",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English",
      "Arabic"
    ],
    "topics": [
      "Research",
      "Women",
      "Islamophobia"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": true,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/dalia-mogahed"
    }
  },
  {
    "id": "ingrid-mattson",
    "slug": "ingrid-mattson",
    "name": "Ingrid Mattson",
    "category": "scholar",
    "tier": "verified",
    "gender": "female",
    "region": "americas",
    "country": "CA",
    "countryFlag": "🇨🇦",
    "languages": [
      "English",
      "Arabic"
    ],
    "topics": [
      "Leadership",
      "Women",
      "Interfaith"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/ingrid-mattson"
    }
  },
  {
    "id": "ieasha-prime",
    "slug": "ieasha-prime",
    "name": "Ieasha Prime",
    "category": "speaker",
    "tier": "verified",
    "gender": "female",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English"
    ],
    "topics": [
      "Women",
      "Family",
      "Spirituality"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/ieasha-prime"
    }
  },
  {
    "id": "haleh-banani",
    "slug": "haleh-banani",
    "name": "Haleh Banani",
    "category": "speaker",
    "tier": "verified",
    "gender": "female",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English"
    ],
    "topics": [
      "Mental Health",
      "Marriage",
      "Family"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": true,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/haleh-banani"
    }
  },
  {
    "id": "tamara-gray",
    "slug": "tamara-gray",
    "name": "Tamara Gray",
    "category": "educator",
    "tier": "verified",
    "gender": "female",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English",
      "Arabic"
    ],
    "topics": [
      "Women",
      "Scholarship",
      "History"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/tamara-gray"
    }
  },
  {
    "id": "maryam-amir",
    "slug": "maryam-amir",
    "name": "Maryam Amir",
    "category": "speaker",
    "tier": "verified",
    "gender": "female",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English"
    ],
    "topics": [
      "Quran",
      "Women",
      "Youth"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/maryam-amir"
    }
  },
  {
    "id": "dave-chappelle",
    "slug": "dave-chappelle",
    "name": "Dave Chappelle",
    "category": "public_figure",
    "tier": "rising",
    "gender": "male",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English"
    ],
    "topics": [
      "Entertainment",
      "Representation",
      "Culture"
    ],
    "verified": false,
    "verificationLevel": "community",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "note": "Muslim comedian and actor",
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/dave-chappelle"
    }
  },
  {
    "id": "mahershala-ali",
    "slug": "mahershala-ali",
    "name": "Mahershala Ali",
    "category": "public_figure",
    "tier": "rising",
    "gender": "male",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English"
    ],
    "topics": [
      "Entertainment",
      "Representation",
      "Arts"
    ],
    "verified": false,
    "verificationLevel": "community",
    "featured": false,
    "trending": true,
    "isHistorical": false,
    "note": "Oscar-winning Muslim actor",
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/mahershala-ali"
    }
  },
  {
    "id": "hasan-minhaj",
    "slug": "hasan-minhaj",
    "name": "Hasan Minhaj",
    "category": "public_figure",
    "tier": "rising",
    "gender": "male",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English"
    ],
    "topics": [
      "Entertainment",
      "Politics",
      "Youth"
    ],
    "verified": false,
    "verificationLevel": "community",
    "featured": false,
    "trending": true,
    "isHistorical": false,
    "note": "Comedian and TV host",
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/hasan-minhaj"
    }
  },
  {
    "id": "ramy-youssef",
    "slug": "ramy-youssef",
    "name": "Ramy Youssef",
    "category": "public_figure",
    "tier": "rising",
    "gender": "male",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English",
      "Arabic"
    ],
    "topics": [
      "Entertainment",
      "Identity",
      "Youth"
    ],
    "verified": false,
    "verificationLevel": "community",
    "featured": false,
    "trending": true,
    "isHistorical": false,
    "note": "Creator/star of 'Ramy' TV series",
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/ramy-youssef"
    }
  },
  {
    "id": "linda-sarsour",
    "slug": "linda-sarsour",
    "name": "Linda Sarsour",
    "category": "activist",
    "tier": "rising",
    "gender": "female",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English",
      "Arabic"
    ],
    "topics": [
      "Social Justice",
      "Activism",
      "Women"
    ],
    "verified": false,
    "verificationLevel": "community",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/linda-sarsour"
    }
  },
  {
    "id": "ilhan-omar",
    "slug": "ilhan-omar",
    "name": "Ilhan Omar",
    "category": "activist",
    "tier": "rising",
    "gender": "female",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English",
      "Somali"
    ],
    "topics": [
      "Politics",
      "Social Justice",
      "Community"
    ],
    "verified": false,
    "verificationLevel": "community",
    "featured": false,
    "trending": true,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/ilhan-omar"
    }
  },
  {
    "id": "keith-ellison",
    "slug": "keith-ellison",
    "name": "Keith Ellison",
    "category": "activist",
    "tier": "rising",
    "gender": "male",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English"
    ],
    "topics": [
      "Politics",
      "Social Justice",
      "Civil Rights"
    ],
    "verified": false,
    "verificationLevel": "community",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/keith-ellison"
    }
  },
  {
    "id": "ibtihaj-muhammad",
    "slug": "ibtihaj-muhammad",
    "name": "Ibtihaj Muhammad",
    "category": "public_figure",
    "tier": "rising",
    "gender": "female",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English"
    ],
    "topics": [
      "Sports",
      "Women",
      "Representation"
    ],
    "verified": false,
    "verificationLevel": "community",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "note": "Olympic fencer",
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/ibtihaj-muhammad"
    }
  },
  {
    "id": "noor-tagouri",
    "slug": "noor-tagouri",
    "name": "Noor Tagouri",
    "category": "influencer",
    "tier": "rising",
    "gender": "female",
    "region": "americas",
    "country": "US",
    "countryFlag": "🇺🇸",
    "languages": [
      "English"
    ],
    "topics": [
      "Media",
      "Youth",
      "Representation"
    ],
    "verified": false,
    "verificationLevel": "community",
    "featured": false,
    "trending": true,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/noor-tagouri"
    }
  },
  {
    "id": "imran-khan",
    "slug": "imran-khan",
    "name": "Imran Khan",
    "category": "activist",
    "tier": "rising",
    "gender": "male",
    "region": "south_asia",
    "country": "PK",
    "countryFlag": "🇵🇰",
    "languages": [
      "Urdu",
      "English"
    ],
    "topics": [
      "Politics",
      "Leadership",
      "Social Justice"
    ],
    "verified": false,
    "verificationLevel": "community",
    "featured": false,
    "trending": true,
    "isHistorical": false,
    "note": "Former Prime Minister of Pakistan",
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/imran-khan"
    }
  },
  {
    "id": "mufti-menk",
    "slug": "mufti-menk",
    "name": "Mufti Menk",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "east_africa",
    "country": "ZW",
    "countryFlag": "🇿🇼",
    "languages": [
      "English",
      "Arabic"
    ],
    "topics": [
      "Spirituality",
      "Family",
      "Youth",
      "Motivation"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": true,
    "trending": true,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/mufti-menk"
    }
  },
  {
    "id": "said-rageah",
    "slug": "said-rageah",
    "name": "Said Rageah",
    "category": "speaker",
    "tier": "verified",
    "gender": "male",
    "region": "east_africa",
    "country": "SO",
    "countryFlag": "🇸🇴",
    "languages": [
      "Somali",
      "Arabic",
      "English"
    ],
    "topics": [
      "Youth",
      "Community",
      "Dawah"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": true,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/said-rageah"
    }
  },
  {
    "id": "sheikh-umal",
    "slug": "sheikh-umal",
    "name": "Sheikh Umal",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "east_africa",
    "country": "SO",
    "countryFlag": "🇸🇴",
    "languages": [
      "Somali",
      "Arabic",
      "English"
    ],
    "topics": [
      "Quran",
      "Fiqh",
      "Community"
    ],
    "verified": true,
    "verificationLevel": "community",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/sheikh-umal"
    }
  },
  {
    "id": "sheikh-hassan-jaamici",
    "slug": "sheikh-hassan-jaamici",
    "name": "Sheikh Hassan Jaamici",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "east_africa",
    "country": "SO",
    "countryFlag": "🇸🇴",
    "location": "Minneapolis, MN",
    "languages": [
      "Somali",
      "Arabic",
      "English"
    ],
    "topics": [
      "Quran",
      "Community",
      "Youth"
    ],
    "verified": true,
    "verificationLevel": "community",
    "featured": true,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/sheikh-hassan-jaamici"
    }
  },
  {
    "id": "mohamed-idris",
    "slug": "mohamed-idris",
    "name": "Mohamed Idris",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "east_africa",
    "country": "SO",
    "countryFlag": "🇸🇴",
    "location": "Minneapolis, MN",
    "languages": [
      "Somali",
      "Arabic",
      "English"
    ],
    "topics": [
      "Quran",
      "Community",
      "Family"
    ],
    "verified": true,
    "verificationLevel": "community",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/mohamed-idris"
    }
  },
  {
    "id": "nuradin-jama",
    "slug": "nuradin-jama",
    "name": "Nuradin Jama",
    "category": "speaker",
    "tier": "verified",
    "gender": "male",
    "region": "east_africa",
    "country": "SO",
    "countryFlag": "🇸🇴",
    "languages": [
      "Somali",
      "Arabic",
      "English"
    ],
    "topics": [
      "Youth",
      "Community",
      "Dawah"
    ],
    "verified": true,
    "verificationLevel": "community",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/nuradin-jama"
    }
  },
  {
    "id": "boonaa-mohammed",
    "slug": "boonaa-mohammed",
    "name": "Boonaa Mohammed",
    "category": "speaker",
    "tier": "rising",
    "gender": "male",
    "region": "east_africa",
    "country": "SO",
    "countryFlag": "🇸🇴",
    "languages": [
      "Somali",
      "English"
    ],
    "topics": [
      "Poetry",
      "Youth",
      "Spirituality"
    ],
    "verified": false,
    "verificationLevel": "community",
    "featured": false,
    "trending": true,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/boonaa-mohammed"
    }
  },
  {
    "id": "ahmed-deedat",
    "slug": "ahmed-deedat",
    "name": "Ahmed Deedat",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "east_africa",
    "country": "ZA",
    "countryFlag": "🇿🇦",
    "languages": [
      "English",
      "Arabic"
    ],
    "topics": [
      "Comparative Religion",
      "Dawah",
      "Debate"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": true,
    "lifespan": "1918-2005",
    "note": "Pioneer of comparative religion debates",
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/ahmed-deedat"
    }
  },
  {
    "id": "mishary-alafasy",
    "slug": "mishary-alafasy",
    "name": "Mishary Rashid Alafasy",
    "category": "reciter",
    "tier": "verified",
    "gender": "male",
    "region": "middle_east",
    "country": "KW",
    "countryFlag": "🇰🇼",
    "languages": [
      "Arabic"
    ],
    "topics": [
      "Quran",
      "Recitation"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": true,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/mishary-alafasy"
    }
  },
  {
    "id": "abdul-rahman-al-sudais",
    "slug": "abdul-rahman-al-sudais",
    "name": "Abdul Rahman Al-Sudais",
    "category": "reciter",
    "tier": "verified",
    "gender": "male",
    "region": "middle_east",
    "country": "SA",
    "countryFlag": "🇸🇦",
    "languages": [
      "Arabic"
    ],
    "topics": [
      "Quran",
      "Recitation"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": true,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/abdul-rahman-al-sudais"
    }
  },
  {
    "id": "assim-al-hakeem",
    "slug": "assim-al-hakeem",
    "name": "Assim Al-Hakeem",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "middle_east",
    "country": "SA",
    "countryFlag": "🇸🇦",
    "languages": [
      "Arabic",
      "English"
    ],
    "topics": [
      "Fiqh",
      "Q&A",
      "Daily Life"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": true,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/assim-al-hakeem"
    }
  },
  {
    "id": "amr-khaled",
    "slug": "amr-khaled",
    "name": "Amr Khaled",
    "category": "speaker",
    "tier": "verified",
    "gender": "male",
    "region": "middle_east",
    "country": "EG",
    "countryFlag": "🇪🇬",
    "languages": [
      "Arabic",
      "English"
    ],
    "topics": [
      "Youth",
      "Motivation",
      "Community"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/amr-khaled"
    }
  },
  {
    "id": "muhammad-nasiruddin-al-albani",
    "slug": "muhammad-nasiruddin-al-albani",
    "name": "Muhammad Nasiruddin al-Albani",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "middle_east",
    "country": "SY",
    "countryFlag": "🇸🇾",
    "languages": [
      "Arabic"
    ],
    "topics": [
      "Hadith",
      "Fiqh",
      "Aqeedah"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": true,
    "lifespan": "1914-1999",
    "note": "Renowned hadith scholar",
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/muhammad-nasiruddin-al-albani"
    }
  },
  {
    "id": "abd-al-aziz-ibn-baz",
    "slug": "abd-al-aziz-ibn-baz",
    "name": "Abd al-Aziz ibn Baz",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "middle_east",
    "country": "SA",
    "countryFlag": "🇸🇦",
    "languages": [
      "Arabic"
    ],
    "topics": [
      "Fiqh",
      "Aqeedah",
      "Fatwa"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": true,
    "lifespan": "1910-1999",
    "note": "Former Grand Mufti of Saudi Arabia",
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/abd-al-aziz-ibn-baz"
    }
  },
  {
    "id": "muhammad-ibn-al-uthaymeen",
    "slug": "muhammad-ibn-al-uthaymeen",
    "name": "Muhammad ibn al-Uthaymeen",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "middle_east",
    "country": "SA",
    "countryFlag": "🇸🇦",
    "languages": [
      "Arabic"
    ],
    "topics": [
      "Fiqh",
      "Aqeedah",
      "Tafsir"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": true,
    "lifespan": "1925-2001",
    "note": "Influential Saudi scholar",
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/muhammad-ibn-al-uthaymeen"
    }
  },
  {
    "id": "mohamed-metwally-al-shaarawy",
    "slug": "mohamed-metwally-al-shaarawy",
    "name": "Mohamed Metwally Al Shaarawy",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "middle_east",
    "country": "EG",
    "countryFlag": "🇪🇬",
    "languages": [
      "Arabic"
    ],
    "topics": [
      "Tafsir",
      "Quran",
      "Spirituality"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": true,
    "lifespan": "1911-1998",
    "note": "Beloved Egyptian scholar known for TV tafsir",
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/mohamed-metwally-al-shaarawy"
    }
  },
  {
    "id": "yusuf-al-qaradawi",
    "slug": "yusuf-al-qaradawi",
    "name": "Yusuf al-Qaradawi",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "middle_east",
    "country": "QA",
    "countryFlag": "🇶🇦",
    "languages": [
      "Arabic"
    ],
    "topics": [
      "Fiqh",
      "Fatwa",
      "Contemporary Issues"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": true,
    "lifespan": "1926-2022",
    "note": "Influential scholar, founder of IslamOnline",
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/yusuf-al-qaradawi"
    }
  },
  {
    "id": "tariq-jameel",
    "slug": "tariq-jameel",
    "name": "Tariq Jameel",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "south_asia",
    "country": "PK",
    "countryFlag": "🇵🇰",
    "languages": [
      "Urdu",
      "Arabic",
      "English"
    ],
    "topics": [
      "Spirituality",
      "Repentance",
      "Youth"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": true,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/tariq-jameel"
    }
  },
  {
    "id": "zakir-naik",
    "slug": "zakir-naik",
    "name": "Zakir Naik",
    "category": "speaker",
    "tier": "verified",
    "gender": "male",
    "region": "south_asia",
    "country": "IN",
    "countryFlag": "🇮🇳",
    "languages": [
      "English",
      "Urdu",
      "Arabic"
    ],
    "topics": [
      "Comparative Religion",
      "Dawah"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/zakir-naik"
    }
  },
  {
    "id": "farhat-hashmi",
    "slug": "farhat-hashmi",
    "name": "Farhat Hashmi",
    "category": "educator",
    "tier": "verified",
    "gender": "female",
    "region": "south_asia",
    "country": "PK",
    "countryFlag": "🇵🇰",
    "languages": [
      "Urdu",
      "Arabic",
      "English"
    ],
    "topics": [
      "Quran",
      "Women",
      "Tafsir"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/farhat-hashmi"
    }
  },
  {
    "id": "javed-ghamidi",
    "slug": "javed-ghamidi",
    "name": "Javed Ahmad Ghamidi",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "south_asia",
    "country": "PK",
    "countryFlag": "🇵🇰",
    "languages": [
      "Urdu",
      "Arabic",
      "English"
    ],
    "topics": [
      "Quran",
      "Theology",
      "Reform"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/javed-ghamidi"
    }
  },
  {
    "id": "allama-iqbal",
    "slug": "allama-iqbal",
    "name": "Allama Iqbal",
    "category": "author",
    "tier": "verified",
    "gender": "male",
    "region": "south_asia",
    "country": "PK",
    "countryFlag": "🇵🇰",
    "languages": [
      "Urdu",
      "Persian",
      "Arabic"
    ],
    "topics": [
      "Poetry",
      "Philosophy",
      "Spirituality"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": true,
    "trending": false,
    "isHistorical": true,
    "lifespan": "1877-1938",
    "note": "National poet of Pakistan, Islamic philosopher",
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/allama-iqbal"
    }
  },
  {
    "id": "sultan-bahu",
    "slug": "sultan-bahu",
    "name": "Sultan Bahu",
    "category": "author",
    "tier": "verified",
    "gender": "male",
    "region": "south_asia",
    "country": "PK",
    "countryFlag": "🇵🇰",
    "languages": [
      "Punjabi",
      "Persian",
      "Arabic"
    ],
    "topics": [
      "Sufism",
      "Poetry",
      "Spirituality"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": true,
    "lifespan": "1628-1691",
    "note": "Sufi saint and poet",
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/sultan-bahu"
    }
  },
  {
    "id": "bulleh-shah",
    "slug": "bulleh-shah",
    "name": "Bulleh Shah",
    "category": "author",
    "tier": "verified",
    "gender": "male",
    "region": "south_asia",
    "country": "PK",
    "countryFlag": "🇵🇰",
    "languages": [
      "Punjabi",
      "Persian"
    ],
    "topics": [
      "Sufism",
      "Poetry",
      "Spirituality"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": true,
    "lifespan": "1680-1757",
    "note": "Sufi poet of Punjab",
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/bulleh-shah"
    }
  },
  {
    "id": "ahmed-raza-khan-barelvi",
    "slug": "ahmed-raza-khan-barelvi",
    "name": "Ahmed Raza Khan Barelvi",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "south_asia",
    "country": "IN",
    "countryFlag": "🇮🇳",
    "languages": [
      "Urdu",
      "Arabic",
      "Persian"
    ],
    "topics": [
      "Fiqh",
      "Aqeedah",
      "Sufism"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": true,
    "lifespan": "1856-1921",
    "note": "Founder of Barelvi movement",
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/ahmed-raza-khan-barelvi"
    }
  },
  {
    "id": "ashraf-ali-thanwi",
    "slug": "ashraf-ali-thanwi",
    "name": "Ashraf Ali Thanwi",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "south_asia",
    "country": "IN",
    "countryFlag": "🇮🇳",
    "languages": [
      "Urdu",
      "Arabic",
      "Persian"
    ],
    "topics": [
      "Tasawwuf",
      "Tafsir",
      "Fiqh"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": true,
    "lifespan": "1863-1943",
    "note": "Deobandi scholar, author of Bahishti Zewar",
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/ashraf-ali-thanwi"
    }
  },
  {
    "id": "abul-ala-maududi",
    "slug": "abul-ala-maududi",
    "name": "Abul A'la Maududi",
    "category": "author",
    "tier": "verified",
    "gender": "male",
    "region": "south_asia",
    "country": "PK",
    "countryFlag": "🇵🇰",
    "languages": [
      "Urdu",
      "Arabic",
      "English"
    ],
    "topics": [
      "Tafsir",
      "Political Islam",
      "Theology"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": true,
    "lifespan": "1903-1979",
    "note": "Founder of Jamaat-e-Islami, author of Tafhim al-Quran",
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/abul-ala-maududi"
    }
  },
  {
    "id": "sayyid-qutb",
    "slug": "sayyid-qutb",
    "name": "Sayyid Qutb",
    "category": "author",
    "tier": "verified",
    "gender": "male",
    "region": "middle_east",
    "country": "EG",
    "countryFlag": "🇪🇬",
    "languages": [
      "Arabic"
    ],
    "topics": [
      "Tafsir",
      "Political Islam",
      "Theology"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": true,
    "lifespan": "1906-1966",
    "note": "Author of Fi Zilal al-Quran (In the Shade of the Quran)",
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/sayyid-qutb"
    }
  },
  {
    "id": "abdal-hakim-murad",
    "slug": "abdal-hakim-murad",
    "name": "Abdal Hakim Murad",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "europe",
    "country": "GB",
    "countryFlag": "🇬🇧",
    "languages": [
      "English",
      "Arabic"
    ],
    "topics": [
      "Traditional Islam",
      "Philosophy",
      "Western Muslims"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": true,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/abdal-hakim-murad"
    }
  },
  {
    "id": "hamza-tzortzis",
    "slug": "hamza-tzortzis",
    "name": "Hamza Tzortzis",
    "category": "speaker",
    "tier": "verified",
    "gender": "male",
    "region": "europe",
    "country": "GB",
    "countryFlag": "🇬🇧",
    "languages": [
      "English",
      "Arabic"
    ],
    "topics": [
      "Dawah",
      "Philosophy",
      "Apologetics"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/hamza-tzortzis"
    }
  },
  {
    "id": "mohammed-hijab",
    "slug": "mohammed-hijab",
    "name": "Mohammed Hijab",
    "category": "speaker",
    "tier": "verified",
    "gender": "male",
    "region": "europe",
    "country": "GB",
    "countryFlag": "🇬🇧",
    "languages": [
      "English",
      "Arabic"
    ],
    "topics": [
      "Dawah",
      "Apologetics",
      "Debate"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": true,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/mohammed-hijab"
    }
  },
  {
    "id": "ali-dawah",
    "slug": "ali-dawah",
    "name": "Ali Dawah",
    "category": "speaker",
    "tier": "rising",
    "gender": "male",
    "region": "europe",
    "country": "GB",
    "countryFlag": "🇬🇧",
    "languages": [
      "English"
    ],
    "topics": [
      "Dawah",
      "Street Preaching",
      "Youth"
    ],
    "verified": false,
    "verificationLevel": "community",
    "featured": false,
    "trending": true,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/ali-dawah"
    }
  },
  {
    "id": "fatima-barkatulla",
    "slug": "fatima-barkatulla",
    "name": "Fatima Barkatulla",
    "category": "author",
    "tier": "verified",
    "gender": "female",
    "region": "europe",
    "country": "GB",
    "countryFlag": "🇬🇧",
    "languages": [
      "English",
      "Arabic"
    ],
    "topics": [
      "Women",
      "Family",
      "Parenting"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/fatima-barkatulla"
    }
  },
  {
    "id": "zara-mohammed",
    "slug": "zara-mohammed",
    "name": "Zara Mohammed",
    "category": "activist",
    "tier": "rising",
    "gender": "female",
    "region": "europe",
    "country": "GB",
    "countryFlag": "🇬🇧",
    "languages": [
      "English"
    ],
    "topics": [
      "Leadership",
      "Women",
      "Community"
    ],
    "verified": false,
    "verificationLevel": "community",
    "featured": false,
    "trending": true,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/zara-mohammed"
    }
  },
  {
    "id": "yahya-ibrahim",
    "slug": "yahya-ibrahim",
    "name": "Yahya Ibrahim",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "southeast_asia",
    "country": "AU",
    "countryFlag": "🇦🇺",
    "languages": [
      "English",
      "Arabic"
    ],
    "topics": [
      "Education",
      "Youth",
      "Community"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/yahya-ibrahim"
    }
  },
  {
    "id": "tawfique-chowdhury",
    "slug": "tawfique-chowdhury",
    "name": "Tawfique Chowdhury",
    "category": "scholar",
    "tier": "verified",
    "gender": "male",
    "region": "southeast_asia",
    "country": "AU",
    "countryFlag": "🇦🇺",
    "languages": [
      "English",
      "Arabic",
      "Bengali"
    ],
    "topics": [
      "Leadership",
      "Business",
      "Community"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/tawfique-chowdhury"
    }
  },
  {
    "id": "abdul-somad",
    "slug": "abdul-somad",
    "name": "Abdul Somad",
    "category": "speaker",
    "tier": "verified",
    "gender": "male",
    "region": "southeast_asia",
    "country": "ID",
    "countryFlag": "🇮🇩",
    "languages": [
      "Indonesian",
      "Arabic"
    ],
    "topics": [
      "Dawah",
      "Youth",
      "Community"
    ],
    "verified": true,
    "verificationLevel": "official",
    "featured": false,
    "trending": false,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/abdul-somad"
    }
  },
  {
    "id": "felix-siauw",
    "slug": "felix-siauw",
    "name": "Felix Siauw",
    "category": "speaker",
    "tier": "rising",
    "gender": "male",
    "region": "southeast_asia",
    "country": "ID",
    "countryFlag": "🇮🇩",
    "languages": [
      "Indonesian",
      "English"
    ],
    "topics": [
      "Youth",
      "Converts",
      "Modern Life"
    ],
    "verified": false,
    "verificationLevel": "community",
    "featured": false,
    "trending": true,
    "isHistorical": false,
    "socialLinks": {
      "podcast": "https://feeds.muslimcentral.com/felix-siauw"
    }
  }
];

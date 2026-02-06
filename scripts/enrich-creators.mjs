/**
 * Creator Data Enrichment Script
 * Adds bios, YouTube, Twitter, Instagram, and website links to seed data.
 * Run: node scripts/enrich-creators.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, '..', 'lib', 'data', 'creators.ts');

let content = readFileSync(filePath, 'utf-8');

// Enrichment data: keyed by creator ID
const enrichments = {
  "omar-suleiman": {
    note: "Founder and president of Yaqeen Institute for Islamic Research",
    socialLinks: {
      youtube: "https://www.youtube.com/@OmarSuleiman",
      twitter: "https://twitter.com/omarsuleiman",
      instagram: "https://www.instagram.com/imamomarsuleiman",
      website: "https://yaqeeninstitute.org"
    }
  },
  "nouman-ali-khan": {
    note: "Founder of Bayyinah Institute, renowned Quran and Arabic educator",
    socialLinks: {
      youtube: "https://www.youtube.com/@bayyinah",
      instagram: "https://www.instagram.com/noumanali1",
      website: "https://www.bayyinah.com"
    }
  },
  "yasir-qadhi": {
    note: "Dean of the Islamic Seminary of America, Yale PhD in Islamic Studies",
    socialLinks: {
      youtube: "https://www.youtube.com/@YasirQadhi",
      twitter: "https://twitter.com/YasirQadhi",
      website: "https://www.yasirqadhi.com"
    }
  },
  "hamza-yusuf": {
    note: "Co-founder of Zaytuna College, first accredited Muslim liberal arts college in the US",
    socialLinks: {
      youtube: "https://www.youtube.com/@zaytunacollege",
      website: "https://www.zaytuna.edu"
    }
  },
  "zaid-shakir": {
    note: "Co-founder of Zaytuna College, scholar of Islamic law and social justice",
    socialLinks: {
      twitter: "https://twitter.com/imamzaidshakir",
      website: "https://www.zaytuna.edu"
    }
  },
  "suhaib-webb": {
    note: "American imam and scholar, known for accessible online Islamic education",
    socialLinks: {
      instagram: "https://www.instagram.com/suhaibwebb"
    }
  },
  "siraj-wahhaj": {
    note: "Imam of Masjid Al-Taqwa in Brooklyn, first Muslim to give opening prayer in US Congress",
    socialLinks: {}
  },
  "abdul-nasir-jangda": {
    note: "Founder of Qalam Institute, expert in Seerah and Quranic Arabic",
    socialLinks: {
      youtube: "https://www.youtube.com/@QalamInstitute",
      instagram: "https://www.instagram.com/abdulnasirjangda",
      website: "https://www.qalaminstitute.org"
    }
  },
  "abdelrahman-murphy": {
    note: "Resident scholar at Roots Community Center, host of Khutbah podcast",
    socialLinks: {
      youtube: "https://www.youtube.com/@RootsCommunity",
      instagram: "https://www.instagram.com/abdelrahmanm"
    }
  },
  "saad-tasleem": {
    note: "AlMaghrib Institute instructor, known for engaging youth-focused content",
    socialLinks: {
      instagram: "https://www.instagram.com/saadtasleem"
    }
  },
  "wisam-sharieff": {
    note: "Quran coach and recitation instructor, founder of Quran Revolution",
    socialLinks: {
      youtube: "https://www.youtube.com/@WisamSharieff",
      instagram: "https://www.instagram.com/wisamsharieff"
    }
  },
  "jonathan-brown": {
    note: "Georgetown professor of Islamic civilization, author of Misquoting Muhammad",
    socialLinks: {
      twitter: "https://twitter.com/jonathanacbrown"
    }
  },
  "sherman-jackson": {
    note: "USC professor, leading voice on Islam and Black American Muslim experience",
    socialLinks: {}
  },
  "yasmin-mogahed": {
    note: "Author of Reclaim Your Heart, international speaker on spirituality and healing",
    socialLinks: {
      youtube: "https://www.youtube.com/@YasminMogahed",
      twitter: "https://twitter.com/YasminMogahed",
      instagram: "https://www.instagram.com/yasminmogahed",
      website: "https://www.yasminmogahed.com"
    }
  },
  "dalia-mogahed": {
    note: "Director of research at ISPU, author of American Muslim Poll, former Obama advisor",
    socialLinks: {
      twitter: "https://twitter.com/DaliaMogahed",
      instagram: "https://www.instagram.com/daliamogahed",
      website: "https://www.ispu.org"
    }
  },
  "ingrid-mattson": {
    note: "Former president of ISNA, professor at Huron University College",
    socialLinks: {
      twitter: "https://twitter.com/IngridMattson"
    }
  },
  "ieasha-prime": {
    note: "Speaker on women's issues, family, and Islamic identity in America",
    socialLinks: {
      instagram: "https://www.instagram.com/ieashaprime"
    }
  },
  "haleh-banani": {
    note: "Licensed clinical psychologist specializing in Muslim family counseling",
    socialLinks: {
      youtube: "https://www.youtube.com/@HalehBanani",
      instagram: "https://www.instagram.com/halehbanani",
      website: "https://www.halehbanani.com"
    }
  },
  "tamara-gray": {
    note: "Founder of Rabata, scholar of women in Islamic civilization",
    socialLinks: {
      website: "https://rabata.org"
    }
  },
  "maryam-amir": {
    note: "Quran educator and speaker on women and youth issues",
    socialLinks: {
      instagram: "https://www.instagram.com/maryamamir"
    }
  },
  // PUBLIC FIGURES - remove bogus podcast links
  "dave-chappelle": {
    note: "Muslim stand-up comedian and actor",
    socialLinks: {},
    removePodcast: true
  },
  "mahershala-ali": {
    note: "Two-time Oscar-winning actor, first Muslim to win an Academy Award",
    socialLinks: {
      instagram: "https://www.instagram.com/mahershalaali"
    },
    removePodcast: true
  },
  "hasan-minhaj": {
    note: "Comedian, TV host, and former correspondent on The Daily Show",
    socialLinks: {
      youtube: "https://www.youtube.com/@HasanMinhaj",
      instagram: "https://www.instagram.com/hasanminhaj"
    },
    removePodcast: true
  },
  "ramy-youssef": {
    note: "Golden Globe-winning creator and star of Hulu's Ramy",
    socialLinks: {
      instagram: "https://www.instagram.com/ramy",
      twitter: "https://twitter.com/ramyyoussef"
    },
    removePodcast: true
  },
  "linda-sarsour": {
    note: "Palestinian-American activist, co-chair of the Women's March",
    socialLinks: {
      twitter: "https://twitter.com/lsarsour",
      instagram: "https://www.instagram.com/lindasarsour"
    },
    removePodcast: true
  },
  "ilhan-omar": {
    note: "Somali-American congresswoman, first Muslim woman elected to US Congress",
    socialLinks: {
      twitter: "https://twitter.com/IlhanMN",
      instagram: "https://www.instagram.com/ilhanomar"
    },
    removePodcast: true
  },
  "keith-ellison": {
    note: "First Muslim elected to US Congress, Minnesota Attorney General",
    socialLinks: {
      twitter: "https://twitter.com/keithellison"
    },
    removePodcast: true
  },
  "ibtihaj-muhammad": {
    note: "Olympic bronze medalist fencer, first US athlete to compete in hijab at the Olympics",
    socialLinks: {
      twitter: "https://twitter.com/IbtihajMuhammad",
      instagram: "https://www.instagram.com/ibtihajmuhammad"
    },
    removePodcast: true
  },
  "noor-tagouri": {
    note: "Journalist and media personality, advocate for Muslim representation",
    socialLinks: {
      instagram: "https://www.instagram.com/noortagouri",
      twitter: "https://twitter.com/NoorTagouri"
    },
    removePodcast: true
  },
  "imran-khan": {
    note: "Former Prime Minister of Pakistan, cricket legend, founder of PTI",
    socialLinks: {
      twitter: "https://twitter.com/ImranKhanPTI",
      instagram: "https://www.instagram.com/imrankhan.pti"
    },
    removePodcast: true
  },
  // EAST AFRICA
  "mufti-menk": {
    note: "Grand Mufti of Zimbabwe, one of the most followed Islamic scholars on social media",
    socialLinks: {
      youtube: "https://www.youtube.com/@MuftiMenk",
      instagram: "https://www.instagram.com/muftimenovmenk",
      website: "https://www.muftimenk.com"
    }
  },
  "said-rageah": {
    note: "Somali-Canadian imam and speaker, founder of Masjid Huda in Montreal",
    socialLinks: {
      youtube: "https://www.youtube.com/@SaidRageah"
    }
  },
  "sheikh-umal": {
    note: "Somali scholar known for Quran and fiqh teachings in the diaspora",
    socialLinks: {}
  },
  "sheikh-hassan-jaamici": {
    note: "Minneapolis-based Somali scholar serving the local Muslim community",
    socialLinks: {}
  },
  "mohamed-idris": {
    note: "Minneapolis-based Somali scholar focused on Quran and community education",
    socialLinks: {}
  },
  "nuradin-jama": {
    note: "Somali youth speaker and dawah advocate in the diaspora",
    socialLinks: {}
  },
  "boonaa-mohammed": {
    note: "Ethiopian-Canadian spoken word poet and filmmaker",
    socialLinks: {
      youtube: "https://www.youtube.com/@BoonaaMohammed",
      instagram: "https://www.instagram.com/boonaamo"
    }
  },
  // MIDDLE EAST
  "mishary-alafasy": {
    note: "World-renowned Kuwaiti Quran reciter, imam of the Grand Mosque in Kuwait",
    socialLinks: {
      youtube: "https://www.youtube.com/@Alafasy"
    }
  },
  "abdul-rahman-al-sudais": {
    note: "Imam and khatib of Masjid al-Haram in Mecca, renowned Quran reciter",
    socialLinks: {}
  },
  "assim-al-hakeem": {
    note: "Saudi scholar known for popular YouTube Q&A sessions on Islamic rulings",
    socialLinks: {
      youtube: "https://www.youtube.com/@assimalhakeem",
      website: "https://www.assimalhakeem.net"
    }
  },
  "amr-khaled": {
    note: "Egyptian TV preacher, one of the most influential Muslim figures in the Arab world",
    socialLinks: {
      youtube: "https://www.youtube.com/@AmrKhaled",
      twitter: "https://twitter.com/AmrKhaled",
      instagram: "https://www.instagram.com/amrkhaled",
      website: "https://www.amrkhaled.net"
    }
  },
  // SOUTH ASIA
  "tariq-jameel": {
    note: "Pakistani scholar of the Tablighi Jamaat, known for emotional sermons on repentance",
    socialLinks: {
      youtube: "https://www.youtube.com/@TariqJameel"
    }
  },
  "zakir-naik": {
    note: "Founder of Peace TV, known for comparative religion lectures and debates",
    socialLinks: {
      youtube: "https://www.youtube.com/@DrZakirNaik"
    }
  },
  "farhat-hashmi": {
    note: "Founder of Al-Huda International, pioneering women's Quran education",
    socialLinks: {
      website: "https://www.alhudapk.com"
    }
  },
  "javed-ghamidi": {
    note: "Pakistani theologian and Quran scholar, known for progressive Islamic thought",
    socialLinks: {
      youtube: "https://www.youtube.com/@JavedAhmadGhamidi",
      website: "https://www.javedahmadghamidi.org"
    }
  },
  // EUROPE
  "abdal-hakim-murad": {
    note: "Dean of Cambridge Muslim College, British scholar of traditional Islamic thought",
    socialLinks: {
      youtube: "https://www.youtube.com/@CambridgeMuslimCollege",
      website: "https://www.cambridgemuslimcollege.ac.uk"
    }
  },
  "hamza-tzortzis": {
    note: "Greek-British speaker and author, co-founder of Sapience Institute",
    socialLinks: {
      youtube: "https://www.youtube.com/@SapienceInstitute",
      twitter: "https://twitter.com/HmzaTzortzis",
      instagram: "https://www.instagram.com/hamza.tzortzis",
      website: "https://www.sapienceinstitute.org"
    }
  },
  "mohammed-hijab": {
    note: "British speaker, debater, and popular YouTuber on Islamic apologetics",
    socialLinks: {
      youtube: "https://www.youtube.com/@MohammedHijab",
      twitter: "https://twitter.com/MohammedHijab",
      instagram: "https://www.instagram.com/mohammed_hijab"
    }
  },
  "ali-dawah": {
    note: "British street dawah YouTuber and speaker, known for engaging debates",
    socialLinks: {
      youtube: "https://www.youtube.com/@AliDawah",
      twitter: "https://twitter.com/AliDawah",
      instagram: "https://www.instagram.com/alidawah"
    }
  },
  "fatima-barkatulla": {
    note: "British author, scholar, and podcaster on women, family, and parenting in Islam",
    socialLinks: {
      youtube: "https://www.youtube.com/@FatimaBarkatulla",
      twitter: "https://twitter.com/fatimabarkatulla"
    }
  },
  "zara-mohammed": {
    note: "Youngest and first female Secretary General of the Muslim Council of Britain",
    socialLinks: {
      twitter: "https://twitter.com/Zara_Mohammed1"
    },
    removePodcast: true
  },
  // SOUTHEAST ASIA
  "yahya-ibrahim": {
    note: "Australian imam and AlMaghrib Institute instructor, popular on social media",
    socialLinks: {
      youtube: "https://www.youtube.com/@ShYahyaIbrahim",
      instagram: "https://www.instagram.com/yahyaibrahim"
    }
  },
  "tawfique-chowdhury": {
    note: "Australian-Bangladeshi scholar, founder of Mercy Mission and AlKauthar Institute",
    socialLinks: {}
  },
  "abdul-somad": {
    note: "Indonesian preacher, one of the most popular Islamic speakers in Southeast Asia",
    socialLinks: {
      youtube: "https://www.youtube.com/@UstadzAbdulSomad"
    }
  },
  "felix-siauw": {
    note: "Chinese-Indonesian convert, popular speaker on youth and modern Muslim life",
    socialLinks: {
      instagram: "https://www.instagram.com/felixsiauw"
    }
  }
};

// Parse the file to find each creator and enrich
for (const [creatorId, data] of Object.entries(enrichments)) {
  // Find the creator block
  const idPattern = `"id": "${creatorId}"`;
  const idIndex = content.indexOf(idPattern);

  if (idIndex === -1) {
    console.log(`WARNING: Creator ${creatorId} not found in file`);
    continue;
  }

  // Add note if not already present
  if (data.note) {
    // Check if note already exists for this creator
    const nextCreatorIndex = content.indexOf('"id":', idIndex + 1);
    const creatorBlock = nextCreatorIndex > -1
      ? content.substring(idIndex, nextCreatorIndex)
      : content.substring(idIndex);

    if (!creatorBlock.includes('"note":')) {
      // Add note before socialLinks
      const socialLinksPos = content.indexOf('"socialLinks":', idIndex);
      if (socialLinksPos > -1 && (nextCreatorIndex === -1 || socialLinksPos < nextCreatorIndex)) {
        const insertPos = socialLinksPos;
        const indent = '    ';
        content = content.substring(0, insertPos) +
          `"note": ${JSON.stringify(data.note)},\n${indent}` +
          content.substring(insertPos);
      }
    } else {
      // Update existing note
      const noteStart = content.indexOf('"note":', idIndex);
      if (noteStart > -1 && (nextCreatorIndex === -1 || noteStart < nextCreatorIndex)) {
        const noteValueStart = content.indexOf(':', noteStart) + 1;
        const noteLineEnd = content.indexOf('\n', noteValueStart);
        const oldNoteValue = content.substring(noteValueStart, noteLineEnd);
        content = content.substring(0, noteValueStart) +
          ` ${JSON.stringify(data.note)},` +
          content.substring(noteLineEnd);
      }
    }
  }

  // Update socialLinks
  if (data.socialLinks !== undefined) {
    const socialLinksStart = content.indexOf('"socialLinks":', idIndex);
    const nextCreatorIdx = content.indexOf('"id":', idIndex + 1);

    if (socialLinksStart > -1 && (nextCreatorIdx === -1 || socialLinksStart < nextCreatorIdx)) {
      // Find the opening { of socialLinks
      const openBrace = content.indexOf('{', socialLinksStart);
      // Find matching closing }
      let braceCount = 1;
      let pos = openBrace + 1;
      while (braceCount > 0 && pos < content.length) {
        if (content[pos] === '{') braceCount++;
        if (content[pos] === '}') braceCount--;
        pos++;
      }
      const closeBrace = pos - 1;

      // Get existing podcast link if we should keep it
      const existingBlock = content.substring(openBrace, closeBrace + 1);
      const podcastMatch = existingBlock.match(/"podcast":\s*"([^"]+)"/);

      // Build new socialLinks
      const newLinks = { ...data.socialLinks };
      if (podcastMatch && !data.removePodcast) {
        newLinks.podcast = podcastMatch[1];
      }

      // Format the socialLinks object
      const entries = Object.entries(newLinks);
      let formatted;
      if (entries.length === 0) {
        formatted = '{}';
      } else {
        const lines = entries.map(([k, v]) => `      "${k}": "${v}"`);
        formatted = '{\n' + lines.join(',\n') + '\n    }';
      }

      content = content.substring(0, openBrace) + formatted + content.substring(closeBrace + 1);
    }
  }

  console.log(`Enriched: ${creatorId}`);
}

writeFileSync(filePath, content, 'utf-8');
console.log('\nDone! File updated successfully.');

// Verify
const lines = content.split('\n').length;
const noteCount = (content.match(/"note":/g) || []).length;
const ytCount = (content.match(/"youtube":/g) || []).length;
const twCount = (content.match(/"twitter":/g) || []).length;
const igCount = (content.match(/"instagram":/g) || []).length;
const webCount = (content.match(/"website":/g) || []).length;

console.log(`\nFile: ${lines} lines`);
console.log(`Notes: ${noteCount}`);
console.log(`YouTube: ${ytCount}`);
console.log(`Twitter: ${twCount}`);
console.log(`Instagram: ${igCount}`);
console.log(`Website: ${webCount}`);

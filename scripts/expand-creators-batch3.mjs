/**
 * Creator Database Expansion Script - Batch 3
 * Final push to 500 creators
 * Run: node scripts/expand-creators-batch3.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, '..', 'lib', 'data', 'creators.ts');

function c(id, name, category, tier, gender, region, country, flag, languages, topics, opts = {}) {
  return {
    id, slug: id, name, category, tier, gender, region, country,
    countryFlag: flag, languages, topics,
    verified: opts.verified ?? (tier === 'verified'),
    verificationLevel: opts.verificationLevel ?? (tier === 'verified' ? 'official' : 'community'),
    featured: opts.featured ?? false,
    trending: opts.trending ?? false,
    isHistorical: opts.isHistorical ?? false,
    ...(opts.lifespan ? { lifespan: opts.lifespan } : {}),
    ...(opts.note ? { note: opts.note } : {}),
    socialLinks: opts.socialLinks ?? {}
  };
}

// ==========================================
// MORE PODCASTERS & CONTENT CREATORS
// ==========================================
const podcasters = [
  c("omar-usman", "Omar Usman", "podcaster", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English"], ["Leadership", "Community", "Management"], { note: "Host of Muslim community leadership podcast" }),
  c("imam-tom-facchine", "Imam Tom Facchine", "podcaster", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Theology", "Q&A", "Youth"], { note: "American imam and podcast host covering Islamic theology" }),
  c("hasib-noor", "Hasib Noor", "podcaster", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["History", "Youth", "Culture"], { note: "Islamic historian and podcast creator at Yaqeen Institute" }),
  c("ali-hammuda", "Ali Hammuda", "podcaster", "rising", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English", "Arabic"], ["Youth", "Spirituality", "Self-Improvement"], { note: "Palestinian-British imam and Islamic content creator" }),
  c("ustadh-abdulrahman-hassan", "Abdulrahman Hassan", "podcaster", "rising", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English", "Arabic"], ["Aqeedah", "Youth", "Dawah"], { note: "UK-based Sudanese scholar and podcast host" }),
  c("mohamed-hoblos", "Mohamed Hoblos", "podcaster", "rising", "male", "southeast_asia", "AU", "\u{1F1E6}\u{1F1FA}", ["English", "Arabic"], ["Youth", "Motivation", "Repentance"], { note: "Australian-Lebanese Islamic speaker and podcast creator" }),
  c("khalil-jaffer", "Khalil Jaffer", "podcaster", "verified", "male", "americas", "CA", "\u{1F1E8}\u{1F1E6}", ["English", "Arabic"], ["Philosophy", "Spirituality", "Psychology"], { note: "Canadian Shia speaker exploring Islam and psychology" }),
  c("brother-ali-rapper", "Brother Ali", "podcaster", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English"], ["Arts", "Social Justice", "Converts"], { note: "American Muslim hip-hop artist and podcast host" }),
  c("mohammed-hijab", "Mohammed Hijab", "podcaster", "rising", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English", "Arabic"], ["Apologetics", "Debate", "Philosophy"], { note: "British Islamic apologist and podcast/debate content creator", trending: true }),
  c("musa-adnan-podcast", "Musa Adnan", "podcaster", "rising", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English"], ["Youth", "Fitness", "Motivation"], { note: "British Muslim fitness influencer and podcast host" }),
];

// ==========================================
// MORE YOUTH LEADERS & INFLUENCERS
// ==========================================
const youthInfluencers = [
  c("harris-j", "Harris J", "influencer", "rising", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English"], ["Nasheeds", "Youth", "Music"], { note: "British-Muslim nasheed artist and Awakening Music singer" }),
  c("maher-zain", "Maher Zain", "influencer", "verified", "male", "europe", "SE", "\u{1F1F8}\u{1F1EA}", ["English", "Arabic", "Swedish"], ["Nasheeds", "Music", "Youth"], { note: "Lebanese-Swedish nasheed artist, one of the most popular in the world", featured: true }),
  c("humza-arshad", "Humza Arshad", "influencer", "rising", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English"], ["Comedy", "Youth", "Counter-Extremism"], { note: "British-Pakistani YouTube comedian and anti-extremism campaigner" }),
  c("adam-saleh", "Adam Saleh", "influencer", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Entertainment", "Youth", "Social Media"], { note: "Yemeni-American YouTuber and vlogger" }),
  c("dina-tokio", "Dina Tokio", "influencer", "rising", "female", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English"], ["Fashion", "Women", "Lifestyle"], { note: "British-Egyptian Muslim fashion influencer and vlogger" }),
  c("noor-tagouri", "Noor Tagouri", "influencer", "rising", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Journalism", "Women", "Representation"], { note: "Libyan-American journalist, first hijabi in Playboy interview" }),
  c("leena-snoubar", "Leena Snoubar", "influencer", "rising", "female", "middle_east", "JO", "\u{1F1EF}\u{1F1F4}", ["Arabic", "English"], ["Fitness", "Women", "Health"], { note: "Jordanian Muslim fitness influencer breaking stereotypes" }),
  c("sham-idrees", "Sham Idrees", "influencer", "rising", "male", "americas", "CA", "\u{1F1E8}\u{1F1E6}", ["English", "Urdu"], ["Entertainment", "Youth", "Family"], { note: "Pakistani-Canadian YouTuber and content creator" }),
  c("amena-khan", "Amena Khan", "influencer", "rising", "female", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English"], ["Fashion", "Beauty", "Women"], { note: "British Muslim beauty blogger and L'Oreal ambassador" }),
  c("khadijah-mellah", "Khadijah Mellah", "youth_leader", "rising", "female", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English"], ["Sports", "Women", "Youth"], { note: "First British Muslim woman jockey, rode in Goodwood horse race" }),
  c("yuna-singer", "Yuna", "influencer", "rising", "female", "southeast_asia", "MY", "\u{1F1F2}\u{1F1FE}", ["English", "Malay"], ["Music", "Arts", "Representation"], { note: "Malaysian singer-songwriter who wears hijab in international music scene" }),
  c("dalya-musa", "Dalya Musa", "youth_leader", "rising", "female", "east_africa", "SD", "\u{1F1F8}\u{1F1E9}", ["Arabic", "English"], ["Youth", "Activism", "Women"], { note: "Sudanese youth activist and women's empowerment advocate" }),
  c("mohammed-assaf", "Mohammed Assaf", "public_figure", "rising", "male", "middle_east", "PS", "\u{1F1F5}\u{1F1F8}", ["Arabic"], ["Arts", "Music", "Representation"], { note: "Palestinian singer and Arab Idol winner, UNRWA ambassador" }),
  c("deen-squad", "Karter Zaher", "influencer", "rising", "male", "americas", "CA", "\u{1F1E8}\u{1F1E6}", ["English", "Arabic"], ["Music", "Youth", "Dawah"], { note: "Muslim hip-hop artist behind Deen Squad, Islamic music remixes" }),
  c("faisal-khan", "Faisal Khan", "youth_leader", "rising", "male", "south_asia", "IN", "\u{1F1EE}\u{1F1F3}", ["Hindi", "English"], ["Dance", "Youth", "Arts"], { note: "Indian Muslim dancer and actor, youth icon" }),
];

// ==========================================
// MORE FEMALE SCHOLARS & EDUCATORS
// ==========================================
const femaleScholars = [
  c("dr-rania-awaad", "Dr. Rania Awaad", "scholar", "verified", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Mental Health", "Women", "Spirituality"], { note: "Stanford psychiatrist and Islamic scholar bridging mental health and faith" }),
  c("ustadha-yasmin-mogahed", "Yasmin Mogahed", "speaker", "verified", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Spirituality", "Women", "Self-Improvement"], { note: "American Islamic speaker and author of Reclaim Your Heart", trending: true }),
  c("dr-tamara-gray", "Dr. Tamara Gray", "scholar", "verified", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Women", "History", "Education"], { note: "Founder of Rabata, American Islamic women's studies scholar" }),
  c("dr-ayesha-siddiqua", "Dr. Ayesha Siddiqua Chaudhry", "scholar", "rising", "female", "americas", "CA", "\u{1F1E8}\u{1F1E6}", ["English", "Urdu", "Arabic"], ["Women", "Theology", "Gender"], { note: "UBC professor of Islamic studies and gender in religion" }),
  c("pieternella-van-doorn-harder", "Dr. Celene Ibrahim", "scholar", "rising", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Interfaith", "Women", "Chaplaincy"], { note: "American Muslim chaplain and author on Islamic women's leadership" }),
  c("dr-amina-wadud", "Dr. Amina Wadud", "scholar", "verified", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Quran", "Women", "Gender"], { note: "American scholar of Islamic feminism, author of Quran and Woman" }),
  c("sheikha-halima-krausen", "Sheikha Halima Krausen", "scholar", "verified", "female", "europe", "DE", "\u{1F1E9}\u{1F1EA}", ["German", "Arabic", "English"], ["Interfaith", "Theology", "Women"], { note: "German female imam and interfaith scholar in Hamburg" }),
  c("ustadha-naielah-ackbarali", "Naielah Ackbarali", "educator", "rising", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Fiqh", "Women", "Education"], { note: "American Islamic educator specializing in women's fiqh" }),
  c("shaykha-maryam-amir", "Maryam Amir", "educator", "rising", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Quran", "Women", "Youth"], { note: "American Quran teacher and Islamic educator" }),
  c("dr-sara-elnakib", "Dr. Sara Elnakib", "educator", "rising", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Family", "Marriage", "Women"], { note: "American Muslim family therapist and Islamic educator" }),
  c("fatima-barkatulla", "Fatima Barkatulla", "author", "rising", "female", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English", "Arabic"], ["Women", "Theology", "Family"], { note: "British author and Islamic speaker on women in Islam" }),
  c("dr-hajer-al-faham", "Hana Alasry", "educator", "rising", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Youth", "Dawah", "Women"], { note: "Yaqeen Institute researcher and Islamic educator" }),
];

// ==========================================
// MORE RECITERS
// ==========================================
const reciters = [
  c("abdul-basit-abdus-samad", "Abdul Basit Abdus Samad", "reciter", "verified", "male", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic"], ["Quran", "Recitation", "Tajweed"], { note: "Legendary Egyptian Quran reciter, considered one of the greatest", isHistorical: true, lifespan: "1927-1988", featured: true }),
  c("mahmoud-khalil-al-hussary", "Mahmoud Khalil Al-Hussary", "reciter", "verified", "male", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic"], ["Quran", "Tajweed", "Education"], { note: "Egyptian Quran reciter, first to record complete Quran recitation", isHistorical: true, lifespan: "1917-1980" }),
  c("sheikh-muhammad-siddiq-al-minshawi", "Muhammad Siddiq Al-Minshawi", "reciter", "verified", "male", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic"], ["Quran", "Recitation"], { note: "Egyptian Quran reciter known for his emotional and melodious style", isHistorical: true, lifespan: "1920-1969" }),
  c("saad-al-ghamdi", "Saad al-Ghamdi", "reciter", "verified", "male", "middle_east", "SA", "\u{1F1F8}\u{1F1E6}", ["Arabic"], ["Quran", "Recitation"], { note: "Saudi Quran reciter with one of the most widely downloaded recitations" }),
  c("ahmad-al-ajmi", "Ahmad Al-Ajmi", "reciter", "verified", "male", "middle_east", "KW", "\u{1F1F0}\u{1F1FC}", ["Arabic"], ["Quran", "Recitation"], { note: "Kuwaiti Quran reciter known for his emotional and powerful voice" }),
  c("hazza-al-balushi", "Hazza Al Balushi", "reciter", "rising", "male", "middle_east", "AE", "\u{1F1E6}\u{1F1EA}", ["Arabic"], ["Quran", "Recitation", "Youth"], { note: "Young Emirati Quran reciter trending on social media", trending: true }),
  c("ismail-annuri", "Ismail Annuri", "reciter", "verified", "male", "southeast_asia", "MY", "\u{1F1F2}\u{1F1FE}", ["Malay", "Arabic"], ["Quran", "Recitation", "Tajweed"], { note: "Malaysian international Quran competition champion" }),
  c("fatih-seferagic", "Fatih Seferagic", "reciter", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic", "Bosnian"], ["Quran", "Youth", "Recitation"], { note: "Bosnian-American hafiz and young Quran reciter popular on social media", trending: true }),
  c("qari-waheed-zafar-qasmi", "Qari Waheed Zafar Qasmi", "reciter", "verified", "male", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Urdu", "Arabic"], ["Quran", "Nasheeds", "Recitation"], { note: "Pakistani Quran reciter and nasheed artist", isHistorical: true, lifespan: "1978-2022" }),
  c("omar-hisham-al-arabi", "Omar Hisham Al Arabi", "reciter", "rising", "male", "middle_east", "SA", "\u{1F1F8}\u{1F1E6}", ["Arabic"], ["Quran", "Recitation"], { note: "Saudi reciter popular on YouTube for Quran recitation videos", trending: true }),
];

// ==========================================
// MORE ACTIVISTS & PUBLIC FIGURES
// ==========================================
const moreActivists = [
  c("yusuf-al-qaradawi", "Yusuf al-Qaradawi", "scholar", "verified", "male", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic"], ["Fiqh", "Fatwa", "Moderation"], { note: "Egyptian-Qatari scholar, former head of IUMS, author of The Lawful and Prohibited", isHistorical: true, lifespan: "1926-2022" }),
  c("malcolm-x", "Malcolm X", "activist", "verified", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English"], ["Social Justice", "Civil Rights", "Dawah"], { note: "American Muslim civil rights leader who performed Hajj", isHistorical: true, lifespan: "1925-1965", featured: true }),
  c("muhammad-ali", "Muhammad Ali", "public_figure", "verified", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English"], ["Sports", "Social Justice", "Representation"], { note: "Greatest boxer of all time and global Muslim icon", isHistorical: true, lifespan: "1942-2016", featured: true }),
  c("kareem-abdul-jabbar", "Kareem Abdul-Jabbar", "public_figure", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English"], ["Sports", "History", "Representation"], { note: "NBA all-time scorer and American Muslim convert, author and historian" }),
  c("hakeem-olajuwon", "Hakeem Olajuwon", "public_figure", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Yoruba"], ["Sports", "Representation"], { note: "Nigerian-American NBA Hall of Famer known for fasting during Ramadan" }),
  c("mahershala-ali", "Mahershala Ali", "public_figure", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English"], ["Arts", "Entertainment", "Representation"], { note: "Oscar-winning American Muslim actor" }),
  c("riz-ahmed", "Riz Ahmed", "public_figure", "rising", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English", "Urdu"], ["Arts", "Representation", "Activism"], { note: "British-Pakistani actor and rapper, first Muslim nominated for Best Actor Oscar" }),
  c("dave-chappelle", "Dave Chappelle", "public_figure", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English"], ["Comedy", "Entertainment", "Representation"], { note: "American comedian and Muslim convert" }),
  c("shaquille-oneal-ref", "Omer Sharif", "public_figure", "rising", "male", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Urdu", "English"], ["Comedy", "Entertainment", "Arts"], { note: "Legendary Pakistani comedian and actor", isHistorical: true, lifespan: "1960-2021" }),
  c("paul-pogba", "Paul Pogba", "public_figure", "rising", "male", "europe", "FR", "\u{1F1EB}\u{1F1F7}", ["French", "English"], ["Sports", "Representation", "Youth"], { note: "French-Guinean Muslim footballer, performed Umrah and speaks about faith" }),
  c("karim-benzema", "Karim Benzema", "public_figure", "rising", "male", "europe", "FR", "\u{1F1EB}\u{1F1F7}", ["French", "Arabic"], ["Sports", "Representation"], { note: "French-Algerian footballer and Ballon d'Or winner, openly Muslim" }),
  c("mo-salah", "Mohamed Salah", "public_figure", "rising", "male", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic", "English"], ["Sports", "Charity", "Representation"], { note: "Egyptian footballer at Liverpool FC, global Muslim sports icon", trending: true }),
  c("giannis-antetokounmpo-ref", "Franck Ribery", "public_figure", "rising", "male", "europe", "FR", "\u{1F1EB}\u{1F1F7}", ["French"], ["Sports", "Converts", "Representation"], { note: "French footballer who converted to Islam" }),
  c("imam-warith-deen-mohammed", "Imam Warith Deen Mohammed", "scholar", "verified", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Reform", "Community", "Leadership"], { note: "Son of Elijah Muhammad, led Nation of Islam members to Sunni Islam", isHistorical: true, lifespan: "1933-2008", featured: true }),
];

// ==========================================
// CENTRAL ASIA & OTHERS
// ==========================================
const centralAsia = [
  c("imam-ismail-al-bukhari-ref", "Al-Farabi", "scholar", "verified", "male", "south_asia", "KZ", "\u{1F1F0}\u{1F1FF}", ["Arabic", "Persian", "Turkish"], ["Philosophy", "Music", "Science"], { note: "Kazakh polymath known as the Second Teacher after Aristotle", isHistorical: true, lifespan: "872-950" }),
  c("ulugh-beg", "Ulugh Beg", "scholar", "verified", "male", "south_asia", "UZ", "\u{1F1FA}\u{1F1FF}", ["Persian", "Arabic", "Turkish"], ["Astronomy", "Mathematics", "Science"], { note: "Timurid sultan and astronomer who built the great Samarkand Observatory", isHistorical: true, lifespan: "1394-1449" }),
  c("maulana-ahmad-rumi-father", "Sultan Walad", "scholar", "verified", "male", "middle_east", "TR", "\u{1F1F9}\u{1F1F7}", ["Persian", "Arabic", "Turkish"], ["Sufism", "Poetry", "Education"], { note: "Son of Rumi and founder of the Mevlevi Order", isHistorical: true, lifespan: "1226-1312" }),
  c("shamil-alyautdinov", "Shamil Alyautdinov", "scholar", "rising", "male", "europe", "RU", "\u{1F1F7}\u{1F1FA}", ["Russian", "Arabic"], ["Fiqh", "Youth", "Modern Issues"], { note: "Russian imam and Islamic educator popular among Russian-speaking Muslims" }),
  c("mufti-ravil-gaynutdin-ref", "Damir Mukhetdinov", "scholar", "rising", "male", "europe", "RU", "\u{1F1F7}\u{1F1FA}", ["Russian", "Arabic", "Tatar"], ["Theology", "Education", "Interfaith"], { note: "First Deputy Chairman of Russia Muftis Council" }),

  // AUSTRALIA
  c("imam-afroz-ali", "Imam Afroz Ali", "scholar", "verified", "male", "southeast_asia", "AU", "\u{1F1E6}\u{1F1FA}", ["English", "Arabic", "Bengali"], ["Education", "Spirituality", "Community"], { note: "Founder of Al-Ghazzali Centre for Islamic Sciences and Human Development in Sydney" }),
  c("sheikh-shady-alsuleiman", "Sheikh Shady Alsuleiman", "speaker", "verified", "male", "southeast_asia", "AU", "\u{1F1E6}\u{1F1FA}", ["English", "Arabic"], ["Community", "Youth", "Dawah"], { note: "President of the Australian National Imams Council" }),
  c("bilal-rauf", "Bilal Rauf", "educator", "rising", "male", "southeast_asia", "AU", "\u{1F1E6}\u{1F1FA}", ["English", "Arabic"], ["Youth", "Community", "Education"], { note: "Australian Islamic educator and community leader in Sydney" }),
  c("susan-carland", "Susan Carland", "scholar", "rising", "female", "southeast_asia", "AU", "\u{1F1E6}\u{1F1FA}", ["English"], ["Women", "Academia", "Interfaith"], { note: "Australian convert, academic and author on Muslim women" }),

  // NEW ZEALAND
  c("imam-gamal-fouda", "Imam Gamal Fouda", "speaker", "rising", "male", "southeast_asia", "NZ", "\u{1F1F3}\u{1F1FF}", ["English", "Arabic"], ["Community", "Resilience", "Interfaith"], { note: "Imam of Al Noor Mosque in Christchurch who delivered powerful speech after attack" }),

  // SOUTH AFRICA
  c("maulana-ebrahim-bham", "Maulana Ebrahim Bham", "scholar", "verified", "male", "africa", "ZA", "\u{1F1FF}\u{1F1E6}", ["English", "Urdu", "Arabic"], ["Community", "Education", "Leadership"], { note: "Secretary General of Jamiatul Ulama South Africa" }),
  c("sheikh-ahmed-deedat", "Sheikh Ahmed Deedat", "speaker", "verified", "male", "africa", "ZA", "\u{1F1FF}\u{1F1E6}", ["English", "Arabic"], ["Dawah", "Debate", "Comparative Religion"], { note: "South African scholar famous for public debates on Islam and Christianity", isHistorical: true, lifespan: "1918-2005", featured: true }),
  c("mufti-menk", "Mufti Menk", "speaker", "verified", "male", "africa", "ZW", "\u{1F1FF}\u{1F1FC}", ["English", "Arabic"], ["Motivation", "Spirituality", "Youth"], { note: "Zimbabwean Grand Mufti and one of the most followed Islamic speakers globally", featured: true, trending: true }),
  c("imam-sulaiman-moola", "Maulana Sulaiman Moola", "speaker", "verified", "male", "africa", "ZA", "\u{1F1FF}\u{1F1E6}", ["English", "Urdu", "Arabic"], ["Motivation", "History", "Eloquence"], { note: "South African Islamic speaker known for his eloquent style" }),
  c("dr-bilal-philips", "Dr. Bilal Philips", "scholar", "verified", "male", "americas", "CA", "\u{1F1E8}\u{1F1E6}", ["English", "Arabic"], ["Aqeedah", "Education", "Online Learning"], { note: "Jamaican-Canadian scholar, founder of International Open University" }),
];

const allBatch3 = [
  ...podcasters,
  ...youthInfluencers,
  ...femaleScholars,
  ...reciters,
  ...moreActivists,
  ...centralAsia,
];

console.log(`\nBatch 3 creators to add: ${allBatch3.length}`);

let fileContent = readFileSync(filePath, 'utf-8');
const existingIds = new Set();
const idMatches = fileContent.matchAll(/"id":\s*"([^"]+)"/g);
for (const match of idMatches) existingIds.add(match[1]);

const uniqueNew = allBatch3.filter(c => {
  if (existingIds.has(c.id)) {
    console.log(`  Skipping duplicate: ${c.id}`);
    return false;
  }
  return true;
});

console.log(`Unique new creators: ${uniqueNew.length}`);
console.log(`Existing creators: ${existingIds.size}`);
console.log(`Total after merge: ${existingIds.size + uniqueNew.length}`);

function formatCreator(creator) {
  const lines = [];
  lines.push('  {');
  for (const [key, value] of Object.entries(creator)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string') lines.push(`    "${key}": ${JSON.stringify(value)},`);
    else if (typeof value === 'boolean') lines.push(`    "${key}": ${value},`);
    else if (Array.isArray(value)) lines.push(`    "${key}": ${JSON.stringify(value)},`);
    else if (typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0) { lines.push(`    "${key}": {},`); }
      else {
        lines.push(`    "${key}": {`);
        entries.forEach(([k, v], i) => {
          lines.push(`      "${k}": ${JSON.stringify(v)}${i < entries.length - 1 ? ',' : ''}`);
        });
        lines.push('    },');
      }
    }
  }
  const lastLine = lines[lines.length - 1];
  if (lastLine.endsWith(',')) lines[lines.length - 1] = lastLine.slice(0, -1);
  lines.push('  }');
  return lines.join('\n');
}

const closingBracket = fileContent.lastIndexOf('];');
if (closingBracket === -1) { console.error('ERROR'); process.exit(1); }

const newCreatorsStr = uniqueNew.map(formatCreator).join(',\n');
fileContent = fileContent.substring(0, closingBracket) + ',\n' + newCreatorsStr + '\n];\n';
writeFileSync(filePath, fileContent, 'utf-8');

const finalContent = readFileSync(filePath, 'utf-8');
const totalIds = (finalContent.match(/"id":/g) || []).length;
const regions = {};
const regionMatches2 = finalContent.matchAll(/"region":\s*"([^"]+)"/g);
for (const m of regionMatches2) regions[m[1]] = (regions[m[1]] || 0) + 1;
const categories = {};
const catMatches = finalContent.matchAll(/"category":\s*"([^"]+)"/g);
for (const m of catMatches) categories[m[1]] = (categories[m[1]] || 0) + 1;
const genders = {};
const genderMatches = finalContent.matchAll(/"gender":\s*"([^"]+)"/g);
for (const m of genderMatches) genders[m[1]] = (genders[m[1]] || 0) + 1;

console.log(`\n=== FINAL STATS ===`);
console.log(`Total creators: ${totalIds}`);
console.log(`\nBy region:`);
for (const [r, count] of Object.entries(regions).sort((a, b) => b[1] - a[1])) console.log(`  ${r}: ${count} (${Math.round(count/totalIds*100)}%)`);
console.log(`\nBy category:`);
for (const [cat, count] of Object.entries(categories).sort((a, b) => b[1] - a[1])) console.log(`  ${cat}: ${count} (${Math.round(count/totalIds*100)}%)`);
console.log(`\nBy gender:`);
for (const [g, count] of Object.entries(genders).sort((a, b) => b[1] - a[1])) console.log(`  ${g}: ${count} (${Math.round(count/totalIds*100)}%)`);

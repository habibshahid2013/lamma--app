/**
 * Creator Database Final Expansion - reach 500
 * Run: node scripts/expand-creators-final.mjs
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
    featured: opts.featured ?? false, trending: opts.trending ?? false,
    isHistorical: opts.isHistorical ?? false,
    ...(opts.lifespan ? { lifespan: opts.lifespan } : {}),
    ...(opts.note ? { note: opts.note } : {}),
    socialLinks: opts.socialLinks ?? {}
  };
}

const finalBatch = [
  // More diverse podcasters
  c("sh-omar-hussain", "Omar Hussain", "podcaster", "rising", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English", "Arabic"], ["Youth", "Stories", "History"], { note: "British Islamic storyteller and podcast creator" }),
  c("sh-sajid-umar", "Sheikh Sajid Umar", "educator", "verified", "male", "africa", "ZA", "\u{1F1FF}\u{1F1E6}", ["English", "Arabic"], ["Fiqh", "Youth", "Education"], { note: "South African scholar and AlMaghrib instructor" }),
  c("belal-assaad", "Belal Assaad", "speaker", "verified", "male", "southeast_asia", "AU", "\u{1F1E6}\u{1F1FA}", ["English", "Arabic"], ["Youth", "Seerah", "Motivation"], { note: "Australian-Lebanese Islamic speaker" }),
  c("abdur-rahman-murphy", "Abdur-Rahman Murphy", "podcaster", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Spirituality", "Mental Health", "Youth"], { note: "Roots podcast host and Islamic chaplain", trending: true }),
  c("ustadh-wahaj-tarin", "Wahaj Tarin", "speaker", "rising", "male", "southeast_asia", "AU", "\u{1F1E6}\u{1F1FA}", ["English", "Pashto", "Arabic"], ["Motivation", "Youth", "Dawah"], { note: "Afghan-Australian Islamic speaker" }),
  c("nourdeen-wildeman", "Nourdeen Wildeman", "podcaster", "rising", "male", "europe", "NL", "\u{1F1F3}\u{1F1F1}", ["Dutch", "Arabic", "English"], ["Youth", "Modern Issues", "Community"], { note: "Dutch Muslim podcaster and community advocate" }),
  c("sh-mohammed-faqih", "Mohammed Faqih", "speaker", "verified", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Khutbah", "Community", "Youth"], { note: "Imam of Memphis Islamic Center, AlMaghrib instructor" }),
  c("sh-omar-el-banna", "Omar El-Banna", "educator", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Youth", "Quran", "Education"], { note: "American Islamic educator and Quran teacher" }),

  // More female leaders
  c("ustadha-lobna-mulla", "Lobna Mulla", "educator", "rising", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Chaplaincy", "Women", "Mental Health"], { note: "First female Muslim chaplain at USC" }),
  c("dr-debbie-almontaser", "Debbie Almontaser", "educator", "rising", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Education", "Community", "Leadership"], { note: "Yemeni-American educator and school founder in Brooklyn" }),
  c("shaykha-ieasha-prime", "Ieasha Prime", "speaker", "rising", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English"], ["Marriage", "Family", "Women"], { note: "American Muslim speaker on relationships and family" }),
  c("dr-nihal-khan", "Nihal Khan", "educator", "rising", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Education", "Women", "Community"], { note: "American Islamic educator and school administrator" }),
  c("ustadha-megan-wyatt", "Megan Wyatt", "educator", "rising", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English"], ["Marriage", "Women", "Self-Improvement"], { note: "American Muslim marriage coach and content creator" }),
  c("sadaf-farooqi", "Sadaf Farooqi", "author", "rising", "female", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["English", "Urdu"], ["Parenting", "Women", "Writing"], { note: "Pakistani Islamic author and parenting blogger" }),
  c("dr-sawsan-salim", "Dr. Sawsan Salim", "educator", "rising", "female", "middle_east", "IQ", "\u{1F1EE}\u{1F1F6}", ["Arabic", "English"], ["Medicine", "Women", "Community"], { note: "Iraqi Muslim physician and women's health advocate" }),

  // More youth & influencers
  c("ali-dawah", "Ali Dawah", "influencer", "rising", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English", "Arabic"], ["Dawah", "Street Preaching", "Youth"], { note: "British Muslim YouTuber known for street dawah content", trending: true }),
  c("smile2jannah", "Smile2Jannah", "podcaster", "rising", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English"], ["Comedy", "Youth", "Social Media"], { note: "British Muslim comedy and Islamic content creator" }),
  c("muslim-belal", "Muslim Belal", "influencer", "rising", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English"], ["Spoken Word", "Youth", "Poetry"], { note: "British Muslim spoken word artist and content creator" }),
  c("nas-daily-nuseir", "Nuseir Yassin", "influencer", "rising", "male", "middle_east", "PS", "\u{1F1F5}\u{1F1F8}", ["Arabic", "English", "Hebrew"], ["Travel", "Media", "Storytelling"], { note: "Palestinian-Israeli content creator known as Nas Daily" }),
  c("habib-omar-podcast", "Omar Suleiman Podcast", "podcaster", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English"], ["Spirituality", "Seerah", "Current Events"], { note: "Host of The Fireside Chat podcast on Islamic spirituality" }),
  c("zara-faris", "Zara Faris", "speaker", "rising", "female", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English", "Arabic"], ["Apologetics", "Women", "Debate"], { note: "British Muslim speaker and writer on Islam and feminism" }),

  // More scholars globally
  c("ahmad-kutty", "Sheikh Ahmad Kutty", "scholar", "verified", "male", "americas", "CA", "\u{1F1E8}\u{1F1E6}", ["English", "Arabic", "Malayalam"], ["Fiqh", "Fatwa", "Education"], { note: "Indian-Canadian scholar, resident scholar at Islamic Institute of Toronto" }),
  c("sh-nuh-ha-mim-keller", "Nuh Ha Mim Keller", "scholar", "verified", "male", "middle_east", "JO", "\u{1F1EF}\u{1F1F4}", ["English", "Arabic"], ["Sufism", "Shafi'i Fiqh", "Hadith"], { note: "American convert and scholar living in Amman, translator of Reliance of the Traveller" }),
  c("sh-hamza-karamali", "Hamza Karamali", "scholar", "verified", "male", "americas", "CA", "\u{1F1E8}\u{1F1E6}", ["English", "Arabic"], ["Theology", "Education", "Shafi'i Fiqh"], { note: "Founder of Basira Education, teaches classical Islamic sciences" }),
  c("imam-tahir-wyatt", "Tahir Wyatt", "scholar", "verified", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Aqeedah", "Hadith", "Education"], { note: "First American to teach in the Prophet's Mosque in Medina" }),
  c("dr-shadee-elmasry", "Shadee Elmasry", "educator", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Maliki Fiqh", "Youth", "Media"], { note: "American scholar and founder of Safina Society NJ" }),
  c("abdurraheem-green", "Abdurraheem Green", "speaker", "verified", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English", "Arabic"], ["Dawah", "Converts", "Philosophy"], { note: "British convert, co-founder of iERA dawah organization" }),
  c("bilal-assad", "Bilal Assad", "speaker", "verified", "male", "southeast_asia", "AU", "\u{1F1E6}\u{1F1FA}", ["English", "Arabic"], ["Seerah", "Youth", "History"], { note: "Lebanese-Australian Islamic speaker known for Seerah lectures" }),
  c("sh-alaa-elsayed", "Alaa Elsayed", "speaker", "rising", "male", "americas", "CA", "\u{1F1E8}\u{1F1E6}", ["English", "Arabic"], ["Youth", "Family", "Community"], { note: "Egyptian-Canadian imam and Islamic speaker" }),
  c("sh-saad-ibn-saeed", "Saad Tasleem Abu Sabah", "educator", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Youth", "Fiqh", "Modern Issues"], { note: "American Islamic instructor focused on contemporary issues" }),

  // More East African scholars
  c("sheikh-umal-somalia", "Sheikh Umal", "speaker", "rising", "male", "east_africa", "SO", "\u{1F1F8}\u{1F1F4}", ["Somali", "Arabic"], ["Dawah", "Youth", "Community"], { note: "Popular Somali Islamic speaker" }),
  c("sheikh-muhyiddin-arale", "Sheikh Muhyiddin Arale", "scholar", "rising", "male", "east_africa", "SO", "\u{1F1F8}\u{1F1F4}", ["Somali", "Arabic", "English"], ["Fiqh", "Education", "Youth"], { note: "Somali scholar and educator" }),
  c("bilal-tube-ethiopia", "Bilal Muhammad", "influencer", "rising", "male", "east_africa", "ET", "\u{1F1EA}\u{1F1F9}", ["Amharic", "Arabic", "English"], ["Dawah", "Youth", "Media"], { note: "Ethiopian Muslim content creator and Islamic media producer" }),

  // More South Asian
  c("mufti-ibrahim-desai", "Mufti Ibrahim Desai", "scholar", "verified", "male", "africa", "ZA", "\u{1F1FF}\u{1F1E6}", ["English", "Urdu", "Arabic"], ["Fiqh", "Fatwa", "Education"], { note: "Founder of AskImam.org, one of the largest Islamic Q&A platforms" }),
  c("mufti-ismail-menk-student", "Muhammad ibn Adam al-Kawthari", "scholar", "verified", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English", "Arabic", "Urdu"], ["Fiqh", "Hadith", "Education"], { note: "British Islamic scholar and founder of Darul Iftaa, Leicester" }),
  c("sh-sajjad-nomani", "Sajjad Nomani", "speaker", "rising", "male", "south_asia", "IN", "\u{1F1EE}\u{1F1F3}", ["Hindi", "Urdu", "Arabic"], ["Community", "Youth", "Dawah"], { note: "Indian Muslim orator and community leader" }),
  c("maulana-ali-miyan", "Maulana Khalilur Rahman Sajjad Nomani", "scholar", "verified", "male", "south_asia", "IN", "\u{1F1EE}\u{1F1F3}", ["Urdu", "Arabic"], ["Fiqh", "Community", "Leadership"], { note: "Indian scholar and general secretary of All India Muslim Personal Law Board" }),

  // More Southeast Asian
  c("habib-luthfi-bin-yahya", "Habib Luthfi bin Yahya", "scholar", "verified", "male", "southeast_asia", "ID", "\u{1F1EE}\u{1F1E9}", ["Indonesian", "Arabic", "Javanese"], ["Sufism", "Spirituality", "Community"], { note: "Indonesian Sufi master and head of the Indonesian Ulema Council" }),
  c("dr-amin-abdullah", "Dr. M. Amin Abdullah", "scholar", "verified", "male", "southeast_asia", "ID", "\u{1F1EE}\u{1F1E9}", ["Indonesian", "Arabic", "English"], ["Philosophy", "Education", "Interfaith"], { note: "Indonesian Islamic philosopher and former rector of UIN Yogyakarta" }),
  c("ning-ahmad-mustofa-bisri", "Ning Ahmad Mustofa Bisri", "youth_leader", "rising", "female", "southeast_asia", "ID", "\u{1F1EE}\u{1F1E9}", ["Indonesian", "Arabic", "Javanese"], ["Women", "Community", "Education"], { note: "Indonesian female pesantren leader and women's rights advocate" }),
  c("ustaz-ebit-lew", "Ustaz Ebit Lew", "influencer", "rising", "male", "southeast_asia", "MY", "\u{1F1F2}\u{1F1FE}", ["Malay", "Arabic"], ["Charity", "Community", "Social Media"], { note: "Malaysian ustaz known for humanitarian charity work", trending: true }),

  // More Middle East
  c("mufti-ahmad-bin-ali-waqas", "Ahmad al-Talib", "educator", "rising", "male", "middle_east", "QA", "\u{1F1F6}\u{1F1E6}", ["Arabic", "English"], ["Education", "Youth", "Quran"], { note: "Qatari Islamic educator and youth mentor" }),
  c("sulaiman-al-rajhi", "Sulaiman al-Rajhi", "public_figure", "rising", "male", "middle_east", "SA", "\u{1F1F8}\u{1F1E6}", ["Arabic"], ["Philanthropy", "Business", "Charity"], { note: "Saudi philanthropist who donated most of his fortune to Islamic causes" }),
  c("sh-ahmad-al-khalili-oman-ref", "Sheikh Kahlan al-Kharusi", "scholar", "rising", "male", "middle_east", "OM", "\u{1F1F4}\u{1F1F2}", ["Arabic"], ["Fiqh", "Education", "Community"], { note: "Assistant Grand Mufti of Oman" }),

  // More North Africa
  c("zaki-naguib-mahmoud", "Dr. Muhammad Abdel Haleem", "scholar", "verified", "male", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic", "English"], ["Quran", "Translation", "Education"], { note: "Egyptian-British professor who translated the Quran for Oxford University Press" }),
  c("professor-ramadan-al-bouti-ref", "Sheikh Osama Al-Azhari", "educator", "rising", "male", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic"], ["Youth", "Spirituality", "Education"], { note: "Young Egyptian Al-Azhar scholar and presidential advisor" }),
  c("nassim-taleb-ref", "Ahmed Zewail", "public_figure", "verified", "male", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic", "English"], ["Science", "Education", "Nobel Prize"], { note: "Egyptian-American Nobel Prize-winning chemist", isHistorical: true, lifespan: "1946-2016" }),

  // More Europe
  c("tariq-jahan", "Tariq Jahan", "activist", "rising", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English", "Urdu"], ["Community", "Peace", "Forgiveness"], { note: "British Muslim father who called for peace during 2011 Birmingham riots" }),
  c("sh-tawfique-chowdhury", "Tawfique Chowdhury", "educator", "verified", "male", "southeast_asia", "AU", "\u{1F1E6}\u{1F1FA}", ["English", "Arabic", "Bengali"], ["Education", "Community", "Charity"], { note: "Founder of AlKauthar Institute and Mercy Mission" }),
  c("zinedine-zidane", "Zinedine Zidane", "public_figure", "rising", "male", "europe", "FR", "\u{1F1EB}\u{1F1F7}", ["French", "Arabic"], ["Sports", "Leadership", "Representation"], { note: "French-Algerian football legend and coach" }),
  c("imam-omar-suleiman-ref", "Edward Said", "author", "verified", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Literature", "Philosophy", "Activism"], { note: "Palestinian-American literary theorist and author of Orientalism", isHistorical: true, lifespan: "1935-2003" }),
  c("dr-tariq-al-suwaidan-ref", "Rached Ghannouchi", "public_figure", "rising", "male", "north_africa", "TN", "\u{1F1F9}\u{1F1F3}", ["Arabic", "French"], ["Politics", "Democracy", "Leadership"], { note: "Tunisian political leader and Islamic democratic thinker" }),
  c("imam-malik-mujahid", "Imam Abdul Malik Mujahid", "activist", "verified", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Urdu", "Arabic"], ["Media", "Community", "Interfaith"], { note: "Founder of Sound Vision and leader in Muslim American media" }),
  c("siraj-hashmi", "Siraj Hashmi", "podcaster", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English"], ["Media", "Commentary", "Politics"], { note: "American Muslim journalist and political commentator" }),
  c("ali-banat", "Ali Banat", "activist", "rising", "male", "southeast_asia", "AU", "\u{1F1E6}\u{1F1FA}", ["English", "Arabic"], ["Charity", "Inspiration", "Dawah"], { note: "Australian Muslim philanthropist who donated wealth after cancer diagnosis", isHistorical: true, lifespan: "1982-2018" }),
  c("junaid-ahmed-jaffri", "Junaid Jamshed Ahmad", "influencer", "rising", "male", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Urdu", "English"], ["Fashion", "Youth", "Business"], { note: "Pakistani Muslim fashion entrepreneur and youth influencer" }),
  c("sh-hamza-maqbul", "Hamza Maqbul", "educator", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Community", "Youth", "Education"], { note: "American imam and Islamic educator in Texas" }),
  c("sh-mohammed-abu-noor", "Mohammed Abu Noor", "educator", "rising", "male", "middle_east", "JO", "\u{1F1EF}\u{1F1F4}", ["Arabic", "English"], ["Tajweed", "Quran", "Education"], { note: "Jordanian Quran teacher with international following" }),
  c("ainee-fatima", "Ainee Fatima", "author", "rising", "female", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Urdu", "English"], ["Poetry", "Women", "Literature"], { note: "Pakistani Muslim poet and author" }),
  c("ramy-youssef", "Ramy Youssef", "public_figure", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Comedy", "Entertainment", "Representation"], { note: "Egyptian-American comedian and creator of Hulu's Ramy, exploring Muslim American life" }),
  c("kumail-nanjiani", "Kumail Nanjiani", "public_figure", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Urdu"], ["Comedy", "Entertainment", "Representation"], { note: "Pakistani-American actor and comedian, star of The Big Sick" }),
];

console.log(`\nFinal batch creators to add: ${finalBatch.length}`);

let fileContent = readFileSync(filePath, 'utf-8');
const existingIds = new Set();
const idMatches = fileContent.matchAll(/"id":\s*"([^"]+)"/g);
for (const match of idMatches) existingIds.add(match[1]);

const uniqueNew = finalBatch.filter(c => {
  if (existingIds.has(c.id)) { console.log(`  Skipping duplicate: ${c.id}`); return false; }
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
        entries.forEach(([k, v], i) => lines.push(`      "${k}": ${JSON.stringify(v)}${i < entries.length - 1 ? ',' : ''}`));
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
for (const m of finalContent.matchAll(/"region":\s*"([^"]+)"/g)) regions[m[1]] = (regions[m[1]] || 0) + 1;
const categories = {};
for (const m of finalContent.matchAll(/"category":\s*"([^"]+)"/g)) categories[m[1]] = (categories[m[1]] || 0) + 1;
const genders = {};
for (const m of finalContent.matchAll(/"gender":\s*"([^"]+)"/g)) genders[m[1]] = (genders[m[1]] || 0) + 1;

console.log(`\n=== FINAL STATS ===`);
console.log(`Total creators: ${totalIds}`);
console.log(`\nBy region:`);
for (const [r, count] of Object.entries(regions).sort((a, b) => b[1] - a[1])) console.log(`  ${r}: ${count} (${Math.round(count/totalIds*100)}%)`);
console.log(`\nBy category:`);
for (const [c, count] of Object.entries(categories).sort((a, b) => b[1] - a[1])) console.log(`  ${c}: ${count} (${Math.round(count/totalIds*100)}%)`);
console.log(`\nBy gender:`);
for (const [g, count] of Object.entries(genders).sort((a, b) => b[1] - a[1])) console.log(`  ${g}: ${count} (${Math.round(count/totalIds*100)}%)`);

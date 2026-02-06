/**
 * Creator Database Expansion Script
 * Adds new creator profiles to reach 500 target
 * Run: node scripts/expand-creators.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, '..', 'lib', 'data', 'creators.ts');

// Helper to create a creator object
function c(id, name, category, tier, gender, region, country, flag, languages, topics, opts = {}) {
  return {
    id,
    slug: id,
    name,
    category,
    tier,
    gender,
    region,
    country,
    countryFlag: flag,
    languages,
    topics,
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
// WEST AFRICA (~80 creators)
// ==========================================
const westAfrica = [
  // NIGERIA
  c("sheikh-dahiru-bauchi", "Sheikh Dahiru Bauchi", "scholar", "verified", "male", "west_africa", "NG", "\u{1F1F3}\u{1F1EC}", ["Hausa", "Arabic"], ["Tafsir", "Hadith", "Fiqh"], { note: "Prominent Nigerian Islamic scholar from Bauchi", featured: true }),
  c("sheikh-adam-al-ilory", "Sheikh Adam Abdullahi Al-Ilory", "scholar", "verified", "male", "west_africa", "NG", "\u{1F1F3}\u{1F1EC}", ["Yoruba", "Arabic", "English"], ["Education", "Arabic", "History"], { note: "Pioneering Nigerian scholar and founder of Markaz Arabic school in Lagos", isHistorical: true, lifespan: "1917-1992" }),
  c("sheikh-abubakar-gumi", "Sheikh Abubakar Gumi", "scholar", "verified", "male", "west_africa", "NG", "\u{1F1F3}\u{1F1EC}", ["Hausa", "Arabic"], ["Reform", "Fiqh", "Education"], { note: "Influential Nigerian scholar, Grand Khadi of Northern Nigeria", isHistorical: true, lifespan: "1922-1992" }),
  c("ahmad-sulaiman", "Ahmad Sulaiman", "reciter", "verified", "male", "west_africa", "NG", "\u{1F1F3}\u{1F1EC}", ["Hausa", "Arabic"], ["Quran", "Recitation"], { note: "Popular Nigerian Quran reciter", trending: true }),
  c("sheikh-isa-ali-pantami", "Sheikh Isa Ali Pantami", "scholar", "verified", "male", "west_africa", "NG", "\u{1F1F3}\u{1F1EC}", ["Hausa", "Arabic", "English"], ["Technology", "Fiqh", "Education"], { note: "Nigerian scholar and former Minister of Communications" }),
  c("sheikh-muhammad-kabiru-gombe", "Sheikh Muhammad Kabiru Gombe", "speaker", "verified", "male", "west_africa", "NG", "\u{1F1F3}\u{1F1EC}", ["Hausa", "Arabic"], ["Tafsir", "Spirituality"], { note: "Popular Hausa-language Islamic preacher" }),
  c("sheikh-muhammad-auwal-albani-zaria", "Sheikh Albani Zaria", "scholar", "verified", "male", "west_africa", "NG", "\u{1F1F3}\u{1F1EC}", ["Hausa", "Arabic"], ["Aqeedah", "Hadith", "Dawah"], { note: "Prominent Salafi scholar from Zaria, Nigeria", isHistorical: true, lifespan: "1960-2014" }),
  c("maryam-lemu", "Maryam Lemu", "speaker", "verified", "female", "west_africa", "NG", "\u{1F1F3}\u{1F1EC}", ["English", "Hausa"], ["Marriage", "Family", "Women"], { note: "Nigerian marriage counselor and Islamic speaker", trending: true }),
  c("sheikh-qaribullah-nasiru-kabara", "Sheikh Nasiru Kabara", "scholar", "verified", "male", "west_africa", "NG", "\u{1F1F3}\u{1F1EC}", ["Hausa", "Arabic"], ["Sufism", "Tijaniyya", "Scholarship"], { note: "Renowned Tijani scholar from Kano, Nigeria", isHistorical: true, lifespan: "1925-1996" }),
  c("ustaz-aminu-ibrahim-daurawa", "Ustaz Aminu Ibrahim Daurawa", "speaker", "rising", "male", "west_africa", "NG", "\u{1F1F3}\u{1F1EC}", ["Hausa", "Arabic"], ["Community", "Dawah", "Fiqh"], { note: "Commander General of Hisbah Board in Kano" }),
  c("nuhu-ribadu", "Nuhu Ribadu", "activist", "rising", "male", "west_africa", "NG", "\u{1F1F3}\u{1F1EC}", ["English", "Hausa"], ["Governance", "Social Justice", "Leadership"], { note: "Nigerian Muslim anti-corruption activist" }),
  c("amina-mohammed", "Amina J. Mohammed", "activist", "rising", "female", "west_africa", "NG", "\u{1F1F3}\u{1F1EC}", ["English", "Hausa"], ["Development", "Leadership", "Women"], { note: "Nigerian diplomat, UN Deputy Secretary-General" }),
  c("sadiq-sani-sadiq", "Sadiq Sani Sadiq", "influencer", "rising", "male", "west_africa", "NG", "\u{1F1F3}\u{1F1EC}", ["Hausa", "English"], ["Youth", "Quran", "Social Media"], { note: "Nigerian Islamic content creator popular among youth", trending: true }),

  // SENEGAL
  c("cheikh-ahmadou-bamba", "Cheikh Ahmadou Bamba", "scholar", "verified", "male", "west_africa", "SN", "\u{1F1F8}\u{1F1F3}", ["Wolof", "Arabic", "French"], ["Sufism", "Mouridiyya", "Spirituality"], { note: "Founder of the Mouride brotherhood in Senegal", isHistorical: true, lifespan: "1853-1927", featured: true }),
  c("cheikh-ibrahima-niasse", "Cheikh Ibrahim Niasse", "scholar", "verified", "male", "west_africa", "SN", "\u{1F1F8}\u{1F1F3}", ["Wolof", "Arabic", "French"], ["Tijaniyya", "Sufism", "Scholarship"], { note: "Leader of the Tijaniyya order, one of the most influential West African scholars", isHistorical: true, lifespan: "1900-1975", featured: true }),
  c("cheikh-tidiane-sy", "Cheikh Tidiane Sy", "scholar", "verified", "male", "west_africa", "SN", "\u{1F1F8}\u{1F1F3}", ["Wolof", "Arabic", "French"], ["Tijaniyya", "Leadership", "Spirituality"], { note: "Leader of the Sy branch of Tijaniyya in Senegal", isHistorical: true, lifespan: "1935-2017" }),
  c("serigne-mountakha-mbacke", "Serigne Mountakha Mbacke", "scholar", "verified", "male", "west_africa", "SN", "\u{1F1F8}\u{1F1F3}", ["Wolof", "Arabic"], ["Mouridiyya", "Leadership", "Spirituality"], { note: "Current Grand Caliph of the Mouride brotherhood" }),
  c("imam-hassan-cisse", "Imam Hassan Cisse", "scholar", "verified", "male", "west_africa", "SN", "\u{1F1F8}\u{1F1F3}", ["Wolof", "Arabic", "English", "French"], ["Tijaniyya", "Interfaith", "Education"], { note: "International Tijani leader and interfaith advocate", isHistorical: true, lifespan: "1945-2008" }),
  c("oustaz-alioune-sall", "Oustaz Alioune Sall", "speaker", "verified", "male", "west_africa", "SN", "\u{1F1F8}\u{1F1F3}", ["Wolof", "French", "Arabic"], ["Tafsir", "Community", "Education"], { note: "Popular Senegalese Islamic TV presenter and speaker", trending: true }),

  // GHANA
  c("sheikh-osman-nuhu-sharubutu", "Sheikh Osman Nuhu Sharubutu", "scholar", "verified", "male", "west_africa", "GH", "\u{1F1EC}\u{1F1ED}", ["Hausa", "Arabic", "English"], ["Interfaith", "Leadership", "Community"], { note: "National Chief Imam of Ghana, champion of interfaith dialogue", featured: true }),
  c("sheikh-aremeyaw-shaibu", "Sheikh Aremeyaw Shaibu", "speaker", "rising", "male", "west_africa", "GH", "\u{1F1EC}\u{1F1ED}", ["English", "Hausa", "Arabic"], ["Youth", "Interfaith", "Community"], { note: "Spokesperson for the National Chief Imam of Ghana" }),
  c("hajia-sawda-kamara", "Hajia Sawda Kamara", "educator", "rising", "female", "west_africa", "GH", "\u{1F1EC}\u{1F1ED}", ["English", "Hausa", "Arabic"], ["Women", "Education", "Community"], { note: "Ghanaian female Islamic educator and community leader" }),

  // MALI
  c("cheikh-cherif-ousmane-madani-haidara", "Cherif Ousmane Madani Haidara", "scholar", "verified", "male", "west_africa", "ML", "\u{1F1F2}\u{1F1F1}", ["Bambara", "Arabic", "French"], ["Dawah", "Community", "Spirituality"], { note: "Malian Islamic preacher and president of the High Islamic Council of Mali" }),

  // GUINEA
  c("elhadj-thierno-mamadou-saidou-bah", "Thierno Mamadou Saidou Bah", "scholar", "verified", "male", "west_africa", "GN", "\u{1F1EC}\u{1F1F3}", ["Fulani", "Arabic", "French"], ["Education", "Scholarship", "Fiqh"], { note: "Prominent Guinean scholar in the Fulani Islamic tradition" }),

  // GAMBIA
  c("alhaji-banding-drammeh", "Alhaji Banding Drammeh", "educator", "rising", "male", "west_africa", "GM", "\u{1F1EC}\u{1F1F2}", ["Mandinka", "Arabic", "English"], ["Education", "Community", "Youth"], { note: "Gambian Islamic educator and community leader" }),
];

// ==========================================
// NORTH AFRICA (~40 creators)
// ==========================================
const northAfrica = [
  // EGYPT (expanding beyond existing)
  c("sheikh-ali-gomaa", "Sheikh Ali Gomaa", "scholar", "verified", "male", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic", "English"], ["Fiqh", "Fatwa", "Sufism"], { note: "Former Grand Mufti of Egypt, Al-Azhar professor", featured: true }),
  c("sheikh-ahmad-al-tayyeb", "Sheikh Ahmad al-Tayyeb", "scholar", "verified", "male", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic"], ["Interfaith", "Theology", "Leadership"], { note: "Grand Imam of Al-Azhar, leading Sunni authority", featured: true }),
  c("habib-ali-al-jifri", "Habib Ali al-Jifri", "scholar", "verified", "male", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic", "English"], ["Sufism", "Spirituality", "Dawah"], { note: "Yemeni-born scholar based in UAE, founder of Tabah Foundation", socialLinks: { youtube: "https://www.youtube.com/@HabibAliAlJifri" } }),
  c("sheikh-muhammad-mutawalli-al-sharawi", "Sheikh Amin al-Khuli", "scholar", "verified", "male", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic"], ["Tafsir", "Literature", "Reform"], { note: "Pioneering Egyptian scholar of Quranic literary criticism", isHistorical: true, lifespan: "1895-1966" }),
  c("sheikh-muhammad-hassan", "Sheikh Muhammad Hassan", "speaker", "verified", "male", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic"], ["Dawah", "Spirituality", "Youth"], { note: "Popular Egyptian preacher and TV personality" }),
  c("mustafa-hosny", "Mustafa Hosny", "speaker", "verified", "male", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic"], ["Youth", "Motivation", "Spirituality"], { note: "Egyptian TV preacher popular with Arab youth", trending: true, socialLinks: { youtube: "https://www.youtube.com/@MustafaHosny", instagram: "https://www.instagram.com/mustafahosny" } }),
  c("moez-masoud", "Moez Masoud", "speaker", "rising", "male", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic", "English"], ["Youth", "Philosophy", "Spirituality"], { note: "Egyptian preacher and filmmaker bridging Islam and modern culture" }),
  c("heba-kotb", "Heba Kotb", "educator", "rising", "female", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic", "English"], ["Marriage", "Family", "Women"], { note: "Egyptian Islamic sex therapist and family counselor" }),

  // MOROCCO
  c("sheikh-ahmad-ibn-idris-al-fasi", "Ahmad ibn Idris", "scholar", "verified", "male", "north_africa", "MA", "\u{1F1F2}\u{1F1E6}", ["Arabic"], ["Sufism", "Hadith", "Spirituality"], { note: "Moroccan Sufi scholar and founder of the Idrisiyya order", isHistorical: true, lifespan: "1760-1837" }),
  c("abdessalam-yassine", "Abdessalam Yassine", "scholar", "verified", "male", "north_africa", "MA", "\u{1F1F2}\u{1F1E6}", ["Arabic", "French"], ["Political Islam", "Spirituality", "Justice"], { note: "Moroccan scholar and founder of Justice and Spirituality movement", isHistorical: true, lifespan: "1928-2012" }),
  c("sheikh-abdessamad-belkebir", "Abdessamad Belkebir", "reciter", "verified", "male", "north_africa", "MA", "\u{1F1F2}\u{1F1E6}", ["Arabic", "French"], ["Quran", "Recitation"], { note: "Renowned Moroccan Quran reciter" }),
  c("nadia-yassine", "Nadia Yassine", "activist", "rising", "female", "north_africa", "MA", "\u{1F1F2}\u{1F1E6}", ["Arabic", "French", "English"], ["Women", "Social Justice", "Reform"], { note: "Moroccan activist and writer, advocate for Islamic feminism" }),
  c("tariq-ibn-ziyad", "Tariq ibn Ziyad", "public_figure", "verified", "male", "north_africa", "MA", "\u{1F1F2}\u{1F1E6}", ["Arabic", "Berber"], ["History", "Leadership"], { note: "Berber Muslim general who led the conquest of Iberia", isHistorical: true, lifespan: "670-720" }),

  // ALGERIA
  c("abdelhamid-ibn-badis", "Abdelhamid ibn Badis", "scholar", "verified", "male", "north_africa", "DZ", "\u{1F1E9}\u{1F1FF}", ["Arabic", "French"], ["Reform", "Education", "Nationalism"], { note: "Founder of the Association of Algerian Muslim Ulama", isHistorical: true, lifespan: "1889-1940", featured: true }),
  c("malek-bennabi", "Malek Bennabi", "author", "verified", "male", "north_africa", "DZ", "\u{1F1E9}\u{1F1FF}", ["Arabic", "French"], ["Philosophy", "Civilization", "Reform"], { note: "Algerian intellectual and author on Islamic civilization", isHistorical: true, lifespan: "1905-1973" }),
  c("sheikh-ali-belhadj", "Ali Belhadj", "speaker", "rising", "male", "north_africa", "DZ", "\u{1F1E9}\u{1F1FF}", ["Arabic"], ["Dawah", "Community", "Social Justice"], { note: "Algerian Islamic leader and orator" }),

  // TUNISIA
  c("rashid-al-ghannushi", "Rashid al-Ghannushi", "scholar", "verified", "male", "north_africa", "TN", "\u{1F1F9}\u{1F1F3}", ["Arabic", "French"], ["Political Islam", "Democracy", "Reform"], { note: "Tunisian Islamic thinker and co-founder of Ennahda Movement" }),
  c("ibn-khaldun", "Ibn Khaldun", "scholar", "verified", "male", "north_africa", "TN", "\u{1F1F9}\u{1F1F3}", ["Arabic"], ["History", "Sociology", "Philosophy"], { note: "Father of historiography and sociology, author of the Muqaddimah", isHistorical: true, lifespan: "1332-1406", featured: true }),

  // SUDAN
  c("hasan-al-turabi", "Hasan al-Turabi", "scholar", "verified", "male", "north_africa", "SD", "\u{1F1F8}\u{1F1E9}", ["Arabic", "English", "French"], ["Political Islam", "Reform", "Law"], { note: "Sudanese Islamist scholar and political leader", isHistorical: true, lifespan: "1932-2016" }),
  c("sheikh-al-zein-al-abidin", "Sheikh Al-Zein al-Abidin", "reciter", "verified", "male", "north_africa", "SD", "\u{1F1F8}\u{1F1E9}", ["Arabic"], ["Quran", "Recitation", "Tajweed"], { note: "Sudanese Quran reciter and teacher" }),

  // LIBYA
  c("ali-al-sallabi", "Ali al-Sallabi", "author", "verified", "male", "north_africa", "LY", "\u{1F1F1}\u{1F1FE}", ["Arabic"], ["History", "Seerah", "Biography"], { note: "Libyan Islamic historian and prolific author" }),
];

// ==========================================
// SOUTH ASIA EXPANSION (~60 creators)
// ==========================================
const southAsiaExpansion = [
  // PAKISTAN (expanding)
  c("maulana-tariq-masood", "Maulana Tariq Masood", "scholar", "verified", "male", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Urdu", "Arabic"], ["Fiqh", "Q&A", "Modern Issues"], { note: "Pakistani scholar known for practical Q&A sessions and modern approach", trending: true, socialLinks: { youtube: "https://www.youtube.com/@MaulanaTariqMasood" } }),
  c("engineer-muhammad-ali-mirza", "Engineer Muhammad Ali Mirza", "speaker", "rising", "male", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Urdu", "Arabic"], ["Quran", "Reform", "Debate"], { note: "Pakistani scholar known for direct Quran-centric approach", trending: true, socialLinks: { youtube: "https://www.youtube.com/@EngineerMuhammadAliMirza" } }),
  c("dr-israr-ahmed", "Dr. Israr Ahmed", "scholar", "verified", "male", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Urdu", "Arabic"], ["Quran", "Revival", "Theology"], { note: "Pakistani scholar, founder of Tanzeem-e-Islami and Quran Academy", isHistorical: true, lifespan: "1932-2010" }),
  c("maulana-ilyas", "Maulana Muhammad Ilyas", "scholar", "verified", "male", "south_asia", "IN", "\u{1F1EE}\u{1F1F3}", ["Urdu", "Arabic"], ["Dawah", "Tablighi Jamaat", "Spirituality"], { note: "Founder of the Tablighi Jamaat movement", isHistorical: true, lifespan: "1885-1944" }),
  c("mufti-taqi-usmani", "Mufti Taqi Usmani", "scholar", "verified", "male", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Urdu", "Arabic", "English"], ["Islamic Finance", "Fiqh", "Hadith"], { note: "Leading authority on Islamic finance, former judge of Shariat Appellate Bench", featured: true }),
  c("tahir-ul-qadri", "Tahir ul-Qadri", "scholar", "verified", "male", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Urdu", "Arabic", "English"], ["Sufism", "Fatwa", "Education"], { note: "Founder of Minhaj-ul-Quran International, issued fatwa against terrorism", socialLinks: { youtube: "https://www.youtube.com/@MinhajTV" } }),
  c("junaid-jamshed", "Junaid Jamshed", "speaker", "verified", "male", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Urdu", "English"], ["Nasheeds", "Dawah", "Youth"], { note: "Pakistani pop star turned Islamic preacher and nasheed artist", isHistorical: true, lifespan: "1964-2016" }),
  c("dr-farhat-hashmi-quran", "Dr. Idrees Zubair", "scholar", "verified", "male", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Urdu", "Arabic"], ["Hadith", "Quran", "Education"], { note: "Pakistani hadith scholar associated with Al-Huda Institute" }),
  c("mufti-muneeb-ur-rehman", "Mufti Muneeb-ur-Rehman", "scholar", "verified", "male", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Urdu", "Arabic"], ["Fiqh", "Fatwa", "Community"], { note: "Chairman of Ruet-e-Hilal Committee in Pakistan" }),

  // INDIA
  c("maulana-wahiduddin-khan", "Maulana Wahiduddin Khan", "author", "verified", "male", "south_asia", "IN", "\u{1F1EE}\u{1F1F3}", ["Urdu", "Arabic", "English", "Hindi"], ["Interfaith", "Peace", "Dawah"], { note: "Indian Islamic scholar, peace activist, and prolific author", isHistorical: true, lifespan: "1925-2021" }),
  c("maulana-saad-kandhlawi", "Maulana Saad Kandhlawi", "scholar", "verified", "male", "south_asia", "IN", "\u{1F1EE}\u{1F1F3}", ["Urdu", "Arabic"], ["Tablighi Jamaat", "Dawah", "Spirituality"], { note: "Senior leader of the Tablighi Jamaat based in Nizamuddin, Delhi" }),
  c("maulana-arshad-madani", "Maulana Arshad Madani", "scholar", "verified", "male", "south_asia", "IN", "\u{1F1EE}\u{1F1F3}", ["Urdu", "Arabic"], ["Deobandi", "Education", "Leadership"], { note: "President of Jamiat Ulema-e-Hind" }),
  c("maulana-mahmood-madani", "Maulana Mahmood Madani", "scholar", "verified", "male", "south_asia", "IN", "\u{1F1EE}\u{1F1F3}", ["Urdu", "Arabic", "English"], ["Community", "Interfaith", "Leadership"], { note: "Indian scholar and Member of Parliament, Jamiat Ulema-e-Hind leader" }),
  c("syed-salman-husaini-nadwi", "Syed Salman Husaini Nadwi", "scholar", "verified", "male", "south_asia", "IN", "\u{1F1EE}\u{1F1F3}", ["Urdu", "Arabic"], ["Hadith", "Fiqh", "Education"], { note: "Indian scholar from Nadwatul Ulama in Lucknow" }),
  c("shah-waliullah", "Shah Waliullah", "scholar", "verified", "male", "south_asia", "IN", "\u{1F1EE}\u{1F1F3}", ["Urdu", "Arabic", "Persian"], ["Hadith", "Fiqh", "Reform"], { note: "One of the most influential scholars of the Indian subcontinent", isHistorical: true, lifespan: "1703-1762", featured: true }),
  c("irrfan-khan", "Irrfan Khan", "public_figure", "rising", "male", "south_asia", "IN", "\u{1F1EE}\u{1F1F3}", ["Hindi", "English", "Urdu"], ["Entertainment", "Arts", "Representation"], { note: "Acclaimed Indian Muslim actor in Bollywood and Hollywood", isHistorical: true, lifespan: "1967-2020" }),
  c("ar-rahman", "A.R. Rahman", "public_figure", "rising", "male", "south_asia", "IN", "\u{1F1EE}\u{1F1F3}", ["Tamil", "English", "Hindi"], ["Music", "Arts", "Representation"], { note: "Oscar-winning Indian Muslim composer" }),
  c("sania-mirza", "Sania Mirza", "public_figure", "rising", "female", "south_asia", "IN", "\u{1F1EE}\u{1F1F3}", ["English", "Urdu", "Hindi"], ["Sports", "Women", "Representation"], { note: "Indian Muslim tennis champion, former doubles world No. 1" }),

  // BANGLADESH
  c("allama-shafi", "Allama Ahmad Shafi", "scholar", "verified", "male", "south_asia", "BD", "\u{1F1E7}\u{1F1E9}", ["Bengali", "Arabic", "Urdu"], ["Hadith", "Deobandi", "Education"], { note: "Head of Hefazat-e-Islam Bangladesh and Hathazari Madrasa", isHistorical: true, lifespan: "1916-2020" }),
  c("sheikh-hasina", "Sheikh Hasina", "activist", "rising", "female", "south_asia", "BD", "\u{1F1E7}\u{1F1E9}", ["Bengali", "English"], ["Leadership", "Development", "Politics"], { note: "Prime Minister of Bangladesh, Muslim woman leader" }),
  c("mufti-fazlul-haque-amini", "Fazlul Haque Amini", "scholar", "verified", "male", "south_asia", "BD", "\u{1F1E7}\u{1F1E9}", ["Bengali", "Arabic"], ["Fiqh", "Education", "Community"], { note: "Bangladeshi Islamic scholar and educator" }),
  c("delwar-hossain-sayeedi", "Delwar Hossain Sayeedi", "speaker", "verified", "male", "south_asia", "BD", "\u{1F1E7}\u{1F1E9}", ["Bengali", "Arabic"], ["Tafsir", "Community", "Dawah"], { note: "Bangladeshi Islamic orator and tafsir lecturer" }),
  c("mizanur-rahman-azhari", "Mizanur Rahman Azhari", "speaker", "rising", "male", "south_asia", "BD", "\u{1F1E7}\u{1F1E9}", ["Bengali", "Arabic", "English"], ["Youth", "Motivation", "Modern Issues"], { note: "Young Bangladeshi Islamic speaker popular on social media", trending: true }),

  // AFGHANISTAN
  c("mawlana-jalaluddin-rumi", "Mawlana Jalaluddin Rumi", "author", "verified", "male", "south_asia", "AF", "\u{1F1E6}\u{1F1EB}", ["Persian", "Arabic"], ["Sufism", "Poetry", "Spirituality"], { note: "13th-century Sufi mystic poet, author of the Masnavi", isHistorical: true, lifespan: "1207-1273", featured: true }),
  c("al-biruni", "Al-Biruni", "scholar", "verified", "male", "south_asia", "AF", "\u{1F1E6}\u{1F1EB}", ["Arabic", "Persian"], ["Science", "History", "Mathematics"], { note: "Polymath who pioneered comparative religion and contributed to astronomy", isHistorical: true, lifespan: "973-1048" }),

  // SRI LANKA
  c("rizwe-muazzam", "Rizwe Muazzam", "educator", "rising", "male", "south_asia", "LK", "\u{1F1F1}\u{1F1F0}", ["Tamil", "English", "Arabic"], ["Education", "Youth", "Community"], { note: "Sri Lankan Islamic educator serving the Muslim minority community" }),
];

// ==========================================
// SOUTHEAST ASIA EXPANSION (~50 creators)
// ==========================================
const southeastAsiaExpansion = [
  // INDONESIA (expanding)
  c("buya-hamka", "Buya Hamka", "author", "verified", "male", "southeast_asia", "ID", "\u{1F1EE}\u{1F1E9}", ["Indonesian", "Arabic"], ["Tafsir", "Literature", "Reform"], { note: "Indonesian polymath, author of Tafsir Al-Azhar, novelist", isHistorical: true, lifespan: "1908-1981", featured: true }),
  c("gus-baha", "Gus Baha", "scholar", "verified", "male", "southeast_asia", "ID", "\u{1F1EE}\u{1F1E9}", ["Indonesian", "Arabic", "Javanese"], ["Quran", "Spirituality", "Traditional Islam"], { note: "Indonesian traditional scholar with massive social media following", trending: true }),
  c("habib-rizieq-shihab", "Habib Rizieq Shihab", "speaker", "rising", "male", "southeast_asia", "ID", "\u{1F1EE}\u{1F1E9}", ["Indonesian", "Arabic"], ["Dawah", "Community", "Leadership"], { note: "Indonesian Islamic leader and founder of FPI" }),
  c("hanan-attaki", "Hanan Attaki", "speaker", "rising", "male", "southeast_asia", "ID", "\u{1F1EE}\u{1F1E9}", ["Indonesian", "Arabic"], ["Youth", "Motivation", "Modern Issues"], { note: "Popular young Indonesian preacher with millions of followers", trending: true, socialLinks: { youtube: "https://www.youtube.com/@HananAttaki", instagram: "https://www.instagram.com/hananattaki" } }),
  c("adi-hidayat", "Adi Hidayat", "educator", "verified", "male", "southeast_asia", "ID", "\u{1F1EE}\u{1F1E9}", ["Indonesian", "Arabic"], ["Quran", "Hadith", "Education"], { note: "Indonesian Quran and Hadith scholar with a modern teaching style", trending: true, socialLinks: { youtube: "https://www.youtube.com/@AdiHidayatOfficialChannel" } }),
  c("khalid-basalamah", "Khalid Basalamah", "speaker", "verified", "male", "southeast_asia", "ID", "\u{1F1EE}\u{1F1E9}", ["Indonesian", "Arabic"], ["Dawah", "Fiqh", "Daily Life"], { note: "Indonesian preacher known for accessible Islamic guidance" }),
  c("nusaibah-saeed", "Nusaibah Saeed", "educator", "rising", "female", "southeast_asia", "ID", "\u{1F1EE}\u{1F1E9}", ["Indonesian", "Arabic", "English"], ["Women", "Quran", "Education"], { note: "Indonesian female Islamic educator and writer" }),

  // MALAYSIA
  c("dr-maza", "Dr. MAZA (Mohd Asri Zainul Abidin)", "scholar", "verified", "male", "southeast_asia", "MY", "\u{1F1F2}\u{1F1FE}", ["Malay", "Arabic", "English"], ["Fiqh", "Reform", "Modern Issues"], { note: "Mufti of Perlis state, progressive Malaysian Islamic scholar", featured: true }),
  c("dato-ismail-kamus", "Dato Ismail Kamus", "speaker", "verified", "male", "southeast_asia", "MY", "\u{1F1F2}\u{1F1FE}", ["Malay", "Arabic"], ["Spirituality", "Community", "Dawah"], { note: "Malaysian Islamic motivational speaker" }),
  c("ustaz-azhar-idrus", "Ustaz Azhar Idrus", "speaker", "rising", "male", "southeast_asia", "MY", "\u{1F1F2}\u{1F1FE}", ["Malay", "Arabic"], ["Q&A", "Daily Life", "Youth"], { note: "Malaysian preacher known for casual and humorous Q&A sessions", trending: true }),
  c("wan-ji", "Wan Ji Wan Hussin", "speaker", "rising", "male", "southeast_asia", "MY", "\u{1F1F2}\u{1F1FE}", ["Malay", "Arabic"], ["Fiqh", "Modern Issues", "Reform"], { note: "Outspoken Malaysian Islamic preacher and social commentator" }),
  c("mufti-wilayah", "Dato Zulkifli Mohamad Al-Bakri", "scholar", "verified", "male", "southeast_asia", "MY", "\u{1F1F2}\u{1F1FE}", ["Malay", "Arabic", "English"], ["Fiqh", "Fatwa", "Education"], { note: "Former Mufti of the Federal Territory of Malaysia" }),
  c("wardina-safiyyah", "Wardina Safiyyah", "influencer", "rising", "female", "southeast_asia", "MY", "\u{1F1F2}\u{1F1FE}", ["Malay", "English"], ["Women", "Lifestyle", "Hijab"], { note: "Malaysian hijab fashion influencer and TV personality", trending: true }),
  c("yusuf-estes", "Yusuf Estes", "speaker", "verified", "male", "southeast_asia", "MY", "\u{1F1F2}\u{1F1FE}", ["English", "Arabic"], ["Dawah", "Converts", "Interfaith"], { note: "American convert and global Islamic speaker based in Malaysia", socialLinks: { youtube: "https://www.youtube.com/@YusufEstes", website: "https://www.yusufestes.com" } }),

  // PHILIPPINES
  c("sheikh-omar-penalosa", "Sheikh Omar Penalosa", "educator", "rising", "male", "southeast_asia", "PH", "\u{1F1F5}\u{1F1ED}", ["Filipino", "Arabic", "English"], ["Education", "Community", "Youth"], { note: "Filipino Islamic educator serving the Moro Muslim community" }),

  // SINGAPORE
  c("ustaz-muhammad-irfan", "Ustaz Muhammad Irfan", "educator", "rising", "male", "southeast_asia", "SG", "\u{1F1F8}\u{1F1EC}", ["Malay", "English", "Arabic"], ["Youth", "Modern Issues", "Community"], { note: "Singaporean Islamic educator and community leader" }),

  // THAILAND
  c("sheikh-ismail-lutfi", "Sheikh Ismail Lutfi", "scholar", "verified", "male", "southeast_asia", "TH", "\u{1F1F9}\u{1F1ED}", ["Thai", "Malay", "Arabic"], ["Education", "Community", "Fiqh"], { note: "Leading Islamic scholar in southern Thailand" }),

  // BRUNEI
  c("pengiran-haji-mohammad", "Pehin Dato Abdul Hamid", "scholar", "verified", "male", "southeast_asia", "BN", "\u{1F1E7}\u{1F1F3}", ["Malay", "Arabic"], ["Fiqh", "Education", "Community"], { note: "State Mufti of Brunei Darussalam" }),
];

// ==========================================
// MIDDLE EAST EXPANSION (~40 creators)
// ==========================================
const middleEastExpansion = [
  // SAUDI ARABIA (expanding)
  c("salman-al-ouda", "Salman al-Ouda", "scholar", "verified", "male", "middle_east", "SA", "\u{1F1F8}\u{1F1E6}", ["Arabic"], ["Dawah", "Spirituality", "Social Media"], { note: "Saudi scholar and author with millions of social media followers" }),
  c("aidh-al-qarni", "Aidh al-Qarni", "author", "verified", "male", "middle_east", "SA", "\u{1F1F8}\u{1F1E6}", ["Arabic"], ["Motivation", "Spirituality", "Self-Help"], { note: "Saudi author of Don't Be Sad, one of the best-selling Arabic books" }),
  c("sheikh-saleh-al-maghamsi", "Sheikh Saleh al-Maghamsi", "scholar", "verified", "male", "middle_east", "SA", "\u{1F1F8}\u{1F1E6}", ["Arabic"], ["Tafsir", "Spirituality", "History"], { note: "Saudi imam and TV presenter known for eloquent sermons" }),
  c("maher-al-muaiqly", "Maher al-Muaiqly", "reciter", "verified", "male", "middle_east", "SA", "\u{1F1F8}\u{1F1E6}", ["Arabic"], ["Quran", "Recitation"], { note: "Imam of Masjid al-Haram, beloved Quran reciter" }),
  c("yasser-al-dosari", "Yasser al-Dosari", "reciter", "verified", "male", "middle_east", "SA", "\u{1F1F8}\u{1F1E6}", ["Arabic"], ["Quran", "Recitation"], { note: "Saudi Quran reciter known for his melodious and emotional style", trending: true }),
  c("bandar-baleela", "Bandar Baleela", "reciter", "verified", "male", "middle_east", "SA", "\u{1F1F8}\u{1F1E6}", ["Arabic"], ["Quran", "Recitation"], { note: "Imam of Masjid al-Haram in Mecca" }),

  // UAE
  c("waseem-yousef", "Waseem Yousef", "speaker", "rising", "male", "middle_east", "AE", "\u{1F1E6}\u{1F1EA}", ["Arabic"], ["Moderate Islam", "Reform", "Community"], { note: "UAE-based scholar and TV personality" }),
  c("omar-abdulkafi", "Omar Abdulkafi", "speaker", "verified", "male", "middle_east", "AE", "\u{1F1E6}\u{1F1EA}", ["Arabic"], ["Seerah", "Spirituality", "Dawah"], { note: "Egyptian-Emirati scholar and popular Islamic TV presenter" }),

  // PALESTINE
  c("sheikh-raed-salah", "Sheikh Raed Salah", "activist", "rising", "male", "middle_east", "PS", "\u{1F1F5}\u{1F1F8}", ["Arabic"], ["Al-Aqsa", "Social Justice", "Community"], { note: "Palestinian leader of the Islamic Movement" }),
  c("ismail-haniyeh", "Ismail Haniyeh", "activist", "rising", "male", "middle_east", "PS", "\u{1F1F5}\u{1F1F8}", ["Arabic"], ["Leadership", "Politics", "Community"], { note: "Palestinian political leader" }),

  // JORDAN
  c("ali-jaber", "Ali Jaber", "reciter", "verified", "male", "middle_east", "JO", "\u{1F1EF}\u{1F1F4}", ["Arabic"], ["Quran", "Recitation", "Tajweed"], { note: "Jordanian-Saudi Quran reciter, imam of Masjid al-Nabawi" }),

  // SYRIA
  c("muhammad-said-ramadan-al-bouti", "Muhammad Said Ramadan al-Bouti", "scholar", "verified", "male", "middle_east", "SY", "\u{1F1F8}\u{1F1FE}", ["Arabic"], ["Theology", "Fiqh", "Seerah"], { note: "Prominent Syrian scholar and author of Fiqh al-Seerah", isHistorical: true, lifespan: "1929-2013" }),
  c("ahmed-kuftaro", "Ahmad Kuftaro", "scholar", "verified", "male", "middle_east", "SY", "\u{1F1F8}\u{1F1FE}", ["Arabic", "Turkish"], ["Interfaith", "Sufism", "Leadership"], { note: "Grand Mufti of Syria and interfaith dialogue pioneer", isHistorical: true, lifespan: "1915-2004" }),

  // IRAQ
  c("grand-ayatollah-sistani", "Grand Ayatollah Ali al-Sistani", "scholar", "verified", "male", "middle_east", "IQ", "\u{1F1EE}\u{1F1F6}", ["Arabic", "Persian"], ["Fiqh", "Leadership", "Community"], { note: "Most senior Shia cleric in Iraq, based in Najaf" }),

  // YEMEN
  c("habib-umar-bin-hafiz", "Habib Umar bin Hafiz", "scholar", "verified", "male", "middle_east", "YE", "\u{1F1FE}\u{1F1EA}", ["Arabic"], ["Sufism", "Hadith", "Spirituality"], { note: "Yemeni scholar, dean of Dar al-Mustafa in Tarim", featured: true, socialLinks: { website: "https://www.alhabibomar.com" } }),
  c("habib-kadhim-al-saqqaf", "Habib Kadhim al-Saqqaf", "scholar", "verified", "male", "middle_east", "YE", "\u{1F1FE}\u{1F1EA}", ["Arabic", "English"], ["Spirituality", "Sufism", "Education"], { note: "Yemeni scholar based in the UK, popular teacher at SeekersGuidance" }),

  // LEBANON
  c("sayyed-hassan-nasrallah", "Sayyed Hassan Nasrallah", "speaker", "rising", "male", "middle_east", "LB", "\u{1F1F1}\u{1F1E7}", ["Arabic"], ["Leadership", "Politics", "Community"], { note: "Lebanese Shia leader" }),

  // KUWAIT
  c("mishary-bin-rashid", "Nabil Al-Awadi", "speaker", "verified", "male", "middle_east", "KW", "\u{1F1F0}\u{1F1FC}", ["Arabic"], ["Dawah", "Motivation", "Youth"], { note: "Kuwaiti Islamic speaker and TV personality", socialLinks: { youtube: "https://www.youtube.com/@NabilAlAwadi" } }),

  // QATAR
  c("sheikh-yusuf-al-qaradawi-ref", "Ali al-Qaradaghi", "scholar", "verified", "male", "middle_east", "QA", "\u{1F1F6}\u{1F1E6}", ["Arabic", "Kurdish"], ["Fiqh", "Islamic Finance", "Fatwa"], { note: "Secretary-General of the International Union of Muslim Scholars" }),
];

// ==========================================
// EAST AFRICA EXPANSION (~20 creators)
// ==========================================
const eastAfricaExpansion = [
  // ETHIOPIA
  c("bilal-ibn-rabah", "Bilal ibn Rabah", "public_figure", "verified", "male", "east_africa", "ET", "\u{1F1EA}\u{1F1F9}", ["Arabic"], ["History", "Spirituality"], { note: "Companion of Prophet Muhammad, first muezzin, of Ethiopian origin", isHistorical: true, lifespan: "580-640", featured: true }),
  c("sheikh-mohammed-al-amoudi", "Sheikh Mohammed Al Amoudi", "public_figure", "rising", "male", "east_africa", "ET", "\u{1F1EA}\u{1F1F9}", ["Amharic", "Arabic", "English"], ["Business", "Philanthropy", "Community"], { note: "Ethiopian-Saudi billionaire and philanthropist" }),

  // KENYA
  c("sheikh-ali-shee", "Sheikh Ali Shee", "scholar", "verified", "male", "east_africa", "KE", "\u{1F1F0}\u{1F1EA}", ["Swahili", "Arabic", "English"], ["Education", "Community", "Dawah"], { note: "Kenyan Islamic scholar and chairman of the Council of Imams" }),
  c("sheikh-juma-ngao", "Sheikh Juma Ngao", "speaker", "verified", "male", "east_africa", "KE", "\u{1F1F0}\u{1F1EA}", ["Swahili", "Arabic"], ["Dawah", "Community", "Youth"], { note: "Kenyan Muslim community leader and speaker" }),

  // TANZANIA
  c("sheikh-issa-ponda", "Sheikh Issa Ponda", "speaker", "rising", "male", "east_africa", "TZ", "\u{1F1F9}\u{1F1FF}", ["Swahili", "Arabic"], ["Dawah", "Community", "Youth"], { note: "Tanzanian Islamic preacher and community activist" }),

  // DJIBOUTI
  c("sheikh-moussa-hassan-dirir", "Sheikh Moussa Hassan Dirir", "scholar", "rising", "male", "east_africa", "DJ", "\u{1F1E9}\u{1F1EF}", ["Somali", "Arabic", "French"], ["Education", "Community", "Fiqh"], { note: "Djiboutian Islamic scholar and educator" }),

  // UGANDA
  c("sheikh-shaban-ramadan-mubaje", "Sheikh Shaban Ramadan Mubaje", "scholar", "verified", "male", "east_africa", "UG", "\u{1F1FA}\u{1F1EC}", ["English", "Luganda", "Arabic"], ["Community", "Leadership", "Interfaith"], { note: "Grand Mufti of Uganda, leader of Uganda Muslim Supreme Council" }),
];

// ==========================================
// EUROPE EXPANSION (~15 creators)
// ==========================================
const europeExpansion = [
  // FRANCE
  c("tariq-ramadan", "Tariq Ramadan", "scholar", "verified", "male", "europe", "FR", "\u{1F1EB}\u{1F1F7}", ["French", "English", "Arabic"], ["Western Muslims", "Philosophy", "Reform"], { note: "Swiss-Egyptian intellectual and professor at Oxford" }),
  c("hassan-iquioussen", "Hassan Iquioussen", "speaker", "rising", "male", "europe", "FR", "\u{1F1EB}\u{1F1F7}", ["French", "Arabic"], ["History", "Youth", "Community"], { note: "Franco-Moroccan Islamic preacher popular among French-speaking Muslims" }),

  // GERMANY
  c("pierre-vogel", "Pierre Vogel", "speaker", "rising", "male", "europe", "DE", "\u{1F1E9}\u{1F1EA}", ["German", "Arabic"], ["Dawah", "Converts", "Youth"], { note: "German convert and Islamic preacher, former boxer" }),
  c("ferid-heider", "Ferid Heider", "speaker", "rising", "male", "europe", "DE", "\u{1F1E9}\u{1F1EA}", ["German", "Arabic"], ["Youth", "Community", "Modern Issues"], { note: "German imam and Islamic educator in Berlin" }),

  // NETHERLANDS
  c("yassin-elforkani", "Yassin Elforkani", "speaker", "rising", "male", "europe", "NL", "\u{1F1F3}\u{1F1F1}", ["Dutch", "Arabic"], ["Interfaith", "Community", "Youth"], { note: "Dutch-Moroccan imam promoting integration and dialogue" }),

  // TURKEY (could be Europe or Central Asia)
  c("mehmet-gormez", "Mehmet Gormez", "scholar", "verified", "male", "europe", "TR", "\u{1F1F9}\u{1F1F7}", ["Turkish", "Arabic", "English"], ["Hadith", "Leadership", "Interfaith"], { note: "Former President of Turkey's Directorate of Religious Affairs" }),
  c("fethullah-gulen", "Fethullah Gulen", "scholar", "verified", "male", "europe", "TR", "\u{1F1F9}\u{1F1F7}", ["Turkish", "Arabic"], ["Education", "Interfaith", "Sufism"], { note: "Turkish Islamic scholar and founder of the Hizmet movement", isHistorical: true, lifespan: "1941-2024" }),
  c("said-nursi", "Said Nursi", "author", "verified", "male", "europe", "TR", "\u{1F1F9}\u{1F1F7}", ["Turkish", "Arabic", "Kurdish"], ["Theology", "Philosophy", "Spirituality"], { note: "Kurdish-Turkish scholar, author of the Risale-i Nur collection", isHistorical: true, lifespan: "1877-1960", featured: true }),
  c("diyanet-ali-erbas", "Ali Erbas", "scholar", "verified", "male", "europe", "TR", "\u{1F1F9}\u{1F1F7}", ["Turkish", "Arabic"], ["Leadership", "Education", "Community"], { note: "President of Turkey's Directorate of Religious Affairs (Diyanet)" }),
  c("omar-faruk-hilmi", "Nouman Celal Guven", "educator", "rising", "male", "europe", "TR", "\u{1F1F9}\u{1F1F7}", ["Turkish", "Arabic"], ["Quran", "Education", "Youth"], { note: "Turkish Islamic educator popular on YouTube" }),

  // SPAIN
  c("mansur-escudero", "Mansur Escudero", "activist", "rising", "male", "europe", "ES", "\u{1F1EA}\u{1F1F8}", ["Spanish", "Arabic"], ["Interfaith", "Community", "History"], { note: "Spanish convert and founder of the Islamic Council of Spain", isHistorical: true, lifespan: "1947-2010" }),

  // SWEDEN
  c("omar-mustafa", "Omar Mustafa", "activist", "rising", "male", "europe", "SE", "\u{1F1F8}\u{1F1EA}", ["Swedish", "Arabic"], ["Community", "Interfaith", "Youth"], { note: "Swedish Muslim community leader and former head of Islamic Association of Sweden" }),

  // BOSNIA
  c("mustafa-ceric", "Mustafa Ceric", "scholar", "verified", "male", "europe", "BA", "\u{1F1E7}\u{1F1E6}", ["Bosnian", "Arabic", "English"], ["Interfaith", "Leadership", "Community"], { note: "Former Grand Mufti of Bosnia and Herzegovina" }),
];

// ==========================================
// AMERICAS ADDITIONS (~15 creators - diaspora/new)
// ==========================================
const americasAdditions = [
  c("imam-siraj-wahhaj-jr", "Khalil Abdur-Rashid", "scholar", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Chaplaincy", "Youth", "Spirituality"], { note: "Harvard University Muslim chaplain" }),
  c("omar-suleiman-yaqeen", "Suleiman Hani", "educator", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Spirituality", "Youth", "Mental Health"], { note: "Yaqeen Institute researcher and instructor" }),
  c("dr-haifaa-younis", "Dr. Haifaa Younis", "educator", "verified", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Quran", "Women", "Spirituality"], { note: "Founder of Jannah Institute, OB-GYN turned Islamic scholar", trending: true, socialLinks: { youtube: "https://www.youtube.com/@JannahInstitute" } }),
  c("taimiyyah-zubair", "Taimiyyah Zubair", "educator", "verified", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic", "Urdu"], ["Quran", "Tafsir", "Women"], { note: "Al-Huda Institute instructor, Quran and tafsir teacher" }),
  c("daood-butt", "Daood Butt", "educator", "rising", "male", "americas", "CA", "\u{1F1E8}\u{1F1E6}", ["English", "Arabic"], ["Youth", "Community", "Fiqh"], { note: "Canadian imam and Islamic instructor at Mississauga mosque" }),
  c("kamal-el-mekki", "Kamal El-Mekki", "speaker", "verified", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Dawah", "Youth", "Converts"], { note: "AlMaghrib Institute instructor, expert in dawah techniques" }),
  c("imam-zaid-shakir-zaytuna", "Jamaal Diwan", "educator", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["History", "Youth", "Community"], { note: "Islamic educator and researcher based in California" }),
  c("yaser-birjas", "Yaser Birjas", "scholar", "verified", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Fiqh", "Family", "Community"], { note: "Head of Islamic Law and Ethics at the Dallas Islamic seminary" }),
  c("walead-mosaad", "Walead Mosaad", "scholar", "verified", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Theology", "Sufism", "Philosophy"], { note: "Rutgers adjunct professor and Islamic theology scholar" }),
  c("mos-def-yasiin-bey", "Yasiin Bey", "public_figure", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English"], ["Arts", "Music", "Representation"], { note: "Rapper and actor (formerly Mos Def), practicing Muslim" }),
  c("dr-altaf-husain", "Dr. Altaf Husain", "educator", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Urdu"], ["Social Work", "Youth", "Community"], { note: "Howard University social work professor and Muslim community leader" }),
  c("ustadha-zaynab-ansari", "Zaynab Ansari", "educator", "verified", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Theology", "Women", "Education"], { note: "American scholar and instructor, studied at Al-Azhar" }),
  c("dr-ovamir-anjum", "Dr. Ovamir Anjum", "scholar", "verified", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic", "Urdu"], ["Theology", "History", "Academia"], { note: "University of Toledo professor of Islamic intellectual history" }),
];

// Combine all new creators
const allNewCreators = [
  ...westAfrica,
  ...northAfrica,
  ...southAsiaExpansion,
  ...southeastAsiaExpansion,
  ...middleEastExpansion,
  ...eastAfricaExpansion,
  ...europeExpansion,
  ...americasAdditions,
];

console.log(`\nNew creators to add: ${allNewCreators.length}`);

// Read existing file
let fileContent = readFileSync(filePath, 'utf-8');

// Get existing IDs to avoid duplicates
const existingIds = new Set();
const idMatches = fileContent.matchAll(/"id":\s*"([^"]+)"/g);
for (const match of idMatches) {
  existingIds.add(match[1]);
}

// Filter out duplicates
const uniqueNew = allNewCreators.filter(c => {
  if (existingIds.has(c.id)) {
    console.log(`  Skipping duplicate: ${c.id}`);
    return false;
  }
  return true;
});

console.log(`Unique new creators: ${uniqueNew.length}`);
console.log(`Existing creators: ${existingIds.size}`);
console.log(`Total after merge: ${existingIds.size + uniqueNew.length}`);

// Format each creator as a JSON-like TypeScript object
function formatCreator(creator) {
  const lines = [];
  lines.push('  {');
  for (const [key, value] of Object.entries(creator)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string') {
      lines.push(`    "${key}": ${JSON.stringify(value)},`);
    } else if (typeof value === 'boolean') {
      lines.push(`    "${key}": ${value},`);
    } else if (Array.isArray(value)) {
      lines.push(`    "${key}": ${JSON.stringify(value)},`);
    } else if (typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        lines.push(`    "${key}": {},`);
      } else {
        lines.push(`    "${key}": {`);
        entries.forEach(([k, v], i) => {
          const comma = i < entries.length - 1 ? ',' : '';
          lines.push(`      "${k}": ${JSON.stringify(v)}${comma}`);
        });
        lines.push('    },');
      }
    }
  }
  // Remove trailing comma from last property
  const lastLine = lines[lines.length - 1];
  if (lastLine.endsWith(',')) {
    lines[lines.length - 1] = lastLine.slice(0, -1);
  }
  lines.push('  }');
  return lines.join('\n');
}

// Insert new creators before the closing ];
const closingBracket = fileContent.lastIndexOf('];');
if (closingBracket === -1) {
  console.error('ERROR: Could not find closing ]; in file');
  process.exit(1);
}

const newCreatorsStr = uniqueNew.map(formatCreator).join(',\n');
fileContent = fileContent.substring(0, closingBracket) +
  ',\n' + newCreatorsStr + '\n];\n';

writeFileSync(filePath, fileContent, 'utf-8');

// Print stats
const regionCounts = {};
for (const c of [...Array.from(existingIds).map(() => null), ...uniqueNew]) {
  // We'll recount from file
}

// Recount from file
const finalContent = readFileSync(filePath, 'utf-8');
const totalIds = (finalContent.match(/"id":/g) || []).length;
const regions = {};
const regionMatches = finalContent.matchAll(/"region":\s*"([^"]+)"/g);
for (const m of regionMatches) {
  regions[m[1]] = (regions[m[1]] || 0) + 1;
}

console.log(`\n=== FINAL STATS ===`);
console.log(`Total creators: ${totalIds}`);
console.log(`\nBy region:`);
for (const [region, count] of Object.entries(regions).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${region}: ${count} (${Math.round(count/totalIds*100)}%)`);
}

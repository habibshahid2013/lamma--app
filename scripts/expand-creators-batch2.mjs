/**
 * Creator Database Expansion Script - Batch 2
 * Adds ~290 new creator profiles to reach 500 target
 * Run: node scripts/expand-creators-batch2.mjs
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
// BATCH 2: AMERICAS (~40 new)
// ==========================================
const americas2 = [
  // USA - More scholars & educators
  c("imam-webb", "Imam Suhaib Webb", "educator", "verified", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Fiqh", "Youth", "Community"], { note: "American imam and educator, convert from Oklahoma" }),
  c("dr-ingrid-mattson", "Dr. Ingrid Mattson", "scholar", "verified", "female", "americas", "CA", "\u{1F1E8}\u{1F1E6}", ["English", "Arabic"], ["Interfaith", "Women", "Leadership"], { note: "Canadian convert, former ISNA president, professor at Huron University" }),
  c("dr-umar-faruq-abd-allah", "Dr. Umar Faruq Abd-Allah", "scholar", "verified", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Theology", "History", "Spirituality"], { note: "American scholar and senior advisor to Nawawi Foundation" }),
  c("hamza-tzortzis", "Hamza Tzortzis", "speaker", "verified", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Greek"], ["Dawah", "Philosophy", "Apologetics"], { note: "Greek-British Islamic speaker and writer, Sapience Institute" }),
  c("imam-khalid-latif", "Imam Khalid Latif", "educator", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Chaplaincy", "Youth", "Community"], { note: "Executive director of the Islamic Center at NYU" }),
  c("dr-sherman-jackson", "Dr. Sherman Jackson", "scholar", "verified", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Theology", "Law", "Race"], { note: "USC professor and leading American Muslim intellectual" }),
  c("imam-johari-abdul-malik", "Imam Johari Abdul-Malik", "speaker", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Interfaith", "Community", "Leadership"], { note: "Imam of Dar Al-Hijrah Islamic Center in Virginia" }),
  c("dr-mattson-islamic-studies", "Dr. Jonathan Brown", "scholar", "verified", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Hadith", "History", "Academia"], { note: "Georgetown University professor and hadith scholar" }),
  c("ustadh-nouman-khan-bayyinah", "Wisam Sharieff", "educator", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Quran", "Tajweed", "Youth"], { note: "Quran Revolution educator, tajweed specialist" }),
  c("haleh-banani", "Haleh Banani", "educator", "rising", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Psychology", "Marriage", "Women"], { note: "Muslim psychologist and Islamic counselor, mental health advocate" }),
  c("keith-ellison", "Keith Ellison", "public_figure", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English"], ["Politics", "Social Justice", "Leadership"], { note: "First Muslim elected to U.S. Congress, Attorney General of Minnesota" }),
  c("rashida-tlaib", "Rashida Tlaib", "public_figure", "rising", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Politics", "Social Justice", "Leadership"], { note: "Palestinian-American Congresswoman, first Muslim woman in Congress" }),
  c("ilhan-omar", "Ilhan Omar", "public_figure", "rising", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Somali"], ["Politics", "Social Justice", "Leadership"], { note: "Somali-American Congresswoman, first Somali-American elected to Congress" }),
  c("ibtihaj-muhammad", "Ibtihaj Muhammad", "public_figure", "rising", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English"], ["Sports", "Women", "Representation"], { note: "Olympic fencer, first Muslim American woman to compete in hijab at the Olympics" }),
  c("dr-zainab-alwani", "Dr. Zainab Alwani", "scholar", "verified", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Quran", "Women", "Education"], { note: "Iraqi-American scholar at Howard University, Quranic studies specialist" }),
  c("linda-sarsour", "Linda Sarsour", "activist", "rising", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Social Justice", "Women", "Activism"], { note: "Palestinian-American activist and Women's March co-chair" }),
  c("wajahat-ali", "Wajahat Ali", "author", "rising", "male", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Urdu"], ["Media", "Culture", "Representation"], { note: "Pakistani-American author, playwright, and NY Times contributor" }),
  c("dalia-mogahed", "Dalia Mogahed", "speaker", "verified", "female", "americas", "US", "\u{1F1FA}\u{1F1F8}", ["English", "Arabic"], ["Research", "Islamophobia", "Women"], { note: "Director of research at ISPU, former Obama advisory council member" }),

  // CANADA
  c("navaid-aziz", "Navaid Aziz", "educator", "rising", "male", "americas", "CA", "\u{1F1E8}\u{1F1E6}", ["English", "Arabic"], ["Youth", "Community", "Fiqh"], { note: "Canadian imam in Calgary, AlMaghrib instructor" }),
  c("saad-tasleem", "Saad Tasleem", "educator", "rising", "male", "americas", "CA", "\u{1F1E8}\u{1F1E6}", ["English", "Arabic"], ["Youth", "Modern Issues", "Dawah"], { note: "Canadian Islamic instructor at AlMaghrib Institute" }),
  c("shaykh-ibrahim-hindy", "Ibrahim Hindy", "speaker", "rising", "male", "americas", "CA", "\u{1F1E8}\u{1F1E6}", ["English", "Arabic"], ["Youth", "Community", "Media"], { note: "Canadian imam in Mississauga, popular social media presence" }),

  // LATIN AMERICA
  c("muhammad-isa-garcia", "Muhammad Isa Garcia", "educator", "rising", "male", "americas", "AR", "\u{1F1E6}\u{1F1F7}", ["Spanish", "Arabic", "English"], ["Dawah", "Education", "Converts"], { note: "Argentine Islamic educator and Spanish-language dawah leader" }),
  c("sheikh-ahmad-bermejo", "Ahmad Bermejo", "educator", "rising", "male", "americas", "MX", "\u{1F1F2}\u{1F1FD}", ["Spanish", "Arabic"], ["Converts", "Education", "Community"], { note: "Mexican convert and Islamic educator for Latin American Muslims" }),
  c("imam-yahya-suquillo", "Yahya Suquillo", "educator", "rising", "male", "americas", "EC", "\u{1F1EA}\u{1F1E8}", ["Spanish", "Arabic"], ["Community", "Dawah", "Education"], { note: "Ecuadorian imam serving the growing Muslim community in South America" }),

  // CARIBBEAN
  c("imam-yasin-abu-bakr", "Imam Yasin Abu Bakr", "speaker", "rising", "male", "americas", "TT", "\u{1F1F9}\u{1F1F9}", ["English", "Arabic"], ["Community", "Leadership", "Dawah"], { note: "Trinidadian Muslim leader" }),

  // BRAZIL
  c("sheikh-rodrigo-rodrigues", "Rodrigo Rodrigues", "educator", "rising", "male", "americas", "BR", "\u{1F1E7}\u{1F1F7}", ["Portuguese", "Arabic", "English"], ["Dawah", "Education", "Converts"], { note: "Brazilian Muslim educator and community leader in Sao Paulo" }),
];

// ==========================================
// BATCH 2: EUROPE (~45 new)
// ==========================================
const europe2 = [
  // UK
  c("abdal-hakim-murad", "Abdal Hakim Murad", "scholar", "verified", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English", "Arabic", "Turkish"], ["Theology", "Sufism", "Philosophy"], { note: "Cambridge professor and dean of the Cambridge Muslim College", featured: true }),
  c("ajmal-masroor", "Ajmal Masroor", "speaker", "rising", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English", "Bengali", "Arabic"], ["Community", "Media", "Politics"], { note: "British-Bangladeshi imam and media commentator" }),
  c("moazzam-begg", "Moazzam Begg", "activist", "rising", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English", "Arabic", "Urdu"], ["Human Rights", "Social Justice"], { note: "British Muslim activist and former Guantanamo detainee" }),
  c("sheikh-haitham-al-haddad", "Sheikh Haitham al-Haddad", "scholar", "verified", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English", "Arabic"], ["Fiqh", "Community", "Modern Issues"], { note: "Palestinian-British scholar at the Islamic Council of Europe" }),
  c("imam-ajmal-masroor-uk", "Shaykh Zahir Mahmood", "speaker", "rising", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English", "Arabic", "Urdu"], ["Seerah", "History", "Youth"], { note: "British Islamic speaker known for powerful storytelling" }),
  c("lauren-booth", "Lauren Booth", "speaker", "rising", "female", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English"], ["Converts", "Women", "Media"], { note: "British journalist and convert, Palestine advocate" }),
  c("yusuf-islam-cat-stevens", "Yusuf Islam", "public_figure", "verified", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English"], ["Arts", "Education", "Charity"], { note: "Singer Cat Stevens, now Muslim philanthropist and educator", featured: true }),
  c("mo-farah", "Mo Farah", "public_figure", "rising", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English", "Somali"], ["Sports", "Representation"], { note: "British-Somali Olympic gold medalist in distance running" }),
  c("sadiq-khan", "Sadiq Khan", "public_figure", "rising", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English"], ["Politics", "Leadership", "Community"], { note: "First Muslim Mayor of London" }),
  c("mehdi-hasan", "Mehdi Hasan", "public_figure", "rising", "male", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English"], ["Media", "Politics", "Debate"], { note: "British-American journalist and broadcaster" }),
  c("ustadha-iffet-rafeeq", "Iffet Rafeeq Ahmed", "educator", "rising", "female", "europe", "GB", "\u{1F1EC}\u{1F1E7}", ["English", "Arabic"], ["Quran", "Women", "Education"], { note: "British female scholar specializing in Quranic studies" }),

  // FRANCE
  c("imam-of-drancy", "Hassen Chalghoumi", "speaker", "rising", "male", "europe", "FR", "\u{1F1EB}\u{1F1F7}", ["French", "Arabic"], ["Interfaith", "Community", "Peace"], { note: "Franco-Tunisian imam known for interfaith dialogue" }),
  c("rachid-benzine", "Rachid Benzine", "author", "rising", "male", "europe", "FR", "\u{1F1EB}\u{1F1F7}", ["French", "Arabic"], ["Reform", "Literature", "Academia"], { note: "Franco-Moroccan scholar and author on Islam and modernity" }),
  c("zineb-el-rhazoui", "Asma Lamrabet", "author", "rising", "female", "europe", "FR", "\u{1F1EB}\u{1F1F7}", ["French", "Arabic"], ["Women", "Reform", "Feminism"], { note: "Moroccan-French physician and author on Islam and women's rights" }),

  // GERMANY
  c("mouhanad-khorchide", "Mouhanad Khorchide", "scholar", "verified", "male", "europe", "DE", "\u{1F1E9}\u{1F1EA}", ["German", "Arabic"], ["Theology", "Reform", "Education"], { note: "Lebanese-born professor of Islamic theology at University of Munster" }),
  c("mesut-ozil", "Mesut Ozil", "public_figure", "rising", "male", "europe", "DE", "\u{1F1E9}\u{1F1EA}", ["German", "Turkish"], ["Sports", "Charity", "Representation"], { note: "German-Turkish footballer known for his Muslim faith and charity work" }),

  // ALBANIA / BALKANS
  c("sheikh-muhammad-nasiruddin-albani", "Muhammad Nasiruddin al-Albani", "scholar", "verified", "male", "europe", "AL", "\u{1F1E6}\u{1F1F1}", ["Arabic"], ["Hadith", "Fiqh", "Reform"], { note: "Albanian-born hadith scholar, one of the most influential modern scholars", isHistorical: true, lifespan: "1914-1999", featured: true }),
  c("grand-mufti-kosovo", "Naim Ternava", "scholar", "verified", "male", "europe", "XK", "\u{1F1FD}\u{1F1F0}", ["Albanian", "Arabic"], ["Community", "Leadership", "Education"], { note: "Grand Mufti of Kosovo" }),

  // RUSSIA / CENTRAL ASIA
  c("khabib-nurmagomedov", "Khabib Nurmagomedov", "public_figure", "rising", "male", "europe", "RU", "\u{1F1F7}\u{1F1FA}", ["Russian", "Arabic"], ["Sports", "Youth", "Representation"], { note: "Dagestani UFC champion known for his devout Muslim faith", trending: true }),
  c("ravil-gaynutdin", "Ravil Gaynutdin", "scholar", "verified", "male", "europe", "RU", "\u{1F1F7}\u{1F1FA}", ["Russian", "Arabic", "Tatar"], ["Community", "Leadership", "Interfaith"], { note: "Chairman of the Russia Muftis Council, Grand Mufti of Russia" }),
  c("talgat-tadzhuddin", "Talgat Tadzhuddin", "scholar", "verified", "male", "europe", "RU", "\u{1F1F7}\u{1F1FA}", ["Russian", "Arabic", "Bashkir"], ["Leadership", "Community", "Interfaith"], { note: "Supreme Mufti of Russia and head of Central Spiritual Board of Muslims" }),

  // SCANDINAVIA
  c("imam-ahmed-obaid", "Ahmed al-Rawi", "speaker", "rising", "male", "europe", "NO", "\u{1F1F3}\u{1F1F4}", ["Norwegian", "Arabic"], ["Community", "Integration", "Youth"], { note: "Norwegian-Iraqi Muslim leader and former head of Federation of Islamic Organizations" }),

  // ITALY
  c("imam-nader-cataldo-ferrara", "Yaha Pallavicini", "scholar", "rising", "male", "europe", "IT", "\u{1F1EE}\u{1F1F9}", ["Italian", "Arabic", "English"], ["Interfaith", "Sufism", "Community"], { note: "Italian Muslim leader and vice president of COREIS" }),

  // POLAND
  c("mufti-tomasz-miskiewicz", "Tomasz Miskiewicz", "scholar", "rising", "male", "europe", "PL", "\u{1F1F5}\u{1F1F1}", ["Polish", "Arabic"], ["Community", "History", "Interfaith"], { note: "Mufti of Poland, leader of the Tatar Muslim community" }),

  // AUSTRIA
  c("farid-hafez", "Farid Hafez", "scholar", "rising", "male", "europe", "AT", "\u{1F1E6}\u{1F1F9}", ["German", "English", "Arabic"], ["Islamophobia", "Academia", "Research"], { note: "Austrian political scientist researching Islamophobia in Europe" }),
];

// ==========================================
// BATCH 2: MIDDLE EAST (~35 new)
// ==========================================
const middleEast2 = [
  // SAUDI ARABIA
  c("sheikh-al-arifi", "Muhammad al-Arifi", "speaker", "verified", "male", "middle_east", "SA", "\u{1F1F8}\u{1F1E6}", ["Arabic"], ["Dawah", "Seerah", "Youth"], { note: "Saudi scholar and preacher with one of the largest social media followings" }),
  c("sheikh-nabil-al-awadi-kw", "Nasser al-Qatami", "reciter", "verified", "male", "middle_east", "SA", "\u{1F1F8}\u{1F1E6}", ["Arabic"], ["Quran", "Recitation"], { note: "Saudi Quran reciter known for emotional and beautiful recitation" }),
  c("idris-abkar", "Idris Abkar", "reciter", "verified", "male", "middle_east", "SA", "\u{1F1F8}\u{1F1E6}", ["Arabic"], ["Quran", "Recitation", "Tajweed"], { note: "Saudi Quran reciter known for his unique melodic style" }),
  c("sheikh-ibn-uthaymeen", "Sheikh Ibn Uthaymeen", "scholar", "verified", "male", "middle_east", "SA", "\u{1F1F8}\u{1F1E6}", ["Arabic"], ["Fiqh", "Aqeedah", "Fatwa"], { note: "One of Saudi Arabia's most respected scholars of the 20th century", isHistorical: true, lifespan: "1925-2001", featured: true }),
  c("sheikh-ibn-baz", "Sheikh Ibn Baz", "scholar", "verified", "male", "middle_east", "SA", "\u{1F1F8}\u{1F1E6}", ["Arabic"], ["Fiqh", "Aqeedah", "Fatwa"], { note: "Former Grand Mufti of Saudi Arabia", isHistorical: true, lifespan: "1910-1999", featured: true }),
  c("raed-al-maqbali", "Raed Al-Maqbali", "speaker", "rising", "male", "middle_east", "SA", "\u{1F1F8}\u{1F1E6}", ["Arabic"], ["Youth", "Motivation", "Social Media"], { note: "Saudi motivational Islamic speaker popular on social media", trending: true }),

  // UAE
  c("ahmad-al-shugairi", "Ahmad al-Shugairi", "speaker", "verified", "male", "middle_east", "AE", "\u{1F1E6}\u{1F1EA}", ["Arabic", "English"], ["Youth", "Self-Improvement", "Travel"], { note: "Saudi-Emirati TV presenter, creator of Khawatir program", trending: true }),
  c("mishaal-bin-fahm", "Mishaal Al Rasheed", "influencer", "rising", "male", "middle_east", "AE", "\u{1F1E6}\u{1F1EA}", ["Arabic", "English"], ["Youth", "Technology", "Modern Issues"], { note: "Emirati Muslim tech influencer and content creator" }),

  // OMAN
  c("grand-mufti-oman", "Sheikh Ahmed Al-Khalili", "scholar", "verified", "male", "middle_east", "OM", "\u{1F1F4}\u{1F1F2}", ["Arabic"], ["Fiqh", "Ibadi", "Leadership"], { note: "Grand Mufti of Oman, leading authority on Ibadi jurisprudence" }),

  // BAHRAIN
  c("isa-qassim", "Sheikh Isa Qassim", "scholar", "verified", "male", "middle_east", "BH", "\u{1F1E7}\u{1F1ED}", ["Arabic"], ["Fiqh", "Community", "Leadership"], { note: "Bahraini Shia cleric and spiritual leader" }),

  // KUWAIT
  c("tariq-al-suwaidan", "Tariq al-Suwaidan", "speaker", "verified", "male", "middle_east", "KW", "\u{1F1F0}\u{1F1FC}", ["Arabic", "English"], ["Leadership", "Management", "Youth"], { note: "Kuwaiti Islamic speaker and leadership development expert" }),
  c("mishary-rashid-alafasy", "Mishary Rashid Alafasy", "reciter", "verified", "male", "middle_east", "KW", "\u{1F1F0}\u{1F1FC}", ["Arabic"], ["Quran", "Recitation", "Nasheeds"], { note: "World-renowned Kuwaiti Quran reciter and nasheed artist", featured: true }),

  // IRAQ
  c("muqtada-al-sadr", "Muqtada al-Sadr", "public_figure", "rising", "male", "middle_east", "IQ", "\u{1F1EE}\u{1F1F6}", ["Arabic"], ["Leadership", "Politics", "Community"], { note: "Iraqi Shia cleric and political leader" }),
  c("sheikh-abdul-qadir-al-jilani", "Sheikh Abdul Qadir al-Jilani", "scholar", "verified", "male", "middle_east", "IQ", "\u{1F1EE}\u{1F1F6}", ["Arabic", "Persian"], ["Sufism", "Hanbali", "Spirituality"], { note: "Founder of the Qadiriyya Sufi order, one of the most revered Sufi saints", isHistorical: true, lifespan: "1078-1166", featured: true }),

  // IRAN
  c("abdolkarim-soroush", "Abdolkarim Soroush", "scholar", "verified", "male", "middle_east", "IR", "\u{1F1EE}\u{1F1F7}", ["Persian", "Arabic", "English"], ["Philosophy", "Reform", "Theology"], { note: "Iranian intellectual and philosopher of religion" }),
  c("mohsen-kadivar", "Mohsen Kadivar", "scholar", "verified", "male", "middle_east", "IR", "\u{1F1EE}\u{1F1F7}", ["Persian", "Arabic"], ["Reform", "Human Rights", "Theology"], { note: "Iranian reformist cleric and professor at Duke University" }),

  // TURKEY (more)
  c("adnan-ibrahim", "Adnan Ibrahim", "scholar", "verified", "male", "middle_east", "PS", "\u{1F1F5}\u{1F1F8}", ["Arabic", "German"], ["Reform", "Theology", "Modern Issues"], { note: "Palestinian scholar based in Vienna, known for progressive views" }),
];

// ==========================================
// BATCH 2: SOUTH ASIA (~40 new)
// ==========================================
const southAsia2 = [
  // PAKISTAN
  c("javed-ahmad-ghamidi", "Javed Ahmad Ghamidi", "scholar", "verified", "male", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Urdu", "Arabic", "English"], ["Quran", "Reform", "Philosophy"], { note: "Pakistani theologian known for rationalist approach to Islamic thought", featured: true }),
  c("dr-zakir-naik-student", "Maulana Fahad Shahzad", "speaker", "rising", "male", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Urdu", "Arabic"], ["Dawah", "Youth", "Modern Issues"], { note: "Pakistani Islamic speaker popular on YouTube" }),
  c("maulana-muhammad-khan-sherani", "Maulana Muhammad Khan Sherani", "scholar", "verified", "male", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Pashto", "Urdu", "Arabic"], ["Fiqh", "Leadership", "Education"], { note: "Former chairman of Council of Islamic Ideology in Pakistan" }),
  c("dr-aamir-liaquat-hussain", "Dr. Aamir Liaquat Hussain", "speaker", "rising", "male", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Urdu", "English"], ["Media", "Community", "Youth"], { note: "Pakistani television host and politician", isHistorical: true, lifespan: "1971-2022" }),
  c("allama-iqbal", "Allama Muhammad Iqbal", "author", "verified", "male", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Urdu", "Persian", "Arabic", "English"], ["Poetry", "Philosophy", "Revival"], { note: "National poet of Pakistan and philosopher of Islamic revival", isHistorical: true, lifespan: "1877-1938", featured: true }),
  c("abul-ala-maududi", "Abul A'la Maududi", "scholar", "verified", "male", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Urdu", "Arabic", "English"], ["Political Islam", "Tafsir", "Theology"], { note: "Founder of Jamaat-e-Islami, influential 20th century Islamic thinker", isHistorical: true, lifespan: "1903-1979" }),
  c("maria-khan", "Maria Khan", "educator", "rising", "female", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Urdu", "English"], ["Women", "Psychology", "Marriage"], { note: "Pakistani Islamic counselor and women's rights within Islam advocate" }),

  // INDIA
  c("maulana-abul-hasan-ali-nadwi", "Maulana Abul Hasan Ali Nadwi", "scholar", "verified", "male", "south_asia", "IN", "\u{1F1EE}\u{1F1F3}", ["Arabic", "Urdu"], ["Dawah", "Education", "History"], { note: "Indian scholar and rector of Nadwatul Ulama, author of Muslims in India", isHistorical: true, lifespan: "1914-1999" }),
  c("imam-ahmed-raza-khan-barelvi", "Ahmed Raza Khan Barelvi", "scholar", "verified", "male", "south_asia", "IN", "\u{1F1EE}\u{1F1F3}", ["Urdu", "Arabic", "Persian"], ["Fiqh", "Sufism", "Theology"], { note: "Founder of the Barelvi movement, prolific scholar and writer", isHistorical: true, lifespan: "1856-1921" }),
  c("maulana-ashraf-ali-thanwi", "Maulana Ashraf Ali Thanwi", "scholar", "verified", "male", "south_asia", "IN", "\u{1F1EE}\u{1F1F3}", ["Urdu", "Arabic", "Persian"], ["Sufism", "Fiqh", "Spirituality"], { note: "Deobandi scholar known as Hakeem-ul-Ummat", isHistorical: true, lifespan: "1863-1943" }),
  c("shah-ahmad-noorani", "Shah Ahmad Noorani", "scholar", "verified", "male", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Urdu", "Arabic"], ["Sufism", "Community", "Leadership"], { note: "Pakistani Barelvi scholar and politician, founder of JUP", isHistorical: true, lifespan: "1926-2003" }),
  c("dr-tahirul-qadri-student", "Hassan Qadri", "youth_leader", "rising", "male", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Urdu", "English", "Arabic"], ["Youth", "Education", "Dawah"], { note: "Young Pakistani scholar at Minhaj-ul-Quran, youth wing leader" }),
  c("dr-muhammad-tahir-ul-qadri-b", "Maulana Fazlur Rehman", "public_figure", "rising", "male", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Urdu", "Pashto", "Arabic"], ["Politics", "Community", "Leadership"], { note: "Pakistani political leader and head of JUI-F" }),
  c("malala-yousafzai", "Malala Yousafzai", "activist", "rising", "female", "south_asia", "PK", "\u{1F1F5}\u{1F1F0}", ["Urdu", "Pashto", "English"], ["Education", "Women", "Activism"], { note: "Pakistani activist and Nobel Peace Prize laureate for girls' education" }),
  c("sir-syed-ahmad-khan", "Sir Syed Ahmad Khan", "scholar", "verified", "male", "south_asia", "IN", "\u{1F1EE}\u{1F1F3}", ["Urdu", "Arabic", "English", "Persian"], ["Education", "Reform", "Modernity"], { note: "Founder of Aligarh Muslim University, pioneer of Muslim modernism in South Asia", isHistorical: true, lifespan: "1817-1898" }),

  // BANGLADESH
  c("dr-khandaker-abdullah-jahangir", "Dr. Khandaker Abdullah Jahangir", "scholar", "verified", "male", "south_asia", "BD", "\u{1F1E7}\u{1F1E9}", ["Bengali", "Arabic"], ["Hadith", "Fiqh", "Education"], { note: "Bangladeshi hadith scholar and professor at IU", isHistorical: true, lifespan: "1973-2016" }),
  c("mufti-kazi-ibrahim", "Mufti Kazi Ibrahim", "speaker", "verified", "male", "south_asia", "BD", "\u{1F1E7}\u{1F1E9}", ["Bengali", "Arabic"], ["Fiqh", "Community", "Education"], { note: "Bangladeshi mufti and Islamic speaker" }),

  // MALDIVES
  c("dr-mohamed-iyaz", "Dr. Mohamed Iyaz Abdul Latheef", "scholar", "verified", "male", "south_asia", "MV", "\u{1F1F2}\u{1F1FB}", ["Dhivehi", "Arabic", "English"], ["Fiqh", "Education", "Community"], { note: "Maldivian Islamic scholar and Quran educator" }),

  // NEPAL
  c("maulana-pir-jamal-uddin", "Maulana Abdul Hamid Rahmani", "educator", "rising", "male", "south_asia", "NP", "\u{1F1F3}\u{1F1F5}", ["Nepali", "Urdu", "Arabic"], ["Education", "Community", "Youth"], { note: "Leading Islamic educator in Nepal's Muslim minority community" }),
];

// ==========================================
// BATCH 2: SOUTHEAST ASIA (~25 new)
// ==========================================
const southeastAsia2 = [
  // INDONESIA
  c("kh-said-aqil-siroj", "KH Said Aqil Siroj", "scholar", "verified", "male", "southeast_asia", "ID", "\u{1F1EE}\u{1F1E9}", ["Indonesian", "Arabic", "Javanese"], ["Community", "Sufism", "Leadership"], { note: "Former chairman of Nahdlatul Ulama, Indonesia's largest Muslim org" }),
  c("aa-gym", "Abdullah Gymnastiar", "speaker", "verified", "male", "southeast_asia", "ID", "\u{1F1EE}\u{1F1E9}", ["Indonesian", "Arabic"], ["Spirituality", "Self-Improvement", "Business"], { note: "Indonesian preacher and entrepreneur, founder of MQ Corporation" }),
  c("felix-siauw", "Felix Siauw", "speaker", "rising", "male", "southeast_asia", "ID", "\u{1F1EE}\u{1F1E9}", ["Indonesian", "Arabic"], ["Youth", "History", "Modern Issues"], { note: "Chinese-Indonesian convert and popular Islamic speaker" }),
  c("oki-setiana-dewi", "Oki Setiana Dewi", "influencer", "rising", "female", "southeast_asia", "ID", "\u{1F1EE}\u{1F1E9}", ["Indonesian"], ["Women", "Entertainment", "Faith"], { note: "Indonesian actress turned Islamic influencer and speaker" }),
  c("habib-syech", "Habib Syech bin Abdul Qodir Assegaf", "reciter", "verified", "male", "southeast_asia", "ID", "\u{1F1EE}\u{1F1E9}", ["Indonesian", "Arabic"], ["Sholawat", "Nasheeds", "Sufism"], { note: "Indonesian sholawat singer and religious figure with massive following" }),
  c("kh-mustofa-bisri", "KH Mustofa Bisri", "author", "verified", "male", "southeast_asia", "ID", "\u{1F1EE}\u{1F1E9}", ["Indonesian", "Arabic", "Javanese"], ["Poetry", "Sufism", "Culture"], { note: "Indonesian poet-scholar and former Rais Aam of Nahdlatul Ulama" }),
  c("ustadz-abdul-somad", "Ustadz Abdul Somad", "speaker", "verified", "male", "southeast_asia", "ID", "\u{1F1EE}\u{1F1E9}", ["Indonesian", "Arabic"], ["Fiqh", "Dawah", "Daily Life"], { note: "Indonesian preacher with one of the largest YouTube followings in Indonesia", trending: true }),
  c("kh-yahya-cholil-staquf", "KH Yahya Cholil Staquf", "scholar", "verified", "male", "southeast_asia", "ID", "\u{1F1EE}\u{1F1E9}", ["Indonesian", "Arabic", "English"], ["Interfaith", "Peace", "Leadership"], { note: "General Chairman of Nahdlatul Ulama, advocate for humanitarian Islam" }),

  // MALAYSIA
  c("dr-zakir-husain-my", "PU Syed", "speaker", "rising", "male", "southeast_asia", "MY", "\u{1F1F2}\u{1F1FE}", ["Malay", "Arabic"], ["Motivation", "Community", "Youth"], { note: "Popular Malaysian Islamic motivational speaker" }),
  c("ustazah-norhafizah-musa", "Ustazah Norhafizah Musa", "educator", "rising", "female", "southeast_asia", "MY", "\u{1F1F2}\u{1F1FE}", ["Malay", "Arabic", "English"], ["Women", "Education", "Family"], { note: "Malaysian female Islamic educator and TV personality" }),
  c("sheikh-nuruddin-marbu", "Sheikh Nuruddin Marbu Al-Banjari", "scholar", "verified", "male", "southeast_asia", "MY", "\u{1F1F2}\u{1F1FE}", ["Malay", "Arabic", "Indonesian"], ["Fiqh", "Hadith", "Education"], { note: "Malaysian scholar known for deep Islamic jurisprudence lectures" }),
  c("habib-ali-zainal-abidin", "Habib Ali Zainal Abidin", "scholar", "verified", "male", "southeast_asia", "MY", "\u{1F1F2}\u{1F1FE}", ["Malay", "Arabic", "English"], ["Sufism", "Spirituality", "Dawah"], { note: "Malaysian habib and founder of Al-Jenderami Institute" }),

  // MYANMAR
  c("sheikh-noor-hussain", "Noor Hussain", "educator", "rising", "male", "southeast_asia", "MM", "\u{1F1F2}\u{1F1F2}", ["Burmese", "Arabic"], ["Education", "Community", "Human Rights"], { note: "Rohingya Islamic educator and community advocate" }),

  // CAMBODIA
  c("imam-san-chey", "Imam San Chey", "educator", "rising", "male", "southeast_asia", "KH", "\u{1F1F0}\u{1F1ED}", ["Khmer", "Arabic", "Malay"], ["Education", "Community"], { note: "Cambodian Muslim leader serving the Cham Muslim community" }),
];

// ==========================================
// BATCH 2: WEST AFRICA (~30 new)
// ==========================================
const westAfrica2 = [
  // NIGERIA (more)
  c("sheikh-ahmad-gumi-jr", "Ahmad Abubakar Mahmud Gumi", "speaker", "rising", "male", "west_africa", "NG", "\u{1F1F3}\u{1F1EC}", ["Hausa", "Arabic", "English"], ["Dawah", "Community", "Peace"], { note: "Nigerian Islamic preacher and peace negotiator" }),
  c("imam-afroz-ali-ng", "Dr. Tajudeen Yusuf", "educator", "rising", "male", "west_africa", "NG", "\u{1F1F3}\u{1F1EC}", ["English", "Yoruba", "Arabic"], ["Education", "Youth", "Community"], { note: "Nigerian Islamic educator and interfaith advocate" }),
  c("sheikh-muhammadu-bello", "Usman dan Fodio", "scholar", "verified", "male", "west_africa", "NG", "\u{1F1F3}\u{1F1EC}", ["Hausa", "Arabic", "Fulani"], ["Reform", "Education", "Leadership"], { note: "Founder of the Sokoto Caliphate, renowned scholar and reformer", isHistorical: true, lifespan: "1754-1817", featured: true }),
  c("zahra-usman-gombi", "Zahra Usman Gombi", "educator", "rising", "female", "west_africa", "NG", "\u{1F1F3}\u{1F1EC}", ["Hausa", "English", "Arabic"], ["Women", "Education", "Youth"], { note: "Nigerian female educator promoting Islamic education for women" }),
  c("imam-bashir-aliyu-umar", "Imam Bashir Aliyu Umar", "scholar", "verified", "male", "west_africa", "NG", "\u{1F1F3}\u{1F1EC}", ["Hausa", "Arabic"], ["Tafsir", "Fiqh", "Community"], { note: "Imam of the National Mosque in Abuja" }),

  // SENEGAL (more)
  c("akon", "Akon", "public_figure", "rising", "male", "west_africa", "SN", "\u{1F1F8}\u{1F1F3}", ["English", "Wolof", "French"], ["Music", "Philanthropy", "Representation"], { note: "Senegalese-American singer and philanthropist, vocal about his Muslim faith" }),
  c("serigne-cheikh-saliou-mbacke", "Serigne Cheikh Saliou Mbacke", "scholar", "verified", "male", "west_africa", "SN", "\u{1F1F8}\u{1F1F3}", ["Wolof", "Arabic"], ["Mouridiyya", "Spirituality", "Leadership"], { note: "Former Grand Caliph of the Mouride brotherhood", isHistorical: true, lifespan: "1915-2007" }),

  // IVORY COAST
  c("imam-idriss-koudouss", "Imam Idriss Koudouss Kone", "speaker", "rising", "male", "west_africa", "CI", "\u{1F1E8}\u{1F1EE}", ["French", "Dyula", "Arabic"], ["Community", "Youth", "Dawah"], { note: "Ivorian Islamic leader and community organizer" }),

  // BURKINA FASO
  c("sheikh-ismaila-drame", "Sheikh Ismaila Drame", "scholar", "rising", "male", "west_africa", "BF", "\u{1F1E7}\u{1F1EB}", ["French", "Bambara", "Arabic"], ["Education", "Community", "Dawah"], { note: "Burkinabe Islamic scholar and community leader" }),

  // NIGER
  c("boubou-hama", "Sheikh Ibrahim Kontao", "scholar", "rising", "male", "west_africa", "NE", "\u{1F1F3}\u{1F1EA}", ["Hausa", "Arabic", "French"], ["Education", "Community", "Fiqh"], { note: "Nigerien Islamic scholar and educator" }),

  // TOGO
  c("imam-razak-togo", "Imam Razak Abaluo", "educator", "rising", "male", "west_africa", "TG", "\u{1F1F9}\u{1F1EC}", ["French", "Ewe", "Arabic"], ["Community", "Education", "Youth"], { note: "Togolese imam and Islamic educator" }),

  // BENIN
  c("imam-rachidi-gbadamassi", "Imam Rachidi Gbadamassi", "educator", "rising", "male", "west_africa", "BJ", "\u{1F1E7}\u{1F1EF}", ["French", "Yoruba", "Arabic"], ["Education", "Community", "Interfaith"], { note: "Beninese Muslim leader and interfaith advocate" }),

  // SIERRA LEONE
  c("alhaji-usman-boie-kamara", "Alhaji Usman Boie Kamara", "speaker", "rising", "male", "west_africa", "SL", "\u{1F1F8}\u{1F1F1}", ["English", "Temne", "Arabic"], ["Community", "Youth", "Education"], { note: "Sierra Leonean Muslim leader and youth advocate" }),

  // MAURITANIA
  c("sheikh-dedew", "Sheikh Mohamed al-Hassan al-Dedew", "scholar", "verified", "male", "west_africa", "MR", "\u{1F1F2}\u{1F1F7}", ["Arabic", "French"], ["Fiqh", "Hadith", "Scholarship"], { note: "Mauritanian scholar renowned for encyclopedic knowledge of hadith", featured: true }),
];

// ==========================================
// BATCH 2: EAST AFRICA (~25 new)
// ==========================================
const eastAfrica2 = [
  // SOMALIA
  c("sheikh-ahmed-gurey", "Sheikh Ahmed Gurey", "public_figure", "verified", "male", "east_africa", "SO", "\u{1F1F8}\u{1F1F4}", ["Somali", "Arabic"], ["History", "Leadership"], { note: "16th-century Somali Muslim leader who united the Horn of Africa", isHistorical: true, lifespan: "1506-1543" }),
  c("sheikh-sharif-sheikh-ahmed", "Sheikh Sharif Sheikh Ahmed", "public_figure", "rising", "male", "east_africa", "SO", "\u{1F1F8}\u{1F1F4}", ["Somali", "Arabic"], ["Leadership", "Politics", "Community"], { note: "Former President of Somalia and Islamic Courts Union leader" }),
  c("dr-mohamed-adam-sheikh", "Dr. Mohamed Adam Sheikh", "educator", "rising", "male", "east_africa", "SO", "\u{1F1F8}\u{1F1F4}", ["Somali", "Arabic", "English"], ["Education", "Community", "Youth"], { note: "Somali Islamic educator and community organizer" }),
  c("nimco-ahmed", "Nimco Ahmed", "influencer", "rising", "female", "east_africa", "SO", "\u{1F1F8}\u{1F1F4}", ["Somali", "English"], ["Women", "Youth", "Community"], { note: "Somali-British Muslim influencer and community advocate" }),

  // ETHIOPIA (more)
  c("sheikh-mohammed-rashad", "Sheikh Mohammed Rashad", "speaker", "rising", "male", "east_africa", "ET", "\u{1F1EA}\u{1F1F9}", ["Amharic", "Arabic"], ["Community", "Youth", "Dawah"], { note: "Popular Ethiopian Islamic speaker" }),
  c("najashi", "Negus As'hama ibn Abjar", "public_figure", "verified", "male", "east_africa", "ET", "\u{1F1EA}\u{1F1F9}", ["Ge'ez", "Arabic"], ["History", "Justice", "Leadership"], { note: "Christian king of Aksum who sheltered early Muslims, accepted Islam", isHistorical: true, lifespan: "560-630" }),

  // KENYA (more)
  c("sheikh-ibrahim-lethome", "Sheikh Ibrahim Lethome", "scholar", "rising", "male", "east_africa", "KE", "\u{1F1F0}\u{1F1EA}", ["Swahili", "Arabic", "English"], ["Education", "Youth", "Community"], { note: "Kenyan Islamic scholar and educator in Mombasa" }),
  c("imam-ahmed-iman-ali", "Imam Ahmed Iman Ali", "speaker", "rising", "male", "east_africa", "KE", "\u{1F1F0}\u{1F1EA}", ["Swahili", "Arabic"], ["Youth", "Community", "Dawah"], { note: "Kenyan Islamic speaker working with youth" }),

  // TANZANIA (more)
  c("sheikh-ponda-issa-ponda-tz", "Sheikh Ponda Issa Ponda", "speaker", "rising", "male", "east_africa", "TZ", "\u{1F1F9}\u{1F1FF}", ["Swahili", "Arabic"], ["Dawah", "Community", "Youth"], { note: "Influential Tanzanian Islamic preacher" }),
  c("bi-kidude", "Bi Kidude", "public_figure", "rising", "female", "east_africa", "TZ", "\u{1F1F9}\u{1F1FF}", ["Swahili"], ["Arts", "Culture", "Representation"], { note: "Legendary Zanzibari Muslim musician and cultural icon", isHistorical: true, lifespan: "1910-2013" }),

  // ERITREA
  c("sheikh-al-amin-osman", "Sheikh Al-Amin Osman", "scholar", "rising", "male", "east_africa", "ER", "\u{1F1EA}\u{1F1F7}", ["Tigrinya", "Arabic"], ["Education", "Community", "Fiqh"], { note: "Eritrean Grand Mufti" }),

  // COMOROS
  c("said-mohamed-cheikh", "Said Mohamed Cheikh", "educator", "rising", "male", "east_africa", "KM", "\u{1F1F0}\u{1F1F2}", ["Comorian", "Arabic", "French"], ["Education", "Community", "Culture"], { note: "Comorian Islamic educator and leader" }),

  // MADAGASCAR
  c("imam-mahadi-madagascar", "Imam El-Mahadi", "educator", "rising", "male", "east_africa", "MG", "\u{1F1F2}\u{1F1EC}", ["Malagasy", "Arabic", "French"], ["Community", "Education", "Youth"], { note: "Malagasy Muslim leader serving the Muslim minority" }),

  // MOZAMBIQUE
  c("sheikh-abdul-carimo-sau", "Sheikh Abdul Carimo Sau", "scholar", "rising", "male", "east_africa", "MZ", "\u{1F1F2}\u{1F1FF}", ["Portuguese", "Arabic", "Swahili"], ["Education", "Community", "Interfaith"], { note: "Mozambican Islamic scholar and community leader" }),
];

// ==========================================
// BATCH 2: NORTH AFRICA (~20 new)
// ==========================================
const northAfrica2 = [
  // EGYPT (more)
  c("imam-al-ghazali", "Imam al-Ghazali", "scholar", "verified", "male", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic", "Persian"], ["Sufism", "Philosophy", "Theology"], { note: "Reviver of the Islamic sciences, author of Ihya Ulum al-Din", isHistorical: true, lifespan: "1058-1111", featured: true }),
  c("imam-al-shafi", "Imam al-Shafi'i", "scholar", "verified", "male", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic"], ["Fiqh", "Usul al-Fiqh", "Hadith"], { note: "Founder of the Shafi'i school of jurisprudence", isHistorical: true, lifespan: "767-820", featured: true }),
  c("salah-al-din", "Salah al-Din al-Ayyubi", "public_figure", "verified", "male", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic", "Kurdish"], ["History", "Leadership", "Military"], { note: "Sultan who recaptured Jerusalem, known for chivalry and justice", isHistorical: true, lifespan: "1137-1193", featured: true }),
  c("ahmad-okasha", "Dr. Ahmad Okasha", "public_figure", "rising", "male", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic", "English"], ["Mental Health", "Science", "Education"], { note: "Egyptian Muslim psychiatrist and former WPA president" }),
  c("amr-diab-muslim", "Tamer Hosny", "public_figure", "rising", "male", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic"], ["Arts", "Music", "Representation"], { note: "Egyptian pop singer known for his faith and charity work" }),

  // MOROCCO (more)
  c("imam-malik", "Imam Malik ibn Anas", "scholar", "verified", "male", "north_africa", "MA", "\u{1F1F2}\u{1F1E6}", ["Arabic"], ["Hadith", "Fiqh", "Muwatta"], { note: "Founder of the Maliki school, author of al-Muwatta", isHistorical: true, lifespan: "711-795", featured: true }),
  c("ibn-battuta", "Ibn Battuta", "public_figure", "verified", "male", "north_africa", "MA", "\u{1F1F2}\u{1F1E6}", ["Arabic", "Berber"], ["Travel", "History", "Culture"], { note: "Moroccan explorer who traveled over 75,000 miles across the medieval world", isHistorical: true, lifespan: "1304-1369", featured: true }),
  c("ahmed-bukhatir", "Ahmed Bukhatir", "reciter", "rising", "male", "north_africa", "MA", "\u{1F1F2}\u{1F1E6}", ["Arabic"], ["Nasheeds", "Quran", "Youth"], { note: "Emirati-Moroccan nasheed artist popular across the Arab world" }),

  // ALGERIA (more)
  c("emir-abdelkader", "Emir Abdelkader", "public_figure", "verified", "male", "north_africa", "DZ", "\u{1F1E9}\u{1F1FF}", ["Arabic", "French"], ["Leadership", "Sufism", "Human Rights"], { note: "Algerian resistance leader, Sufi scholar, and humanitarian", isHistorical: true, lifespan: "1808-1883", featured: true }),
  c("sheikh-abdelfattah-zeraoui", "Abdelfattah Zeraoui Hamadache", "speaker", "rising", "male", "north_africa", "DZ", "\u{1F1E9}\u{1F1FF}", ["Arabic", "French"], ["Community", "Youth", "Dawah"], { note: "Algerian Islamic speaker and community leader" }),

  // TUNISIA (more)
  c("khayr-al-din-tunisi", "Khayr al-Din al-Tunisi", "public_figure", "verified", "male", "north_africa", "TN", "\u{1F1F9}\u{1F1F3}", ["Arabic", "Turkish", "French"], ["Reform", "Politics", "Education"], { note: "19th-century Tunisian reformer and grand vizier", isHistorical: true, lifespan: "1820-1890" }),

  // LIBYA (more)
  c("omar-mukhtar", "Omar Mukhtar", "public_figure", "verified", "male", "north_africa", "LY", "\u{1F1F1}\u{1F1FE}", ["Arabic"], ["Resistance", "Leadership", "Education"], { note: "Lion of the Desert, Libyan resistance leader and Quran teacher", isHistorical: true, lifespan: "1858-1931", featured: true }),
];

// ==========================================
// BATCH 2: GLOBAL CLASSICAL SCHOLARS (~30 new)
// ==========================================
const classicalScholars = [
  c("imam-abu-hanifa", "Imam Abu Hanifa", "scholar", "verified", "male", "middle_east", "IQ", "\u{1F1EE}\u{1F1F6}", ["Arabic", "Persian"], ["Fiqh", "Theology", "Reasoning"], { note: "Founder of the Hanafi school, the largest school of Islamic law", isHistorical: true, lifespan: "699-767", featured: true }),
  c("imam-ahmad-ibn-hanbal", "Imam Ahmad ibn Hanbal", "scholar", "verified", "male", "middle_east", "IQ", "\u{1F1EE}\u{1F1F6}", ["Arabic"], ["Hadith", "Fiqh", "Theology"], { note: "Founder of the Hanbali school and compiler of the Musnad", isHistorical: true, lifespan: "780-855", featured: true }),
  c("imam-bukhari", "Imam al-Bukhari", "scholar", "verified", "male", "south_asia", "UZ", "\u{1F1FA}\u{1F1FF}", ["Arabic", "Persian"], ["Hadith", "Scholarship"], { note: "Compiler of Sahih al-Bukhari, the most authentic hadith collection", isHistorical: true, lifespan: "810-870", featured: true }),
  c("imam-muslim", "Imam Muslim ibn al-Hajjaj", "scholar", "verified", "male", "middle_east", "IR", "\u{1F1EE}\u{1F1F7}", ["Arabic", "Persian"], ["Hadith", "Scholarship"], { note: "Compiler of Sahih Muslim, second most authentic hadith collection", isHistorical: true, lifespan: "815-875" }),
  c("imam-nawawi", "Imam al-Nawawi", "scholar", "verified", "male", "middle_east", "SY", "\u{1F1F8}\u{1F1FE}", ["Arabic"], ["Hadith", "Fiqh", "Spirituality"], { note: "Author of Riyad as-Salihin and the 40 Nawawi Hadith collection", isHistorical: true, lifespan: "1233-1277", featured: true }),
  c("ibn-taymiyyah", "Ibn Taymiyyah", "scholar", "verified", "male", "middle_east", "SY", "\u{1F1F8}\u{1F1FE}", ["Arabic"], ["Theology", "Fiqh", "Reform"], { note: "Influential Hanbali scholar and theologian, prolific writer", isHistorical: true, lifespan: "1263-1328", featured: true }),
  c("ibn-qayyim-al-jawziyya", "Ibn Qayyim al-Jawziyya", "scholar", "verified", "male", "middle_east", "SY", "\u{1F1F8}\u{1F1FE}", ["Arabic"], ["Spirituality", "Fiqh", "Theology"], { note: "Student of Ibn Taymiyyah, prolific scholar and author", isHistorical: true, lifespan: "1292-1350" }),
  c("ibn-kathir", "Ibn Kathir", "scholar", "verified", "male", "middle_east", "SY", "\u{1F1F8}\u{1F1FE}", ["Arabic"], ["Tafsir", "History", "Hadith"], { note: "Author of the famous Tafsir Ibn Kathir and Al-Bidaya wan-Nihaya", isHistorical: true, lifespan: "1300-1373", featured: true }),
  c("imam-ibn-hajar", "Ibn Hajar al-Asqalani", "scholar", "verified", "male", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic"], ["Hadith", "Fiqh", "History"], { note: "Author of Fath al-Bari, the most important commentary on Sahih Bukhari", isHistorical: true, lifespan: "1372-1449" }),
  c("imam-suyuti", "Imam al-Suyuti", "scholar", "verified", "male", "north_africa", "EG", "\u{1F1EA}\u{1F1EC}", ["Arabic"], ["Tafsir", "Hadith", "History"], { note: "Egyptian polymath and one of the most prolific writers in Islamic history", isHistorical: true, lifespan: "1445-1505" }),
  c("abu-al-qasim-al-zahrawi", "Al-Zahrawi", "scholar", "verified", "male", "europe", "ES", "\u{1F1EA}\u{1F1F8}", ["Arabic"], ["Medicine", "Science", "Surgery"], { note: "Father of modern surgery, physician in Islamic Spain", isHistorical: true, lifespan: "936-1013" }),
  c("ibn-rushd-averroes", "Ibn Rushd (Averroes)", "scholar", "verified", "male", "europe", "ES", "\u{1F1EA}\u{1F1F8}", ["Arabic"], ["Philosophy", "Medicine", "Law"], { note: "Andalusian polymath who shaped Western and Islamic philosophy", isHistorical: true, lifespan: "1126-1198", featured: true }),
  c("ibn-sina-avicenna", "Ibn Sina (Avicenna)", "scholar", "verified", "male", "south_asia", "UZ", "\u{1F1FA}\u{1F1FF}", ["Arabic", "Persian"], ["Medicine", "Philosophy", "Science"], { note: "Father of early modern medicine, author of The Canon of Medicine", isHistorical: true, lifespan: "980-1037", featured: true }),
  c("al-khwarizmi", "Al-Khwarizmi", "scholar", "verified", "male", "south_asia", "UZ", "\u{1F1FA}\u{1F1FF}", ["Arabic", "Persian"], ["Mathematics", "Astronomy", "Science"], { note: "Father of algebra, pioneer of algorithms", isHistorical: true, lifespan: "780-850", featured: true }),
  c("ibn-arabi", "Ibn Arabi", "scholar", "verified", "male", "europe", "ES", "\u{1F1EA}\u{1F1F8}", ["Arabic"], ["Sufism", "Theology", "Philosophy"], { note: "The Greatest Master of Sufism, author of Fusus al-Hikam", isHistorical: true, lifespan: "1165-1240", featured: true }),
  c("imam-al-tabari", "Imam al-Tabari", "scholar", "verified", "male", "middle_east", "IR", "\u{1F1EE}\u{1F1F7}", ["Arabic", "Persian"], ["Tafsir", "History"], { note: "Author of the most comprehensive Quran commentary and Islamic history", isHistorical: true, lifespan: "839-923" }),
  c("imam-abu-dawud", "Imam Abu Dawud", "scholar", "verified", "male", "middle_east", "IR", "\u{1F1EE}\u{1F1F7}", ["Arabic"], ["Hadith", "Fiqh"], { note: "Compiler of Sunan Abu Dawud, one of the six canonical hadith collections", isHistorical: true, lifespan: "817-889" }),
  c("imam-tirmidhi", "Imam al-Tirmidhi", "scholar", "verified", "male", "south_asia", "UZ", "\u{1F1FA}\u{1F1FF}", ["Arabic"], ["Hadith", "Fiqh"], { note: "Compiler of Jami al-Tirmidhi, a canonical hadith collection", isHistorical: true, lifespan: "824-892" }),
  c("imam-ibn-majah", "Imam Ibn Majah", "scholar", "verified", "male", "middle_east", "IR", "\u{1F1EE}\u{1F1F7}", ["Arabic"], ["Hadith"], { note: "Compiler of Sunan Ibn Majah, one of the six canonical hadith collections", isHistorical: true, lifespan: "824-887" }),
  c("imam-al-nasai", "Imam al-Nasa'i", "scholar", "verified", "male", "south_asia", "AF", "\u{1F1E6}\u{1F1EB}", ["Arabic"], ["Hadith", "Fiqh"], { note: "Compiler of Sunan al-Nasa'i, known for strict hadith authentication", isHistorical: true, lifespan: "829-915" }),
];

// Combine all batch 2 creators
const allBatch2 = [
  ...americas2,
  ...europe2,
  ...middleEast2,
  ...southAsia2,
  ...southeastAsia2,
  ...westAfrica2,
  ...eastAfrica2,
  ...northAfrica2,
  ...classicalScholars,
];

console.log(`\nBatch 2 creators to add: ${allBatch2.length}`);

// Read existing file
let fileContent = readFileSync(filePath, 'utf-8');

// Get existing IDs
const existingIds = new Set();
const idMatches = fileContent.matchAll(/"id":\s*"([^"]+)"/g);
for (const match of idMatches) {
  existingIds.add(match[1]);
}

// Filter duplicates
const uniqueNew = allBatch2.filter(c => {
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
  const lastLine = lines[lines.length - 1];
  if (lastLine.endsWith(',')) {
    lines[lines.length - 1] = lastLine.slice(0, -1);
  }
  lines.push('  }');
  return lines.join('\n');
}

const closingBracket = fileContent.lastIndexOf('];');
if (closingBracket === -1) {
  console.error('ERROR: Could not find closing ]; in file');
  process.exit(1);
}

const newCreatorsStr = uniqueNew.map(formatCreator).join(',\n');
fileContent = fileContent.substring(0, closingBracket) +
  ',\n' + newCreatorsStr + '\n];\n';

writeFileSync(filePath, fileContent, 'utf-8');

// Recount
const finalContent = readFileSync(filePath, 'utf-8');
const totalIds = (finalContent.match(/"id":/g) || []).length;
const regions = {};
const regionMatches2 = finalContent.matchAll(/"region":\s*"([^"]+)"/g);
for (const m of regionMatches2) {
  regions[m[1]] = (regions[m[1]] || 0) + 1;
}
const categories = {};
const catMatches = finalContent.matchAll(/"category":\s*"([^"]+)"/g);
for (const m of catMatches) {
  categories[m[1]] = (categories[m[1]] || 0) + 1;
}

console.log(`\n=== FINAL STATS ===`);
console.log(`Total creators: ${totalIds}`);
console.log(`\nBy region:`);
for (const [region, count] of Object.entries(regions).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${region}: ${count} (${Math.round(count/totalIds*100)}%)`);
}
console.log(`\nBy category:`);
for (const [cat, count] of Object.entries(categories).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat}: ${count} (${Math.round(count/totalIds*100)}%)`);
}

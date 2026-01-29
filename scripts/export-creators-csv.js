// Script to export creators to CSV
const fs = require('fs');

// Read the creators file
const creatorsFile = fs.readFileSync('./lib/data/creators.ts', 'utf-8');

// Extract the CREATORS array using regex
const match = creatorsFile.match(/export const CREATORS: Creator\[\] = (\[[\s\S]*?\]);/);

if (!match) {
  console.error('Could not find CREATORS array');
  process.exit(1);
}

// Evaluate the array (it's valid JSON-like structure)
// Clean up TypeScript syntax to make it valid JSON
let jsonStr = match[1]
  .replace(/(\w+):/g, '"$1":')  // Quote property names
  .replace(/,\s*]/g, ']')       // Remove trailing commas in arrays
  .replace(/,\s*}/g, '}');      // Remove trailing commas in objects

// Parse as JSON
let creators;
try {
  creators = JSON.parse(jsonStr);
} catch (e) {
  console.error('Parse error:', e.message);
  process.exit(1);
}

// Create CSV headers
const headers = [
  'id',
  'name',
  'category',
  'tier',
  'gender',
  'region',
  'country',
  'countryFlag',
  'location',
  'languages',
  'topics',
  'verified',
  'verificationLevel',
  'featured',
  'trending',
  'isHistorical',
  'lifespan',
  'note',
  'youtube',
  'podcast',
  'twitter',
  'instagram',
  'facebook',
  'website'
];

// Convert to CSV rows
const csvRows = [headers.join(',')];

creators.forEach(creator => {
  const row = [
    creator.id || '',
    `"${(creator.name || '').replace(/"/g, '""')}"`,
    creator.category || '',
    creator.tier || '',
    creator.gender || '',
    creator.region || '',
    creator.country || '',
    creator.countryFlag || '',
    creator.location || '',
    `"${(creator.languages || []).join('; ')}"`,
    `"${(creator.topics || []).join('; ')}"`,
    creator.verified || false,
    creator.verificationLevel || '',
    creator.featured || false,
    creator.trending || false,
    creator.isHistorical || false,
    creator.lifespan || '',
    `"${(creator.note || '').replace(/"/g, '""')}"`,
    creator.socialLinks?.youtube || '',
    creator.socialLinks?.podcast || '',
    creator.socialLinks?.twitter || '',
    creator.socialLinks?.instagram || '',
    creator.socialLinks?.facebook || '',
    creator.socialLinks?.website || ''
  ];
  csvRows.push(row.join(','));
});

// Write to CSV file
fs.writeFileSync('./creators_export.csv', csvRows.join('\n'));
console.log(`Exported ${creators.length} creators to creators_export.csv`);

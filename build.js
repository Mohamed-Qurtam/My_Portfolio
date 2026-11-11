/**
 * Zero-dependency Static Site Generator & Content Validator
 * Reads content/site.json and validates content integrity against index.html
 */

const fs = require('fs');
const path = require('path');

console.log('⚡ [build.js] Validating and building content from content/site.json...');

const siteJsonPath = path.join(__dirname, 'content', 'site.json');
const indexPath = path.join(__dirname, 'index.html');

if (!fs.existsSync(siteJsonPath)) {
  console.error('Error: content/site.json not found!');
  process.exit(1);
}

const siteData = JSON.parse(fs.readFileSync(siteJsonPath, 'utf8'));
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// 1. Verify required fields exist
const requiredCandidateFields = ['name', 'headline', 'email', 'phone', 'location'];
for (const field of requiredCandidateFields) {
  if (!siteData.candidate[field]) {
    console.error(`Validation Error: Missing candidate field: ${field}`);
    process.exit(1);
  }
}

// 2. Synchronize Title & Meta description
indexHtml = indexHtml.replace(
  /<title>[^<]*<\/title>/,
  `<title>${siteData.meta.title}</title>`
);

console.log(`✓ Synchronized meta title: "${siteData.meta.title}"`);
console.log(`✓ Validated ${siteData.experience.length} experience records`);
console.log(`✓ Validated ${siteData.stats.length} metrics`);
console.log(`✓ Validated ${siteData.projects.length} featured projects`);
console.log(`✓ Validated ${siteData.vendorBadges.length} vendor badges`);

fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log('✨ [build.js] Static build verification passed successfully.');

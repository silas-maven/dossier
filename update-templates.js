const fs = require('fs');

let templates = fs.readFileSync('lib/templates.ts', 'utf8');

// The new templates added:
// legal-formal, metrics-banner, campaign-cards, people-soft, scanner-compact, process-left, credentials-top, academic-traditional, mission-impact

const newVariantIds = [
  "legal-formal",
  "metrics-banner",
  "campaign-cards",
  "people-soft",
  "scanner-compact",
  "process-left",
  "credentials-top",
  "academic-traditional",
  "mission-impact"
];

for (const variant of newVariantIds) {
  // We want to find the block for each variant and replace isPublic: false with isPublic: true
  // Let's use a regex that matches the variant block
  const regex = new RegExp(`(variant:\\s*"${variant}"[\\s\\S]*?isPublic:\\s*)false`, 'g');
  templates = templates.replace(regex, `$1true`);
}

fs.writeFileSync('lib/templates.ts', templates);
console.log('Fixed isPublic');

const fs = require('fs');
const files = ['app/editor/cv-live-preview.tsx', 'app/editor/cv-pdf-document.tsx'];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  const regex = /\{section\.items\.map\([^)]*\)\s*=>\s*\([^)]*\.title[^}]+\}/g;
  console.log(`\n--- ${file} ---`);
  while ((match = regex.exec(content)) !== null) {
    console.log(match[0]);
  }
}

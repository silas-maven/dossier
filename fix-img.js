const fs = require('fs');

let pdf = fs.readFileSync('app/editor/cv-pdf-document.tsx', 'utf8');
pdf = pdf.replace(/\{profile\.basics\.image \?\s*\(\s*<Image[^>]*\/>\s*\)\s*:\s*null\}/g, '');
fs.writeFileSync('app/editor/cv-pdf-document.tsx', pdf);

let preview = fs.readFileSync('app/editor/cv-live-preview.tsx', 'utf8');
preview = preview.replace(/\{profile\.basics\.photoUrl \?\s*\(\s*<img[^>]*\/>\s*\)\s*:\s*null\}/g, '');
fs.writeFileSync('app/editor/cv-live-preview.tsx', preview);

console.log('Fixed images');

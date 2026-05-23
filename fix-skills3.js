const fs = require('fs');

const fixFile = (filename) => {
  let content = fs.readFileSync(filename, 'utf8');
  
  content = content.replace(/\.filter\(i => i\.visible\)/g, '.filter(i => i.visible !== false)');

  fs.writeFileSync(filename, content);
};

fixFile('app/editor/cv-live-preview.tsx');
fixFile('app/editor/cv-pdf-document.tsx');
console.log("Fixed visible check.");

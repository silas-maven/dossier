const fs = require('fs');
const fixFile = (filename) => {
  let content = fs.readFileSync(filename, 'utf8');
  content = content.replace(/\.filter\(\(item\) => item\.visible\)/g, '.filter((item) => item.visible !== false)');
  content = content.replace(/\.filter\(item => item\.visible\)/g, '.filter(item => item.visible !== false)');
  fs.writeFileSync(filename, content);
};
fixFile('app/editor/cv-live-preview.tsx');
fixFile('app/editor/cv-pdf-document.tsx');
console.log("Fixed all item.visible checks.");

const fs = require('fs');
const path = require('path');
const p = path.join('/Users/hn52/Desktop/jarvis/projects/dossier/lib/ai/prompts.ts');
let text = fs.readFileSync(p, 'utf8');

const injection = `
    "- When modifying a 'skills' section item_description, you MUST maintain the double-colon level format. Format each skill on a new line like 'SkillName::Level' where Level is an integer from 1 to 5 (e.g. 'React::4'). Do NOT write paragraphs.",
    "- Treat any section titled 'Skills', 'Key Skills', or similar as the skills section, even if its type is 'custom'."`;

text = text.replace(
  '"- Return JSON only. Do not wrap it in markdown.",',
  injection + ',\n    "- Return JSON only. Do not wrap it in markdown.",'
);

fs.writeFileSync(p, text);

const fs = require('fs');

const fixFile = (filename) => {
  let content = fs.readFileSync(filename, 'utf8');
  
  // Fix joined strings
  content = content.replace(
    /\{section\.items\.map\(\(item\) => \(item\.title \|\| ""\)\.trim\(\)\)\.filter\(Boolean\)\.join\("([^"]+)"\)\}/g,
    '{section.items.filter(i => i.visible).flatMap(i => [i.title, ...parseSkillEntries(i.description).map(e => e.name)].filter(Boolean)).join("$1")}'
  );

  // Fix View bubbles in PDF
  content = content.replace(
    /\{section\.items\.map\(\(item\) => \(\s*<View key=\{item\.id\} style=\{\{ borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 \}\}>\s*<Text style=\{\{ fontSize: 9, color: "#374151", fontFamily: bodyFont \}\}>\s*\{item\.title \|\| ""\}\s*<\/Text>\s*<\/View>\s*\)\)\}/g,
    `{section.items.filter(i => i.visible).flatMap(i => [i.title, ...parseSkillEntries(i.description).map(e => e.name)].filter(Boolean)).map((name, idx) => (
                    <View key={idx} style={{ borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Text style={{ fontSize: 9, color: "#374151", fontFamily: bodyFont }}>
                        {name}
                      </Text>
                    </View>
                  ))}`
  );

  // Fix Text items in PDF
  content = content.replace(
    /\{section\.items\.map\(\(item\) => \(\s*<Text key=\{item\.id\} style=\{\{ fontSize: 9, color: accent, fontFamily: headingFont, textTransform: "uppercase" \}\}>\s*\{item\.title \|\| ""\}\s*<\/Text>\s*\)\)\}/g,
    `{section.items.filter(i => i.visible).flatMap(i => [i.title, ...parseSkillEntries(i.description).map(e => e.name)].filter(Boolean)).map((name, idx) => (
                      <Text key={idx} style={{ fontSize: 9, color: accent, fontFamily: headingFont, textTransform: "uppercase" }}>
                        {name}
                      </Text>
                    ))}`
  );
  
  // Fix bubbles in live preview
  content = content.replace(
    /\{section\.items\.filter\(item => item\.visible\)\.map\(\(item\) => \(\s*<span key=\{item\.id\} className="px-2\.5 py-1 text-xs border rounded-full text-muted-foreground border-border bg-muted\/20" style=\{\{ fontFamily: bodyFont \}\}>\s*\{item\.title \|\| ""\}\s*<\/span>\s*\)\)\}/g,
    `{section.items.filter(i => i.visible).flatMap(i => [i.title, ...parseSkillEntries(i.description).map(e => e.name)].filter(Boolean)).map((name, idx) => (
                      <span key={idx} className="px-2.5 py-1 text-xs border rounded-full text-muted-foreground border-border bg-muted/20" style={{ fontFamily: bodyFont }}>
                        {name}
                      </span>
                    ))}`
  );
  
  // Fix uppercase text in live preview
  content = content.replace(
    /\{section\.items\.filter\(i => i\.visible\)\.map\(i => \(\s*<span key=\{i\.id\} className="text-\[10px\] font-medium uppercase" style=\{\{ color: accent \}\}>\s*\{i\.title \|\| ""\}\s*<\/span>\s*\)\)\}/g,
    `{section.items.filter(i => i.visible).flatMap(i => [i.title, ...parseSkillEntries(i.description).map(e => e.name)].filter(Boolean)).map((name, idx) => (
                        <span key={idx} className="text-[10px] font-medium uppercase" style={{ color: accent }}>
                          {name}
                        </span>
                      ))}`
  );

  fs.writeFileSync(filename, content);
};

fixFile('app/editor/cv-live-preview.tsx');
fixFile('app/editor/cv-pdf-document.tsx');
console.log("Fixes applied.");

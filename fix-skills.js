const fs = require('fs');

let live = fs.readFileSync('app/editor/cv-live-preview.tsx', 'utf8');
let pdf = fs.readFileSync('app/editor/cv-pdf-document.tsx', 'utf8');

// The incorrect patterns usually look like:
// {section.items.filter(item => item.visible).map(item => (item.title || "").trim()).filter(Boolean).join(", ")}
// {section.items.filter(i => i.visible).map(i => i.title).join("  •  ")}
// {section.items.map((item) => (item.title || "").trim()).filter(Boolean).join("  |  ")}
// {section.items.map((item) => (item.title || "").trim()).filter(Boolean).join("  •  ")}

const regex1 = /\{section\.items(?:\.filter\([^)]+\))?\.map\([^)]+=>\s*(?:\([^)]+\)\.)?(?:item|i)\.title(?:[^)]+\))?(?:\.trim\(\))?\)(?:\.filter\(Boolean\))?\.join\("([^"]+)"\)\}/g;

const replacement = '{section.items.filter(i => i.visible).flatMap(i => [i.title, ...parseSkillEntries(i.description).map(e => e.name)].filter(Boolean)).join("$1")}';

live = live.replace(regex1, replacement);
pdf = pdf.replace(regex1, replacement);

// Wait, what if there's a loop that creates spans?
// <span key={item.id} ...>{item.title}</span>
// <span key={i.id} ...>{i.title}</span>

const regex2 = /\{section\.items\.filter\([^)]+\)\.map\(\((item|i)\) => \(\s*<span key=\{[a-z]+\.id\}[^>]*>(\s*)\{([a-z]+)\.title\}(\s*)<\/span>\s*\)\)\}/g;
const replacement2 = `{section.items.filter(i => i.visible).flatMap(i => [i.title, ...parseSkillEntries(i.description).map(e => e.name)].filter(Boolean)).map((name, idx) => (
                      <span key={idx} className="px-2.5 py-1 text-xs border rounded-full text-muted-foreground border-border bg-muted/20" style={{ fontFamily: bodyFont }}>
                        {name}
                      </span>
                    ))}`;

// I need to be careful with className and styles. Let's do it manually for the spans.
live = live.replace(/\{section\.items\.filter\(item => item\.visible\)\.map\(\(item\) => \(\s*<span key=\{item\.id\} className="px-2\.5 py-1 text-xs border rounded-full text-muted-foreground border-border bg-muted\/20" style=\{\{ fontFamily: bodyFont \}\}>\s*\{item\.title\}\s*<\/span>\s*\)\)\}/g, 
  `{section.items.filter(i => i.visible).flatMap(i => [i.title, ...parseSkillEntries(i.description).map(e => e.name)].filter(Boolean)).map((name, idx) => (
                      <span key={idx} className="px-2.5 py-1 text-xs border rounded-full text-muted-foreground border-border bg-muted/20" style={{ fontFamily: bodyFont }}>
                        {name}
                      </span>
                    ))}`);

live = live.replace(/\{section\.items\.filter\(i => i\.visible\)\.map\(i => \(\s*<span key=\{i\.id\} className="text-\[10px\] font-medium uppercase" style=\{\{ color: accent \}\}>\s*\{i\.title\}\s*<\/span>\s*\)\)\}/g,
  `{section.items.filter(i => i.visible).flatMap(i => [i.title, ...parseSkillEntries(i.description).map(e => e.name)].filter(Boolean)).map((name, idx) => (
                        <span key={idx} className="text-[10px] font-medium uppercase" style={{ color: accent }}>
                          {name}
                        </span>
                      ))}`);

pdf = pdf.replace(/\{section\.items\.map\(\(item\) => \(\s*<View key=\{item\.id\} style=\{\{ borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 \}\}>\s*<Text style=\{\{ fontSize: 9, color: "#374151", fontFamily: bodyFont \}\}>\s*\{item\.title\}\s*<\/Text>\s*<\/View>\s*\)\)\}/g,
  `{section.items.filter(i => i.visible).flatMap(i => [i.title, ...parseSkillEntries(i.description).map(e => e.name)].filter(Boolean)).map((name, idx) => (
                    <View key={idx} style={{ borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Text style={{ fontSize: 9, color: "#374151", fontFamily: bodyFont }}>
                        {name}
                      </Text>
                    </View>
                  ))}`);

pdf = pdf.replace(/\{section\.items\.map\(\(item\) => \(\s*<Text key=\{item\.id\} style=\{\{ fontSize: 9, color: accent, fontFamily: headingFont, textTransform: "uppercase" \}\}>\s*\{item\.title\}\s*<\/Text>\s*\)\)\}/g,
  `{section.items.filter(i => i.visible).flatMap(i => [i.title, ...parseSkillEntries(i.description).map(e => e.name)].filter(Boolean)).map((name, idx) => (
                      <Text key={idx} style={{ fontSize: 9, color: accent, fontFamily: headingFont, textTransform: "uppercase" }}>
                        {name}
                      </Text>
                    ))}`);

fs.writeFileSync('app/editor/cv-live-preview.tsx', live);
fs.writeFileSync('app/editor/cv-pdf-document.tsx', pdf);
console.log("Skills fixes applied successfully.");

const fs = require('fs');

let live = fs.readFileSync('app/editor/cv-live-preview.tsx', 'utf8');
let pdf = fs.readFileSync('app/editor/cv-pdf-document.tsx', 'utf8');

// 1. Fix credentials-top redesign
// Live Preview:
live = live.replace(
  /<div style=\{\{ backgroundColor: accent, padding: "8px 12px", marginBottom: 12 \}\}>\s*<h2 style=\{\{ fontSize: "1rem", fontFamily: headingFont, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: 1 \}\}>\s*\{section\.style\.uppercaseTitle \? section\.title\.toUpperCase\(\) : section\.title\}\s*<\/h2>\s*<\/div>/g,
  `<div style={{ borderBottom: \`3px solid \${accent}\`, paddingBottom: 4, marginBottom: 16 }}>
                  <h2 style={{ fontSize: "1.1rem", fontFamily: headingFont, color: accent, textTransform: "uppercase", letterSpacing: 1, fontWeight: "bold" }}>
                    {section.style.uppercaseTitle ? section.title.toUpperCase() : section.title}
                  </h2>
                </div>`
);

// PDF:
pdf = pdf.replace(
  /<View style=\{\{ backgroundColor: accent, padding: "6px 12px", marginBottom: 12 \}\}>\s*<Text style=\{\{ fontSize: sectionTitleSize\(section\), fontFamily: headingFont, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: 1 \}\}>\s*\{sectionTitleLabel\(section\)\}\s*<\/Text>\s*<\/View>/g,
  `<View style={{ borderBottomWidth: 3, borderBottomColor: accent, paddingBottom: 4, marginBottom: 16 }}>
                    <Text style={{ fontSize: sectionTitleSize(section) + 1, fontFamily: headingFont, color: accent, textTransform: "uppercase", letterSpacing: 1 }}>
                      {sectionTitleLabel(section)}
                    </Text>
                  </View>`
);

// 2. Fix metrics-banner
// LIVE:
live = live.replace(/let metricBoxes = \[\s*\{ label: "ADD METRICS SECTION", value: "0" \},\s*\{ label: "TO SHOW DATA", value: "0" \},\s*\{ label: "IN THIS BANNER", value: "0" \}\s*\];/g,
  `let metricBoxes: {label: string, value: string}[] = [];`);

live = live.replace(/if \(metricsSection && metricsSection\.items\.length > 0\) \{\s*metricBoxes = metricsSection\.items\.filter\(item => item\.visible\)\.slice\(0, 4\)\.map\(item => \(\{\s*label: item\.subtitle \|\| "Metric",\s*value: item\.title \|\| "0"\s*\}\)\);\s*if \(metricBoxes\.length === 0\) \{\s*metricBoxes = \[\{ label: "ADD METRICS", value: "0" \}\];\s*\}\s*\}/g,
  `if (metricsSection && metricsSection.items.length > 0) {
      metricBoxes = metricsSection.items.filter(item => item.visible).slice(0, 4).map(item => ({
        label: item.subtitle || "Metric",
        value: item.title || "0"
      }));
    } else {
      const expText = profile.sections.filter(s => s.type === "experience").flatMap(s => s.items).map(i => i.description).join(" ");
      const matches = expText.match(/(\\d+%|\\$\\d+[MBK]?|\\£\\d+[MBK]?|\\d+\\+)/g) || [];
      const unique = [...new Set(matches)].slice(0, 3);
      metricBoxes = unique.map(val => ({ label: "HIGHLIGHT", value: val }));
    }`);

// PDF:
pdf = pdf.replace(/let metricBoxes = \[\s*\{ label: "ADD METRICS SECTION", value: "0" \},\s*\{ label: "TO SHOW DATA", value: "0" \},\s*\{ label: "IN THIS BANNER", value: "0" \}\s*\];/g,
  `let metricBoxes: {label: string, value: string}[] = [];`);

pdf = pdf.replace(/if \(metricsSection && metricsSection\.items\.length > 0\) \{\s*metricBoxes = metricsSection\.items\.filter\(item => item\.visible\)\.slice\(0, 4\)\.map\(item => \(\{\s*label: item\.subtitle \|\| "Metric",\s*value: item\.title \|\| "0"\s*\}\)\);\s*if \(metricBoxes\.length === 0\) \{\s*metricBoxes = \[\{ label: "ADD METRICS", value: "0" \}\];\s*\}\s*\}/g,
  `if (metricsSection && metricsSection.items.length > 0) {
      metricBoxes = metricsSection.items.filter(item => item.visible).slice(0, 4).map(item => ({
        label: item.subtitle || "Metric",
        value: item.title || "0"
      }));
    } else {
      const expText = sections.filter(s => s.type === "experience").flatMap(s => s.items).map(i => i.description).join(" ");
      const matches = expText.match(/(\\d+%|\\$\\d+[MBK]?|\\£\\d+[MBK]?|\\d+\\+)/g) || [];
      const unique = [...new Set(matches)].slice(0, 3);
      metricBoxes = unique.map(val => ({ label: "HIGHLIGHT", value: val }));
    }`);

// 3. Fix mission-impact contrast and skills parsing
// LIVE contrast
live = live.replace(/<aside className="p-8 text-foreground" style=\{\{ backgroundColor: sidebarBg \}\}>/g, `<aside className="p-8" style={{ backgroundColor: sidebarBg, color: "#FFFFFF" }}>`);
live = live.replace(/<h1 className="text-3xl font-bold uppercase tracking-widest text-foreground"/g, `<h1 className="text-3xl font-bold uppercase tracking-widest" style={{ color: "#FFFFFF" }}`);
live = live.replace(/<p className="mt-2 text-sm text-foreground"/g, `<p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.85)" }}`);
live = live.replace(/<div className="mt-6 space-y-2 text-xs text-muted-foreground">/g, `<div className="mt-6 space-y-2 text-xs" style={{ color: "rgba(255,255,255,0.8)" }}>`);

// LIVE Skills fixing:
live = live.replace(/<div key=\{item\.id\}>\s*<p className="text-xs uppercase text-foreground\/80">\{item\.title\}<\/p>\s*<\/div>/g, 
  `<div key={item.id}>
                          <p className="text-xs uppercase text-foreground/80" style={{ color: "rgba(255,255,255,0.9)" }}>{item.title}</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {parseSkillEntries(item.description).map((entry, idx) => (
                              <span key={idx} className="text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>{entry.name}{idx < parseSkillEntries(item.description).length - 1 ? "," : ""}</span>
                            ))}
                          </div>
                        </div>`);

// PDF contrast
pdf = pdf.replace(/<View style=\{\{ width: "32%", backgroundColor: sidebarBg, padding: 24, height: "100%" \}\}>/g, `<View style={{ width: "32%", backgroundColor: sidebarBg, padding: 24, height: "100%", color: "#FFFFFF" }}>`);

// PDF Skills fixing:
pdf = pdf.replace(/<View key=\{item\.id\} style=\{\{ marginBottom: 4 \}\}>\s*<Text style=\{\{ fontFamily: bodyFont, fontSize: 9, color: "#4B5563" \}\}>\{item\.title\}<\/Text>\s*<\/View>/g,
  `<View key={item.id} style={{ marginBottom: 4 }}>
                        <Text style={{ fontFamily: bodyFont, fontSize: 9, color: "rgba(255,255,255,0.9)" }}>{item.title}</Text>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 2, marginTop: 2 }}>
                          {parseSkillEntries(item.description).map((entry, idx) => (
                             <Text key={idx} style={{ fontSize: 8, color: "rgba(255,255,255,0.7)" }}>{entry.name}{idx < parseSkillEntries(item.description).length - 1 ? "," : ""}</Text>
                          ))}
                        </View>
                      </View>`);


fs.writeFileSync('app/editor/cv-live-preview.tsx', live);
fs.writeFileSync('app/editor/cv-pdf-document.tsx', pdf);

console.log("Fixes applied successfully.");

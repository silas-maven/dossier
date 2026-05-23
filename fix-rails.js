const fs = require('fs');

const fixPdf = () => {
  let content = fs.readFileSync('app/editor/cv-pdf-document.tsx', 'utf8');
  
  // 1. campaign-cards
  content = content.replace(
    /\) : \(\s*<View style=\{\{\s*flexDirection:\s*"row",\s*flexWrap:\s*"wrap",\s*gap:\s*4\s*\}\}>\s*\{section\.items\.map\(\(item\) => \(\s*<View key=\{item\.id\}(.*?)>\s*<Text(.*?)\>\{item\.title \|\| ""\}<\/Text>\s*<\/View>\s*\)\)\}\s*<\/View>\s*\)/s,
    `) : section.type === "skills" || section.title.toLowerCase().includes("skills") ? (
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                        {section.items.filter(i => i.visible !== false).flatMap(i => [i.title, ...parseSkillEntries(i.description).map(e => e.name)].filter(Boolean)).map((name, idx) => (
                          <View key={idx}$1>
                             <Text$2>{name}</Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                        {section.items.filter(i => i.visible !== false).map((item) => (
                          <View key={item.id}$1>
                             <Text$2>{item.title || ""}</Text>
                          </View>
                        ))}
                      </View>
                    )`
  );

  // 2. process-left
  // Find the sidebar gap: 8 block in process-left
  content = content.replace(
    /(\s*)<View style=\{\{\s*gap:\s*8\s*\}\}>\s*\{section\.items\.map\(\(item\) => \(\s*<View key=\{item\.id\}>\s*<Text([^>]*?color:\s*"#111827"[^>]*?)>\{item\.title \|\| ""\}<\/Text>\s*\{item\.subtitle \?\s*\(\s*<Text([^>]*?)>\{item\.subtitle\}<\/Text>\s*\)\s*:\s*null\}\s*<\/View>\s*\)\)\}\s*<\/View>/gs,
    `$1{section.type === "skills" || section.title.toLowerCase().includes("skills") ? (
$1  <View style={{ gap: 8 }}>
$1    {section.items.filter(i => i.visible !== false).flatMap(i => [i.title, ...parseSkillEntries(i.description).map(e => e.name)].filter(Boolean)).map((name, idx) => (
$1      <View key={idx}>
$1        <Text$2>{name}</Text>
$1      </View>
$1    ))}
$1  </View>
$1) : (
$1  <View style={{ gap: 8 }}>
$1    {section.items.filter(i => i.visible !== false).map((item) => (
$1      <View key={item.id}>
$1        <Text$2>{item.title || ""}</Text>
$1        {item.subtitle ? (
$1          <Text$3>{item.subtitle}</Text>
$1        ) : null}
$1      </View>
$1    ))}
$1  </View>
$1)}`
  );

  fs.writeFileSync('app/editor/cv-pdf-document.tsx', content);
};

const fixLive = () => {
  let content = fs.readFileSync('app/editor/cv-live-preview.tsx', 'utf8');
  
  // 1. campaign-cards
  content = content.replace(
    /\) : \(\s*<div className="flex flex-wrap gap-1\.5">\s*\{section\.items\.map\(\(item\) => \(\s*<div\s*key=\{item\.id\}\s*style=\{[^}]*\}\s*className="[^"]*"\s*>\s*\{item\.title \|\| ""\}\s*<\/div>\s*\)\)\}\s*<\/div>\s*\)/s,
    `) : section.type === "skills" || section.title.toLowerCase().includes("skills") ? (
                      <div className="flex flex-wrap gap-1.5">
                        {section.items.filter(i => i.visible !== false).flatMap(i => [i.title, ...parseSkillEntries(i.description).map(e => e.name)].filter(Boolean)).map((name, idx) => (
                          <div key={idx} style={{ backgroundColor: sidebarBg, borderColor: accent, color: accent }} className="rounded-md border px-2 py-1 text-[0.6rem] font-medium leading-none">
                            {name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {section.items.filter(i => i.visible !== false).map((item) => (
                          <div key={item.id} style={{ backgroundColor: sidebarBg, borderColor: accent, color: accent }} className="rounded-md border px-2 py-1 text-[0.6rem] font-medium leading-none">
                            {item.title || ""}
                          </div>
                        ))}
                      </div>
                    )`
  );

  // 2. process-left & mission-impact
  content = content.replace(
    /(\s*)<div className="space-y-2">\s*\{section\.items\.map\(\(item\) => \(\s*<div key=\{item\.id\}>\s*<div([^>]*?text-gray-900[^>]*?)>\{item\.title \|\| ""\}<\/div>\s*\{item\.subtitle \?\s*\(\s*<div([^>]*?text-gray-500[^>]*?)>\{item\.subtitle\}<\/div>\s*\)\s*:\s*null\}\s*<\/div>\s*\)\)\}\s*<\/div>/gs,
    `$1{section.type === "skills" || section.title.toLowerCase().includes("skills") ? (
$1  <div className="space-y-2">
$1    {section.items.filter(i => i.visible !== false).flatMap(i => [i.title, ...parseSkillEntries(i.description).map(e => e.name)].filter(Boolean)).map((name, idx) => (
$1      <div key={idx}>
$1        <div$2>{name}</div>
$1      </div>
$1    ))}
$1  </div>
$1) : (
$1  <div className="space-y-2">
$1    {section.items.filter(i => i.visible !== false).map((item) => (
$1      <div key={item.id}>
$1        <div$2>{item.title || ""}</div>
$1        {item.subtitle ? (
$1          <div$3>{item.subtitle}</div>
$1        ) : null}
$1      </div>
$1    ))}
$1  </div>
$1)}`
  );

  fs.writeFileSync('app/editor/cv-live-preview.tsx', content);
};

fixPdf();
fixLive();
console.log("Done rails fix.");

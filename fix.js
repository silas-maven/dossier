const fs = require('fs');

// Fix cv-live-preview.tsx
let preview = fs.readFileSync('app/editor/cv-live-preview.tsx', 'utf8');

// Replace fmtDate
preview = preview.replace(/fmtDate\(item\.dateRange\)/g, 'formatDateRange(item.dateRange, profile.style.dateFormat)');

// Replace resolveFontPair
preview = preview.replace(/resolveFontPair\(variant, profile\.style\.fontFamily\)/g, 'resolveLiveFontStack(profile.style.fontFamily)');

// Replace sections where not defined (in Batch 3 blocks)
// In credentials-top:
preview = preview.replace(/const certsSection = sections\.find/g, 'const sections = profile.sections.filter(sectionHasVisibleItems).filter((s) => !isSummarySection(s));\n    const certsSection = sections.find');
// In academic-traditional:
preview = preview.replace(/sections\.map\(\(section\) => \(/g, 'profile.sections.filter(sectionHasVisibleItems).filter((s) => !isSummarySection(s)).map((section) => (');
// In mission-impact:
preview = preview.replace(/const sidebarSections = sections\.filter/g, 'const sections = profile.sections.filter(sectionHasVisibleItems).filter((s) => !isSummarySection(s));\n    const sidebarSections = sections.filter');

// Fix sectionTitleLabel
preview = preview.replace(/sectionTitleLabel\(section\)/g, 'section.style.uppercaseTitle ? section.title.toUpperCase() : section.title');

// Fix renderDescription (item.id, item.description, section, { ... }) -> renderDescription(item, section)
// wait, earlier I checked the signature of renderDescription:
// `const renderDescription = (item: CvItem, section: CvSection) => {`
// So I should replace renderDescription(item.id, item.description, section, { ... }) with renderDescription(item, section)

preview = preview.replace(/renderDescription\(item\.id, item\.description, section, \{\s*itemDesc:[^}]*\}\)/g, 'renderDescription(item, section)');

// Now for cv-pdf-document.tsx
let pdf = fs.readFileSync('app/editor/cv-pdf-document.tsx', 'utf8');

// Fix photoUrl -> image
pdf = pdf.replace(/profile\.basics\.photoUrl/g, 'profile.basics.image');

fs.writeFileSync('app/editor/cv-live-preview.tsx', preview);
fs.writeFileSync('app/editor/cv-pdf-document.tsx', pdf);
console.log('Fixed');

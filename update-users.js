const fs = require('fs');

let userCount = fs.readFileSync('lib/user-count.ts', 'utf8');

userCount = userCount.replace(/create table if not exists dossier_visitors \([\s\S]*?\)/, `$&;
  try {
    await sql\`alter table dossier_visitors add column if not exists first_path text\`;
    await sql\`alter table dossier_visitors add column if not exists last_path text\`;
    await sql\`alter table dossier_visitors add column if not exists referrer text\`;
    await sql\`alter table dossier_visitors add column if not exists user_agent text\`;
  } catch (e) {
    // ignore
  }`);

fs.writeFileSync('lib/user-count.ts', userCount);
console.log('Fixed user count table schema');

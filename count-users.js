require('dotenv').config();
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);
sql`select count(*) from dossier_visitors`.then(res => {
  console.log("Count is:", res[0].count);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);
async function run() {
  try {
    await sql`alter table dossier_visitors add column if not exists first_path text`;
    console.log("Success");
  } catch (e) {
    console.error("Error:", e);
  }
}
run();

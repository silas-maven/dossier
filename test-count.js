import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env' });
const sql = postgres(process.env.DATABASE_URL);
async function run() {
  try {
    const rows = await sql`select count(*) as count from dossier_visitors`;
    console.log("Count:", rows[0].count);
    const recent = await sql`select * from dossier_visitors order by last_seen_at desc limit 2`;
    console.log("Recent:", recent);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}
run();

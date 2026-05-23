import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env' });
const sql = postgres(process.env.DATABASE_URL);
async function run() {
  try {
    // Check if first_seen exists and rename
    const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'dossier_visitors'`;
    const colNames = cols.map(c => c.column_name);

    if (colNames.includes('first_seen')) {
      await sql`ALTER TABLE public.dossier_visitors RENAME COLUMN first_seen TO first_seen_at`;
      console.log("Renamed first_seen -> first_seen_at");
    }
    if (colNames.includes('last_seen')) {
      await sql`ALTER TABLE public.dossier_visitors RENAME COLUMN last_seen TO last_seen_at`;
      console.log("Renamed last_seen -> last_seen_at");
    }
    if (!colNames.includes('visit_count')) {
      await sql`ALTER TABLE public.dossier_visitors ADD COLUMN visit_count integer not null default 1`;
      console.log("Added visit_count column");
    }
    console.log("Schema fixed.");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}
run();

import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env' });
const sql = postgres(process.env.DATABASE_URL);
async function run() {
  try {
    await sql`alter table dossier_visitors add column if not exists first_path text`;
    await sql`alter table dossier_visitors add column if not exists last_path text`;
    await sql`alter table dossier_visitors add column if not exists referrer text`;
    await sql`alter table dossier_visitors add column if not exists user_agent text`;
    console.log("Columns added successfully");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}
run();

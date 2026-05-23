import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });
const sql = postgres(process.env.DATABASE_URL);
async function run() {
  try {
    await sql`alter table dossier_visitors add column if not exists first_path text`;
    console.log("Success");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}
run();

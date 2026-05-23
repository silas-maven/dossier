import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env' });
const sql = postgres(process.env.DATABASE_URL);
async function run() {
  try {
    const publicData = await sql`SELECT count(*) FROM public.dossier_visitors`;
    const watchtowerData = await sql`SELECT count(*) FROM watchtower.dossier_visitors`;
    console.log("Public Count:", publicData[0].count);
    console.log("Watchtower Count:", watchtowerData[0].count);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}
run();

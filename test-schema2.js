import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env' });
const sql = postgres(process.env.DATABASE_URL);
async function run() {
  try {
    const cols = await sql`SELECT table_schema, column_name, data_type FROM information_schema.columns WHERE table_name = 'dossier_visitors'`;
    console.log(cols);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}
run();

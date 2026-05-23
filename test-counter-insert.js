import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env' });
const sql = postgres(process.env.DATABASE_URL);

async function run() {
  const visitorId = "test_visitor_" + Date.now();
  try {
    console.log("Attempting insert...");
    await sql`
      insert into dossier_visitors (visitor_id, first_path, last_path, referrer, user_agent)
      values (${visitorId}, '/', '/', 'direct', 'Mozilla')
      on conflict (visitor_id) do update set
        last_seen_at = now(),
        visit_count = dossier_visitors.visit_count + 1,
        last_path = excluded.last_path,
        user_agent = coalesce(excluded.user_agent, dossier_visitors.user_agent)
    `;
    console.log("Insert successful.");
    const countRows = await sql`select count(*) as count from dossier_visitors`;
    console.log("New count:", countRows[0].count);
    
    // Test update
    console.log("Attempting update...");
    await sql`
      insert into dossier_visitors (visitor_id, first_path, last_path, referrer, user_agent)
      values (${visitorId}, '/', '/editor', 'direct', 'Mozilla')
      on conflict (visitor_id) do update set
        last_seen_at = now(),
        visit_count = dossier_visitors.visit_count + 1,
        last_path = excluded.last_path,
        user_agent = coalesce(excluded.user_agent, dossier_visitors.user_agent)
    `;
    console.log("Update successful.");
    const updatedUser = await sql`select * from dossier_visitors where visitor_id = ${visitorId}`;
    console.log("Updated user visit_count:", updatedUser[0].visit_count, "last_path:", updatedUser[0].last_path);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}
run();

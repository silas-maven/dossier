import postgres from "postgres";

export const USER_COUNT_FLOOR = Number.parseInt(process.env.DOSSIER_USER_COUNT_FLOOR ?? "0", 10) || 0;

const connectionString = process.env.DATABASE_URL?.trim();

let client: postgres.Sql | null = null;

const getClient = () => {
  if (!connectionString) return null;
  if (!client) {
    client = postgres(connectionString, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 5,
      prepare: false,
      onnotice: () => {},
    });
  }
  return client;
};

const ensureVisitorTable = async (sql: postgres.Sql) => {
  await sql`
    create table if not exists dossier_visitors (
      visitor_id text primary key,
      first_seen_at timestamptz not null default now(),
      last_seen_at timestamptz not null default now(),
      visit_count integer not null default 1,
      first_path text,
      last_path text,
      referrer text,
      user_agent text
    )
  `;
};

export const trackDossierVisitor = async ({
  visitorId,
  path,
  referrer,
  userAgent,
}: {
  visitorId: string;
  path?: string;
  referrer?: string;
  userAgent?: string;
}) => {
  const sql = getClient();
  if (!sql) return null;

  await ensureVisitorTable(sql);
  await sql`
    insert into dossier_visitors (visitor_id, first_path, last_path, referrer, user_agent)
    values (${visitorId}, ${path ?? null}, ${path ?? null}, ${referrer ?? null}, ${userAgent ?? null})
    on conflict (visitor_id) do update set
      last_seen_at = now(),
      visit_count = dossier_visitors.visit_count + 1,
      last_path = excluded.last_path,
      user_agent = coalesce(excluded.user_agent, dossier_visitors.user_agent)
  `;

  return getDossierUserCount();
};

export const getDossierUserCount = async () => {
  const sql = getClient();
  if (!sql) return USER_COUNT_FLOOR;

  try {
    await ensureVisitorTable(sql);
    const rows = await sql<{ count: string }[]>`select count(*)::text as count from dossier_visitors`;
    const liveCount = Number.parseInt(rows[0]?.count ?? "0", 10) || 0;
    return Math.max(liveCount, USER_COUNT_FLOOR);
  } catch (error) {
    console.error("Failed to read Dossier visitor count", error);
    return USER_COUNT_FLOOR;
  }
};

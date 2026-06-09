import postgres from "postgres";

// Server-side credit wallet for the managed "Dossier AI" tier. No user accounts: a
// random bearer token (the wallet token, stored client-side in localStorage) is the
// identity, and this DB is the source of truth. The browser never touches these tables
// directly — only server routes do, via the DATABASE_URL connection — so editing
// localStorage cannot grant credits. Mirrors the pattern in lib/user-count.ts.

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
      onnotice: () => {}
    });
  }
  return client;
};

const TOKEN_RE = /^[a-zA-Z0-9_-]{16,80}$/;
export const isValidCreditToken = (value: string | undefined): value is string =>
  Boolean(value && TOKEN_RE.test(value));

let tablesReady = false;
const ensureTables = async (sql: postgres.Sql) => {
  if (tablesReady) return;
  await sql`
    create table if not exists dossier_ai_credits (
      token text primary key,
      credits_remaining integer not null default 0,
      credits_total integer not null default 0,
      credits_used integer not null default 0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;
  await sql`
    create table if not exists dossier_ai_credit_purchases (
      stripe_session_id text primary key,
      token text not null,
      credits integer not null,
      amount integer,
      currency text,
      created_at timestamptz not null default now()
    )
  `;
  tablesReady = true;
};

export const getCreditBalance = async (token: string): Promise<number> => {
  const sql = getClient();
  if (!sql) return 0;
  await ensureTables(sql);
  const rows = await sql<{ credits_remaining: number }[]>`
    select credits_remaining from dossier_ai_credits where token = ${token}
  `;
  return rows[0]?.credits_remaining ?? 0;
};

// Atomically spends one credit. Returns the new balance, or null if the token has no
// credits (insufficient). The single conditional UPDATE prevents a double-spend race
// between concurrent requests.
export const consumeCredit = async (token: string): Promise<number | null> => {
  const sql = getClient();
  if (!sql) return null;
  await ensureTables(sql);
  const rows = await sql<{ credits_remaining: number }[]>`
    update dossier_ai_credits
    set credits_remaining = credits_remaining - 1,
        credits_used = credits_used + 1,
        updated_at = now()
    where token = ${token} and credits_remaining > 0
    returning credits_remaining
  `;
  return rows.length ? rows[0].credits_remaining : null;
};

// Returns the spent credit if the downstream AI call failed entirely.
export const refundCredit = async (token: string): Promise<void> => {
  const sql = getClient();
  if (!sql) return;
  await ensureTables(sql);
  await sql`
    update dossier_ai_credits
    set credits_remaining = credits_remaining + 1,
        credits_used = greatest(credits_used - 1, 0),
        updated_at = now()
    where token = ${token}
  `;
};

// Idempotent on stripe_session_id (webhooks retry). Returns true if credits were added,
// false if this session was already processed.
export const addCredits = async ({
  sessionId,
  token,
  credits,
  amount,
  currency
}: {
  sessionId: string;
  token: string;
  credits: number;
  amount?: number;
  currency?: string;
}): Promise<boolean> => {
  const sql = getClient();
  if (!sql) return false;
  await ensureTables(sql);
  const recorded = await sql`
    insert into dossier_ai_credit_purchases (stripe_session_id, token, credits, amount, currency)
    values (${sessionId}, ${token}, ${credits}, ${amount ?? null}, ${currency ?? null})
    on conflict (stripe_session_id) do nothing
    returning stripe_session_id
  `;
  if (!recorded.length) return false;
  await sql`
    insert into dossier_ai_credits (token, credits_remaining, credits_total)
    values (${token}, ${credits}, ${credits})
    on conflict (token) do update set
      credits_remaining = dossier_ai_credits.credits_remaining + ${credits},
      credits_total = dossier_ai_credits.credits_total + ${credits},
      updated_at = now()
  `;
  return true;
};

import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client for server-side use only.
 *
 * This uses the service role key, which bypasses row level security. It must
 * never reach the browser, which is what the `server-only` import above
 * guards: importing this file from a client component becomes a build error.
 *
 * Row level security on `lifegroup_members` stays locked with no public
 * policies, so every read and write has to come through the server actions in
 * this app rather than straight from someone's browser.
 */

let cached: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  // Accept whichever variable name is present. The Vercel Supabase integration
  // sets several, and marketplace integrations sometimes prefix them again with
  // the integration name, so check the known spellings rather than assume one.
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    // List the Supabase-ish names that *are* set. Names only, never values, and
    // this reaches the server log rather than the browser. Saves guessing which
    // spelling an integration used if this ever breaks again.
    const seen = Object.keys(process.env)
      .filter((k) => k.toUpperCase().includes("SUPABASE"))
      .sort()
      .join(", ");
    throw new Error(
      `Missing Supabase credentials. Supabase-ish vars present: [${seen || "none"}]`,
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cached;
}

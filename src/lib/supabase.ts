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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cached;
}

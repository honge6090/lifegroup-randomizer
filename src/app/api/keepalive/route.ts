import { supabaseAdmin } from "@/lib/supabase";

/**
 * Daily keep alive ping for the Supabase project.
 *
 * Supabase pauses free projects after about a week without any requests, and
 * a paused project makes every page here fail with "Could not load
 * submissions: fetch failed". The app is used once a week, right on that
 * limit, so a Vercel cron job (see vercel.json) hits this route every day and
 * runs one tiny read against the table. That counts as activity and keeps the
 * project awake.
 *
 * Vercel sends `Authorization: Bearer <CRON_SECRET>` with every cron call.
 * When CRON_SECRET is set on the project, anything without that header is
 * turned away so the route cannot be hammered from outside.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TABLE = "lifegroup_members";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const { count, error } = await supabaseAdmin()
    .from(TABLE)
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error(`keepalive: Supabase read failed: ${error.message}`);
    return Response.json({ ok: false, error: error.message }, { status: 502 });
  }

  return Response.json({ ok: true, members: count ?? 0 });
}

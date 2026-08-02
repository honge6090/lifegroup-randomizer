import Link from "next/link";
import { listGroups } from "@/lib/members";

// Group data changes whenever the admin re-rolls, so never serve this from cache.
export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const groups = await listGroups();
  const total = groups.reduce((sum, g) => sum + g.members.length, 0);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
      <header className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {groups.length > 0 ? "Here are the groups" : "Groups"}
        </h1>
        {groups.length > 0 && (
          <p className="mt-3 text-[15px] text-muted-foreground">
            {total} {total === 1 ? "person" : "people"} · {groups.length}{" "}
            {groups.length === 1 ? "group" : "groups"}
          </p>
        )}
      </header>

      {groups.length === 0 ? (
        <div className="mx-auto mt-10 max-w-sm rounded-xl border border-border bg-card p-8 text-center">
          <p className="font-semibold tracking-tight">Not sorted yet.</p>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            The groups haven&rsquo;t been made yet. Check back in a few minutes.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Sign up
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <section
              key={group.number}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {group.number}
                </span>
                <div>
                  <h2 className="font-semibold tracking-tight">
                    Group {group.number}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {group.members.length} members
                  </p>
                </div>
              </div>

              <ul className="mt-5 space-y-2.5 border-t border-border pt-5">
                {group.members.map((member) => (
                  <li key={member.id} className="text-[15px]">
                    {member.first_name} {member.last_name}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

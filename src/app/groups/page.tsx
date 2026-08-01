import Link from "next/link";
import { listGroups } from "@/lib/members";

// Group data changes whenever the admin re-rolls, so never serve this from cache.
export const dynamic = "force-dynamic";

/** A rotating set of warm hues so groups are easy to tell apart on a projector. */
const GROUP_TINTS = [
  { bg: "#f6e9e1", text: "#a2461f" },
  { bg: "#e4ece4", text: "#33613f" },
  { bg: "#e6e9f2", text: "#3c4a7a" },
  { bg: "#f4eadd", text: "#8a5d19" },
  { bg: "#f0e6ee", text: "#7a3b68" },
  { bg: "#e2edee", text: "#276068" },
];

export default async function GroupsPage() {
  const groups = await listGroups();

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:py-16">
      <header className="text-center">
        <p className="text-[12px] font-semibold tracking-[0.18em] text-accent uppercase">
          Life Groups
        </p>
        <h1 className="mt-3 font-display text-[38px] leading-[1.1] font-semibold">
          {groups.length > 0 ? "Here are the groups" : "Groups"}
        </h1>
      </header>

      {groups.length === 0 ? (
        <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-line bg-card p-8 text-center shadow-[0_1px_3px_rgba(33,29,24,0.06)]">
          <p className="font-display text-xl font-semibold">
            Not sorted yet.
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            The groups haven&rsquo;t been made yet. Check back in a few minutes.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-ink px-5 py-3 text-[15px] font-semibold text-paper transition-opacity hover:opacity-90"
          >
            Sign up
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-3 text-center text-[15px] text-muted">
            {groups.reduce((sum, g) => sum + g.members.length, 0)} people ·{" "}
            {groups.length} groups
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {groups.map((group) => {
              const tint = GROUP_TINTS[(group.number - 1) % GROUP_TINTS.length];
              return (
                <section
                  key={group.number}
                  className="rounded-2xl border border-line bg-card p-6 shadow-[0_1px_3px_rgba(33,29,24,0.06)]"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-lg font-semibold"
                      style={{ background: tint.bg, color: tint.text }}
                    >
                      {group.number}
                    </span>
                    <div>
                      <h2 className="font-display text-lg font-semibold">
                        Group {group.number}
                      </h2>
                      <p className="text-[13px] text-muted">
                        {group.members.length} members
                      </p>
                    </div>
                  </div>

                  <ul className="mt-5 space-y-2.5 border-t border-line pt-5">
                    {group.members.map((member) => (
                      <li key={member.id} className="text-[15px] text-ink">
                        {member.first_name} {member.last_name}
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
